// SkipLink.tsx - Accessibility helper
'use client';

import { useState } from 'react';

export function SkipLink() {
  const [focused, setFocused] = useState(false);

  return (
    <a
      href="#main-content"
      className={`fixed top-4 left-4 z-[100] bg-accent-primary text-bg-primary px-4 py-2 rounded font-bold font-mono transition-transform duration-200 ${
        focused ? 'translate-y-0' : '-translate-y-32'
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      Skip to content
    </a>
  );
}


