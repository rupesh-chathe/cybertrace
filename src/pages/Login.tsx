import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { auditService } from '@/services/auditService';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      auditService.log(data.email, 'Login', 'auth', 'User logged in from authorized session');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const fillDemo = () => {
    setValue('email', 'investigator@cybertrace.demo');
    setValue('password', 'demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e14] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">CYBERTRACE AI</h1>
          <p className="text-sm text-slate-400 mt-1">Digital Forensics &amp; Cyber Triage Platform</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">Sign In</h2>
          <p className="text-sm text-slate-400 mb-6">Access the investigation platform.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  placeholder="investigator@cybertrace.demo"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={false}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/90 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              Sign In
            </button>
          </form>

          <button
            onClick={fillDemo}
            className="mt-3 w-full rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Fill Demo Credentials
          </button>

          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-slate-400">
            <p className="font-medium text-cyan-300 mb-1">Demo Account</p>
            <p>Email: investigator@cybertrace.demo</p>
            <p>Password: demo123</p>
          </div>

          <p className="mt-4 text-center text-sm text-slate-400">
            No account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
              Register
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Prototype authentication — not for production use.
        </p>
      </div>
    </div>
  );
}
