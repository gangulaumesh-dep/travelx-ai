import React, { FormEvent, useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { guidesAPI } from '../../services/api';

export default function Profile() {
  const [form, setForm] = useState({ bio: '', expertise: '', languages: '', hourly_rate: '' });
  const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
  useEffect(() => { guidesAPI.getMe().then(({ data }) => setForm({ bio: data.bio || '', expertise: (data.expertise || []).join(', '), languages: (data.languages || []).join(', '), hourly_rate: data.hourly_rate || '' })).catch(() => setState({ loading: false, saving: false, error: 'Could not load your profile.', message: '' })).finally(() => setState((current) => ({ ...current, loading: false }))); }, []);
  const submit = async (event: FormEvent) => { event.preventDefault(); setState((current) => ({ ...current, saving: true, error: '', message: '' })); try { await guidesAPI.updateProfile({ bio: form.bio, expertise: form.expertise.split(',').map((value) => value.trim()).filter(Boolean), languages: form.languages.split(',').map((value) => value.trim()).filter(Boolean), hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null }); setState((current) => ({ ...current, saving: false, message: 'Profile updated.' })); } catch { setState((current) => ({ ...current, saving: false, error: 'Could not update your profile.' })); } };
  if (state.loading) return <PageShell title="Guide profile"><p role="status">Loading profile…</p></PageShell>;
  return <PageShell title="Guide profile"><form onSubmit={submit} className="grid max-w-2xl gap-4 rounded-xl bg-white p-6 shadow">
    <label className="grid gap-1 text-sm">Bio<textarea className="rounded border px-3 py-2" minLength={20} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
    <label className="grid gap-1 text-sm">Expertise <span className="text-slate-500">(comma-separated)</span><input className="rounded border px-3 py-2" value={form.expertise} onChange={(event) => setForm({ ...form, expertise: event.target.value })} /></label>
    <label className="grid gap-1 text-sm">Languages <span className="text-slate-500">(comma-separated)</span><input className="rounded border px-3 py-2" value={form.languages} onChange={(event) => setForm({ ...form, languages: event.target.value })} /></label>
    <label className="grid gap-1 text-sm">Hourly rate<input className="rounded border px-3 py-2" type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(event) => setForm({ ...form, hourly_rate: event.target.value })} /></label>
    {state.error && <p className="text-red-600">{state.error}</p>}{state.message && <p className="text-teal-700">{state.message}</p>}<button disabled={state.saving} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{state.saving ? 'Saving…' : 'Save profile'}</button>
  </form></PageShell>;
}
