import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-800 to-neutral-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-zinc-700 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Login</h1>

        <input
          className="w-full p-3 mb-4 rounded-md bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="email"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-6 rounded-md bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold"
          onClick={handleLogin}
        >
          Sign In
        </button>

        <p className="mt-4 text-center text-white text-sm">
          Don’t have an account? <a href="/signup" className="text-indigo-400 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

