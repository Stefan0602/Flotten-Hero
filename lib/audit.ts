import { prisma } from './prisma';

interface LogAuditParams {
  mandantId: string;
  userId: string;
  userName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        mandantId: params.mandantId,
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        targetName: params.targetName,
        details: params.details,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}
