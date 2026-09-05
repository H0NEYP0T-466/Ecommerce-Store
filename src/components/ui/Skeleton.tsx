import './Skeleton.css';

interface SkeletonProps { width?: string; height?: string; radius?: string; className?: string; }

export default function Skeleton({ width = '100%', height = '20px', radius = '8px', className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton height="280px" radius="8px 8px 0 0" />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="70%" height="16px" />
        <Skeleton width="40%" height="14px" />
        <Skeleton width="50%" height="20px" />
      </div>
    </div>
  );
}
