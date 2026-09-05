import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastData { id: string; message: string; type: ToastType; }

let addToast: (message: string, type?: ToastType) => void;

export function useToast() {
  return { toast: (message: string, type: ToastType = 'success') => addToast?.(message, type) };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToast = (message, type = 'success') => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
  }, []);

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };

  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <Icon size={18} />
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
