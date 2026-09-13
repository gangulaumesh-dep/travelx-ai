import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAppDispatch } from '../hooks';
import { loginFailure, loginSuccess, setLoading } from '../store/slices/authSlice';
import FormField from '../components/FormField';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const dispatch = useAppDispatch(); const navigate = useNavigate();
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); dispatch(setLoading(true)); try { const { data } = await authAPI.login({ email, password }); dispatch(loginSuccess({ user: data.user, token: data.token })); navigate(`/${data.user.role}`); } catch (err) { const message = 'Unable to sign in. Check your email and password.'; setError(message); dispatch(loginFailure(message)); } };
  return <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 shadow"><h1 className="mb-6 text-2xl font-bold">Sign in</h1><form className="grid gap-4" onSubmit={submit}><FormField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /><FormField label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />{error && <p className="text-sm text-red-600">{error}</p>}<button className="rounded bg-teal-700 px-4 py-2 text-white">Sign in</button></form><p className="mt-4 text-sm">No account? <Link className="text-teal-700" to="/register">Create one</Link></p></div>;
}
