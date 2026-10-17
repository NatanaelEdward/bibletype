import React from 'react';

interface BibleTypingLogoProps {
  size?: number;
  className?: string;
  badge?: boolean;
}

export const BibleTypingLogo: React.FC<BibleTypingLogoProps> = ({
  size = 28,
  className = '',
  badge = false,
}) => {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bible Typing Indonesia Logo"
    >
      {/* Open Bible Page Contours */}
      <path
        d="M16 8.5C12.8 6.5 7 6.8 4 7.8V23C7 21.8 12.8 21.5 16 23.5M16 8.5C19.2 6.5 25 6.8 28 7.8V23C25 21.8 19.2 21.5 16 23.5M16 8.5V25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Christian Cross on Center Spine */}
      <path
        d="M16 2.5V12M12.5 5.5H19.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Page Keyboard Keys */}
      <rect x="6.2" y="10.2" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="10.6" y="10.2" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="6.2" y="14" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="10.6" y="14" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="6.2" y="17.8" width="7.6" height="2.4" rx="0.75" fill="currentColor" fillOpacity="0.9" />

      {/* Right Page Keyboard Keys */}
      <rect x="18.2" y="10.2" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="22.6" y="10.2" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="18.2" y="14" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="22.6" y="14" width="3.2" height="2.6" rx="0.75" fill="currentColor" fillOpacity="0.75" />
      <rect x="18.2" y="17.8" width="7.6" height="2.4" rx="0.75" fill="currentColor" fillOpacity="0.9" />
    </svg>
  );

  if (badge) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#818CF8]/15 to-[#A78BFA]/20 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shadow-sm transition hover:border-[#A78BFA]/50">
        {svg}
      </div>
    );
  }

  return svg;
};

export default BibleTypingLogo;
