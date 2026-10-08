'use server';

import {
  SignUpSchema,
  LoginSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  CreateAddressInputSchema,
  AutoFillContextSchema,
  type AutoFillContextDto,
  type ResolvedCustomizationDefaultsDto,
} from '@jeanius/contracts';
import {
  SignUpUseCase,
  LoginUseCase,
  LogoutUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  CustomerProfileUseCase,
  ResolveCustomizationDefaultsUseCase,
} from '@jeanius/application';
import {
  db,
  DrizzleUserProfileRepository,
  DrizzleAddressRepository,
  DrizzleOutboxRepository,
} from '@jeanius/database';
import { SupabaseAuthGateway } from '@jeanius/integrations';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';

const logger = createLogger('storefront:auth-actions');

export interface ActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

async function getServices() {
  const supabase = await createClient();
  const authGateway = new SupabaseAuthGateway(supabase);
  const userProfileRepo = new DrizzleUserProfileRepository(db);
  const addressRepo = new DrizzleAddressRepository(db);
  const outboxRepo = new DrizzleOutboxRepository(db);

  return {
    supabase,
    authGateway,
    userProfileRepo,
    addressRepo,
    outboxRepo,
  };
}

export async function signUpAction(formData: unknown): Promise<ActionResult<{ userId: string }>> {
  const traceId = generateTraceId();
  const start = Date.now();
  logger.info('Customer sign-up action started', { traceId });

  try {
    const validated = SignUpSchema.parse(formData);
    const { authGateway, userProfileRepo, outboxRepo } = await getServices();
    const useCase = new SignUpUseCase(authGateway, userProfileRepo, outboxRepo);

    const result = await useCase.execute(validated);
    logger.info('Customer sign-up action succeeded', {
      traceId,
      userId: result.userId,
      email: result.email,
      durationMs: Date.now() - start,
    });
    return { success: true, data: { userId: result.userId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    logger.error('Customer sign-up action failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'SIGN_UP_FAILED', message } };
  }
}

export async function loginAction(formData: unknown): Promise<ActionResult<{ role: string }>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const validated = LoginSchema.parse(formData);
    logger.info('Customer login action started', { traceId, email: validated.email });
    const { authGateway, userProfileRepo } = await getServices();
    const useCase = new LoginUseCase(authGateway, userProfileRepo);

    const result = await useCase.execute(validated);
    logger.info('Customer login action succeeded', {
      traceId,
      role: result.role,
      durationMs: Date.now() - start,
    });
    return { success: true, data: { role: result.role } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    logger.warn('Customer login action failed', {
      traceId,
      error: message,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'LOGIN_FAILED', message } };
  }
}

export async function logoutAction(): Promise<void> {
  const traceId = generateTraceId();
  const start = Date.now();
  logger.info('Customer logout action initiated', { traceId });

  const { authGateway } = await getServices();
  const useCase = new LogoutUseCase(authGateway);
  await useCase.execute();

  logger.info('Customer logout action completed, redirecting to login', {
    traceId,
    durationMs: Date.now() - start,
  });
  redirect('/login');
}

export async function requestPasswordResetAction(formData: unknown): Promise<ActionResult<void>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const validated = RequestPasswordResetSchema.parse(formData);
    logger.info('Password reset request action initiated', { traceId, email: validated.email });
    const { authGateway, outboxRepo } = await getServices();
    const useCase = new RequestPasswordResetUseCase(authGateway, outboxRepo);

    await useCase.execute(validated);
    logger.info('Password reset request action succeeded', {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset request failed';
    logger.error('Password reset request action failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'RESET_REQUEST_FAILED', message } };
  }
}

export async function resetPasswordAction(formData: unknown): Promise<ActionResult<void>> {
  const traceId = generateTraceId();
  const start = Date.now();
  logger.info('Password update action initiated', { traceId });

  try {
    const validated = ResetPasswordSchema.parse(formData);
    const { authGateway } = await getServices();
    const useCase = new ResetPasswordUseCase(authGateway);

    await useCase.execute(validated);
    logger.info('Password update action succeeded', {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password update failed';
    logger.error('Password update action failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'PASSWORD_UPDATE_FAILED', message } };
  }
}

export async function updateProfileAction(data: unknown): Promise<ActionResult<void>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn('Unauthorized updateProfile attempt', { traceId });
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    const validated = UpdateProfileSchema.parse(data);
    logger.info('Customer profile update action started', {
      traceId,
      userId: user.id,
      craftFocus: validated.craftFocus,
    });
    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);

    await useCase.updateProfile(user.id, validated);
    logger.info('Customer profile update action succeeded', {
      traceId,
      userId: user.id,
      durationMs: Date.now() - start,
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Profile update failed';
    logger.error('Customer profile update action failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'PROFILE_UPDATE_FAILED', message } };
  }
}

export async function addAddressAction(
  data: unknown,
): Promise<ActionResult<{ addressId: string }>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn('Unauthorized addAddress attempt', { traceId });
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    const validated = CreateAddressInputSchema.parse(data);
    logger.info('Customer address addition started', { traceId, userId: user.id });
    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);

    const created = await useCase.addAddress(user.id, validated);
    logger.info('Customer address addition succeeded', {
      traceId,
      userId: user.id,
      addressId: created.id,
      durationMs: Date.now() - start,
    });
    return { success: true, data: { addressId: created.id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Address creation failed';
    logger.error('Customer address addition failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'ADDRESS_CREATE_FAILED', message } };
  }
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult<void>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logger.warn('Unauthorized deleteAddress attempt', { traceId });
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    logger.info('Customer address deletion started', { traceId, userId: user.id, addressId });
    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);
    await useCase.deleteAddress(user.id, addressId);
    logger.info('Customer address deletion succeeded', {
      traceId,
      userId: user.id,
      addressId,
      durationMs: Date.now() - start,
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Address deletion failed';
    logger.error('Customer address deletion failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'ADDRESS_DELETE_FAILED', message } };
  }
}

export async function resolveCustomizationDefaultsAction(
  context: AutoFillContextDto,
): Promise<ActionResult<ResolvedCustomizationDefaultsDto>> {
  const traceId = generateTraceId();
  const start = Date.now();

  try {
    const validated = AutoFillContextSchema.parse(context);
    const { supabase, userProfileRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    logger.debug('Resolving customization defaults action started', {
      traceId,
      userId: user?.id,
      category: validated.category,
      subcategory: validated.subcategory,
    });

    const useCase = new ResolveCustomizationDefaultsUseCase(userProfileRepo);
    const defaults = await useCase.execute(user?.id, validated);

    logger.debug('Resolving customization defaults action succeeded', {
      traceId,
      userId: user?.id,
      category: validated.category,
      subcategory: validated.subcategory,
      durationMs: Date.now() - start,
    });

    return {
      success: true,
      data: defaults as ResolvedCustomizationDefaultsDto,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Customization auto-fill failed';
    logger.error('Resolving customization defaults action failed', err, {
      traceId,
      durationMs: Date.now() - start,
    });
    return { success: false, error: { code: 'AUTOFILL_FAILED', message } };
  }
}
