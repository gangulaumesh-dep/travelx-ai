import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { discoveriesAPI } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setDiscoveries, setError, setFilters, setLoading } from '../../store/slices/discoveriesSlice';

export default function Discover() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error, filters } = useAppSelector((state) => state.discoveries);
  const [category, setCategory] = useState(filters.category || '');
  const [city, setCity] = useState('');

  const load = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const params = { status: 'verified', ...(category ? { category } : {}), ...(city ? { city } : {}) };
      const { data } = await discoveriesAPI.getAll(params);
      dispatch(setDiscoveries(data.items || data));
    } catch {
      dispatch(setError('Could not load discoveries. Please try again.'));
    }
  }, [category, city, dispatch]);

  useEffect(() => { void load(); }, [load]);
  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setFilters({ category: category || undefined }));
    void load();
  };

  return <PageShell title="Discover places">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <form className="flex flex-wrap gap-2" onSubmit={applyFilters}>
        <label className="grid gap-1 text-sm">Category<input className="rounded border px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="heritage, food…" /></label>
        <label className="grid gap-1 text-sm">City<input className="rounded border px-3 py-2" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Search city" /></label>
        <button className="rounded border px-4 py-2">Filter</button>
      </form>
      <Link className="rounded bg-teal-700 px-4 py-2 text-white" to="/discover/new">Share a place</Link>
    </div>
    {isLoading && <p role="status">Loading discoveries…</p>}
    {error && <div className="rounded bg-red-50 p-3 text-red-700"><p>{error}</p><button className="mt-2 underline" onClick={() => void load()}>Retry</button></div>}
    {!isLoading && !error && items.length === 0 && <p className="rounded bg-white p-6 text-slate-600">No verified places match your filters.</p>}
    <div className="grid gap-4 md:grid-cols-3">{items.map((item) => <Link to={`/discover/${item.id}`} className="rounded-xl bg-white p-5 shadow transition hover:shadow-md" key={item.id}>
      {item.images?.[0] && <img className="mb-3 h-40 w-full rounded object-cover" src={item.images[0].image_url} alt="" />}
      <h2 className="font-semibold">{item.place_name}</h2><p className="text-sm text-teal-700">{item.category || 'Travel'} · {item.city || 'Location pending'}</p><p className="mt-2 line-clamp-3 text-slate-600">{item.description}</p>
    </Link>)}</div>
  </PageShell>;
}
