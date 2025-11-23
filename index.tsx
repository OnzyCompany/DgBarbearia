import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout';
import HomePage from './app/page';
import AgendarPage from './app/(cliente)/agendar/page';

// Custom Router that listens to internal events instead of window.location
// This prevents 'Blocked by response' errors in sandboxed iframes
const Router = () => {
  const [path, setPath] = useState('/');

  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      setPath(e.detail);
      // Scroll to top on navigation
      window.scrollTo(0, 0);
    };

    // Listen to our custom navigation event
    window.addEventListener('app-navigate', handleNavigation as EventListener);

    return () => {
      window.removeEventListener('app-navigate', handleNavigation as EventListener);
    };
  }, []);

  let Component;
  if (path === '/agendar') {
    Component = AgendarPage;
  } else {
    Component = HomePage;
  }

  return <Component />;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootLayout children={<Router />} />
  </React.StrictMode>
);