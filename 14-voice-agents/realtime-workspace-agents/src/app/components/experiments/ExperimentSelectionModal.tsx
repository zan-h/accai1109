// ExperimentSelectionModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useExperimentStore, ExperimentType } from '@/app/hooks/useExperimentStore';

export function ExperimentSelectionModal() {
  const { stage, selectExperiment, closeExperiment } = useExperimentStore();

  if (stage !== 'selection') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Header / Intro Side */}
        <div className="md:w-1/3 p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-r border-white/5 flex flex-col justify-between z-20 relative">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-2xl">
              🧪
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Research Experiments</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Help us understand how voice agents affect focus and flow. Choose an experiment to participate in.
            </p>
          </div>
          <button 
            onClick={closeExperiment}
            className="mt-8 text-sm text-white/40 hover:text-white transition-colors text-left"
          >
            ← Back to Workspace
          </button>
        </div>

        {/* Selection Side */}
        <div className="md:w-2/3 p-8 bg-[#0A0A0A] z-20 relative">
          <div className="grid gap-4">
            <ExperimentCard 
              title="Experiment 1"
              subtitle="In-the-Moment Session"
              duration="15–20 min"
              description="Pick a real task, set a timer, and use the voice agent while you work. Short survey at the end."
              onClick={() => selectExperiment('experiment_1')}
              color="blue"
            />
            
            <ExperimentCard 
              title="Experiment 2"
              subtitle="Retrospective Analysis"
              duration="10–15 min"
              description="Reflect on your past week's work sessions and how the agent influenced your productivity."
              onClick={() => selectExperiment('experiment_2')}
              color="purple"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ExperimentCard({ 
  title, 
  subtitle, 
  duration, 
  description, 
  onClick,
  color
}: { 
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple'
}) {
  const borderClass = color === 'blue' ? 'hover:border-blue-500/50' : 'hover:border-purple-500/50';
  const bgClass = color === 'blue' ? 'group-hover:bg-blue-500/10' : 'group-hover:bg-purple-500/10';
  const textClass = color === 'blue' ? 'text-blue-400' : 'text-purple-400';

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`group w-full p-5 text-left rounded-xl border border-white/10 bg-white/5 transition-all ${borderClass} relative overflow-hidden cursor-pointer`}
    >
      <div className={`absolute inset-0 opacity-0 ${bgClass} transition-opacity duration-300 pointer-events-none`} />
      
      <div className="relative z-10 flex justify-between items-start mb-2 pointer-events-none">
        <div>
          <h3 className={`font-bold ${textClass} text-lg`}>{title}</h3>
          <p className="text-white font-medium">{subtitle}</p>
        </div>
        <span className="text-xs font-mono py-1 px-2 rounded-full bg-white/10 text-white/60">
          ⏱ {duration}
        </span>
      </div>
      
      <p className="relative z-10 text-sm text-white/50 leading-relaxed pointer-events-none">
        {description}
      </p>
    </button>
  );
}
