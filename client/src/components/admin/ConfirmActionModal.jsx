import React from 'react';

export default function ConfirmActionModal({ isOpen, title, description, confirmText, cancelText, onConfirm, onCancel, isDestructive }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#f0f6fc] mb-3">{title}</h2>
        <p className="text-[#8b949e] mb-8 text-sm leading-relaxed">{description}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#c9d1d9] hover:text-white bg-transparent border border-[#30363d] rounded-lg hover:bg-[#30363d] transition-colors"
          >
            {cancelText || 'Cancel'}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDestructive 
                ? 'bg-[#da3633] text-white hover:bg-[#b32d2a]' 
                : 'bg-[#238636] text-white hover:bg-[#2ea043]'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
