'use server';

import { LoginSchema } from '@jeanius/contracts';
import {
  LoginUseCase,
  LogoutUseCase,
  RecordPrivilegedActionUseCase,
} from '@jeanius/application/auth';
import { db, DrizzleUserProfileRepository, DrizzleAuditLogRepository } from '@jeanius/database';
import type { Actor, EntityId, ActorRole } from '@jeanius/domain';
import { SupabaseAuthGateway } from '@jeanius/integrations';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AdminActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

async function getAdminServices() {
  const supabase = await createClient();
  const authGateway = new SupabaseAuthGateway(supabase);
  const userProfileRepo = new DrizzleUserProfileRepository(db);

  return {
    supabase,
    authGateway,
    userProfileRepo,
  };
}

export async function adminLoginAction(
  formData: unknown,
): Promise<AdminActionResult<{ role: string; redirectPath: string }>> {
  try {
    const validated = LoginSchema.parse(formData);
    const { authGateway, userProfileRepo } = await getAdminServices();
    const useCase = new LoginUseCase(authGateway, userProfileRepo);

    const result = await useCase.execute(validated);

    // Verify user has staff or admin privileges
    const allowedStaffRoles = ['ADMIN', 'TAILOR', 'JEWELLER', 'FULFILLMENT', 'SUPPORT'];
    if (!allowedStaffRoles.includes(result.role)) {
      await authGateway.signOut();
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Account is not authorized for staff atelier access.',
        },
      };
    }

    // Role-tailored initial redirection path
    let redirectPath = '/';
    if (result.role === 'TAILOR') redirectPath = '/workshop/tailor';
    else if (result.role === 'JEWELLER') redirectPath = '/workshop/jeweller';
    else if (result.role === 'FULFILLMENT') redirectPath = '/fulfillment';
    else if (result.role === 'SUPPORT') redirectPath = '/support';

    return {
      success: true,
      data: {
        role: result.role,
        redirectPath,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Staff login failed';
    return { success: false, error: { code: 'LOGIN_FAILED', message } };
  }
}

export async function adminLogoutAction(): Promise<void> {
  const { authGateway } = await getAdminServices();
  const useCase = new LogoutUseCase(authGateway);
  await useCase.execute();
  redirect('/login');
}

export async function recordPrivilegedAuditAction(params: {
  action: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
}): Promise<AdminActionResult<{ recorded: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } };
    }

    const role = (user.user_metadata?.role as ActorRole) || 'ADMIN';
    const actor: Actor = {
      id: user.id as EntityId<'User'>,
      role,
      email: user.email ?? 'admin@jeanius.co',
    };

    const auditRepo = new DrizzleAuditLogRepository(db);
    const useCase = new RecordPrivilegedActionUseCase(auditRepo);

    await useCase.execute({
      actor,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: params.payload,
    });

    return { success: true, data: { recorded: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit log write failed.';
    return { success: false, error: { code: 'AUDIT_RECORD_FAILED', message } };
  }
}
