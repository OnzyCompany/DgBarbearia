import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In this client-side preview, we render a div wrapper instead of html/body
  // and use standard fonts instead of next/font optimization
  return (
    <div className="min-h-screen bg-dark text-white font-sans antialiased selection:bg-gold selection:text-dark">
      {children}
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#1A1A1A',
          color: '#fff',
          border: '1px solid #D4A853',
        }
      }} />
    </div>
  );
}