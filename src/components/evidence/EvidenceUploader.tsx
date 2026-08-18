import { useState, useCallback } from 'react';
import { UploadCloud, FileUp, Loader2, CheckCircle2, X } from 'lucide-react';
import type { Evidence } from '@/types/evidence';
import type { InvestigationCase } from '@/types/case';
import { evidenceService } from '@/services/evidenceService';
import { useToast } from '@/hooks/useToast';

const stages = [
  'Uploading',
  'Processing',
  'Extracting Metadata',
  'Calculating SHA-256',
  'Analyzing',
  'Complete',
];

const acceptedTypes = ['PDF', 'TXT', 'CSV', 'JPG', 'PNG', 'JSON', 'LOG', 'ZIP'];

function inferType(filename: string): Evidence['type'] | null {
  const ext = filename.split('.').pop()?.toUpperCase();
  return (ext && acceptedTypes.includes(ext) ? ext : null) as Evidence['type'] | null;
}

interface EvidenceUploaderProps {
  caseData: InvestigationCase;
  onUploaded: (evidence: Evidence) => void;
}

export function EvidenceUploader({ caseData, onUploaded }: EvidenceUploaderProps) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(-1);
  const [filename, setFilename] = useState('');
  const { toast } = useToast();

  const processFile = useCallback(
    async (name: string) => {
      const type = inferType(name);
      if (!type) {
        toast('error', 'Unsupported file type. Use PDF, TXT, CSV, JPG, PNG, JSON, LOG, or ZIP.');
        return;
      }
      setFilename(name);
      for (let i = 0; i < stages.length; i++) {
        setStage(i);
        await new Promise((r) => setTimeout(r, 600));
      }
      const size = `${(0.5 + Math.random() * 8).toFixed(1)} MB`;
      const evidence = await evidenceService.uploadEvidence({
        filename: name,
        type,
        caseId: caseData.caseId,
        caseTitle: caseData.title,
        fileSize: size,
      });
      await evidenceService.finalizeProcessing(evidence.evidenceId);
      toast('success', `${name} uploaded and analyzed. Risk score: ${evidence.riskScore}.`);
      onUploaded(evidence);
      setStage(-1);
      setFilename('');
      setOpen(false);
    },
    [caseData, onUploaded, toast]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file.name);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file.name);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
      >
        <UploadCloud className="h-4 w-4" />
        Upload Evidence
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => stage < 0 && setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Upload Evidence</h3>
              {stage < 0 && (
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {stage < 0 ? (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    dragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <FileUp className="mx-auto h-10 w-10 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-300">Drag and drop a file here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                  <label className="mt-4 inline-block cursor-pointer rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
                    Browse Files
                    <input type="file" className="hidden" onChange={handleSelect} />
                  </label>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Supported: {acceptedTypes.join(', ')}
                </p>
              </>
            ) : (
              <div className="py-6">
                <p className="text-sm text-slate-300 mb-4 truncate">File: {filename}</p>
                <div className="space-y-2.5">
                  {stages.map((label, i) => {
                    const done = stage > i;
                    const active = stage === i;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-700" />
                        )}
                        <span
                          className={`text-sm ${
                            done ? 'text-slate-400' : active ? 'text-slate-100' : 'text-slate-600'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
