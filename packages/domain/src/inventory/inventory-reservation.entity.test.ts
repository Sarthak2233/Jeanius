import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InventoryReservation } from './inventory-reservation.entity.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('InventoryReservation (Two-Phase Hold)', () => {
  it('initializes with default 10-minute TTL', () => {
    const reservation = new InventoryReservation({
      id: createEntityId('res-001'),
      variantId: createEntityId('var-drop-32'),
      quantity: 1,
    });

    assert.equal(reservation.status, 'HELD');
    const diffMs = reservation.expiresAt.getTime() - reservation.createdAt.getTime();
    assert.equal(diffMs, 10 * 60 * 1000);
    assert.equal(reservation.isExpired(), false);
  });

  it('commits successfully when within TTL window', () => {
    const reservation = new InventoryReservation({
      id: createEntityId('res-002'),
      variantId: createEntityId('var-drop-34'),
      quantity: 2,
    });

    reservation.commit();
    assert.equal(reservation.status, 'COMMITTED');
  });

  it('throws error and transitions to EXPIRED if committed past TTL', () => {
    const pastExpiresAt = new Date(Date.now() - 5000); // 5 seconds ago
    const reservation = new InventoryReservation({
      id: createEntityId('res-003'),
      variantId: createEntityId('var-drop-36'),
      quantity: 1,
      expiresAt: pastExpiresAt,
    });

    assert.equal(reservation.isExpired(), true);
    assert.throws(() => reservation.commit(), DomainError);
    assert.equal(reservation.status, 'EXPIRED');
  });

  it('releases hold when checkout is cancelled', () => {
    const reservation = new InventoryReservation({
      id: createEntityId('res-004'),
      variantId: createEntityId('var-drop-32'),
      quantity: 1,
    });

    reservation.release();
    assert.equal(reservation.status, 'RELEASED');
  });
});
