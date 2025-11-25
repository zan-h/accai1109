import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '../../contexts/TourContext';

export default function TourOverlay() {
  const { isActive, steps, currentStepIndex, nextStep, prevStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const currentStep = steps[currentStepIndex];
  
  // Update target position
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        // If element not found, maybe wait or skip? 
        // For now, we'll just log it.
        console.warn(`Tour target not found: ${currentStep.targetId}`);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    // Small delay to allow for animations/rendering
    const timeout = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearTimeout(timeout);
    };
  }, [isActive, currentStepIndex, currentStep]);

  if (!isActive || !currentStep) return null;

  // Calculate tooltip position
  const tooltipPadding = 16;
  let tooltipX = 0;
  let tooltipY = 0;
  let isCentered = false;

  if (targetRect) {
      tooltipX = targetRect.left + targetRect.width / 2; // Default center horizontally
      tooltipY = targetRect.bottom + tooltipPadding; // Default bottom

      // Simple positioning logic
      if (currentStep.position === 'top') {
        tooltipY = targetRect.top - tooltipPadding;
      } else if (currentStep.position === 'left') {
        tooltipX = targetRect.left - tooltipPadding;
        tooltipY = targetRect.top + targetRect.height / 2;
      } else if (currentStep.position === 'right') {
        tooltipX = targetRect.right + tooltipPadding;
        tooltipY = targetRect.top + targetRect.height / 2;
      }
  } else {
      isCentered = true;
  }

  // Adjust for screen edges (basic)
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop / Spotlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
         {targetRect ? (
             <>
                 {/* Top */}
                 <div 
                    className="absolute bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
                    style={{ top: 0, left: 0, right: 0, height: targetRect.top }} 
                 />
                 {/* Bottom */}
                 <div 
                    className="absolute bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
                    style={{ top: targetRect.bottom, left: 0, right: 0, bottom: 0 }} 
                 />
                 {/* Left */}
                 <div 
                    className="absolute bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
                    style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }} 
                 />
                 {/* Right */}
                 <div 
                    className="absolute bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
                    style={{ top: targetRect.top, left: targetRect.right, right: 0, height: targetRect.height }} 
                 />
                 
                 {/* Highlight Border/Glow */}
                 <div 
                   className="absolute border-2 border-accent-primary shadow-[0_0_30px_rgba(0,255,255,0.3)] rounded-lg transition-all duration-300 ease-out pointer-events-none"
                   style={{
                     top: targetRect.top - 4,
                     left: targetRect.left - 4,
                     width: targetRect.width + 8,
                     height: targetRect.height + 8,
                   }}
                 />
             </>
         ) : (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
         )}
      </motion.div>

      {/* Tooltip */}
      <div 
        className={`absolute pointer-events-auto flex flex-col items-start transition-all duration-300 ease-out ${isCentered ? 'inset-0 items-center justify-center' : ''}`}
        style={!isCentered ? {
          top: currentStep.position === 'top' ? 'auto' : tooltipY,
          bottom: currentStep.position === 'top' ? window.innerHeight - tooltipY : 'auto',
          left: currentStep.position === 'left' ? 'auto' : (currentStep.position === 'right' ? tooltipX : Math.max(16, Math.min(window.innerWidth - 320, tooltipX - 160))),
          right: currentStep.position === 'left' ? window.innerWidth - tooltipX : 'auto',
        } : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentStepIndex}
          className="w-80 bg-bg-secondary/90 border border-white/10 backdrop-blur-xl rounded-xl p-6 shadow-2xl text-left"
        >
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
             <button 
               onClick={endTour} 
               className="text-white/50 hover:text-white transition-colors"
               aria-label="Close tour"
             >
               ✕
             </button>
          </div>
          <p className="text-sm text-white/70 mb-6 leading-relaxed">
            {currentStep.content}
          </p>
          
          <div className="flex justify-between items-center">
             <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20'}`}
                  />
                ))}
             </div>
             
             <div className="flex gap-2">
               {currentStepIndex > 0 && (
                 <button
                   onClick={prevStep}
                   className="px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
                 >
                   Back
                 </button>
               )}
               <button
                 onClick={nextStep}
                 className="px-4 py-1.5 text-sm bg-accent-primary text-bg-primary font-bold rounded-md hover:bg-accent-primary/90 transition-colors"
               >
                 {isLastStep ? 'Finish' : 'Next'}
               </button>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

