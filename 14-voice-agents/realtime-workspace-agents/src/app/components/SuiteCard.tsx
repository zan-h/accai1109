// src/app/components/SuiteCard.tsx

import React from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MagneticButton } from './ui/MagneticButton';

interface SuiteCardProps {
  suite: AgentSuite;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
}

export default function SuiteCard({ suite, isExpanded, onExpand, onSelect }: SuiteCardProps) {
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      className="glass-panel hover:neon-border-cyan transition-all relative overflow-hidden group rounded-xl"
      data-suite-id={suite.id}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glossy sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

      {/* Header */}
      <div className="p-4 border-b border-white/10 relative z-20">
        <div className="flex items-start gap-3">
          <div className="text-4xl filter drop-shadow-glow" role="img" aria-label={suite.name}>
            {suite.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-mono text-sm mb-1 font-bold group-hover:text-accent-primary transition-colors">
              {suite.name}
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">
              {suite.description}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {suite.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-black/20 text-text-tertiary border border-white/5 font-mono rounded"
            >
              {tag}
            </span>
          ))}
          {suite.tags.length > 3 && (
            <span className="text-xs text-text-tertiary font-mono">
              +{suite.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* Expandable Details */}
      {isExpanded && (
        <motion.div 
          className="p-4 border-b border-white/10 text-xs space-y-3 bg-black/20 relative z-20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Agents */}
          <div>
            <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono text-[10px]">
              Agents
            </div>
            <div className="space-y-1">
              {suite.agents.map(agent => (
                <div key={agent.name} className="text-text-primary font-mono flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-primary rounded-full" />
                  {agent.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Use Cases */}
          {suite.suggestedUseCases && suite.suggestedUseCases.length > 0 && (
            <div>
              <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono text-[10px]">
                Best For
              </div>
              <div className="space-y-1">
                {suite.suggestedUseCases.map((useCase, i) => (
                  <div key={i} className="text-text-tertiary">
                    • {useCase}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex gap-4 pt-2 border-t border-white/10">
            {suite.estimatedSessionLength && (
              <div className="text-text-tertiary">
                ⏱️ {suite.estimatedSessionLength} min
              </div>
            )}
            {suite.userLevel && (
              <div className="text-text-tertiary">
                📊 {suite.userLevel}
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Actions */}
      <div className="p-4 flex gap-2 relative z-20 bg-white/5">
        <MagneticButton
          onClick={() => onExpand()}
          variant="secondary"
          className="flex-1 text-xs"
        >
          {isExpanded ? 'Hide' : 'Info'}
        </MagneticButton>
        <MagneticButton
          onClick={() => onSelect()}
          variant="primary"
          className="flex-1 text-xs font-bold"
        >
          Start
        </MagneticButton>
      </div>
    </motion.div>
  );
}
