import { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  'Initializing Secure Intelligence Engine...',
  'Calibrating Forensic Logic Layers...',
  'Securing Session Instance...',
  'Instance Isolated. Booting Dashboard.'
];

export default function SplashScreen({ onComplete }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Cycle messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 500);

    // Completion Timer
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 600); // Allow fade-out animation to finish
    }, 2200);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#060912', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: isExiting ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none'
    }}>
      <style>{`
        @keyframes logoPulse {
          0% { transform: scale(0.95); opacity: 0.8; filter: drop-shadow(0 0 10px rgba(99,102,241,0.2)); }
          50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 30px rgba(99,102,241,0.5)); }
          100% { transform: scale(0.95); opacity: 0.8; filter: drop-shadow(0 0 10px rgba(99,102,241,0.2)); }
        }
        @keyframes textScan {
          from { opacity: 0.3; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* Decorative Radials */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem'
      }}>
        <img 
          src="/logo.png" 
          alt="BizEngine Logo" 
          style={{ 
            width: '100px', height: '100px', borderRadius: '24px',
            animation: 'logoPulse 2s infinite ease-in-out',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
          }} 
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', fontWeight: 800, color: '#fff', 
            letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 
          }}>
            BizEngine
          </h1>
          <div key={currentMessageIndex} style={{ 
            fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            animation: 'textScan 0.3s ease-out',
            fontFamily: 'monospace'
          }}>
            {STATUS_MESSAGES[currentMessageIndex]}
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '3rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.1)',
        textTransform: 'uppercase', letterSpacing: '0.3em'
      }}>
        Forensic Intelligence v1.0.4 • Isolated Session
      </div>
    </div>
  );
}
