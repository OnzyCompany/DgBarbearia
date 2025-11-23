
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Scissors, Users, Calendar, 
  BarChart3, Settings, Bell, Gift, Heart,
  Sparkles, Clock, CalendarOff, LogOut, Menu, X,
  CreditCard, Package
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const MENU_ITEMS = [
  { href: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { href: '/admin/servicos', label: 'Serviços', icon: Scissors },
  { href: '/admin/barbeiros', label: 'Barbeiros', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/horarios', label: 'Config. Horários', icon: Clock },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Saiu com sucesso');
      navigate('/admin');
    } catch (error) {
      console.error('Logout error', error);
      toast.error('Erro ao sair');
    }
  };

  return (
    <>
      {/* Botão Mobile */}
      <button
        onClick={() => setAberto(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay Mobile */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAberto(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: aberto || window.innerWidth >= 1024 ? 0 : -280 }}
        className={`
          fixed left-0 top-0 bottom-0 w-[280px] bg-[#0D0D0D] border-r border-[#252525]
          z-50 flex flex-col overflow-hidden
          lg:relative lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#252525]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                <span className="text-white">Next</span>
                <span className="text-[#D4A853]">Barber</span>
              </h1>
              <p className="text-[#A0A0A0] text-xs">ADMIN PRO</p>
            </div>
            <button
              onClick={() => setAberto(false)}
              className="lg:hidden p-1 text-[#A0A0A0]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={() => setAberto(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative
                    ${isActive 
                      ? 'bg-[#D4A853] text-[#0D0D0D]' 
                      : 'text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-[#0D0D0D] rounded-r opacity-20" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Info do Admin */}
        <div className="p-4 border-t border-[#252525]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#D4A853] flex items-center justify-center text-[#0D0D0D] font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">Administrador</p>
              <p className="text-[#D4A853] text-xs">Online</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3 bg-[#1A1A1A] text-white hover:text-[#D4A853] rounded-xl font-bold flex items-center justify-center gap-2 border border-[#252525]"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
