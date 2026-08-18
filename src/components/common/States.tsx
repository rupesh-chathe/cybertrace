import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
    <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="rounded-full bg-slate-800/50 p-4 mb-4">
      <Icon className="h-8 w-8 text-slate-500" />
    </div>
    <h3 className="text-slate-200 font-medium mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="rounded-full bg-red-500/10 p-4 mb-4">
      <AlertCircle className="h-8 w-8 text-red-400" />
    </div>
    <h3 className="text-slate-200 font-medium mb-1">Error</h3>
    <p className="text-sm text-slate-400 max-w-sm mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
      >
        Try again
      </button>
    )}
  </div>
);
