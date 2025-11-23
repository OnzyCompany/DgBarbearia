'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Scissors, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Agendamento } from '@/types';

interface Props {
  dados: Partial<Agendamento>;
  onComplete: () => void;
}

export function BookingSuccessAnimation({ dados, onComplete }: Props) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4A853', '#E5BE7D', '#22C55E']
    });
  }, []);

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | number }) => (
    <div className="flex items-center justify-between bg-dark p-3 rounded-lg border border-white/5">
      <div className="flex items-center gap-3 text-gray-400">
        <span className="text-gold">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium text-white">{value}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-gradient-to-br from-dark-card to-[#252525] rounded-3xl p-8 max-w-md w-full text-center border border-gold/20 shadow-[0_0_50px_rgba(212,168,83,0.1)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center shadow-lg"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <CheckCircle className="w-12 h-12 text-dark" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Agendamento Confirmado!
          </h2>
          <p className="text-gray-400 mb-6">
            Seu horário foi reservado com sucesso.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-8"
        >
          <InfoRow icon={<Scissors className="w-4 h-4" />} label="Serviço" value={dados.servicoNome} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Data" value={dados.data} />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Horário" value={dados.horario} />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-dark font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
        >
          <Sparkles className="w-5 h-5" />
          Voltar ao Início
        </motion.button>
      </motion.div>
    </motion.div>
  );
}