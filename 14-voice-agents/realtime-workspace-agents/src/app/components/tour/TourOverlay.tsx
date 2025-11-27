import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTour } from '../../contexts/TourContext';

export default function TourOverlay() {
  const { isActive, steps, currentStepIndex, nextStep, prevStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetRadius, setTargetRadius] = useState<number>(10);
  const [tooltipSize, setTooltipSize] = useState<{ width: number; height: number }>({ width: 320, height: 200 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const currentStep = steps[currentStepIndex];
  
  // Update target position
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        const computedStyle = window.getComputedStyle(element);
        const radiusValue = parseFloat(computedStyle.borderRadius || '0') || 0;
        const inferredRadius = Math.min(rect.width, rect.height) / 4;
        setTargetRadius(radiusValue > 0 ? radiusValue : Math.max(8, Math.min(20, inferredRadius)));
        
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
  const tooltipWidth = tooltipSize.width || 320;
  const tooltipHeight = tooltipSize.height || 200;
  let tooltipStyle: React.CSSProperties = {};
  let isCentered = false;

  if (targetRect) {
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    const clampedX = Math.max(tooltipPadding, Math.min(window.innerWidth - tooltipPadding, centerX));
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Decide placement with fallback to keep tooltip in view
    let placement: 'top' | 'bottom' | 'left' | 'right' = currentStep.position || 'bottom';

    if (placement === 'top' && targetRect.top - tooltipPadding - tooltipHeight < tooltipPadding) {
      placement = 'bottom';
    } else if (
      placement === 'bottom' &&
      targetRect.bottom + tooltipPadding + tooltipHeight > viewportHeight - tooltipPadding &&
      targetRect.top - tooltipPadding - tooltipHeight >= tooltipPadding
    ) {
      placement = 'top';
    }

    if (placement === 'left' && (targetRect.left - tooltipPadding - tooltipWidth < tooltipPadding) &&
        (targetRect.right + tooltipPadding + tooltipWidth <= viewportWidth - tooltipPadding)) {
      placement = 'right';
    } else if (placement === 'right' && (targetRect.right + tooltipPadding + tooltipWidth > viewportWidth - tooltipPadding) &&
      (targetRect.left - tooltipPadding - tooltipWidth >= tooltipPadding)) {
      placement = 'left';
    }

    switch (placement) {
      case 'top': {
        const top = Math.max(
          tooltipPadding,
          targetRect.top - tooltipPadding - tooltipHeight
        );
        const left = Math.max(
          tooltipPadding,
          Math.min(viewportWidth - tooltipWidth - tooltipPadding, clampedX - tooltipWidth / 2)
        );
        tooltipStyle = { top, left };
        break;
      }
      case 'bottom': {
        const top = Math.min(
          viewportHeight - tooltipHeight - tooltipPadding,
          targetRect.bottom + tooltipPadding
        );
        const left = Math.max(
          tooltipPadding,
          Math.min(viewportWidth - tooltipWidth - tooltipPadding, clampedX - tooltipWidth / 2)
        );
        tooltipStyle = { top, left };
        break;
      }
      case 'left': {
        const left = Math.max(tooltipPadding, targetRect.left - tooltipPadding - tooltipWidth);
        const top = Math.max(
          tooltipPadding,
          Math.min(viewportHeight - tooltipHeight - tooltipPadding, centerY - tooltipHeight / 2)
        );
        tooltipStyle = { top, left };
        break;
      }
      case 'right': {
        const left = Math.min(
          viewportWidth - tooltipWidth - tooltipPadding,
          targetRect.right + tooltipPadding
        );
        const top = Math.max(
          tooltipPadding,
          Math.min(viewportHeight - tooltipHeight - tooltipPadding, centerY - tooltipHeight / 2)
        );
        tooltipStyle = { top, left };
        break;
      }
      default:
        break;
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
                   className="absolute border-2 border-accent-primary shadow-[0_0_28px_rgba(0,255,255,0.35)] transition-all duration-300 ease-out pointer-events-none"
                   style={{
                     top: targetRect.top - 6,
                     left: targetRect.left - 6,
                     width: targetRect.width + 12,
                     height: targetRect.height + 12,
                     borderRadius: targetRadius + 4,
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
        style={!isCentered ? tooltipStyle : undefined}
      >
        <motion.div
          ref={tooltipRef}
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
