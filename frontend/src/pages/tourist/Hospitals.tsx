import React, { useCallback, useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import { hospitalsAPI } from '../../services/api';
export default function Hospitals() {
  const [items, setItems] = useState<any[]>([]); const [city, setCity] = useState('Hyderabad'); const [error, setError] = useState('');
  const load = useCallback(() => { setError(''); return hospitalsAPI.getAll(city ? { city } : undefined).then(({ data }) => setItems(data.items || [])).catch(() => setError('Could not load hospitals.')); }, [city]);
  useEffect(() => { void load(); }, [load]);
  return <PageShell title="Nearby medical help"><div className="mb-6 flex gap-2"><input className="rounded border px-3 py-2" value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" /><button className="rounded bg-teal-700 px-4 py-2 text-white" onClick={load}>Search</button></div>{error && <p className="text-red-600">{error}</p>}{items.length === 0 && !error && <p className="rounded bg-white p-6 text-slate-600">No hospitals found for this city.</p>}<div className="grid gap-4 md:grid-cols-2">{items.map((hospital) => <article className="rounded-xl bg-white p-5 shadow" key={hospital.id}><h2 className="font-semibold">{hospital.name}</h2><p className="mt-1 text-slate-600">{hospital.address}</p><p className="mt-2">Emergency: <a className="text-teal-700 underline" href={`tel:${hospital.emergency_phone}`}>{hospital.emergency_phone}</a></p><p>Phone: <a className="text-teal-700 underline" href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>{hospital.website && <a className="mt-2 inline-block text-teal-700 underline" href={hospital.website} target="_blank" rel="noreferrer">Hospital website</a>}</article>)}</div></PageShell>;
}
