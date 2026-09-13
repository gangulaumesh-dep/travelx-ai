import React from 'react';
import { Link } from 'react-router-dom';
export default function RoleSelection() {
  return <div className="flex min-h-screen items-center justify-center bg-teal-700 p-6"><div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center"><h1 className="text-4xl font-bold text-teal-700">TRAVELX AI</h1><p className="my-4 text-slate-600">Discover local places and build better trips.</p><Link className="inline-block rounded bg-teal-700 px-5 py-3 text-white" to="/login">Get started</Link></div></div>;
}
