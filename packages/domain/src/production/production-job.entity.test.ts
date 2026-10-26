import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProductionJob } from './production-job.entity.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('ProductionJob Aggregate (Kathmandu Metalsmith Workshop Floor)', () => {
  const createJob = () =>
    new ProductionJob({
      id: createEntityId('job-test-01'),
      orderId: createEntityId('ord-test-01'),
      orderLineId: createEntityId('line-test-01'),
      currentStage: 'QUEUED',
      targetCompletionDate: new Date(Date.now() + 14 * 86400000),
    });

  it('advances sequentially through the 8-stage jewellery workshop pipeline', () => {
    const job = createJob();
    assert.equal(job.currentStage, 'QUEUED');
    assert.equal(job.isPointOfNoReturn(), false);

    // QUEUED -> CASTING (Point of no return begins: precious metal poured)
    job.advanceStage('CASTING', 'metalsmith-bikash');
    assert.equal(job.currentStage, 'CASTING');
    assert.equal(job.assignedArtisanId, 'metalsmith-bikash');
    assert.equal(job.isPointOfNoReturn(), true);

    // CASTING -> SETTING
    job.advanceStage('SETTING', 'setter-sunil');
    assert.equal(job.currentStage, 'SETTING');

    // SETTING -> PATINA
    job.advanceStage('PATINA');
    assert.equal(job.currentStage, 'PATINA');

    // PATINA -> POLISHING
    job.advanceStage('POLISHING');
    assert.equal(job.currentStage, 'POLISHING');

    // POLISHING -> QC
    job.advanceStage('QC', 'lead-inspector-kiran');
    assert.equal(job.currentStage, 'QC');

    // QC -> READY
    job.advanceStage('READY');
    assert.equal(job.currentStage, 'READY');

    // READY -> SHIPPED
    job.advanceStage('SHIPPED');
    assert.equal(job.currentStage, 'SHIPPED');
  });

  it('rejects illegal non-sequential stage skips (e.g. QUEUED straight to PATINA)', () => {
    const job = createJob();
    assert.throws(() => job.advanceStage('PATINA'), DomainError);
  });

  it('permits artisan rework loop specifically from QC back to SETTING or POLISHING', () => {
    const job = createJob();
    job.advanceStage('CASTING');
    job.advanceStage('SETTING');
    job.advanceStage('PATINA');
    job.advanceStage('POLISHING');
    job.advanceStage('QC');

    assert.equal(job.reworkCount, 0);

    // QC fails surface inspection -> triggers rework loop back to SETTING
    job.recordRework('Gemstone claw loose; re-prong required', 'SETTING');
    assert.equal(job.currentStage, 'SETTING');
    assert.equal(job.reworkCount, 1);

    // Progresses back through pipeline
    job.advanceStage('PATINA');
    job.advanceStage('POLISHING');
    job.advanceStage('QC');

    // QC passes -> advances to READY
    job.advanceStage('READY');
    assert.equal(job.currentStage, 'READY');
  });
});
