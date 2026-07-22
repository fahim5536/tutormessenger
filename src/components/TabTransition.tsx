import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TabTransition({ activeTab, children }: { activeTab: string, children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex flex-col min-w-0 h-full relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
