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
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';

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
  try {
    const validated = SignUpSchema.parse(formData);
    const { authGateway, userProfileRepo, outboxRepo } = await getServices();
    const useCase = new SignUpUseCase(authGateway, userProfileRepo, outboxRepo);

    const result = await useCase.execute(validated);
    return { success: true, data: { userId: result.userId } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { success: false, error: { code: 'SIGN_UP_FAILED', message } };
  }
}

export async function loginAction(formData: unknown): Promise<ActionResult<{ role: string }>> {
  try {
    const validated = LoginSchema.parse(formData);
    const { authGateway, userProfileRepo } = await getServices();
    const useCase = new LoginUseCase(authGateway, userProfileRepo);

    const result = await useCase.execute(validated);
    return { success: true, data: { role: result.role } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return { success: false, error: { code: 'LOGIN_FAILED', message } };
  }
}

export async function logoutAction(): Promise<void> {
  const { authGateway } = await getServices();
  const useCase = new LogoutUseCase(authGateway);
  await useCase.execute();
  redirect('/login');
}

export async function requestPasswordResetAction(formData: unknown): Promise<ActionResult<void>> {
  try {
    const validated = RequestPasswordResetSchema.parse(formData);
    const { authGateway, outboxRepo } = await getServices();
    const useCase = new RequestPasswordResetUseCase(authGateway, outboxRepo);

    await useCase.execute(validated);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset request failed';
    return { success: false, error: { code: 'RESET_REQUEST_FAILED', message } };
  }
}

export async function resetPasswordAction(formData: unknown): Promise<ActionResult<void>> {
  try {
    const validated = ResetPasswordSchema.parse(formData);
    const { authGateway } = await getServices();
    const useCase = new ResetPasswordUseCase(authGateway);

    await useCase.execute(validated);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password update failed';
    return { success: false, error: { code: 'PASSWORD_UPDATE_FAILED', message } };
  }
}

export async function updateProfileAction(data: unknown): Promise<ActionResult<void>> {
  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    const validated = UpdateProfileSchema.parse(data);
    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);

    await useCase.updateProfile(user.id, validated);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Profile update failed';
    return { success: false, error: { code: 'PROFILE_UPDATE_FAILED', message } };
  }
}

export async function addAddressAction(
  data: unknown,
): Promise<ActionResult<{ addressId: string }>> {
  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    const validated = CreateAddressInputSchema.parse(data);
    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);

    const created = await useCase.addAddress(user.id, validated);
    return { success: true, data: { addressId: created.id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Address creation failed';
    return { success: false, error: { code: 'ADDRESS_CREATE_FAILED', message } };
  }
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult<void>> {
  try {
    const { supabase, userProfileRepo, addressRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      };
    }

    const useCase = new CustomerProfileUseCase(userProfileRepo, addressRepo);
    await useCase.deleteAddress(user.id, addressId);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Address deletion failed';
    return { success: false, error: { code: 'ADDRESS_DELETE_FAILED', message } };
  }
}

export async function resolveCustomizationDefaultsAction(
  context: AutoFillContextDto,
): Promise<ActionResult<ResolvedCustomizationDefaultsDto>> {
  try {
    const validated = AutoFillContextSchema.parse(context);
    const { supabase, userProfileRepo } = await getServices();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const useCase = new ResolveCustomizationDefaultsUseCase(userProfileRepo);
    const defaults = await useCase.execute(user?.id, validated);

    return {
      success: true,
      data: defaults as ResolvedCustomizationDefaultsDto,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Customization auto-fill failed';
    return { success: false, error: { code: 'AUTOFILL_FAILED', message } };
  }
}
