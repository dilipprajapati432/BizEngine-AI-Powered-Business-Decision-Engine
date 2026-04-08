import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Smooth entry animation
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSmoothNavigate = (to) => {
    setIsExiting(true);
    setTimeout(() => {
      if (to === -1) navigate(-1);
      else navigate(to);
    }, 250); // Sharper exit
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', 
      background: 'var(--bg-base)', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      opacity: isExiting ? 0 : (isMounted ? 1 : 0),
      transition: 'opacity 0.25s ease-in-out',
      zIndex: 1000
    }}>
      {/* Background Decorative Mesh */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        transform: isMounted ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.8s ease-out'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        transform: isMounted ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 1s ease-out'
      }} />

      {/* Main Content Card */}
      <div className="card" style={{
        maxWidth: '420px', width: '100%', 
        padding: '3rem 2rem', 
        background: 'rgba(30,41,59,0.5)', 
        border: '1px solid var(--border)',
        borderRadius: '24px', 
        backdropFilter: 'blur(16px)',
        zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: isMounted ? 'translateY(0)' : 'translateY(15px)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          transform: isMounted ? 'rotate(0)' : 'rotate(-10deg)',
          transition: 'transform 0.6s ease-out'
        }}>
          <AlertCircle size={30} color="var(--accent)" />
        </div>

        <h1 style={{
          fontSize: '4.5rem', fontWeight: 900, margin: 0, lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.05em'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.35rem', fontWeight: 800, marginTop: '0.75rem', marginBottom: '0.75rem',
          color: '#fff', letterSpacing: '-0.02em'
        }}>
          Resource Not Found
        </h2>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6,
          marginBottom: '2.5rem', maxWidth: '280px'
        }}>
          The path you requested does not exist or has been relocated within the intelligence engine.
        </p>

        <button 
          onClick={() => handleSmoothNavigate('/')}
          className="btn-primary" 
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0 24px', height: '46px', fontSize: '0.9rem',
            fontWeight: 700, borderRadius: '12px', textDecoration: 'none'
          }}
        >
          <Home size={16} /> Return to Dashboard
        </button>

        <button 
          onClick={() => handleSmoothNavigate(-1)}
          style={{
            marginTop: '1.25rem', background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.target.style.color = '#fff'}
          onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>

      {/* Corporate Metadata Footer */}
      <div style={{
        marginTop: '2rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase', letterSpacing: '0.2em', zIndex: 1
      }}>
        BizEngine Intelligence Framework • System Error: 0x404
      </div>
    </div>
  );
}
