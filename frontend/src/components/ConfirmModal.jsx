import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1.5rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      <div style={{
        maxWidth: '400px', width: '100%', background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px',
        padding: '2rem', position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={onClose}
            className="btn-ghost"
            style={{ flex: 1, height: '44px', borderRadius: '12px' }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="btn-primary"
            style={{ 
              flex: 1, height: '44px', borderRadius: '12px', 
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
          >
            Purge Data
          </button>
        </div>
      </div>
    </div>
  );
}
