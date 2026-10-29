// Adapted from CompliScan's local OCR asset preparation. No CDN needed at runtime.
import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const destination = new URL('../public/ocr/', import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(require.resolve('tesseract.js/dist/worker.min.js'), new URL('worker.min.js', destination));
const core = dirname(require.resolve('tesseract.js-core/package.json'));
for (const file of await readdir(core)) {
  if (/^tesseract-core.*\.wasm(\.js)?$/.test(file)) await copyFile(join(core, file), new URL(file, destination));
}
const language = dirname(require.resolve('@tesseract.js-data/eng/package.json'));
await copyFile(join(language, '4.0.0_best_int', 'eng.traineddata.gz'), new URL('eng.traineddata.gz', destination));
console.log('Bundled OCR assets ready.');
