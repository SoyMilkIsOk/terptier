import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { weeklyDropsEmail } from "@/lib/emailTemplates";

type BatchEmailItem = {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
};

type BatchSendOptions = {
  batchValidation?: "permissive" | "strict";
  idempotencyKey?: string;
};

type BatchSendResponseItem = {
  id?: string;
  to?: string | string[];
  status?: string;
  batchId?: string;
};

type BatchSendError = {
  index?: number;
  message?: string;
};

type BatchSendResult = {
  data: BatchSendResponseItem[] | null;
  errors: BatchSendError[];
  error: { statusCode?: number; message?: string } | null;
};

const MAX_BATCH_SIZE = 100;
const RATE_LIMIT_DELAY_MS = 700;
const MAX_ATTEMPTS = 5;
const MAX_BACKOFF_DELAY_MS = 8000;

function createResendBatchClient(apiKey: string) {
  const endpoint = "https://api.resend.com/emails/batch";

  async function batchSend(
    items: BatchEmailItem[],
    options: BatchSendOptions = {}
  ): Promise<BatchSendResult> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      if (options.idempotencyKey) {
        headers["Idempotency-Key"] = options.idempotencyKey;
      }

      const payload: Record<string, unknown> = {
        emails: items,
      };

      const validationSetting = options.batchValidation ?? "strict";
      if (validationSetting) {
        payload.batchValidation = validationSetting;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      let json: unknown;
      try {
        json = await res.json();
      } catch (parseErr) {
        json = undefined;
      }

      const parsed = (json as {
        data?: BatchSendResponseItem[];
        errors?: BatchSendError[];
        message?: string;
        error?: { message?: string };
      }) ?? { data: undefined, errors: undefined };

      if (res.status === 429) {
        return {
          data: parsed.data ?? null,
          errors: parsed.errors ?? [],
          error: { statusCode: 429, message: parsed.message ?? parsed.error?.message },
        };
      }

      if (!res.ok) {
        return {
          data: parsed.data ?? null,
          errors: parsed.errors ?? [],
          error: {
            statusCode: res.status,
            message: parsed.message ?? parsed.error?.message ?? "Resend batch request failed",
          },
        };
      }

      return {
        data: parsed.data ?? null,
        errors: parsed.errors ?? [],
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        errors: [],
        error: {
          message:
            err instanceof Error ? err.message : "Resend batch request threw an unknown error",
        },
      };
    }
  }

  return {
    batch: {
      send: batchSend,
    },
  };
}

function chunkArray<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getIsoWeekKey(date: Date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

export async function GET() {
  const baseUrl = process.env.BASE_URL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!baseUrl || !resendApiKey || !from) {
    console.error("Missing email configuration", { hasBaseUrl: !!baseUrl, hasKey: !!resendApiKey, hasFrom: !!from });
    return NextResponse.json(
      { success: false, error: "Server misconfig" },
      { status: 500 }
    );
  }

  const users = await prisma.user.findMany({
    where: { notificationOptIn: true },
  });

  if (users.length === 0) {
    return NextResponse.json({
      totalRecipients: 0,
      batches: 0,
      sent: 0,
      failed: 0,
      errors: [],
    });
  }

  const resend = createResendBatchClient(resendApiKey);
  const chunks = chunkArray(users, MAX_BATCH_SIZE);
  const isoWeekKey = getIsoWeekKey(new Date());
  const idempotencyPrefix = `weekly-drops/${isoWeekKey}`;
  const summary = {
    totalRecipients: users.length,
    batches: chunks.length,
    sent: 0,
    failed: 0,
    errors: [] as Array<{
      batch: number;
      index: number;
      email: string;
      message: string;
    }>,
  };

  const subject = "This Week's Drops";

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunkUsers = chunks[chunkIndex];
    const items: BatchEmailItem[] = chunkUsers.map((user) => {
      const profileSlug = user.username || user.id;
      const html = weeklyDropsEmail(baseUrl, profileSlug);
      const text = `Check out this week's drops: ${baseUrl}/drops\n\nManage preferences: ${baseUrl}/profile/${profileSlug}`;

      return {
        from,
        to: [user.email],
        subject,
        html,
        text,
      };
    });

    const idempotencyKey = `${idempotencyPrefix}/chunk-${chunkIndex}`;

    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
      const { data, error, errors } = await resend.batch.send(items, {
        batchValidation: "permissive",
        idempotencyKey,
      });

      if (error?.statusCode === 429 && attempt < MAX_ATTEMPTS - 1) {
        const backoff = Math.min(1000 * 2 ** attempt + Math.floor(Math.random() * 250), MAX_BACKOFF_DELAY_MS);
        console.warn("Resend batch rate limited", {
          batch: chunkIndex,
          attempt,
          delayMs: backoff,
          message: error.message,
          idempotencyKey,
        });
        attempt += 1;
        await sleep(backoff);
        continue;
      }

      if (error) {
        console.error("Resend batch send failed", {
          batch: chunkIndex,
          statusCode: error.statusCode,
          message: error.message,
          idempotencyKey,
        });

        summary.failed += chunkUsers.length;
        chunkUsers.forEach((user, index) => {
          summary.errors.push({
            batch: chunkIndex,
            index,
            email: user.email,
            message: error.message ?? "Batch send failed",
          });
        });
      } else {
        const sentCount = data?.length ?? 0;
        summary.sent += sentCount;

        data?.forEach((item, index) => {
          console.info("weekly-drops batch item sent", {
            batch: chunkIndex,
            index,
            recipient: chunkUsers[index]?.email,
            id: item.id,
            batchId: item.batchId,
            status: item.status ?? "sent",
            idempotencyKey,
          });
        });

        const itemErrors = errors ?? [];
        if (itemErrors.length > 0) {
          itemErrors.forEach((itemError) => {
            const errorIndex = itemError.index ?? -1;
            const recipient = chunkUsers[errorIndex]?.email ?? "unknown";
            summary.errors.push({
              batch: chunkIndex,
              index: errorIndex,
              email: recipient,
              message: itemError.message ?? "Validation error",
            });
            summary.failed += 1;
            console.warn("weekly-drops batch item error", {
              batch: chunkIndex,
              index: errorIndex,
              recipient,
              message: itemError.message,
              idempotencyKey,
            });
          });
        }

        console.info("weekly-drops batch complete", {
          batch: chunkIndex,
          sent: sentCount,
          failed: itemErrors.length,
          idempotencyKey,
        });
      }

      if (chunkIndex < chunks.length - 1) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }

      break;
    }
  }

  return NextResponse.json(summary);
}

