// GradientMesh.tsx - Animated gradient background
export function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      <div 
        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 0, 229, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.04) 0%, transparent 50%)
          `,
          animation: 'gradientMorph 20s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
}

