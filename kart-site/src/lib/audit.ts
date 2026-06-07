import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'register'
  | 'logout'
  | '2fa_enable'
  | '2fa_disable'
  | '2fa_verify_failed'
  | 'password_change'
  | 'profile_update'
  | 'card_issue'
  | 'card_load'
  | 'card_freeze'
  | 'card_unfreeze'
  | 'card_cancel'
  | 'deposit_create'
  | 'deposit_complete'
  | 'withdraw_request'
  | 'withdraw_complete'
  | 'exchange';

interface AuditLogParams {
  userId: string;
  action: AuditAction;
  details?: Record<string, any>;
  req?: NextRequest;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const ipAddress = params.req
      ? params.req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        params.req.headers.get('x-real-ip') ||
        'unknown'
      : 'unknown';

    const userAgent = params.req
      ? params.req.headers.get('user-agent') || 'unknown'
      : 'unknown';

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        details: JSON.stringify(params.details || {}),
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Audit log error:', error);
  }
}

export async function getAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
  }
) {
  return prisma.auditLog.findMany({
    where: {
      userId,
      ...(options?.action && { action: options.action }),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}
