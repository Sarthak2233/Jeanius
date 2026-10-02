/**
 * MetalStock aggregate root (JN-086).
 * Tracks raw precious metal casting grain (.925 Sterling Silver, Solid Brass, 18k Gold).
 */
import type { MetalStockId, OrderLineId, MetalAllocationId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type MetalAlloy = 'STERLING_SILVER_925' | 'SOLID_BRASS' | 'YELLOW_GOLD_18K';
export type MetalStockStatus = 'ACTIVE' | 'DEPLETED' | 'RECLAIMED';

export interface MetalAllocation {
  readonly id: MetalAllocationId;
  readonly orderLineId: OrderLineId;
  readonly gramsAllocated: number;
  readonly allocatedAt: Date;
}

export interface MetalStockProps {
  readonly id: MetalStockId;
  readonly metalAlloy: MetalAlloy;
  readonly purity: number;
  readonly lotNumber: string;
  readonly initialWeightGrams: number;
  readonly remainingWeightGrams: number;
  readonly supplier: string;
  readonly status?: MetalStockStatus;
  readonly allocations?: readonly MetalAllocation[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class MetalStock {
  readonly id: MetalStockId;
  readonly metalAlloy: MetalAlloy;
  readonly purity: number;
  readonly lotNumber: string;
  readonly initialWeightGrams: number;
  private _remainingWeightGrams: number;
  readonly supplier: string;
  private _status: MetalStockStatus;
  private readonly _allocations: MetalAllocation[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: MetalStockProps) {
    if (props.initialWeightGrams <= 0) {
      throw new DomainError('Initial metal stock weight must be positive');
    }
    if (props.remainingWeightGrams < 0) {
      throw new DomainError('Remaining metal stock weight cannot be negative');
    }
    if (props.purity <= 0 || props.purity > 1) {
      throw new DomainError('Metal stock purity must be between 0 and 1');
    }

    this.id = props.id;
    this.metalAlloy = props.metalAlloy;
    this.purity = props.purity;
    this.lotNumber = props.lotNumber;
    this.initialWeightGrams = props.initialWeightGrams;
    this._remainingWeightGrams = props.remainingWeightGrams;
    this.supplier = props.supplier;
    this._status = props.status ?? 'ACTIVE';
    this._allocations = props.allocations ? [...props.allocations] : [];
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get remainingWeightGrams(): number {
    return this._remainingWeightGrams;
  }

  get status(): MetalStockStatus {
    return this._status;
  }

  get allocations(): readonly MetalAllocation[] {
    return [...this._allocations];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  allocateWeight(
    allocationId: MetalAllocationId,
    orderLineId: OrderLineId,
    gramsNeeded: number,
  ): void {
    if (this._status !== 'ACTIVE') {
      throw new DomainError(`Cannot allocate from metal stock in status ${this._status}`);
    }
    if (gramsNeeded <= 0) {
      throw new DomainError('Allocated weight must be positive');
    }
    if (this._remainingWeightGrams < gramsNeeded) {
      throw new DomainError(
        `Insufficient metal stock. Requested: ${gramsNeeded}g, Available: ${this._remainingWeightGrams}g`,
      );
    }

    this._remainingWeightGrams -= gramsNeeded;
    this._allocations.push({
      id: allocationId,
      orderLineId,
      gramsAllocated: gramsNeeded,
      allocatedAt: new Date(),
    });

    if (this._remainingWeightGrams === 0) {
      this._status = 'DEPLETED';
    }

    this._updatedAt = new Date();
  }

  reclaimScrap(gramsReclaimed: number): void {
    if (gramsReclaimed <= 0) {
      throw new DomainError('Reclaimed scrap weight must be positive');
    }

    this._remainingWeightGrams += gramsReclaimed;

    if (this._status === 'DEPLETED' && this._remainingWeightGrams > 0) {
      this._status = 'ACTIVE';
    }

    this._updatedAt = new Date();
  }
}
