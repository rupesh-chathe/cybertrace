import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Database, RefreshCw, ShieldCheck, Download } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { store } from '@/services/store';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useState } from 'react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    store.clearAll();
    setConfirmReset(false);
    toast('success', 'All prototype data has been reset. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleExportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cybertrace_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) ?? 'null');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybertrace-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Data exported successfully.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and prototype data." />

      {/* Profile */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          Profile
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-lg font-medium text-slate-300">
            {user?.name?.charAt(0) ?? 'I'}
          </div>
          <div>
            <p className="text-base font-medium text-slate-100">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </Card>

      {/* Demo Mode */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-slate-400" />
          Prototype Data
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 p-3">
            <div>
              <p className="text-sm text-slate-200">Export Data</p>
              <p className="text-xs text-slate-500">Download all stored prototype data as JSON.</p>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div>
              <p className="text-sm text-slate-200">Reset All Data</p>
              <p className="text-xs text-slate-500">Clear all localStorage data and restore demo defaults.</p>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          About
        </h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p><span className="text-slate-500">Platform:</span> CYBERTRACE AI</p>
          <p><span className="text-slate-500">Version:</span> 1.0.0 (Prototype)</p>
          <p><span className="text-slate-500">Purpose:</span> Digital forensics &amp; cyber triage — SIH26037</p>
          <p className="text-xs text-slate-500 mt-3">
            This is a frontend-only prototype for demonstration purposes. All data is stored locally in the browser.
            No backend, database, or external API is required.
          </p>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset All Data"
        message="This will clear all stored cases, evidence, notes, reports, and audit logs, then reload with demo defaults. This cannot be undone."
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
