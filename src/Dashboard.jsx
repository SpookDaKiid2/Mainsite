import React, { useEffect, useState } from 'react';
import { supabase } from './client';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchProfileAndTracks = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from('artist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setProfile(profileData);

        const { data: uploads } = await supabase
          .from('uploads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setTracks(uploads || []);
      }
    };
    fetchProfileAndTracks();
  }, [user]);

  if (!user) return <div className="p-6 text-gray-700">Loading dashboard...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-60 bg-black text-white p-6 flex flex-col gap-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🎧 Runner Portal</h1>
        <Link to="/dashboard" className="hover:text-red-500">🏠 Home</Link>
        <Link to="/upload" className="hover:text-red-500">⬆️ Upload Music</Link>
        <Link to="/profile" className="hover:text-red-500">👤 Edit Profile</Link>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-10">
        <div className="flex items-center gap-6">
          <img
            src={profile.profile_image || '/default-avatar.png'}
            alt="Artist"
            className="w-24 h-24 rounded-full object-cover border-4 border-black"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{profile.name || 'Artist Name'}</h2>
            <div className="flex gap-4 mt-2 text-blue-600">
              {profile.spotify && (
                <a href={profile.spotify} target="_blank" rel="noreferrer" className="hover:underline">Spotify</a>
              )}
              {profile.instagram && (
                <a href={profile.instagram} target="_blank" rel="noreferrer" className="hover:underline">Instagram</a>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">🎵 Uploaded Tracks</h3>
          {tracks.length === 0 ? (
            <p className="text-gray-600">No uploads yet.</p>
          ) : (
            <div className="grid gap-6">
              {tracks.map((track) => (
                <div key={track.id} className="bg-white rounded shadow p-4">
                  <h4 className="font-semibold">{track.title || 'Untitled'}</h4>
                  <AudioPlayer
                    src={track.file_url}
                    layout="horizontal"
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
