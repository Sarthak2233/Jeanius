import type { Membership } from '@jeanius/domain';

export interface IMembershipRepository {
  findByCustomerId(customerId: string): Promise<Membership | null>;
  save(membership: Membership): Promise<void>;
}
