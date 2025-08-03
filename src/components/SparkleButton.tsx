import { useState, useRef, useEffect } from 'react';

interface SparkleButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  as?: 'button' | 'a';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function SparkleButton({ children, onClick, className = '', as = 'button', href, type = 'button', ...props }: SparkleButtonProps) {
  const [spark, setSpark] = useState(false);
  const sparkTimeout = useRef<NodeJS.Timeout | null>(null);

  function handleClick(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    setSpark(true);
    if (onClick) onClick(e);
    if (sparkTimeout.current) clearTimeout(sparkTimeout.current);
    sparkTimeout.current = setTimeout(() => setSpark(false), 700);
  }

  useEffect(() => {
    return () => {
      if (sparkTimeout.current) clearTimeout(sparkTimeout.current);
    };
  }, []);

  const baseClass = `relative overflow-visible ${className}`;

  if (as === 'a' && href) {
    return (
      <a href={href} className={baseClass} onClick={handleClick} {...props}>
        {children}
        {spark && (
          <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg width="60" height="30" className="animate-sparkle" viewBox="0 0 60 30" fill="none">
              <circle cx="10" cy="15" r="2" fill="#ffe066" />
              <circle cx="30" cy="8" r="1.5" fill="#fff" />
              <circle cx="50" cy="18" r="2.2" fill="#ffd700" />
              <circle cx="20" cy="25" r="1.2" fill="#fffbe7" />
              <circle cx="40" cy="12" r="1.7" fill="#fff" />
            </svg>
          </span>
        )}
      </a>
    );
  }
  return (
    <button type={type} className={baseClass} onClick={handleClick} {...props}>
      {children}
      {spark && (
        <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg width="60" height="30" className="animate-sparkle" viewBox="0 0 60 30" fill="none">
            <circle cx="10" cy="15" r="2" fill="#ffe066" />
            <circle cx="30" cy="8" r="1.5" fill="#fff" />
            <circle cx="50" cy="18" r="2.2" fill="#ffd700" />
            <circle cx="20" cy="25" r="1.2" fill="#fffbe7" />
            <circle cx="40" cy="12" r="1.7" fill="#fff" />
          </svg>
        </span>
      )}
    </button>
  );
} 