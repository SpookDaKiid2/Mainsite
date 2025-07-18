import React, { useEffect, useState } from 'react';
import { supabase } from './client';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    spotify: '',
    instagram: '',
    profile_pic: '',
    song_url: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    getUser();
  }, []);

  const handleUpdate = async () => {
    const updates = { ...profile, id: user.id, updated_at: new Date() };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) alert('Error updating profile: ' + error.message);
    else alert('Profile updated!');
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const path = `${user.id}/${type}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });

    if (error) {
      alert(`Upload error: ${error.message}`);
    } else {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      setProfile(prev => ({
        ...prev,
        [type === 'image' ? 'profile_pic' : 'song_url']: urlData.publicUrl,
      }));
    }
    setUploading(false);
  };

  if (!user) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 w-full bg-gray-800 p-6 md:h-screen">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-3">
          <a href="/dashboard" className="block hover:text-blue-400">Edit Profile</a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-left w-full hover:text-red-400"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Profile Info</h3>

          {profile.profile_pic && (
            <img
              src={profile.profile_pic}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full mb-2"
            />
          )}
          <label className="block mb-2">
            Upload Profile Picture:
            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} className="mt-1" />
          </label>

          <input
            className="w-full p-2 mt-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Username"
            value={profile.username}
            onChange={e => setProfile({ ...profile, username: e.target.value })}
          />
          <textarea
            className="w-full p-2 mt-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Bio"
            value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          />
          <input
            className="w-full p-2 mt-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Spotify Link"
            value={profile.spotify}
            onChange={e => setProfile({ ...profile, spotify: e.target.value })}
          />
          <input
            className="w-full p-2 mt-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Instagram Link"
            value={profile.instagram}
            onChange={e => setProfile({ ...profile, instagram: e.target.value })}
          />
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Music Upload</h3>

          {profile.song_url && (
            <AudioPlayer
              src={profile.song_url}
              autoPlay={false}
              controls
              className="rounded mt-2"
            />
          )}

          <label className="block mt-2">
            Upload Song:
            <input type="file" accept="audio/*" onChange={e => handleFileUpload(e, 'audio')} className="mt-1" />
          </label>
        </section>

        <button
          onClick={handleUpdate}
          disabled={uploading}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition duration-200"
        >
          {uploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </main>
    </div>
  );
}
