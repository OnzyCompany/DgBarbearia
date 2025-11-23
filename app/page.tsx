'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Star, MapPin } from 'lucide-react';
import { StyleConsultant } from '../components/ai/StyleConsultant';

export default function HomePage() {
  const navigateToSchedule = () => {
    // Dispatch custom event for internal routing without changing URL
    const event = new CustomEvent('app-navigate', { detail: '/agendar' });
    window.dispatchEvent(event);
  };

  return (
    <main className="min-h-screen bg-dark">
      <StyleConsultant />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-card to-dark" />
        
        {/* Animated Gold Particles */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              <span className="text-white">Next</span>
              <span className="text-gold">Barber</span>
            </h1>
            <p className="text-gray-400 mt-4 text-lg tracking-wide uppercase">Estilo & Precisão</p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-gray-400 text-lg mb-8 max-w-lg mx-auto"
          >
            A experiência de barbearia definitiva. Agende seu horário e deixe nossa IA te ajudar a encontrar o estilo perfeito.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.button
              onClick={navigateToSchedule}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 168, 83, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-gold to-gold-light text-dark w-full max-w-xs py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              Agendar Agora
            </motion.button>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16"
          >
            {[
              { icon: Clock, label: 'Seg - Sáb', value: '9h - 20h' },
              { icon: Star, label: 'Avaliação', value: '4.9 ★' },
              { icon: MapPin, label: 'Local', value: 'Centro' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-dark-card/80 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-gold/30 transition-colors"
              >
                <item.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-gray-500 text-xs uppercase tracking-wider">{item.label}</p>
                <p className="text-white text-sm font-medium">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}