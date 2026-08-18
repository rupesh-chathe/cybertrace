import type { AuditLog } from '@/types/audit';
import { demoAuditLogs } from '@/data/demoAuditLogs';
import { store } from './store';

const KEY = 'audit_logs';

const getAll = (): AuditLog[] => store.get(KEY, demoAuditLogs);
const setAll = (a: AuditLog[]) => store.set(KEY, a);

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    await new Promise((r) => setTimeout(r, 200));
    return getAll().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  log(user: string, action: string, resource: string, details: string): void {
    const entry: AuditLog = {
      id: `AL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      resource,
      details,
    };
    setAll([entry, ...getAll()]);
  },
};
