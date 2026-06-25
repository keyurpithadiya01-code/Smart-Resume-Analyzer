import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="bg-[#161b22] border border-[#30363d] shadow-lg rounded-lg px-4 py-3 text-sm text-[#f0f6fc] flex items-center gap-3 animate-slide-up"
          >
            {toast.type === 'success' && (
              <span className="w-2 h-2 rounded-full bg-[#00ffa3] shrink-0"></span>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
