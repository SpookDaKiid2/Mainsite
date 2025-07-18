import React, { useEffect, useState } from 'react';
import { supabase } from './client';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
// remove the import entirely; // assuming your logo is in public/logo.png

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [audioURL, setAudioURL] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      setUser(data?.session?.user);
    });

    // Fetch release schedule
    const fetchSchedule = async () => {
      const { data, error } = await supabase.from('release_schedule').select('*');
      if (!error) setSchedule(data);
    };

    fetchSchedule();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col items-center py-8">
        <img src="/logo.png" alt="Logo" className="h-16 mb-6" />
        <nav className="flex flex-col space-y-4 w-full text-center">
          <a href="/dashboard" className="hover:bg-gray-800 py-2 w-full block">Dashboard</a>
          <a href="#" className="hover:bg-gray-800 py-2 w-full block">My Songs</a>
          <a href="#" className="hover:bg-gray-800 py-2 w-full block">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.email || 'Artist'} 🎶</h1>

        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 flex items-center space-x-6">
          <img
            src="https://via.placeholder.com/80"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">Your Artist Profile</h2>
            <p className="text-gray-600">Customize your image, bio, and socials soon.</p>
            <div className="flex space-x-4 mt-2">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Spotify
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 underline"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Release Schedule */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Release Schedule</h2>
          <table className="w-full text-left border">
            <thead className="bg-gray-200 text-sm text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Release Date</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.id} className="text-sm">
                  <td className="px-4 py-2 border">{item.title}</td>
                  <td className="px-4 py-2 border">{item.release_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audio Player */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preview Track</h2>
          <AudioPlayer
            src={audioURL || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
            onPlay={() => console.log('playing')}
            customAdditionalControls={[]}
            showJumpControls={false}
            layout="horizontal"
          />
        </div>
      </main>
    </div>
  );
}
