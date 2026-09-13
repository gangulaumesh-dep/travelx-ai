import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { adminAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null); const [state, setState] = useState({ loading: true, error: '' });
  const load = () => { setState({ loading: true, error: '' }); adminAPI.getStats().then(({ data }) => setStats(data.stats || data)).catch(() => setState({ loading: false, error: 'Could not load overview.' })).finally(() => setState((current) => ({ ...current, loading: false }))); };
  useEffect(() => { load(); }, []);
  return <PageShell title="Admin dashboard">{state.loading && <p role="status">Loading overview…</p>}{state.error && <p className="text-red-600">{state.error} <button className="underline" onClick={load}>Retry</button></p>}{!state.loading && !state.error && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Tourists', stats?.total_tourists], ['Guides', stats?.total_guides], ['Businesses', stats?.total_businesses], ['Pending discoveries', stats?.pending_discoveries]].map(([label, value]) => <div className="rounded-xl bg-white p-5 shadow" key={String(label)}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value ?? 0}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><Link className="rounded bg-teal-700 px-4 py-2 text-white" to="/admin/discoveries">Review discoveries</Link><Link className="rounded border px-4 py-2" to="/admin/analytics">Platform analytics</Link></div></>}</PageShell>;
}
