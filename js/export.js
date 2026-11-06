const pad = (n) => String(n).padStart(2, '0');

export function fileName(date) {
  return `inked-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.png`;
}

export function capabilities(nav = navigator) {
  let shareFiles = false;
  try {
    shareFiles = !!nav.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] });
  } catch {
    shareFiles = false;
  }
  return { shareFiles, copyImage: !!(nav.clipboard?.write && globalThis.ClipboardItem) };
}

export function createExporter(render, { retryMs = 1000 } = {}) {
  let version = 0;
  let blob = null;
  let pending = null;
  let retryTimer = 0;
  let retried = false;
  let failed = false;
  const listeners = [];
  const emit = () => listeners.forEach((cb) => cb(blob !== null));

  function invalidate() {
    version++;
    blob = null;
    pending = null;
    retried = false;
    failed = false;
    clearTimeout(retryTimer);
    retryTimer = 0;
    emit();
  }

  function prepare() {
    if (blob !== null) return Promise.resolve();
    if (pending) return pending;
    const mine = version;
    const run = (async () => {
      let result = null;
      try {
        result = await render();
      } catch {
        result = null;
      }
      if (mine !== version) return;
      pending = null;
      if (result) {
        blob = result;
        failed = false;
        emit();
        return;
      }
      failed = true;
      // A failed render leaves the UI unblocked; one retry, then wait for the next change.
      emit();
      if (!retried) {
        retried = true;
        retryTimer = setTimeout(() => {
          retryTimer = 0;
          if (mine === version) prepare();
        }, retryMs);
      }
    })();
    pending = run;
    return run;
  }

  return {
    invalidate,
    prepare,
    ready: () => blob,
    failed: () => failed,
    onChange: (cb) => listeners.push(cb),
  };
}

export async function share(blob, { caption = null } = {}) {
  const data = { files: [new File([blob], 'inked.png', { type: 'image/png' })], title: 'Inked.' };
  if (caption) data.text = caption;
  try {
    await navigator.share(data);
  } catch (e) {
    if (e?.name !== 'AbortError') throw e;
  }
}

export function copy(blob) {
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
