import React, { useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { adminAPI, discoveriesAPI } from '../../services/api';

export default function Discoveries() {
  const [items, setItems] = useState<any[]>([]); const [state, setState] = useState({ loading: true, error: '' });
  const load = () => { setState({ loading: true, error: '' }); adminAPI.getPendingDiscoveries().then(({ data }) => setItems(data.items || [])).catch(() => setState({ loading: false, error: 'Could not load pending discoveries.' })).finally(() => setState((current) => ({ ...current, loading: false }))); };
  useEffect(() => { load(); }, []);
  const review = async (id: string, status: string) => { try { await discoveriesAPI.verify(id, { status }); setItems((current) => current.filter((item) => item.id !== id)); } catch { setState((current) => ({ ...current, error: 'Could not update this discovery.' })); } };
  return <PageShell title="Discovery moderation">{state.loading && <p role="status">Loading pending discoveries…</p>}{state.error && <p className="text-red-600">{state.error} <button className="underline" onClick={load}>Retry</button></p>}{!state.loading && !state.error && items.length === 0 && <p className="rounded bg-white p-6 text-slate-600">No pending discoveries.</p>}<div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article className="rounded-xl bg-white p-5 shadow" key={item.id}><h2 className="font-semibold">{item.place_name}</h2><p className="text-sm text-slate-500">{item.city} · Submitted by {item.submitter_first_name || item.submitter_email}</p><p className="mt-3">{item.description}</p><div className="mt-4 flex gap-2"><button className="rounded bg-teal-700 px-3 py-2 text-sm text-white" onClick={() => void review(item.id, 'verified')}>Approve</button><button className="rounded border px-3 py-2 text-sm" onClick={() => void review(item.id, 'rejected')}>Reject</button></div></article>)}</div></PageShell>;
}
