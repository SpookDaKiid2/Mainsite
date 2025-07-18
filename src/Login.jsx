import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './client';
import Layout from './Layout';

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
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <input
        className="w-full px-4 py-2 border rounded mb-4"
        type="email"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full px-4 py-2 border rounded mb-4"
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-4"
      >
        Login
      </button>
      <p className="text-sm text-center">
        Don’t have an account? <Link className="text-blue-600 hover:underline" to="/signup">Sign up</Link>
      </p>
    </Layout>
  );
}

