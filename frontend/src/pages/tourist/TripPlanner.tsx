import React, { FormEvent, useState } from 'react';
import PageShell from '../../components/PageShell';
import { tripsAPI } from '../../services/api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setError, setGeneratedItinerary, setGenerating } from '../../store/slices/tripsSlice';

export default function TripPlanner() {
  const [destination, setDestination] = useState(''); const [days, setDays] = useState(3); const [message, setMessage] = useState('');
  const dispatch = useAppDispatch(); const { generatedItinerary: trip, isGenerating, error } = useAppSelector((state) => state.trips);
  const submit = async (event: FormEvent) => { event.preventDefault(); setMessage(''); if (!destination.trim() || days < 1 || days > 14) { setMessage('Enter a destination and choose between 1 and 14 days.'); return; } dispatch(setGenerating(true)); try { const { data } = await tripsAPI.generate({ destination: destination.trim(), days }); dispatch(setGeneratedItinerary(data.trip || data)); } catch { dispatch(setError('Could not generate an itinerary. Please try again.')); } };
  const save = async () => { if (!trip) return; try { await tripsAPI.update(trip.id, { status: 'saved' }); setMessage('Trip saved.'); } catch { setMessage('Could not save this trip.'); } };
  return <PageShell title="AI trip planner">
    <form onSubmit={submit} className="mb-6 grid max-w-xl gap-3 rounded-xl bg-white p-5 shadow sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <label className="grid gap-1 text-sm">Destination<input className="rounded border px-3 py-2" placeholder="e.g. Hyderabad" required value={destination} onChange={(event) => setDestination(event.target.value)} /></label>
      <label className="grid gap-1 text-sm">Days<input className="w-24 rounded border px-3 py-2" type="number" min={1} max={14} value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
      <button disabled={isGenerating} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{isGenerating ? 'Generating…' : 'Generate'}</button>
    </form>
    {(message || error) && <p className="mb-4 text-sm text-red-600">{message || error}</p>}
    {!trip && !isGenerating && <p className="rounded bg-white p-6 text-slate-600">Tell us where you want to go and we’ll create a practical starter itinerary.</p>}
    {trip && <div className="rounded-xl bg-white p-6 shadow"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{trip.title || `Trip to ${trip.destination}`}</h2><p className="text-sm text-slate-500">{trip.start_date} – {trip.end_date} · {trip.generated_by_ai ? 'AI-assisted' : 'rule-based fallback'}</p></div><div className="flex gap-2"><a className="rounded border px-4 py-2" href={trip.directions_url} target="_blank" rel="noreferrer">Open route</a><button className="rounded bg-teal-700 px-4 py-2 text-white" onClick={() => void save()}>Save trip</button></div></div>{trip.metrics && <div className="my-5 grid gap-3 sm:grid-cols-5">{[['Relevant', trip.metrics.relevant_places], ['Included', trip.metrics.included_places], ['Coverage', `${trip.metrics.coverage_percent}%`], ['Remaining', trip.metrics.remaining_places], ['Extra days', trip.metrics.extra_days]].map(([label, value]) => <div className="rounded bg-slate-50 p-3 text-center" key={String(label)}><p className="text-xs text-slate-500">{label}</p><b>{value}</b></div>)}</div>}{trip.days?.map((day) => <div className="mt-4 border-t pt-3" key={day.day_number}><b>Day {day.day_number}</b><p className="mt-1 text-slate-700">{day.morning_activity} · {day.afternoon_activity} · {day.evening_activity}</p></div>)}</div>}
  </PageShell>;
}
