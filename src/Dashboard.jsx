import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [uploads, setUploads] = useState([]);
  const [releaseSchedule, setReleaseSchedule] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return navigate('/login');
      setUser(user);

      const { data } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setBio(data.bio || '');
        setProfileUrl(data.profile_url || '');
        setReleaseSchedule(data.release_schedule || '');
        setSpotifyUrl(data.spotify_url || '');
        setInstagramUrl(data.instagram_url || '');
      } else {
        await supabase.from('artist_profiles').insert({ user_id: user.id });
      }

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
      profile_url: profileUrl,
      release_schedule: releaseSchedule,
      spotify_url: spotifyUrl,
      instagram_url: instagramUrl
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
    <motion.div
      className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold">Artist Dashboard</h1>
      <p className="text-sm text-gray-600">Email: {user?.email}</p>

      {/* Bio */}
      <div>
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={bio}
          placeholder="Your artist bio..."
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Profile Image Upload */}
      <div>
        <label className="block font-semibold mb-1">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleUpload} />
        {profileUrl && (
          <img
            src={profileUrl}
            alt="Profile"
            className="w-24 h-24 object-cover rounded-full border mt-2"
          />
        )}
      </div>

      {/* Spotify + Instagram Links */}
      <div>
        <label className="block font-semibold mb-1 mt-4">Spotify URL</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/artist/..."
        />

        <label className="block font-semibold mb-1 mt-4">Instagram URL</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/yourhandle"
        />
      </div>

      {/* Release Schedule */}
      <div>
        <label className="block font-semibold mb-1 mt-4">Release Schedule</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={5}
          value={releaseSchedule}
          placeholder="Upcoming releases, dates, notes..."
          onChange={(e) => setReleaseSchedule(e.target.value)}
        />
      </div>

      {/* Music Upload */}
      <div>
        <h2 className="text-lg font-bold mt-6 mb-2">Upload Music</h2>
        <input type="file" accept=".mp3,.wav,.zip" onChange={handleMusicUpload} />
        <ul className="mt-4 space-y-4">
          {uploads.map((url, idx) => {
            const fileName = url.split('/').pop();
            const isAudio = fileName.endsWith('.mp3') || fileName.endsWith('.wav');
            return (
              <li key={idx} className="border rounded p-3 shadow-sm">
                <p className="font-semibold text-sm mb-2">{fileName}</p>
                {isAudio ? (
                  <audio controls className="w-full">
                    <source src={url} />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <a
                    className="text-blue-600 underline"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition"
        >
          Save
        </button>
        <button
          onClick={handleLogout}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 transition"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}
