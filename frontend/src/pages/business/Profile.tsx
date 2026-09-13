import React, { FormEvent, useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { businessesAPI } from '../../services/api';

export default function Profile() {
  const [form, setForm] = useState({ business_name: '', category: '', description: '', phone: '', website: '', address: '', city: '', state: '' });
  const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
  useEffect(() => { businessesAPI.getMe().then(({ data }) => setForm({ business_name: data.business_name || '', category: data.category || '', description: data.description || '', phone: data.phone || '', website: data.website || '', address: data.address || '', city: data.city || '', state: data.state || '' })).catch(() => setState((current) => ({ ...current, error: 'Could not load your business profile.' }))).finally(() => setState((current) => ({ ...current, loading: false }))); }, []);
  const submit = async (event: FormEvent) => { event.preventDefault(); setState((current) => ({ ...current, saving: true, error: '', message: '' })); try { await businessesAPI.updateProfile(form); setState((current) => ({ ...current, saving: false, message: 'Business profile updated.' })); } catch { setState((current) => ({ ...current, saving: false, error: 'Could not update your profile.' })); } };
  if (state.loading) return <PageShell title="Business profile"><p role="status">Loading profile…</p></PageShell>;
  return <PageShell title="Business profile"><form onSubmit={submit} className="grid max-w-2xl gap-4 rounded-xl bg-white p-6 shadow">
    {(['business_name', 'category', 'phone', 'website', 'address', 'city', 'state'] as const).map((key) => <label className="grid gap-1 text-sm" key={key}>{key.replace('_', ' ')}<input className="rounded border px-3 py-2" required={key === 'business_name'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
    <label className="grid gap-1 text-sm">Description<textarea className="rounded border px-3 py-2" minLength={20} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
    {state.error && <p className="text-red-600">{state.error}</p>}{state.message && <p className="text-teal-700">{state.message}</p>}<button disabled={state.saving} className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{state.saving ? 'Saving…' : 'Save profile'}</button>
  </form></PageShell>;
}
