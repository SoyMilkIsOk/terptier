import { prisma } from "@/lib/prismadb";
import { Role } from "@prisma/client";
import type { JwtClaims } from "@/lib/authorize";

export type AdminScopedUser = Awaited<ReturnType<typeof getAdminScopedUserByEmail>>;

type ProducerWithState = {
  id: string;
  stateId: string;
  state: { slug: string };
};

export async function getAdminScopedUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      producerAdmins: true,
      stateAdmins: {
        include: {
          state: { select: { id: true, slug: true } },
        },
      },
    },
  });
}

interface AdminAccessTarget {
  targetProducerId?: string | null;
  targetStateId?: string | null;
  targetStateSlug?: string | null;
}

interface AdminAccessContext {
  claims: JwtClaims | null;
  user: AdminScopedUser | null;
}

export type AdminAccessResult = {
  allowed: boolean;
  producer?: ProducerWithState | null;
  stateId?: string | null;
  stateSlug?: string | null;
  reason?: "forbidden" | "producer_not_found" | "state_mismatch";
};

const arrayIncludes = (value: string | null | undefined, collection: unknown): boolean => {
  if (!value) return false;
  if (!Array.isArray(collection)) return false;
  return collection.includes(value);
};

export async function evaluateAdminAccess(
  context: AdminAccessContext,
  target: AdminAccessTarget,
): Promise<AdminAccessResult> {
  const { claims, user } = context;
  const { targetProducerId, targetStateId, targetStateSlug } = target;

  let producer: ProducerWithState | null = null;
  let stateId: string | null = null;
  let stateSlug: string | null = null;

  if (targetProducerId) {
    producer = await prisma.producer.findUnique({
      where: { id: targetProducerId },
      select: { id: true, stateId: true, state: { select: { slug: true } } },
    });

    if (!producer) {
      return { allowed: false, producer: null, stateId: null, stateSlug: null, reason: "producer_not_found" };
    }

    stateId = producer.stateId;
    stateSlug = producer.state.slug;

    if (targetStateId && targetStateId !== stateId) {
      return { allowed: false, producer, stateId, stateSlug, reason: "state_mismatch" };
    }

    if (targetStateSlug && targetStateSlug !== stateSlug) {
      return { allowed: false, producer, stateId, stateSlug, reason: "state_mismatch" };
    }
  } else {
    stateId = targetStateId ?? null;
    stateSlug = targetStateSlug ?? null;
  }

  const isGlobalAdmin =
    claims?.role === "ADMIN" || user?.role === Role.ADMIN;
  if (isGlobalAdmin) {
    return { allowed: true, producer, stateId, stateSlug };
  }

  if (targetProducerId) {
    if (arrayIncludes(targetProducerId, claims?.producer_ids)) {
      return { allowed: true, producer, stateId, stateSlug };
    }

    if (user?.producerAdmins.some((pa) => pa.producerId === targetProducerId)) {
      return { allowed: true, producer, stateId, stateSlug };
    }
  }

  if (stateId || stateSlug) {
    if (
      arrayIncludes(stateId, claims?.state_ids) ||
      arrayIncludes(stateSlug, claims?.state_slugs)
    ) {
      return { allowed: true, producer, stateId, stateSlug };
    }

    if (
      user?.stateAdmins.some(
        (sa) => sa.stateId === stateId || sa.state.slug === stateSlug,
      )
    ) {
      return { allowed: true, producer, stateId, stateSlug };
    }
  }

  return { allowed: false, producer, stateId, stateSlug, reason: "forbidden" };
}
