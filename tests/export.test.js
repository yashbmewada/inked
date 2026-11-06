import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileName, capabilities, createExporter } from '../js/export.js';

function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}

test('fileName uses local date with the inked- prefix', () => {
  assert.equal(fileName(new Date(2026, 10, 6)), 'inked-2026-11-06.png');
});

test('capabilities is all false without browser APIs', () => {
  assert.deepEqual(capabilities({}), { shareFiles: false, copyImage: false });
});

test('a stale render is discarded', async () => {
  const jobs = [];
  const exporter = createExporter(() => {
    const d = deferred();
    jobs.push(d);
    return d.promise;
  });
  exporter.invalidate();
  const first = exporter.prepare();
  exporter.invalidate();
  const second = exporter.prepare();
  jobs[0].resolve('old');
  await first;
  assert.equal(exporter.ready(), null);
  jobs[1].resolve('new');
  await second;
  assert.equal(exporter.ready(), 'new');
});

test('onChange fires false on invalidate and true on a current render', async () => {
  const exporter = createExporter(async () => 'blob');
  const seen = [];
  exporter.onChange((r) => seen.push(r));
  exporter.invalidate();
  await exporter.prepare();
  assert.deepEqual(seen, [false, true]);
});

test('prepare does nothing when a blob is already ready', async () => {
  let calls = 0;
  const exporter = createExporter(async () => ++calls);
  await exporter.prepare();
  await exporter.prepare();
  assert.equal(calls, 1);
});

test('a null render leaves Preparing, retries once, then delivers the blob', async () => {
  let calls = 0;
  const exporter = createExporter(async () => (++calls === 1 ? null : 'blob'), { retryMs: 5 });
  const seen = [];
  exporter.onChange((r) => seen.push(r));
  exporter.invalidate();
  await exporter.prepare();
  assert.equal(exporter.ready(), null);
  assert.equal(exporter.failed(), true);
  assert.deepEqual(seen, [false, false]);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(exporter.ready(), 'blob');
  assert.equal(exporter.failed(), false);
  assert.deepEqual(seen, [false, false, true]);
  assert.equal(calls, 2);
});

test('after the one retry fails, no further retries until a change', async () => {
  let calls = 0;
  const exporter = createExporter(async () => (++calls, null), { retryMs: 5 });
  await exporter.prepare();
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(calls, 2);
  exporter.invalidate();
  await exporter.prepare();
  assert.equal(calls, 3);
});
