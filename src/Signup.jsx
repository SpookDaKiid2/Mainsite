import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './client';
import Layout from './Layout';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else navigate('/dashboard');
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
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
        onClick={handleSignup}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mb-4"
      >
        Create Account
      </button>
      <p className="text-sm text-center mb-2">
        Already have an account? <Link className="text-blue-600 hover:underline" to="/login">Log in</Link>
      </p>
      <p className="text-xs text-center">
        <Link className="text-gray-600 hover:underline" to="#">Forgot your password?</Link>
      </p>
    </Layout>
  );
}
