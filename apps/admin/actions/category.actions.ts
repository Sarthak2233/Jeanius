'use server';

import { db, DrizzleCategoryRepository, DrizzleAuditLogRepository } from '@jeanius/database';
import { CategoryService, RecordPrivilegedActionUseCase } from '@jeanius/application';
import { createEntityId, type Actor, type ActorRole } from '@jeanius/domain';
import { createLogger, generateTraceId } from '@jeanius/observability';
import { CreateCategorySchema, UpdateCategorySchema } from '@jeanius/contracts';
import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

const logger = createLogger('admin:category-actions');

export interface AdminActionResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

export interface CategoryAdminDto {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

async function getAdminCategoryContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const role = (user.user_metadata?.role as string) || 'STAFF';
  if (role !== 'ADMIN') {
    throw new Error('Only administrators can manage jewellery categories');
  }

  const actor: Actor = {
    id: createEntityId<'Actor'>(user.id),
    email: user.email || 'admin@jeanius.co',
    role: role as ActorRole,
  };

  const categoryRepo = new DrizzleCategoryRepository(db);
  const auditRepo = new DrizzleAuditLogRepository(db);
  const categoryService = new CategoryService(categoryRepo);
  const auditUseCase = new RecordPrivilegedActionUseCase(auditRepo);

  return { actor, categoryService, auditUseCase };
}

export async function getCategoriesAction(): Promise<AdminActionResult<CategoryAdminDto[]>> {
  try {
    const categoryRepo = new DrizzleCategoryRepository(db);
    const categoryService = new CategoryService(categoryRepo);
    const items = await categoryService.listCategories(false);

    const dtos: CategoryAdminDto[] = items.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return { success: true, data: dtos };
  } catch (error) {
    logger.error('Failed to load categories', { error });
    return {
      success: false,
      error: {
        code: 'LOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to load categories',
      },
    };
  }
}

export async function createCategoryAction(
  formData: FormData,
): Promise<AdminActionResult<CategoryAdminDto>> {
  const traceId = generateTraceId();
  try {
    const { actor, categoryService, auditUseCase } = await getAdminCategoryContext();

    const raw = {
      slug: (formData.get('slug') as string)?.trim().toLowerCase(),
      name: (formData.get('name') as string)?.trim(),
      description: (formData.get('description') as string)?.trim() || undefined,
      sortOrder: Number(formData.get('sortOrder') ?? 0),
      isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    };

    const parsed = CreateCategorySchema.parse(raw);
    const created = await categoryService.createCategory(parsed);

    await auditUseCase.execute({
      actor,
      action: 'CATEGORY_CREATED',
      entityType: 'categories',
      entityId: created.id,
      payload: { slug: created.slug, name: created.name },
    });

    revalidatePath('/categories');
    revalidatePath('/(storefront)', 'layout');

    return {
      success: true,
      data: {
        id: created.id,
        slug: created.slug,
        name: created.name,
        description: created.description,
        sortOrder: created.sortOrder,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to create category', { traceId, error });
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create category',
      },
    };
  }
}

export async function updateCategoryAction(
  id: string,
  updates: {
    readonly name?: string;
    readonly description?: string;
    readonly sortOrder?: number;
    readonly isActive?: boolean;
  },
): Promise<AdminActionResult<CategoryAdminDto>> {
  const traceId = generateTraceId();
  try {
    const { actor, categoryService, auditUseCase } = await getAdminCategoryContext();

    const parsed = UpdateCategorySchema.parse(updates);
    const updated = await categoryService.updateCategory({
      id,
      name: parsed.name,
      description: parsed.description ?? undefined,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive,
    });

    await auditUseCase.execute({
      actor,
      action: 'CATEGORY_UPDATED',
      entityType: 'categories',
      entityId: updated.id,
      payload: { ...parsed },
    });

    revalidatePath('/categories');
    revalidatePath('/(storefront)', 'layout');

    return {
      success: true,
      data: {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        description: updated.description,
        sortOrder: updated.sortOrder,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to update category', { traceId, id, error });
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update category',
      },
    };
  }
}

export async function toggleCategoryStatusAction(
  id: string,
): Promise<AdminActionResult<CategoryAdminDto>> {
  try {
    const { actor, categoryService, auditUseCase } = await getAdminCategoryContext();
    const toggled = await categoryService.toggleCategoryStatus(id);

    await auditUseCase.execute({
      actor,
      action: 'CATEGORY_STATUS_TOGGLED',
      entityType: 'categories',
      entityId: toggled.id,
      payload: { isActive: toggled.isActive },
    });

    revalidatePath('/categories');
    revalidatePath('/(storefront)', 'layout');

    return {
      success: true,
      data: {
        id: toggled.id,
        slug: toggled.slug,
        name: toggled.name,
        description: toggled.description,
        sortOrder: toggled.sortOrder,
        isActive: toggled.isActive,
        createdAt: toggled.createdAt.toISOString(),
        updatedAt: toggled.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to toggle category status', { id, error });
    return {
      success: false,
      error: {
        code: 'TOGGLE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to toggle category status',
      },
    };
  }
}

export async function deleteCategoryAction(id: string): Promise<AdminActionResult<void>> {
  try {
    const { actor, categoryService, auditUseCase } = await getAdminCategoryContext();
    await categoryService.deleteCategory(id);

    await auditUseCase.execute({
      actor,
      action: 'CATEGORY_DELETED',
      entityType: 'categories',
      entityId: id,
    });

    revalidatePath('/categories');
    revalidatePath('/(storefront)', 'layout');

    return { success: true };
  } catch (error) {
    logger.error('Failed to delete category', { id, error });
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete category',
      },
    };
  }
}
