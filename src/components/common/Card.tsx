import { Link } from 'react-router-dom';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 ${className}`}>
      {children}
    </div>
  );
}

interface CardLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function CardLink({ to, children, className = '' }: CardLinkProps) {
  return (
    <Link
      to={to}
      className={`block rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-slate-700 hover:bg-slate-900 ${className}`}
    >
      {children}
    </Link>
  );
}
