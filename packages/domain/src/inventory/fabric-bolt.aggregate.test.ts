import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FabricBolt } from './fabric-bolt.aggregate.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('FabricBolt Aggregate (Continuous Selvedge Yardage)', () => {
  it('allocates continuous yardage for an order line', () => {
    const bolt = new FabricBolt({
      id: createEntityId('bolt-kuroki-001'),
      millName: 'Kuroki Mills, Okayama',
      fabricCode: 'KM-14OZ-INDIGO',
      weightOz: 14,
      initialLengthYards: 50.0,
    });

    assert.equal(bolt.remainingLengthYards, 50.0);
    assert.equal(bolt.status, 'ACTIVE');

    const alloc = bolt.allocateContinuousYardage(createEntityId('line-001'), 2.75);
    assert.equal(alloc.yardageAllocated, 2.75);
    assert.equal(bolt.remainingLengthYards, 47.25);
    assert.equal(bolt.allocations.length, 1);
  });

  it('rejects allocation when requested continuous yardage exceeds remaining length', () => {
    const bolt = new FabricBolt({
      id: createEntityId('bolt-kuroki-002'),
      millName: 'Kuroki Mills',
      fabricCode: 'KM-16OZ-NATURAL',
      weightOz: 16,
      initialLengthYards: 5.0,
    });

    // Requesting 6.0 yards from 5.0 yard bolt must fail (cross-bolt splitting prohibited)
    assert.throws(
      () => bolt.allocateContinuousYardage(createEntityId('line-002'), 6.0),
      DomainError,
    );
  });

  it('marks bolt as depleted when remaining yards drop below minimum garment cut (2.0 yds)', () => {
    const bolt = new FabricBolt({
      id: createEntityId('bolt-nihon-003'),
      millName: 'Nihon Menpu',
      fabricCode: 'NM-13OZ-BLACK',
      weightOz: 13,
      initialLengthYards: 4.5,
    });

    // Allocating 3.0 yards leaves 1.5 yards (less than 2.0 yds needed for jeans)
    bolt.allocateContinuousYardage(createEntityId('line-003'), 3.0);
    assert.equal(bolt.remainingLengthYards, 1.5);
    assert.equal(bolt.status, 'DEPLETED');
  });

  it('recovers yardage when an allocation is released', () => {
    const bolt = new FabricBolt({
      id: createEntityId('bolt-kuroki-004'),
      millName: 'Kuroki Mills',
      fabricCode: 'KM-14OZ-INDIGO',
      weightOz: 14,
      initialLengthYards: 50.0,
    });

    const alloc = bolt.allocateContinuousYardage(createEntityId('line-004'), 3.0);
    assert.equal(bolt.remainingLengthYards, 47.0);

    bolt.releaseAllocation(alloc.allocationId);
    assert.equal(bolt.remainingLengthYards, 50.0);
    assert.equal(bolt.allocations.length, 0);
  });
});
