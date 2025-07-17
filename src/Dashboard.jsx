import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login');
      else setUser(data.session.user);
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Welcome to your dashboard!</h1>
      <p>{user?.email}</p>
      <button className="rounded-full px-4 py-2 bg-red-500 text-white" onClick={handleLogout}>
        Logout
      </button
