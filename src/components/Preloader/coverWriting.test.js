import test from 'node:test';
import assert from 'node:assert/strict';
import { getStampFlapPose, scheduleCoverWriting, smoothstep } from './coverWriting.js';

test('cover writing budgets measured line lengths, smooth easing, and the lift travel', () => {
  assert.deepEqual(scheduleCoverWriting([10, 30, 20, 40], 2500, 160), [
    { lineIndex: 0, startMs: 0, endMs: 202, travelEndMs: 362 },
    { lineIndex: 1, startMs: 362, endMs: 968, travelEndMs: 1128 },
    { lineIndex: 2, startMs: 1128, endMs: 1532, travelEndMs: 1692 },
    { lineIndex: 3, startMs: 1692, endMs: 2500, travelEndMs: 2500 },
  ]);

  const defaultTravel = scheduleCoverWriting([1, 1], 1000);
  assert.equal(defaultTravel[0].travelEndMs - defaultTravel[0].endMs, 160);
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(0.25), 0.15625);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(0.75), 0.84375);
  assert.equal(smoothstep(2), 1);
});

test('stamp flap pose transcribes the dove, wing, and envelope keyframes', () => {
  assert.equal(getStampFlapPose(0).nearWingRotationDegrees, 0);
  assert.equal(getStampFlapPose(176.4).nearWingRotationDegrees, -26);
  assert.equal(getStampFlapPose(344.4).nearWingRotationDegrees, 6);
  assert.equal(getStampFlapPose(420).nearWingRotationDegrees, 0);

  assert.equal(getStampFlapPose(58.8).farWingRotationDegrees, 0);
  assert.equal(getStampFlapPose(218.4).farWingRotationDegrees, -20);
  assert.equal(getStampFlapPose(357).farWingRotationDegrees, 4);
  assert.equal(getStampFlapPose(420).farWingRotationDegrees, 0);

  assert.equal(getStampFlapPose(240).envelopeSwingDegrees, 8);
  assert.equal(getStampFlapPose(560).envelopeSwingDegrees, -6);
  assert.equal(getStampFlapPose(1600).envelopeSwingDegrees, 0);

  assert.equal(getStampFlapPose(231).doveBobY, -8);
  assert.equal(getStampFlapPose(420).doveBobY, 0);
  assert.ok(Math.abs(getStampFlapPose(44.1).nearWingRotationDegrees + 3.517) < 0.02);
});
