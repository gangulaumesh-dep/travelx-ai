import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { discoveriesAPI } from '../../services/api';
import { Discovery } from '../../types';

export default function DiscoveryDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Discovery | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (id) discoveriesAPI.getById(id).then(({ data }) => setItem(data)).catch(() => setError('This discovery could not be found.')); }, [id]);
  return <PageShell title={item?.place_name || 'Place details'}>
    <Link className="text-sm text-teal-700" to="/discover">← Back to discoveries</Link>
    {error && <p className="mt-4 text-red-600">{error}</p>}
    {item && <article className="mt-4 max-w-3xl rounded-xl bg-white p-6 shadow">
      {item.images?.map((image) => <img key={image.id} className="mb-4 max-h-96 w-full rounded object-cover" src={image.image_url} alt={item.place_name} />)}
      <p className="text-sm text-teal-700">{item.category || 'Travel'} · {[item.city, item.state].filter(Boolean).join(', ')}</p>
      <p className="mt-4 whitespace-pre-wrap text-slate-700">{item.description}</p>
    </article>}
  </PageShell>;
}
