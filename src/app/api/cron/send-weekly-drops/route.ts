/* eslint-disable no-console */
// src/app/api/notify/weekly-drops/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { weeklyDropsEmail } from "@/lib/emailTemplates";
import { createHash } from "crypto";

/** ─────────────────────────────────────────────────────────────────────────────
 * Types for our domain
 * ────────────────────────────────────────────────────────────────────────────*/
type SubscribedUser = {
  id: string;
  email: string;
  username: string | null;
};

type BatchEmailItem = {
  from: string;
  to: readonly string[]; // Resend allows an array; we keep it readonly for safety
  subject: string;
  html?: string;
  text?: string;
  // NOTE: keep fields minimal; Batch API currently doesn't support attachments/tags/scheduled_at
};

type BatchValidationMode = "permissive" | "strict";

type BatchSendOptions = {
  batchValidation?: BatchValidationMode;
  idempotencyKey?: string;
};

/** What Resend returns for each successfully-accepted item. */
type BatchSendResponseItem = {
  id: string;
  to: string | string[];
  status: string; // e.g., "queued" / "sent"
  batchId?: string;
};

/** Validation error for a specific item index when batchValidation=permissive */
type BatchSendItemError = {
  index: number;        // index in the submitted array
  message: string;      // validation error message
};

/** Uniform result shape for our client */
type BatchSendOk = {
  ok: true;
  status: number;                         // HTTP status
  data: readonly BatchSendResponseItem[]; // accepted items for this chunk
  errors: readonly BatchSendItemError[];  // per-item validation errors (if any)
};

type BatchSendErr = {
  ok: false;
  status: number; // 4xx/5xx or 429
  message: string;
  data?: readonly BatchSendResponseItem[];   // may be present from server
  errors?: readonly BatchSendItemError[];    // may be present from server
};

type BatchSendResult = BatchSendOk | BatchSendErr;

/** Response shape for our API route */
type Summary = {
  totalRecipients: number;
  batches: number;
  sent: number;
  failed: number;
  errors: Array<{
    batch: number;
    index: number;  // -1 if unknown
    email: string;
    message: string;
  }>;
};

/** ─────────────────────────────────────────────────────────────────────────────
 * Tunables
 * ────────────────────────────────────────────────────────────────────────────*/
const MAX_BATCH_SIZE = 100;
const RATE_LIMIT_DELAY_MS = 700; // stay ≲ 2 rps
const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_DELAY_MS = 8000;

/** ─────────────────────────────────────────────────────────────────────────────
 * Tiny runtime guards (no zod dependency needed)
 * ────────────────────────────────────────────────────────────────────────────*/
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}
function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Narrow unknown JSON into the shapes we care about from Resend */
function coerceBatchResponse(json: unknown, status: number): BatchSendResult {
  if (!isObject(json)) {
    // If Resend returned no JSON body (rare), construct a generic error/success by status.
    if (status >= 200 && status < 300) {
      return { ok: true, status, data: [], errors: [] };
    }
    return { ok: false, status, message: "Resend returned a non-JSON response." };
  }

  const message = asString(json.message);

  // Success-ish payload may include data[] and/or errors[]
  const rawData = isArray(json.data) ? json.data : [];
  const data: BatchSendResponseItem[] = rawData
    .map((item) => (isObject(item) ? item : null))
    .filter((i): i is Record<string, unknown> => i !== null)
    .map((i) => {
      const id = asString(i.id) ?? "";
      const to = i.to as string | string[] | undefined;
      const statusStr = asString(i.status) ?? "queued";
      const batchId = asString(i.batchId);
      return { id, to: to ?? "", status: statusStr, batchId };
    });

  const rawErrors = isArray(json.errors) ? json.errors : [];
  const errors: BatchSendItemError[] = rawErrors
    .map((e) => (isObject(e) ? e : null))
    .filter((e): e is Record<string, unknown> => e !== null)
    .map((e) => {
      const index =
        typeof e.index === "number"
          ? e.index
          : Number.isFinite((e as { index?: unknown }).index)
          ? Number((e as { index?: unknown }).index)
          : -1;
      const message = asString(e.message) ?? "validation error";
      return { index, message };
    });

  if (status >= 200 && status < 300) {
    return { ok: true, status, data, errors };
  }

  return {
    ok: false,
    status,
    message: message ?? "Resend batch request failed",
    data,
    errors,
  };
}

/** ─────────────────────────────────────────────────────────────────────────────
 * Minimal Resend Batch REST client (typed)
 * ────────────────────────────────────────────────────────────────────────────*/
function createResendBatchClient(apiKey: string) {
  const endpoint = "https://api.resend.com/emails/batch" as const;

  async function batchSend(
    items: readonly BatchEmailItem[],
    options: BatchSendOptions = {}
  ): Promise<BatchSendResult> {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options.batchValidation ? { "x-batch-validation": options.batchValidation } : {}),
    } satisfies Record<string, string>;

    let res: Response;
    try {
      // IMPORTANT: Body must be the ARRAY itself (no wrapper key)
      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(items),
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to call Resend batch endpoint (network)";
      return { ok: false, status: 0, message: msg };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      json = undefined;
    }

    // 429 will be retried by caller; still surface parsed content, if any
    return coerceBatchResponse(json, res.status);
  }

  return {
    batch: { send: batchSend },
  };
}

/** ─────────────────────────────────────────────────────────────────────────────
 * Utilities
 * ────────────────────────────────────────────────────────────────────────────*/
