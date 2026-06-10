import React from 'react';

export function CorreiosLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 144" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M72.2 47.6L47.7 75.8L72.2 104H119.8L95.3 75.8L119.8 47.6H72.2Z" fill="#FFB600"/>
      <path d="M110.2 47.6L85.7 75.8L110.2 104H157.8L133.3 75.8L157.8 47.6H110.2Z" fill="#00416B"/>
      <text fill="#00416B" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="76" letterSpacing="-1" x="180" y="102">Correios</text>
    </svg>
  );
}
