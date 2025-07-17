import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [bio, setBio] = useState('');
  const [user, setUser] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return navigate('/login');
      setUser(user);

      const { data } = await supabase.from('artist_profiles').select('*').eq('user_id', user.id).single();
      if (data) {
        setBio(data.bio || '');
        setProfileUrl(data.profile_url || '');
      } else {
        await supabase.from('artist_profiles').insert({ user_id: user.id });
      }
    })();
  }, [navigate]);

  const handleSave = async () => {
    await supabase.from('artist_profiles').upsert({
      user_id: user.id,
      bio,
      profile_url: profileUrl
    });
    alert('Saved!');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const filePath = `${user.id}/${file.name}`;
    const { error } = await supabase.storage.from('artist-uploads').upload(filePath, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('artist-uploads').getPublicUrl(filePath);
      setProfileUrl(data.publicUrl);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Email: {user?.email}</p>

      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        value={bio}
        placeholder="Write your artist bio here..."
        onChange={(e) => setBio(e.target.value)}
      />

      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={handleUpload} />
        {profileUrl && <img src={profileUrl} alt="Profile" className="w-24 h-24 rounded-full" />}
      </div>

      <button onClick={handleSave} className="rounded-full bg-blue-600 text-white px-6 py-2">Save</button>
      <button onClick={handleLogout} className="rounded-full bg-red-600 text-white px-6 py-2">Logout</button>
    </div>
  );
}
