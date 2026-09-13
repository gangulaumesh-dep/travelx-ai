import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { discoveriesAPI } from '../../services/api';

const initialForm = { place_name: '', category: '', description: '', city: '', state: '', latitude: '', longitude: '' };
export default function DiscoverNewPlace() {
  const [form, setForm] = useState(initialForm); const [files, setFiles] = useState<File[]>([]); const [error, setError] = useState(''); const [submitted, setSubmitted] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false); const navigate = useNavigate();
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setIsSubmitting(true); const data = new FormData(); Object.entries(form).forEach(([key, value]) => { if (value) data.append(key, value); }); files.forEach((file) => data.append('images', file)); try { await discoveriesAPI.create(data); setSubmitted(true); } catch { setError('Could not submit this place. Check the form and try again.'); } finally { setIsSubmitting(false); } };
  if (submitted) return <PageShell title="Thanks for sharing"><div className="rounded-xl bg-white p-6 shadow"><p>Your place was submitted for review.</p><button className="mt-4 rounded bg-teal-700 px-4 py-2 text-white" onClick={() => navigate('/discover')}>Back to discoveries</button></div></PageShell>;
  return <PageShell title="Share a place"><form className="grid max-w-2xl gap-4 rounded-xl bg-white p-6 shadow" onSubmit={submit}>
    {(['place_name', 'category', 'city', 'state'] as const).map((key) => <label className="grid gap-1 text-sm font-medium" key={key}>{key.replace('_', ' ')}<input className="rounded border px-3 py-2" required={key === 'place_name'} value={form[key]} onChange={update(key)} /></label>)}
    <label className="grid gap-1 text-sm font-medium">Description<textarea className="rounded border px-3 py-2" required minLength={20} value={form.description} onChange={update('description')} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm">Latitude<input className="rounded border px-3 py-2" type="number" step="any" value={form.latitude} onChange={update('latitude')} /></label><label className="grid gap-1 text-sm">Longitude<input className="rounded border px-3 py-2" type="number" step="any" value={form.longitude} onChange={update('longitude')} /></label></div>
    <label className="grid gap-1 text-sm font-medium">Photos (up to 5)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))} /></label>
    {error && <p className="text-red-600">{error}</p>}<button disabled={isSubmitting} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'Submitting…' : 'Submit for review'}</button>
  </form></PageShell>;
}
