import React, { useCallback, useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { tripsAPI } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { deleteTrip, setError, setLoading, setTrips, updateTrip } from '../../store/slices/tripsSlice';

export default function MyTrips() {
  const dispatch = useAppDispatch(); const { trips, isLoading, error } = useAppSelector((state) => ({ trips: state.trips.items, isLoading: state.trips.isLoading, error: state.trips.error })); const [editing, setEditing] = useState<string | null>(null); const [title, setTitle] = useState('');
  const load = useCallback(async () => { dispatch(setLoading(true)); try { const { data } = await tripsAPI.getAll(); dispatch(setTrips(data.items || data)); } catch { dispatch(setError('Could not load your trips.')); } }, [dispatch]);
  useEffect(() => { void load(); }, [load]);
  const saveTitle = async (id: string) => { try { const { data } = await tripsAPI.update(id, { title }); dispatch(updateTrip(data)); setEditing(null); } catch { dispatch(setError('Could not update this trip.')); } };
  const remove = async (id: string) => { if (!window.confirm('Delete this trip?')) return; try { await tripsAPI.delete(id); dispatch(deleteTrip(id)); } catch { dispatch(setError('Could not delete this trip.')); } };
  return <PageShell title="My trips">{isLoading && <p role="status">Loading trips…</p>}{error && <div className="mb-4 rounded bg-red-50 p-3 text-red-700"><p>{error}</p><button className="underline" onClick={() => void load()}>Retry</button></div>}{!isLoading && !error && trips.length === 0 && <p className="rounded bg-white p-6 text-slate-600">You have no saved trips yet. Start with the trip planner.</p>}<div className="grid gap-4 md:grid-cols-2">{trips.map((trip) => <article className="rounded-xl bg-white p-5 shadow" key={trip.id}>{editing === trip.id ? <div className="flex gap-2"><input className="flex-1 rounded border px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} /><button className="rounded bg-teal-700 px-3 py-2 text-white" onClick={() => void saveTitle(trip.id)}>Save</button></div> : <><h2 className="font-semibold">{trip.title || trip.destination}</h2><p className="text-sm">{trip.start_date} – {trip.end_date}</p><p className="text-slate-600">{trip.status}</p><div className="mt-4 flex gap-3 text-sm"><button className="text-teal-700 underline" onClick={() => { setEditing(trip.id); setTitle(trip.title || trip.destination); }}>Rename</button><button className="text-red-600 underline" onClick={() => void remove(trip.id)}>Delete</button></div></>}</article>)}</div></PageShell>;
}
