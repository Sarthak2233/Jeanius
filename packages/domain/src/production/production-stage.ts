/**
 * 8-stage OM manufacturing pipeline, CutTicket definition, and stage transition rules (JN-005).
 */
import type { CommerceModel } from '../catalog/product-type.js';

export type ProductionStage =
  'QUEUED' | 'CUTTING' | 'SEWING' | 'WASHING' | 'HARDWARE' | 'QC' | 'READY' | 'SHIPPED';

export const ORDERED_PRODUCTION_STAGES: readonly ProductionStage[] = [
  'QUEUED',
  'CUTTING',
  'SEWING',
  'WASHING',
  'HARDWARE',
  'QC',
  'READY',
  'SHIPPED',
] as const;

export interface ProductionPolicy {
  readonly productType: CommerceModel;
  readonly minimumDays: number;
  readonly maximumDays: number;
  readonly excludedDates?: readonly string[];
  readonly excludedHolidays?: readonly string[];
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

export interface CutTicket {
  readonly jobId: string;
  readonly orderNumber: string;
  readonly orderLineId: string;
  readonly customerName?: string;
  readonly measurements: Readonly<Record<string, string | number>>;
  readonly fabricLot: string;
  readonly threadColor: string;
  readonly buttonFinish: string;
  readonly pocketBagFabric: string;
  readonly cutAt: string;
  readonly artisanName?: string;
}

/**
 * Validates whether a production job can transition from current to next stage.
 * Forward advancement along the pipeline is allowed.
 * QC -> SEWING is permitted specifically for rework loop.
 */
export function canAdvanceProductionStage(
  current: ProductionStage,
  next: ProductionStage,
): boolean {
  if (current === next) return false;
  if (current === 'QC' && next === 'SEWING') return true; // Dedicated artisan rework loop

  const currentIndex = ORDERED_PRODUCTION_STAGES.indexOf(current);
  const nextIndex = ORDERED_PRODUCTION_STAGES.indexOf(next);

  return nextIndex === currentIndex + 1;
}

/**
 * Calculates estimated completion date dynamically based on order date and ProductionPolicy.
 * Automatically excludes Saturday (Nepal weekly rest day) and public holidays.
 */
export function calculateEstimatedCompletion(orderDate: Date, policy: ProductionPolicy): Date {
  const result = new Date(orderDate.getTime());
  let addedDays = 0;
  const targetDays = policy.maximumDays;

  while (addedDays < targetDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Exclude Saturday (standard rest day in Nepal)
    const isWeekend = dayOfWeek === 6;
    const dateStr = result.toISOString().split('T')[0] ?? '';
    const isHoliday = policy.excludedHolidays?.includes(dateStr) ?? false;

    if (!isWeekend && !isHoliday) {
      addedDays++;
    }
  }

  return result;
}
