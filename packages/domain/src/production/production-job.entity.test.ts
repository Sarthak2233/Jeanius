import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProductionJob } from './production-job.entity.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('ProductionJob Aggregate (Kathmandu Workshop Floor)', () => {
  const createJob = () =>
    new ProductionJob({
      id: createEntityId('job-test-01'),
      orderId: createEntityId('ord-test-01'),
      orderLineId: createEntityId('line-test-01'),
      currentStage: 'QUEUED',
      targetCompletionDate: new Date(Date.now() + 14 * 86400000),
    });

  it('advances sequentially through the 8-stage workshop pipeline', () => {
    const job = createJob();
    assert.equal(job.currentStage, 'QUEUED');
    assert.equal(job.isPointOfNoReturn(), false);

    // QUEUED -> CUTTING (Point of no return begins)
    job.advanceStage('CUTTING', 'artisan-ram');
    assert.equal(job.currentStage, 'CUTTING');
    assert.equal(job.assignedArtisanId, 'artisan-ram');
    assert.equal(job.isPointOfNoReturn(), true);

    // CUTTING -> SEWING
    job.advanceStage('SEWING', 'artisan-shyam');
    assert.equal(job.currentStage, 'SEWING');

    // SEWING -> WASHING
    job.advanceStage('WASHING');
    assert.equal(job.currentStage, 'WASHING');

    // WASHING -> HARDWARE
    job.advanceStage('HARDWARE');
    assert.equal(job.currentStage, 'HARDWARE');

    // HARDWARE -> QC
    job.advanceStage('QC', 'lead-inspector-hari');
    assert.equal(job.currentStage, 'QC');
  });

  it('rejects illegal non-sequential stage skips (e.g. QUEUED straight to SEWING)', () => {
    const job = createJob();
    assert.throws(() => job.advanceStage('SEWING'), DomainError);
  });

  it('permits artisan rework loop specifically from QC back to SEWING', () => {
    const job = createJob();
    job.advanceStage('CUTTING');
    job.advanceStage('SEWING');
    job.advanceStage('WASHING');
    job.advanceStage('HARDWARE');
    job.advanceStage('QC');

    assert.equal(job.reworkCount, 0);

    // QC fails stitch inspection -> triggers rework loop back to SEWING
    job.recordRework('Tension loose on waistband chainstitch');
    assert.equal(job.currentStage, 'SEWING');
    assert.equal(job.reworkCount, 1);
    assert.equal(
      job.notes.some((n) => n.includes('loose on waistband')),
      true,
    );

    // Can proceed forward again through WASHING -> HARDWARE -> QC
    job.advanceStage('WASHING');
    job.advanceStage('HARDWARE');
    job.advanceStage('QC');
    job.advanceStage('READY');
    assert.equal(job.currentStage, 'READY');
  });

  it('records delays and adjusts target completion date', () => {
    const job = createJob();
    const initialTarget = job.targetCompletionDate.getTime();

    job.recordDelay(3, 'Monsoon courier delay on Japanese Kuroki denim batch');
    assert.equal(job.delayDays, 3);
    assert.equal(job.targetCompletionDate.getTime(), initialTarget + 3 * 86400000);
  });
});
