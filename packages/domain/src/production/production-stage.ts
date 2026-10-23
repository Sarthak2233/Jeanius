/**
 * 8-stage OM Jewellery manufacturing pipeline and stage transition rules (Project 925).
 * Strictly Kathmandu Metalsmith workshop stages.
 */
import type { CommerceModel } from '../catalog/product-type.js';

export type ProductionStage =
  'QUEUED' | 'CASTING' | 'SETTING' | 'PATINA' | 'POLISHING' | 'QC' | 'READY' | 'SHIPPED';

export const JEWELLERY_PRODUCTION_STAGES: readonly ProductionStage[] = [
  'QUEUED',
  'CASTING',
  'SETTING',
  'PATINA',
  'POLISHING',
  'QC',
  'READY',
  'SHIPPED',
] as const;

export const PRODUCTION_STAGES = JEWELLERY_PRODUCTION_STAGES;

export interface ProductionPolicy {
  readonly productType: CommerceModel;
  readonly minimumDays: number;
  readonly maximumDays: number;
  readonly excludedDates?: readonly string[];
  readonly excludedHolidays?: readonly string[];
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

export interface MetalsmithWorkTicket {
  readonly jobId: string;
  readonly orderNumber: string;
  readonly orderLineId: string;
  readonly customerName?: string;
  readonly ringSize?: string;
  readonly chainLength?: string;
  readonly metalAlloy: string;
  readonly purity: string;
  readonly metalLotNumber?: string;
  readonly finish: string;
  readonly engravingText?: string;
  readonly gemstone?: string;
  readonly benchStartedAt: string;
  readonly metalsmithName?: string;
}

// Backward compatibility alias
export type JewelleryBenchTicket = MetalsmithWorkTicket;
export type CraftTicket = MetalsmithWorkTicket;

/**
 * Validates whether a production job can transition from current to next stage.
 * Forward advancement along the Kathmandu metalsmithing pipeline is allowed.
 * QC -> SETTING or QC -> POLISHING is permitted for rework loops.
 */
export function canAdvanceProductionStage(
  current: ProductionStage,
  next: ProductionStage,
): boolean {
  if (current === next) return false;
  if (current === 'QC' && (next === 'SETTING' || next === 'POLISHING')) return true; // Jewellery rework loop

  const currentIndex = JEWELLERY_PRODUCTION_STAGES.indexOf(current);
  const nextIndex = JEWELLERY_PRODUCTION_STAGES.indexOf(next);

  if (currentIndex !== -1 && nextIndex === currentIndex + 1) {
    return true;
  }

  return false;
}

/**
 * Calculates estimated completion date dynamically based on order date and ProductionPolicy.
 * Automatically excludes Saturday (Nepal weekly rest day) and public holidays in Kathmandu.
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
