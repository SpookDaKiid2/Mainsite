import React from 'react';

export default function App() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">Runner Portal Starter</h1>
      <p>Supabase + Login system coming soon...</p>
    </div>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
