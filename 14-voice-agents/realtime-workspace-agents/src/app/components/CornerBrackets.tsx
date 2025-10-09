/**
 * CornerBrackets Component
 * Renders L-shaped cyan corner brackets at the four corners of the viewport
 * Creates the spy/command-center dashboard frame aesthetic
 */

export default function CornerBrackets() {
  return (
    <>
      {/* Top-left corner bracket */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] border-t-[3px] border-l-[3px] border-accent-primary"
        aria-hidden="true"
      />
      
      {/* Top-right corner bracket */}
      <div 
        className="fixed top-0 right-0 w-8 h-8 pointer-events-none z-[9999] border-t-[3px] border-r-[3px] border-accent-primary"
        aria-hidden="true"
      />
      
      {/* Bottom-left corner bracket */}
      <div 
        className="fixed bottom-0 left-0 w-8 h-8 pointer-events-none z-[9999] border-b-[3px] border-l-[3px] border-accent-primary"
        aria-hidden="true"
      />
      
      {/* Bottom-right corner bracket */}
      <div 
        className="fixed bottom-0 right-0 w-8 h-8 pointer-events-none z-[9999] border-b-[3px] border-r-[3px] border-accent-primary"
        aria-hidden="true"
      />
    </>
  );
}

