import type { User } from '@/types/user';
import { store } from './store';

const DEMO_USER: User = {
  id: 'USR-001',
  name: 'Investigator One',
  email: 'investigator@cybertrace.demo',
  role: 'Authorized User',
};

const DEMO_CREDENTIALS = {
  email: 'investigator@cybertrace.demo',
  password: 'demo123',
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 400));
    if (
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    ) {
      const token = `demo.${btoa(email)}.${Date.now()}`;
      store.set('user', DEMO_USER);
      store.set('token', token);
      return DEMO_USER;
    }
    throw new Error('Invalid credentials. Use the demo account shown below.');
  },

  async register(name: string, email: string, _password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 400));
    const user: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      role: 'Authorized User',
    };
    const token = `demo.${btoa(email)}.${Date.now()}`;
    store.set('user', user);
    store.set('token', token);
    return user;
  },

  logout(): void {
    store.remove('user');
    store.remove('token');
  },

  getCurrentUser(): User | null {
    return store.get<User | null>('user', null);
  },

  getToken(): string | null {
    return store.get<string | null>('token', null);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
