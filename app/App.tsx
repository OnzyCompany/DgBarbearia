
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './page';
import AgendarPage from './(cliente)/agendar/page';
import AdminLoginPage from './(admin)/admin/page';
import AdminDashboardPage from './(admin)/admin/dashboard/page';
import AdminServicosPage from './(admin)/admin/servicos/page';
import AdminAgendamentosPage from './(admin)/admin/agendamentos/page';
import AdminBarbeirosPage from './(admin)/admin/barbeiros/page';
import AdminClientesPage from './(admin)/admin/clientes/page';
import AdminHorariosPage from './(admin)/admin/horarios/page';
import AdminConfiguracoesPage from './(admin)/admin/configuracoes/page';
import AdminNotificacoesPage from './(admin)/admin/notificacoes/page';
import { NotificationSystem } from '../components/NotificationSystem';

// Layout wrapper to apply global styles and providers
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-dark text-white font-sans antialiased selection:bg-gold selection:text-dark">
      <NotificationSystem />
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
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/servicos" element={<AdminServicosPage />} />
        <Route path="/admin/agendamentos" element={<AdminAgendamentosPage />} />
        <Route path="/admin/barbeiros" element={<AdminBarbeirosPage />} />
        <Route path="/admin/clientes" element={<AdminClientesPage />} />
        <Route path="/admin/horarios" element={<AdminHorariosPage />} />
        <Route path="/admin/notificacoes" element={<AdminNotificacoesPage />} />
        <Route path="/admin/configuracoes" element={<AdminConfiguracoesPage />} />
        
        {/* Catch all for admin to dashboard, others to home */}
        <Route path="/admin/*" element={<AdminDashboardPage />} />
      </Routes>
    </Layout>
  );
}
