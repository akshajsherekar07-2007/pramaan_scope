export const APP_ID = 'PS-2026-0042';
export const RULE_VERSION = 'demo-2026.1';
export const SLOT_NAMES = {
  application: 'Application summary', approval: 'Previous approval',
  certificate: 'Campus safety certificate', undertaking: 'Institutional undertaking', infrastructure: 'Infrastructure evidence'
} as const;
export type Slot = keyof typeof SLOT_NAMES;
export type Persona = 'REVIEWER' | 'INSTITUTION';
export interface Account { id: string; username: string; name: string; role: Persona; applicationId: string; }
export interface AccessSession { mode: 'demo' | 'pilot'; setupRequired: boolean; user: Account | null; csrf: string; expiresAt: number | null; }
export type FixtureMode = 'MATCH' | 'MISMATCH' | 'UNAVAILABLE';
export type Status = 'PASS' | 'DEFICIENCY' | 'UNRESOLVED' | 'NOT_APPLICABLE';
export interface Fact { field: string; value: string; raw: string; page: number; method: 'PDF_TEXT' | 'LOCAL_OCR' | 'MANUAL'; }
export interface PageText { page: number; text: string; }
export interface DocumentVersion {
  id: string; slot: Slot; version: number; name: string; mime: string; hash: string; size: number;
  state: 'ACTIVE' | 'CANDIDATE' | 'SUPERSEDED'; status: 'READY' | 'NEEDS_OCR' | 'ERROR';
  error: string; createdAt: string; previousId: string | null; reason: string;
  pages: PageText[]; facts: Fact[];
}
export interface EvidenceRef { documentId: string; name: string; page: number; quote: string; field: string; }
export interface Finding {
  key: string; group: string; title: string; status: Status; reason: string;
  evidence: EvidenceRef[]; dependencyIds: string[]; fingerprint: string;
  sourceStatus: 'SIMULATED_MATCH' | 'SIMULATED_MISMATCH' | 'SOURCE_UNAVAILABLE' | 'NOT_CHECKED';
  nextAction: string; ruleVersion: string;
}
export interface Review {
  id: string; findingKey: string; fingerprint: string; action: 'REVIEWED' | 'CLARIFICATION' | 'MANUAL_VERIFICATION' | 'INSPECTION';
  note: string; createdAt: string; actor: string;
}
export interface AuditEvent { id: number; type: string; detail: string; actor: string; createdAt: string; }
export interface Clarification { id: string; findingKey: string; slot: Slot; note: string; status: 'OPEN' | 'RESPONDED'; createdAt: string; }
export interface SourceAttempt { id: string; mode: 'SIMULATED'; outcome: FixtureMode; queriedIdentifier: string; source: string; timestamp: string; coverage: string; }
export interface Application {
  id: string; institution: string; institutionId: string; trust: string; campus: string; address: string;
  period: string; previousPeriod: string; referenceDate: string; course: string; intake: string;
  revision: number; workflow: string; fixtureMode: FixtureMode;
}
export interface Snapshot {
  reviewVisibility?: 'FULL' | 'STATUS_ONLY';
  application: Application; documents: DocumentVersion[]; findings: Finding[]; reviews: Review[];
  events: AuditEvent[]; clarifications: Clarification[]; sourceAttempts: SourceAttempt[];
  infrastructure: { outcome: string; note: string };
}
export interface Impact {
  candidateId: string; applicationRevision: number; original: DocumentVersion; candidate: DocumentVersion;
  changes: { field: string; before: string; after: string }[];
  affected: { before: Finding; after: Finding | null; reviews: number }[];
  unchanged: Finding[]; affectedReviews: number;
}
