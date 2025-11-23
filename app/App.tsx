import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './page';
import AgendarPage from './(cliente)/agendar/page';

// Layout wrapper to apply global styles and providers
const Layout = ({ children }: { children: React.ReactNode }) => {
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
};

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agendar" element={<AgendarPage />} />
      </Routes>
    </Layout>
  );
}