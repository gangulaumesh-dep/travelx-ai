import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout } from '../store/slices/authSlice';

interface PageShellProps {
  title: string;
  children: ReactNode;
}

export default function PageShell({ title, children }: PageShellProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const home = user?.role === 'tourist' ? '/tourist' : `/${user?.role || 'login'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to={home} className="text-xl font-bold text-teal-700">TRAVELX AI</Link>
          <nav className="flex items-center gap-4 text-sm">
            {user?.role === 'tourist' && <><Link to="/discover">Discover</Link><Link to="/guides-business">Guides</Link><Link to="/planner">Plan a trip</Link><Link to="/my-trips">My trips</Link></>}
            {user?.role === 'guide' && <><Link to="/guide">Dashboard</Link><Link to="/guide/profile">Profile</Link></>}
            {user?.role === 'business' && <><Link to="/business">Dashboard</Link><Link to="/business/profile">Profile</Link></>}
            <span className="text-slate-500">{user?.first_name || user?.email}</span>
            <button className="rounded border px-3 py-1" onClick={() => { dispatch(logout()); navigate('/login'); }}>Log out</button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8"><h1 className="mb-6 text-3xl font-bold text-slate-900">{title}</h1>{children}</main>
    </div>
  );
}
