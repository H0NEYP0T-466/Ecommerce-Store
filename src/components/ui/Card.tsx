import './Card.css';

interface CardProps {
  variant?: 'standard' | 'featured';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export default function Card({
  variant = 'standard',
  hoverable = false,
  onClick,
  className = '',
  children,
}: CardProps) {
  return (
    <div
      className={`card card--${variant} ${hoverable ? 'card--hoverable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
