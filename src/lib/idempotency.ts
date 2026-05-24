import { prisma } from "./prisma";

export async function getIdempotentResponse(key: string, method: string, route: string) {
  if (!key) return null;

  const rec = await (prisma as any).idempotencyKey.findUnique({
    where: { key_method_route: { key, method, route } as any },
  });

  if (!rec) return null;

  return {
    statusCode: rec.statusCode,
    body: rec.response,
  };
}

export async function saveIdempotentResponse(key: string, method: string, route: string, statusCode: number, body: any) {
  if (!key) return;

  try {
    await (prisma as any).idempotencyKey.upsert({
      where: { key_method_route: { key, method, route } as any },
      update: { statusCode, response: body },
      create: { key, method, route, statusCode, response: body },
    });
  } catch (err) {
    // best-effort: do not fail the request if idempotency save fails
    console.error("Failed to save idempotency key", err);
  }
}

export default {};
