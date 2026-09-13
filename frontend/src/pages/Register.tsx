import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAppDispatch } from '../hooks';
import { loginSuccess } from '../store/slices/authSlice';
import FormField from '../components/FormField';
export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'tourist' }); const [error, setError] = useState(''); const dispatch = useAppDispatch(); const navigate = useNavigate();
  const update = (key: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event: FormEvent) => { event.preventDefault(); try { const { data } = await authAPI.register(form); dispatch(loginSuccess({ user: data.user, token: data.token })); navigate(`/${data.user.role}`); } catch { setError('Registration failed. Use a valid email and a password of at least 8 characters.'); } };
  return <div className="mx-auto mt-10 max-w-md rounded-xl bg-white p-8 shadow"><h1 className="mb-6 text-2xl font-bold">Create account</h1><form className="grid gap-4" onSubmit={submit}><FormField label="First name" required value={form.first_name} onChange={update('first_name')} /><FormField label="Last name" value={form.last_name} onChange={update('last_name')} /><FormField label="Email" type="email" required value={form.email} onChange={update('email')} /><FormField label="Password" type="password" minLength={8} required value={form.password} onChange={update('password')} /><label className="grid gap-1 text-sm font-medium">Role<select className="rounded border px-3 py-2" value={form.role} onChange={update('role')}><option value="tourist">Tourist</option><option value="guide">Guide</option><option value="business">Business</option></select></label>{error && <p className="text-sm text-red-600">{error}</p>}<button className="rounded bg-teal-700 px-4 py-2 text-white">Register</button></form><p className="mt-4 text-sm">Already registered? <Link className="text-teal-700" to="/login">Sign in</Link></p></div>;
}
