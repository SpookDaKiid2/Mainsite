import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [spotify, setSpotify] = useState('');
  const [instagram, setInstagram] = useState('');
  const [releaseSchedule, setReleaseSchedule] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        loadProfile(user.id);
      } else {
        navigate('/login');
      }
    });
  }, []);

  async function loadProfile(userId) {
    const { data, error } = await supabase.from('artist_profiles').select('*').eq('id', userId).single();
    if (data) {
      setBio(data.bio || '');
      setSpotify(data.spotify || '');
      setInstagram(data.instagram || '');
      setReleaseSchedule(data.release_schedule || '');
    }
  }

  async function handleSave() {
    const updates = {
      id: user.id,
      bio,
      spotify,
      instagram,
      release_schedule: releaseSchedule,
      updated_at: new Date(),
    };
    await supabase.from('artist_profiles').upsert(updates, { returning: 'minimal' });
    alert('Profile saved!');
  }

  async function uploadFile(file, pathPrefix) {
    const fileName = `${pathPrefix}/${user.id}/${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage.from('artist-media').upload(fileName, file);
    if (error) throw error;
    return fileName;
  }

  async function handleSubmit() {
    if (profilePic) await uploadFile(profilePic, 'profile_pictures');
    if (musicFile) await uploadFile(musicFile, 'music');
    if (bannerImage) await uploadFile(bannerImage, 'banners');
    await handleSave();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <img
          src="/rmg-logo.png"
          alt="Runner Music Group"
          className="w-full max-h-96 object-contain rounded-md mb-6 shadow-lg"
        />

        <h1 className="text-3xl font-bold mb-6 text-white">🎤 Artist Dashboard</h1>

        <p className="mb-2 text-sm text-gray-400">Welcome, <span className="font-medium">{user?.email}</span></p>

        {/* Banner Upload */}
        <label className="block mt-6 mb-2 font-medium">📸 Banner / Header Image</label>
        <input type="file" onChange={(e) => setBannerImage(e.target.files[0])} className="file-input file-input-bordered w-full" />

        {/* Bio */}
        <label className="block mt-6 mb-2 font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the world who you are..."
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          rows={3}
        />

        {/* Profile Picture */}
        <label className="block mt-6 mb-2 font-medium">Profile Picture</label>
        <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} className="file-input file-input-bordered w-full" />

        {/* Social Links */}
        <label className="block mt-6 mb-2 font-medium">Spotify URL</label>
        <input
          type="url"
          value={spotify}
          onChange={(e) => setSpotify(e.target.value)}
          placeholder="https://open.spotify.com/artist/..."
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
        />

        <label className="block mt-4 mb-2 font-medium">Instagram URL</label>
        <input
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="https://instagram.com/yourhandle"
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
        />

        {/* Release Schedule */}
        <label className="block mt-6 mb-2 font-medium">Release Schedule</label>
        <textarea
          value={releaseSchedule}
          onChange={(e) => setReleaseSchedule(e.target.value)}
          placeholder="Upcoming drops, shows, videos, etc..."
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          rows={3}
        />

        {/* Music Upload */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2 text-white">🎵 Upload Music</h2>
          <input type="file" onChange={(e) => setMusicFile(e.target.files[0])} className="file-input file-input-bordered w-full" />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-500 transition font-semibold text-white"
          >
            Save
          </button>
          <button
            onClick={logout}
            className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-500 transition font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
