/**
 * FabricBolt aggregate root (JN-085).
 * Enforces continuous shuttle-loom selvedge yardage allocation without cross-bolt splitting.
 */
import type { BoltId, OrderLineId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type BoltStatus = 'ACTIVE' | 'DEPLETED' | 'QUARANTINED';

export interface BoltAllocation {
  readonly allocationId: string;
  readonly orderLineId: OrderLineId;
  readonly yardageAllocated: number;
  readonly allocatedAt: Date;
}

export interface FabricBoltProps {
  readonly id: BoltId;
  readonly millName: string;
  readonly fabricCode: string;
  readonly weightOz: number;
  readonly initialLengthYards: number;
  readonly remainingLengthYards?: number;
  readonly status?: BoltStatus;
  readonly allocations?: readonly BoltAllocation[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class FabricBolt {
  readonly id: BoltId;
  readonly millName: string;
  readonly fabricCode: string;
  readonly weightOz: number;
  readonly initialLengthYards: number;
  private _remainingLengthYards: number;
  private _status: BoltStatus;
  private readonly _allocations: BoltAllocation[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: FabricBoltProps) {
    if (!props.millName?.trim()) {
      throw new DomainError('Mill name is required for selvedge bolt');
    }
    if (!props.fabricCode?.trim()) {
      throw new DomainError('Fabric code is required');
    }
    if (props.initialLengthYards <= 0) {
      throw new DomainError('Initial bolt length in yards must be positive');
    }

    this.id = props.id;
    this.millName = props.millName.trim();
    this.fabricCode = props.fabricCode.trim().toUpperCase();
    this.weightOz = props.weightOz;
    this.initialLengthYards = props.initialLengthYards;
    this._remainingLengthYards = props.remainingLengthYards ?? props.initialLengthYards;
    this._status = props.status ?? 'ACTIVE';
    this._allocations = props.allocations ? [...props.allocations] : [];
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get remainingLengthYards(): number {
    return this._remainingLengthYards;
  }

  get status(): BoltStatus {
    return this._status;
  }

  get allocations(): readonly BoltAllocation[] {
    return [...this._allocations];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Continuous yardage rule: A garment cut must come from a single bolt.
   * Cross-bolt splitting is strictly prohibited to prevent indigo shading mismatch.
   */
  allocateContinuousYardage(orderLineId: OrderLineId, yardsNeeded: number): BoltAllocation {
    if (this._status !== 'ACTIVE') {
      throw new DomainError(`Cannot allocate from bolt ${this.id} with status ${this._status}`);
    }
    if (yardsNeeded <= 0) {
      throw new DomainError(`Yardage needed must be positive, received: ${yardsNeeded}`);
    }
    if (this._remainingLengthYards < yardsNeeded) {
      throw new DomainError(
        `Insufficient continuous yardage on bolt ${this.id}. Required: ${yardsNeeded} yds, Available: ${this._remainingLengthYards} yds`,
      );
    }

    this._remainingLengthYards = Math.round((this._remainingLengthYards - yardsNeeded) * 100) / 100;
    const allocation: BoltAllocation = {
      allocationId: `alloc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderLineId,
      yardageAllocated: yardsNeeded,
      allocatedAt: new Date(),
    };

    this._allocations.push(allocation);

    // If remaining length is less than minimum adult garment requirement (e.g. 2.0 yds), mark depleted
    if (this._remainingLengthYards < 2.0) {
      this._status = 'DEPLETED';
    }

    this._updatedAt = new Date();
    return allocation;
  }

  releaseAllocation(allocationId: string): void {
    const index = this._allocations.findIndex((a) => a.allocationId === allocationId);
    if (index === -1) {
      throw new DomainError(`Allocation ${allocationId} not found on bolt ${this.id}`);
    }
    const alloc = this._allocations[index]!;
    this._remainingLengthYards =
      Math.round((this._remainingLengthYards + alloc.yardageAllocated) * 100) / 100;
    this._allocations.splice(index, 1);

    if (this._status === 'DEPLETED' && this._remainingLengthYards >= 2.0) {
      this._status = 'ACTIVE';
    }

    this._updatedAt = new Date();
  }

  quarantine(reason: string): void {
    this._status = 'QUARANTINED';
    this._updatedAt = new Date();
    void reason;
  }
}
