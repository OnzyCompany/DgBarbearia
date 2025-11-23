import React from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-dark text-white font-sans antialiased selection:bg-gold selection:text-dark">
        {children}
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #D4A853',
          }
        }} />
      </body>
    </html>
  );
}