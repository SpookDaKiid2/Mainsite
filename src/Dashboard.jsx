import React, { useEffect, useState } from 'react';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [spotify, setSpotify] = useState('');
  const [instagram, setInstagram] = useState('');
  const [file, setFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null);
  const [schedule, setSchedule] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) navigate('/login');
      else setUser(data.session.user);
    });
  }, []);

  const handleFileUpload = async () => {
    if (!file) return;
    const { data, error } = await supabase.storage
      .from('artist-files')
      .upload(`${user.id}/${file.name}`, file, { upsert: true });

    if (error) return alert(error.message);
    const { data: urlData } = supabase.storage
      .from('artist-files')
      .getPublicUrl(`${user.id}/${file.name}`);
    setUploadUrl(urlData.publicUrl);
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('artist_profiles')
      .upsert({ id: user.id, bio, spotify, instagram, schedule });

    if (error) alert(error.message);
    else alert('Profile saved!');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-zinc-900 to-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-800 border-r border-zinc-700 hidden md:flex flex-col p-6 space-y-6">
        <h2 className="text-xl font-bold">Runner Portal</h2>
        <button className="text-left hover:text-indigo-400 transition">Dashboard</button>
        <button className="text-left hover:text-indigo-400 transition">Inbox</button>
        <button className="text-left hover:text-indigo-400 transition">Settings</button>
        <div className="mt-auto">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={adminMode}
              onChange={() => setAdminMode(!adminMode)}
              className="accent-indigo-500"
            />
            Admin View
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 space-y-8">
        <div className="text-2xl font-bold">Welcome back 👋</div>

        {/* Bio + Socials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea
            className="bg-zinc-800 p-4 rounded-lg border border-zinc-600 w-full resize-none placeholder-white"
            rows="4"
            placeholder="Your artist bio..."
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
          <div className="space-y-3">
            <input
              className="bg-zinc-800 p-3 rounded-lg border border-zinc-600 w-full placeholder-white"
              placeholder="Spotify URL"
              value={spotify}
              onChange={e => setSpotify(e.target.value)}
            />
            <input
              className="bg-zinc-800 p-3 rounded-lg border border-zinc-600 w-full placeholder-white"
              placeholder="Instagram URL"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
            />
            <button
              onClick={handleSaveProfile}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-full font-semibold"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Release Schedule */}
        <div>
          <h3 className="font-semibold mb-2">Release Schedule</h3>
          <textarea
            className="w-full bg-zinc-800 border border-zinc-600 p-4 rounded-md resize-y placeholder-white"
            rows="4"
            placeholder="Add release dates, notes, deadlines..."
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div>
          <h3 className="font-semibold mb-2">Upload a track</h3>
          <input
            type="file"
            accept="audio/*"
            onChange={e => setFile(e.target.files[0])}
            className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
          <button
            onClick={handleFileUpload}
            className="ml-4 px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 transition font-semibold"
          >
            Upload
          </button>
          {uploadUrl && (
            <audio controls src={uploadUrl} className="mt-4 w-full rounded-lg" />
          )}
        </div>

        {/* Fan Inbox (Mock) */}
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <h3 className="text-lg font-semibold mb-2">📨 Fan Inbox (Coming Soon)</h3>
          <p className="text-zinc-400 text-sm">Messages from fans will appear here.</p>
        </div>
      </div>
    </div>
  );
}
