import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/States';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { caseService } from '@/services/caseService';
import { auditService } from '@/services/auditService';
import { formatDateTime } from '@/utils/format';
import type { CaseNote } from '@/types/case';

interface CaseNotesProps {
  caseId: string;
  notes: CaseNote[];
  author: string;
  onChange: (notes: CaseNote[]) => void;
}

export function CaseNotes({ caseId, notes, author, onChange }: CaseNotesProps) {
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    const note = caseService.addNote(caseId, author, newContent.trim());
    auditService.log(author, 'Note Added', caseId, 'Investigator note appended');
    onChange(caseService.getNotes(caseId));
    setNewContent('');
    setAdding(false);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editContent.trim()) return;
    caseService.updateNote(noteId, editContent.trim());
    onChange(caseService.getNotes(caseId));
    setEditId(null);
    setEditContent('');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    caseService.deleteNote(deleteId);
    onChange(caseService.getNotes(caseId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Investigator Notes</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        )}
      </div>

      {adding && (
        <Card className="p-4">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Write your note..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => { setAdding(false); setNewContent(''); }} className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800">
              <X className="h-4 w-4 inline mr-1" />Cancel
            </button>
            <button onClick={handleAdd} className="rounded-lg bg-cyan-500/90 px-3 py-1.5 text-sm text-white hover:bg-cyan-500">
              <Save className="h-4 w-4 inline mr-1" />Save
            </button>
          </div>
        </Card>
      )}

      {notes.length === 0 && !adding ? (
        <Card><EmptyState title="No notes yet" description="Add notes to track your findings and observations." /></Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              {editId === note.id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    autoFocus
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={() => setEditId(null)} className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800">Cancel</button>
                    <button onClick={() => handleSaveEdit(note.id)} className="rounded-lg bg-cyan-500/90 px-3 py-1 text-sm text-white hover:bg-cyan-500">Save</button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{note.content}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {note.author} · {formatDateTime(note.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditId(note.id); setEditContent(note.content); }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(note.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
