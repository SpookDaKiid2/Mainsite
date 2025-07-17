import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [uploads, setUploads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return navigate('/login');
      setUser(user);

      // Load profile
      const { data } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setBio(data.bio || '');
        setProfileUrl(data.profile_url || '');
      } else {
        await supabase.from('artist_profiles').insert({ user_id: user.id });
      }

      // Load uploaded music files
      const { data: files } = await supabase
        .storage
        .from('artist-uploads')
        .list(`${user.id}/music`, { limit: 100 });

      if (files) {
        const urls = files.map(file => {
          const { publicUrl } = supabase
            .storage
            .from('artist-uploads')
            .getPublicUrl(`${user.id}/music/${file.name}`);
          return publicUrl;
        });
        setUploads(urls);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `${user.id}/${file.name}`;
    const { error } = await supabase
      .storage
      .from('artist-uploads')
      .upload(filePath, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('artist-uploads').getPublicUrl(filePath);
      setProfileUrl(data.publicUrl);
    }
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const filePath = `${user.id}/music/${Date.now()}-${file.name}`;
    const { error } = await supabase
      .storage
      .from('artist-uploads')
      .upload(filePath, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from('artist-uploads').getPublicUrl(filePath);
      setUploads((prev) => [...prev, data.publicUrl]);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Welcome to your dashboard</h1>
      <p>Email: {user?.email}</p>

      {/* Bio */}
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        value={bio}
        placeholder="Your artist bio..."
        onChange={(e) => setBio(e.target.value)}
      />

      {/* Profile Image Upload */}
      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={handleUpload} />
        {profileUrl && (
          <img
            src={profileUrl}
            alt="Profile"
            className="w-24 h-24 object-cover rounded-full border"
          />
        )}
      </div>

      {/* Music Upload */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Upload Music</h2>
        <input type="file" accept=".mp3,.wav,.zip" onChange={handleMusicUpload} />
        <ul className="mt-2 space-y-2">
          {uploads.map((url, idx) => (
            <li key={idx}>
              <a
                className="text-blue-600 underline"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download {url.split('/').pop()}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="space-x-2">
        <button
          onClick={handleSave}
          className="rounded-full bg-blue-600 text-white px-6 py-2"
        >
          Save
        </button>
        <button
          onClick={handleLogout}
          className="rounded-full bg-red-600 text-white px-6 py-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
