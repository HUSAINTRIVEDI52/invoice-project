import { prisma } from "./db";
import { getSession } from "./auth";

export async function logActivity(action: string, entity: string, details: string) {
  try {
    const session = await getSession();
    const adminName = session ? session.name : "System";

    await prisma.activityLog.create({
      data: {
        action,
        entity,
        details: `[${adminName}] ${details}`,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
