import { useEffect } from 'react';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-slide-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📦</span>
        <div>
          <p className="font-medium text-sm">Order Status Updated!</p>
          <p className="text-xs text-blue-100 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Toast;