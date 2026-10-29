// CompliScan's bundled local OCR pattern, with a reused worker for lower startup overhead.
import type { Worker } from 'tesseract.js';
let worker: Promise<Worker> | null = null;
let listener: (message: string) => void = () => {};
export async function recognize(image: Blob, onProgress: (message: string) => void) {
  listener = onProgress;
  if (!worker) {
    worker = import('tesseract.js').then(({ createWorker }) => createWorker('eng', 1, {
      workerPath: `${location.origin}/ocr/worker.min.js`, corePath: `${location.origin}/ocr/`,
      langPath: `${location.origin}/ocr/`, workerBlobURL: false,
      logger: (message: { status: string; progress?: number }) => listener(`${message.status}${message.progress == null ? '' : ` ${Math.round(message.progress * 100)}%`}`)
    })).catch(error => { worker = null; throw error; });
  }
  const active = await worker;
  const result = await active.recognize(image);
  return result.data.text;
}
