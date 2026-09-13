import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { guidesAPI, businessesAPI } from '../../services/api';

export default function GuidesBusiness() {
  const [guides, setGuides] = useState<any[]>([]); const [state, setState] = useState({ loading: true, error: '' });
  useEffect(() => { guidesAPI.getAll().then(({ data }) => setGuides(data.items || [])).catch(() => setState({ loading: false, error: 'Could not load guides.' })).finally(() => setState((current) => ({ ...current, loading: false }))); }, []);
  return <PageShell title="Local experts"><section><h2 className="mb-3 text-xl font-semibold">Guides</h2>{state.loading && <p role="status">Loading guides…</p>}{state.error && <p className="text-red-600">{state.error}</p>}{!state.loading && !state.error && guides.length === 0 && <p className="rounded bg-white p-5 text-slate-600">No verified guides are available yet.</p>}<div className="grid gap-4 md:grid-cols-3">{guides.map((guide) => <Link to={`/guides/${guide.id}`} className="rounded-xl bg-white p-5 shadow hover:shadow-md" key={guide.id}><h3 className="font-semibold">{`${guide.first_name || ''} ${guide.last_name || ''}`.trim() || guide.email}</h3><p className="mt-1 text-sm text-teal-700">{(guide.expertise || []).join(' · ') || 'Local guide'}</p><p className="mt-2 line-clamp-2 text-slate-600">{guide.bio || 'View guide profile and request an experience.'}</p></Link>)}</div></section><section className="mt-10"><h2 className="mb-3 text-xl font-semibold">Businesses</h2><BusinessesPreview load={businessesAPI.getAll} /></section></PageShell>;
}

function BusinessesPreview({ load }: { load: () => Promise<{ data: { items?: any[] } }> }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { load().then(({ data }) => setItems(data.items || [])).catch(() => undefined); }, [load]);
  return <div className="mt-3 grid gap-3 md:grid-cols-3">{items.length === 0 ? <p className="rounded bg-white p-5 text-slate-600">No verified businesses are available yet.</p> : items.map((business) => <Link to={`/businesses/${business.id}`} className="rounded bg-white p-4 shadow hover:shadow-md" key={business.id}><b>{business.business_name || business.email}</b><p className="text-sm text-teal-700">{business.category}</p><p className="mt-1 text-sm">{business.services?.length || 0} services</p></Link>)}</div>;
}
