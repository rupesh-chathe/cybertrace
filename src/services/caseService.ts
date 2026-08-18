import type { InvestigationCase, CaseNote } from '@/types/case';
import { demoCases } from '@/data/demoCases';
import { store } from './store';

const CASES_KEY = 'cases';
const NOTES_KEY = 'case_notes';

const getCases = (): InvestigationCase[] => store.get(CASES_KEY, demoCases);
const setCases = (c: InvestigationCase[]) => store.set(CASES_KEY, c);

export const caseService = {
  async getCases(): Promise<InvestigationCase[]> {
    await new Promise((r) => setTimeout(r, 250));
    return getCases();
  },

  async getCaseById(caseId: string): Promise<InvestigationCase | null> {
    await new Promise((r) => setTimeout(r, 200));
    return getCases().find((c) => c.caseId === caseId) ?? null;
  },

  async createCase(
    data: Omit<InvestigationCase, 'caseId' | 'evidenceCount' | 'createdAt' | 'updatedAt'>
  ): Promise<InvestigationCase> {
    await new Promise((r) => setTimeout(r, 400));
    const cases = getCases();
    const num = cases.length + 1;
    const now = new Date().toISOString();
    const newCase: InvestigationCase = {
      ...data,
      caseId: `CYB-${String(num).padStart(3, '0')}`,
      evidenceCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setCases([newCase, ...cases]);
    return newCase;
  },

  async updateCase(caseId: string, patch: Partial<InvestigationCase>): Promise<void> {
    const cases = getCases().map((c) =>
      c.caseId === caseId ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    );
    setCases(cases);
  },

  async incrementEvidence(caseId: string): Promise<void> {
    const cases = getCases().map((c) =>
      c.caseId === caseId
        ? { ...c, evidenceCount: c.evidenceCount + 1, updatedAt: new Date().toISOString() }
        : c
    );
    setCases(cases);
  },

  // Notes
  getNotes(caseId: string): CaseNote[] {
    const all = store.get<CaseNote[]>(NOTES_KEY, []);
    return all.filter((n) => n.caseId === caseId);
  },

  addNote(caseId: string, author: string, content: string): CaseNote {
    const all = store.get<CaseNote[]>(NOTES_KEY, []);
    const note: CaseNote = {
      id: `NOTE-${Date.now()}`,
      caseId,
      author,
      content,
      timestamp: new Date().toISOString(),
    };
    store.set(NOTES_KEY, [note, ...all]);
    return note;
  },

  updateNote(noteId: string, content: string): void {
    const all = store.get<CaseNote[]>(NOTES_KEY, []);
    store.set(
      NOTES_KEY,
      all.map((n) => (n.id === noteId ? { ...n, content, timestamp: new Date().toISOString() } : n))
    );
  },

  deleteNote(noteId: string): void {
    const all = store.get<CaseNote[]>(NOTES_KEY, []);
    store.set(
      NOTES_KEY,
      all.filter((n) => n.id !== noteId)
    );
  },
};
