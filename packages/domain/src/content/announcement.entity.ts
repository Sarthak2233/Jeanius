/**
 * Announcement entity (JN-081).
 * Operational site notices (holiday closures, festival delays, raw denim drop countdowns).
 */
import type { AnnouncementId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

export type AnnouncementType = 'INFO' | 'WARNING' | 'ALERT' | 'PROMO';

export interface AnnouncementProps {
  readonly id: AnnouncementId;
  readonly title: string;
  readonly message: string;
  readonly type?: AnnouncementType;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly priority?: number;
}

export class Announcement {
  readonly id: AnnouncementId;
  readonly title: string;
  readonly message: string;
  readonly type: AnnouncementType;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly priority: number;

  constructor(props: AnnouncementProps) {
    if (!props.title?.trim()) {
      throw new DomainError('Announcement title cannot be empty');
    }
    if (!props.message?.trim()) {
      throw new DomainError('Announcement message cannot be empty');
    }
    if (props.endDate && props.endDate.getTime() <= props.startDate.getTime()) {
      throw new DomainError('Announcement end date must be after start date');
    }

    this.id = props.id;
    this.title = props.title.trim();
    this.message = props.message.trim();
    this.type = props.type ?? 'INFO';
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.priority = props.priority ?? 0;
  }

  isActive(at: Date = new Date()): boolean {
    const time = at.getTime();
    if (time < this.startDate.getTime()) return false;
    if (this.endDate && time > this.endDate.getTime()) return false;
    return true;
  }
}
