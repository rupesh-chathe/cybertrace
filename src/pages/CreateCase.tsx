import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { caseService } from '@/services/caseService';
import { auditService } from '@/services/auditService';
import type { CaseStatus, CasePriority } from '@/types/case';

interface CreateCaseForm {
  title: string;
  description: string;
  investigator: string;
  priority: CasePriority;
  status: CaseStatus;
}

export default function CreateCase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseForm>({
    defaultValues: {
      investigator: user?.name ?? 'Investigator One',
      priority: 'MEDIUM',
      status: 'OPEN',
    },
  });

  const onSubmit = async (data: CreateCaseForm) => {
    const newCase = await caseService.createCase(data);
    auditService.log(
      user?.email ?? 'unknown',
      'Case Created',
      newCase.caseId,
      `Title: ${newCase.title}`
    );
    toast('success', `Case ${newCase.caseId} created successfully.`);
    navigate(`/cases/${newCase.caseId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Case" subtitle="Open a new investigation case." />

      <button
        onClick={() => navigate('/cases')}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cases
      </button>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Case Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              placeholder="e.g. Unauthorized Access Investigation"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none"
              placeholder="Describe the investigation scope and context..."
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Investigator</label>
            <input
              {...register('investigator', { required: 'Investigator is required' })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
            {errors.investigator && <p className="mt-1 text-xs text-red-400">{errors.investigator.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Priority</label>
              <select
                {...register('priority')}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/cases')}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Case
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
