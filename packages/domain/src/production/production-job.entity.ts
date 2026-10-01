/**
 * ProductionJob manufacturing aggregate (JN-076).
 * Tracks garment progress through the 8-stage workshop pipeline and enforces artisan floor modes.
 */
import type { ProductionJobId, OrderId, OrderLineId } from '../common/entity-id.js';
import {
  type ProductionStage,
  type CutTicket,
  canAdvanceProductionStage,
} from './production-stage.js';
import { DomainError } from '../errors/index.js';

export interface ProductionJobProps {
  readonly id: ProductionJobId;
  readonly orderId: OrderId;
  readonly orderLineId: OrderLineId;
  readonly currentStage?: ProductionStage;
  readonly targetCompletionDate: Date;
  readonly cutTicket?: CutTicket;
  readonly assignedArtisanId?: string;
  readonly reworkCount?: number;
  readonly delayDays?: number;
  readonly delayReason?: string;
  readonly notes?: readonly string[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class ProductionJob {
  readonly id: ProductionJobId;
  readonly orderId: OrderId;
  readonly orderLineId: OrderLineId;
  private _currentStage: ProductionStage;
  private _targetCompletionDate: Date;
  private _cutTicket?: CutTicket;
  private _assignedArtisanId?: string;
  private _reworkCount: number;
  private _delayDays: number;
  private _delayReason?: string;
  private readonly _notes: string[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ProductionJobProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.orderLineId = props.orderLineId;
    this._currentStage = props.currentStage ?? 'QUEUED';
    this._targetCompletionDate = props.targetCompletionDate;
    this._cutTicket = props.cutTicket;
    this._assignedArtisanId = props.assignedArtisanId;
    this._reworkCount = props.reworkCount ?? 0;
    this._delayDays = props.delayDays ?? 0;
    this._delayReason = props.delayReason;
    this._notes = props.notes ? [...props.notes] : [];
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get currentStage(): ProductionStage {
    return this._currentStage;
  }

  get targetCompletionDate(): Date {
    return this._targetCompletionDate;
  }

  get cutTicket(): CutTicket | undefined {
    return this._cutTicket;
  }

  get assignedArtisanId(): string | undefined {
    return this._assignedArtisanId;
  }

  get reworkCount(): number {
    return this._reworkCount;
  }

  get delayDays(): number {
    return this._delayDays;
  }

  get delayReason(): string | undefined {
    return this._delayReason;
  }

  get notes(): readonly string[] {
    return [...this._notes];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isPointOfNoReturn(): boolean {
    return this._currentStage !== 'QUEUED';
  }

  advanceStage(next: ProductionStage, artisanId?: string): void {
    if (!canAdvanceProductionStage(this._currentStage, next)) {
      throw new DomainError(
        `Invalid production stage transition from ${this._currentStage} to ${next}`,
      );
    }
    this._currentStage = next;
    if (artisanId) {
      this._assignedArtisanId = artisanId;
    }
    this._updatedAt = new Date();
  }

  recordRework(reason: string): void {
    if (this._currentStage !== 'QC') {
      throw new DomainError(
        `Rework can only be triggered from QC stage, current: ${this._currentStage}`,
      );
    }
    this._currentStage = 'SEWING';
    this._reworkCount++;
    this._notes.push(`[REWORK]: ${reason}`);
    this._updatedAt = new Date();
  }

  recordDelay(additionalDays: number, reason: string): void {
    if (additionalDays <= 0) {
      throw new DomainError('Delay days must be positive');
    }
    this._delayDays += additionalDays;
    this._delayReason = reason;
    this._targetCompletionDate = new Date(
      this._targetCompletionDate.getTime() + additionalDays * 24 * 60 * 60 * 1000,
    );
    this._notes.push(`[DELAY +${additionalDays}d]: ${reason}`);
    this._updatedAt = new Date();
  }

  attachCutTicket(ticket: CutTicket): void {
    this._cutTicket = ticket;
    this._updatedAt = new Date();
  }
}
