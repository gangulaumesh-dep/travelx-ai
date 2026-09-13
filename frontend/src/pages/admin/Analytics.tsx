import React, { useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { adminAPI } from '../../services/api';

export default function Analytics() {
  const [data, setData] = useState<any>(null); const [error, setError] = useState('');
  useEffect(() => { adminAPI.getAnalytics().then(({ data: result }) => setData(result)).catch(() => setError('Could not load analytics.')); }, []);
  return <PageShell title="Platform analytics">{error && <p className="text-red-600">{error}</p>}{!data && !error && <p role="status">Loading analytics…</p>}{data && <div className="grid gap-6 md:grid-cols-3"><Metric title="Active services" value={data.activeServices} /><Breakdown title="Users by role" items={data.usersByRole} /><Breakdown title="Bookings by status" items={data.bookingsByStatus} /><Breakdown title="Discoveries by status" items={data.discoveriesByStatus} /></div>}</PageShell>;
}
function Metric({ title, value }: { title: string; value: number }) { return <div className="rounded-xl bg-white p-5 shadow"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold">{value || 0}</p></div>; }
function Breakdown({ title, items }: { title: string; items?: Array<{ role?: string; status?: string; count: number }> }) { return <div className="rounded-xl bg-white p-5 shadow"><h2 className="font-semibold">{title}</h2>{!items?.length ? <p className="mt-3 text-slate-500">No data yet.</p> : <ul className="mt-3 space-y-2">{items.map((item) => <li className="flex justify-between text-sm" key={item.role || item.status}>{item.role || item.status}<b>{item.count}</b></li>)}</ul>}</div>; }
