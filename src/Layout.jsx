import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}