function chunkArray<T>(values: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size));
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns an ISO week key like "2025-W38" (UTC-based) */
function getIsoWeekKey(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

/** Stable stringify: sorts object keys and preserves deterministic output */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Deterministic body hash for idempotency */
function hashBodyHex(payload: unknown): string {
  const str = stableStringify(payload);
  return createHash("sha256").update(str).digest("hex");
}

/** ─────────────────────────────────────────────────────────────────────────────
 * API Route
 * ────────────────────────────────────────────────────────────────────────────*/
export async function GET() {
  const baseUrl = process.env.BASE_URL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!baseUrl || !resendApiKey || !from) {
    console.error("Missing email configuration", {
      hasBaseUrl: Boolean(baseUrl),
      hasKey: Boolean(resendApiKey),
      hasFrom: Boolean(from),
    });
    return NextResponse.json({ success: false, error: "Server misconfig" }, { status: 500 });
  }

  // IMPORTANT: order recipients deterministically so chunk boundaries are stable
  const users: SubscribedUser[] = await prisma.user.findMany({
    where: { notificationOptIn: true },
    select: { id: true, email: true, username: true },
    orderBy: { email: "asc" }, // <— key for stable chunking and hashing
  });

  const noRecipients: Summary = {
    totalRecipients: users.length,
    batches: 0,
    sent: 0,
    failed: 0,
    errors: [],
  };

  if (users.length === 0) {
    return NextResponse.json(noRecipients satisfies Summary);
  }

  const resend = createResendBatchClient(resendApiKey);
  const chunks = chunkArray(users, MAX_BATCH_SIZE);
  const isoWeekKey = getIsoWeekKey(new Date());
  const idempotencyPrefix = `weekly-drops/${isoWeekKey}` as const;

  const summary: Summary = {
    totalRecipients: users.length,
    batches: chunks.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const subject = "This Week's Drops" as const;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunkUsers = chunks[chunkIndex];

    // Build typed items
    const items: readonly BatchEmailItem[] = chunkUsers.map((user) => {
      const profileSlug = user.username ?? user.id;
      const html: string = weeklyDropsEmail(baseUrl, profileSlug); // ensure template returns string
      const text = [
        `Check out this week's drops: ${baseUrl}/drops`,
        "",
        `Manage preferences: ${baseUrl}/profile/${profileSlug}`,
      ].join("\n");

      return {
        from,
        to: [user.email] as const,
        subject,
        html,
        text,
      };
    });

    /**
     * Idempotency design:
     * - We keep the weekly prefix for semantics.
     * - We append a SHA-256 of the EXACT request body (the array of items) we will send.
     *   If anything in the body changes (new user, template tweak, reordering), the hash changes,
     *   producing a new idempotency key and avoiding the "modified body" error from Resend.
     * - Retries of the same body reuse the same key.
     */
    const bodyHash = hashBodyHex(items).slice(0, 24); // keep header short but collision-safe
    const idempotencyKey = `${idempotencyPrefix}/chunk-${chunkIndex}/${bodyHash}`;

    let attempt = 0;

    while (attempt < MAX_ATTEMPTS) {
      const result = await resend.batch.send(items, {
        batchValidation: "permissive",
        idempotencyKey,
      });

      // Handle 429 retry path
      if (!result.ok && result.status === 429 && attempt < MAX_ATTEMPTS - 1) {
        const backoff = Math.min(
          1000 * 2 ** attempt + Math.floor(Math.random() * 250),
          MAX_BACKOFF_DELAY_MS
        );
        console.warn("Resend batch rate limited", {
          batch: chunkIndex,
          attempt,
          delayMs: backoff,
          message: result.message,
          idempotencyKey,
        });
        attempt += 1;
        await sleep(backoff);
        continue;
      }

      // Non-429 error: count whole chunk as failed (plus item-level context if present)
      if (!result.ok) {
        console.error("Resend batch send failed", {
          batch: chunkIndex,
          statusCode: result.status,
          message: result.message,
          idempotencyKey,
          bodyHash,
        });

        summary.failed += chunkUsers.length;

        // Prefer item-level indices if present
        if (result.errors && result.errors.length > 0) {
          for (const itemErr of result.errors) {
            const idx = itemErr.index ?? -1;
            const recipient = chunkUsers[idx]?.email ?? "unknown";
            summary.errors.push({
              batch: chunkIndex,
              index: idx,
              email: recipient,
              message: itemErr.message,
            });
          }
        } else {
          // Fall back: mark each address with the generic error message
          chunkUsers.forEach((user, index) => {
            summary.errors.push({
              batch: chunkIndex,
              index,
              email: user.email,
              message: result.message,
            });
          });
        }
      } else {
        // Success path: add sent count and log item-level IDs
        const sentCount = result.data.length;
        summary.sent += sentCount;

        result.data.forEach((item, index) => {
          console.info("weekly-drops batch item accepted", {
            batch: chunkIndex,
            index,
            recipient: chunkUsers[index]?.email,
            id: item.id,
            batchId: item.batchId,
            status: item.status,
            idempotencyKey,
            bodyHash,
          });
        });

        // Record per-item validation errors (permissive mode)
        if (result.errors.length > 0) {
          for (const itemErr of result.errors) {
            const idx = itemErr.index ?? -1;
            const recipient = chunkUsers[idx]?.email ?? "unknown";
            summary.errors.push({
              batch: chunkIndex,
              index: idx,
              email: recipient,
              message: itemErr.message,
            });
          }
          summary.failed += result.errors.length;
        }

        console.info("weekly-drops batch complete", {
          batch: chunkIndex,
          sent: sentCount,
          failed: result.errors.length,
          idempotencyKey,
          bodyHash,
        });
      }

      // Basic throttle to respect ~2 rps for the next chunk
      if (chunkIndex < chunks.length - 1) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }

      // Exit retry loop after a terminal outcome (success or non-429 failure)
      break;
    }
  }

  return NextResponse.json(summary satisfies Summary);
}
