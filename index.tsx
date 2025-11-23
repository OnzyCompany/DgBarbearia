import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout';
import HomePage from './app/page';
import AgendarPage from './app/(cliente)/agendar/page';

// Mock Router to handle navigation in this preview environment
const Router = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    // Intercept link clicks to prevent full page reloads where possible
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const newPath = anchor.getAttribute('href') || '/';
        window.history.pushState({}, '', newPath);
        setPath(newPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
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