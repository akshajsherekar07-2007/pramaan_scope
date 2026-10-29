import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Clock3, FileText, MinusCircle, X, ExternalLink, ShieldQuestion, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import type { DocumentVersion, Finding, Review, Status } from '../shared/types';
export function StatusBadge({ status, label }: { status: Status | 'STALE' | 'SIMULATED' | 'READY' | 'NEEDS_OCR' | 'ERROR'; label?: string }) {
  const Icon = status === 'PASS' || status === 'READY' ? CheckCircle2 : status === 'DEFICIENCY' || status === 'ERROR' ? AlertCircle : status === 'NOT_APPLICABLE' ? MinusCircle : status === 'SIMULATED' ? ShieldQuestion : Clock3;
  const titles = { PASS: 'Consistent', DEFICIENCY: 'Needs attention', UNRESOLVED: 'Unresolved', NOT_APPLICABLE: 'Not applicable', STALE: 'Review again', SIMULATED: 'Simulated', READY: 'Extracted', NEEDS_OCR: 'OCR required', ERROR: 'Extraction error' };
  return <span className={`status status-${status.toLowerCase()}`}><Icon size={13} aria-hidden="true" />{label || titles[status]}</span>;
}
export function ReviewBadge({ finding, reviews }: { finding: Finding; reviews: Review[] }) {
  const entries = reviews.filter(review => review.findingKey === finding.key);
  const latest = entries.at(-1);
  if (!latest) return <span className="muted small">Not reviewed</span>;
  if (latest.fingerprint !== finding.fingerprint) return <StatusBadge status="STALE" />;
  return <span className="review-label">{latest.action === 'CLARIFICATION' ? 'Clarification requested' : latest.action === 'REVIEWED' ? 'Reviewed' : latest.action === 'INSPECTION' ? 'Inspection advised' : 'Manual check recorded'}</span>;
}
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; ref.current?.showModal(); return () => previous?.focus(); }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>
    {children}
  </dialog>;
}
export function DocumentPreview({ document, page = 1, compact = false }: { document?: DocumentVersion; page?: number; compact?: boolean }) {
  const [selectedPage, setSelectedPage] = useState(page); const [loadedSource, setLoadedSource] = useState(''); const [failedSource, setFailedSource] = useState('');
  useEffect(() => { setSelectedPage(page); }, [document?.id, page]);
  const changePage = (next: number) => setSelectedPage(next);
  if (!document) return <div className="empty-state"><FileText size={32} /><h3>No original evidence yet</h3><p>Upload a supporting document to inspect its original contents.</p></div>;
  const url = `/api/documents/${document.id}/file`;
  const previewSource = `/api/documents/${document.id}/page/${selectedPage}`;
  const loaded = loadedSource === previewSource; const failed = failedSource === previewSource;
  const pageCount = Math.max(1, document.pages.length);
  return <div className={`document-preview ${compact ? 'compact-preview' : ''}`}>
    <div className="preview-toolbar"><span><FileText size={15} />{document.name}</span><a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${document.name} in a new tab`}><ExternalLink size={15} /> Open original</a></div>
    {document.mime === 'application/pdf' ? <><div className="pdf-page-navigation"><button className="icon-button" aria-label={`Previous page of ${document.name}`} disabled={selectedPage <= 1} onClick={() => changePage(selectedPage - 1)}><ChevronLeft size={16}/></button><span>Page {selectedPage} of {pageCount}</span><button className="icon-button" aria-label={`Next page of ${document.name}`} disabled={selectedPage >= pageCount} onClick={() => changePage(selectedPage + 1)}><ChevronRight size={16}/></button></div><div className="rendered-pdf-page" role="region" tabIndex={0} aria-label={`Scrollable original ${document.name}, page ${selectedPage}`} key={`${document.id}:${selectedPage}`}>
      {!loaded && !failed && <div className="pdf-loading" role="status"><LoaderCircle size={20} className="spin"/><span>Rendering the original page…</span></div>}
      {failed ? <div className="empty-state"><AlertCircle size={24}/><h3>Preview unavailable</h3><p>The original is retained. Open the PDF to inspect this page.</p><a className="button secondary" href={url} target="_blank" rel="noreferrer">Open original</a></div> : <img key={previewSource} src={previewSource} alt={`Original ${document.name}, page ${selectedPage}. Extracted evidence is provided below.`} onLoad={() => setLoadedSource(previewSource)} onError={() => setFailedSource(previewSource)} />}
    </div></> : <div className="image-preview"><img src={url} alt={`Uploaded evidence: ${document.name}`} /></div>}
    <div className="preview-caption">Original file · v{document.version} · {document.mime === 'application/pdf' ? `Page ${selectedPage}` : 'Image evidence'} · Signature not checked</div>
  </div>;
}
export function Empty({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return <div className="empty-state"><FileText size={30} /><h3>{title}</h3><p>{text}</p>{children}</div>;
}
