
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For demo/preview purposes, allow generic login if firebase fails or is not configured
      if (process.env.NODE_ENV === 'development' || !auth.app) {
         // Mock login for preview
         setTimeout(() => {
            toast.success('Login simulado com sucesso (Modo Preview)');
            navigate('/admin/dashboard');
         }, 1000);
         return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Bem-vindo de volta!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao acessar. Verifique suas credenciais.');
      // Fallback for demo if auth fails (remove in real prod)
      if (email === 'admin@nextbarber.com' && password === 'admin123') {
        toast.success('Acesso de emergência concedido');
        navigate('/admin/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A853]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-3xl border border-[#252525] relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">Next</span>
            <span className="text-[#D4A853]">Barber</span>
          </h1>
          <p className="text-[#A0A0A0]">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nextbarber.com"
                className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4A853] transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D0D0D] border border-[#252525] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4A853] transition-colors"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 bg-[#D4A853] hover:bg-[#E5BE7D] text-[#0D0D0D] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">Credenciais Demo: admin@nextbarber.com / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}
