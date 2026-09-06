import { CheckCircle, Package, Truck, Clock } from 'lucide-react';
import type { OrderStatus } from '../../types';
import './StatusTimeline.css';

const STATUS_STEPS: OrderStatus[] = ['received', 'packing', 'dispatched', 'delivered'];
const STATUS_ICONS = {
  received: Clock,
  packing: Package,
  dispatched: Truck,
  delivered: CheckCircle,
};

interface StatusTimelineProps {
  status: OrderStatus;
}

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const currentStepIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="status-timeline" style={{ paddingBottom: '36px' }}>
      {STATUS_STEPS.map((step, i) => {
        const Icon = STATUS_ICONS[step];
        const isComplete = i <= currentStepIdx;
        const isLineComplete = i < currentStepIdx;

        return (
          <div key={step} className={`timeline-step ${isComplete ? 'complete' : ''}`}>
            <div className="timeline-icon-box">
              <Icon size={18} />
            </div>
            <span className="timeline-label">{step}</span>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`timeline-line ${isLineComplete ? 'complete' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
