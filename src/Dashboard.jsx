import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [bannerImg, setBannerImg] = useState(null);
  const [spotify, setSpotify] = useState('');
  const [instagram, setInstagram] = useState('');
  const [releaseSchedule, setReleaseSchedule] = useState('');
  const [musicFile, setMusicFile] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${folder}/${uuidv4()}.${fileExt}`;
    let { error } = await supabase.storage.from('artist-assets').upload(filePath, file);
    if (error) console.error(error);
    return filePath;
  };

  const handleSave = async () => {
    const updates = { bio, spotify, instagram, releaseSchedule };
    if (profilePic) updates.profilePic = await uploadFile(profilePic, 'profile-pics');
    if (bannerImg) updates.bannerImg = await uploadFile(bannerImg, 'banners');
    if (musicFile) updates.music = await uploadFile(musicFile, 'music');

    const { error } = await supabase
      .from('artists')
      .upsert({ id: user.id, ...updates });
    if (error) console.error(error);
    else alert('Saved successfully!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {/* Logo Header */}
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="Runner Music Group" className="h-20 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">🎤 Artist Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.email}</p>
        </div>

        {/* Banner Upload */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">📸 Banner / Header Image</label>
          <input type="file" onChange={(e) => setBannerImg(e.target.files[0])} />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Bio</label>
          <textarea
            className="w-full border rounded p-2"
            rows="3"
            placeholder="Tell the world who you are..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Profile Picture */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Profile Picture</label>
          <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
        </div>

        {/* Social Links */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Spotify URL</label>
          <input
            className="w-full border rounded p-2"
            type="url"
            placeholder="https://open.spotify.com/artist/..."
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Instagram URL</label>
          <input
            className="w-full border rounded p-2"
            type="url"
            placeholder="https://instagram.com/yourhandle"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>

        {/* Release Schedule */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Release Schedule</label>
          <textarea
            className="w-full border rounded p-2"
            rows="2"
            placeholder="Upcoming drops, shows, videos, etc..."
            value={releaseSchedule}
            onChange={(e) => setReleaseSchedule(e.target.value)}
          />
        </div>

        {/* Music Upload */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">🎵 Upload Music</label>
          <input type="file" onChange={(e) => setMusicFile(e.target.files[0])} />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
