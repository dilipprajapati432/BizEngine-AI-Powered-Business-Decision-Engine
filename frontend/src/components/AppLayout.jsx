import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Upload, Lightbulb, Bot, Info, Menu, X, LogOut } from 'lucide-react';
import ChatWidget from './ChatWidget';
import ConfirmModal from './ConfirmModal';

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/upload', icon: Upload, label: 'Upload Data' },
  { to: '/insights', icon: Lightbulb, label: 'AI Insights' },
  { to: '/about', icon: Info, label: 'About App' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Force redirect to home on refresh / initial mount
  useEffect(() => {
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart({ 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    });
  };

  const handleTouchEnd = (e) => {
    const touchEnd = { 
      x: e.changedTouches[0].clientX, 
      y: e.changedTouches[0].clientY 
    };
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);
    const swipeThreshold = 80;

    if (Math.abs(deltaX) > swipeThreshold && deltaY < 50) {
      const currentIndex = navLinks.findIndex(link => 
        link.to === location.pathname || (link.to === '/' && location.pathname === '/')
      );
      
      if (deltaX > 0 && currentIndex < navLinks.length - 1) {
        navigate(navLinks[currentIndex + 1].to);
      } else if (deltaX < 0 && currentIndex > 0) {
        navigate(navLinks[currentIndex - 1].to);
      }
    }
  };

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    setIsPurgeModalOpen(false);
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  return (
    <div 
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        /* RESPONSIVE LAYOUT TOGGLES */
        @media (max-width: 768px) {
          .sidebar { 
            position: fixed !important;
            top: 0;
            left: 0;
            z-index: 1000;
            transform: translateX(${isSidebarOpen ? '0' : '-100%'});
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: ${isSidebarOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'} !important;
            display: flex !important;
          }
          .mobile-header { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content { 
            padding-top: 60px !important; 
            padding-bottom: 90px !important; 
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
          }
          .chat-fab { bottom: 6rem !important; right: 1rem !important; transform: scale(0.9) !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
          .sidebar { transform: none !important; }
          .sidebar-backdrop { display: none !important; }
        }
        
        .nav-item-active::after {
          content: ''; position: absolute; top: -1px; left: 25%; width: 50%; height: 3px;
          background: var(--accent); border-radius: 0 0 4px 4px;
          box-shadow: 0 0 10px var(--accent);
        }
      `}</style>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      {/* Mobile Top Header */}
      <header className="mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', zIndex: 100,
        display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem'
      }}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ 
            background: 'transparent', border: 'none', color: '#fff', 
            cursor: 'pointer', padding: '8px', display: 'flex' 
          }}
        >
          <Menu size={24} />
        </button>

        <div 
          onClick={() => { if(location.pathname === '/') window.location.reload(); else navigate('/'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: '8px' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>BizEngine</span>
        </div>
        
        <div style={{ width: 40 }} /> {/* Spacer to balance header */}
      </header>

      {/* Sidebar (Responsive Drawer) */}
      <aside className="sidebar" style={{
        width: '260px', minHeight: '100vh', background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        padding: '1.5rem 1rem', gap: '0.5rem', flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Link 
            to="/" 
            onClick={(e) => { handleLogoClick(e); setIsSidebarOpen(false); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.85rem', 
              padding: '0 0.5rem', textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <img 
              src="/logo.png" 
              alt="BizEngine Logo" 
              style={{ 
                width: 38, height: 38, borderRadius: '10px', 
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }} 
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2, color: '#fff', letterSpacing: '0.02em' }}>BizEngine</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Decision Engine</div>
            </div>
          </Link>
          
          {/* Close button for mobile only */}
          <button 
            className="mobile-header" /* Reusing class for simplified media query visibility */
            onClick={() => setIsSidebarOpen(false)}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill-active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="nav-pill nav-pill-danger"
            style={{ 
              width: '100%', border: 'none', background: 'transparent', 
              color: '#f87171', justifyContent: 'flex-start' 
            }}
          >
            <LogOut size={18} />
            Purge Session
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem', minWidth: 0 }}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px',
        background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)', zIndex: 100,
        display: 'none', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 0.5rem'
      }}>
        {navLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              textDecoration: 'none', color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              flex: 1, transition: 'all 0.2s', position: 'relative', height: '100%', justifyContent: 'center'
            })}
            className={({ isActive }) => isActive ? 'nav-item-active' : ''}
          >
            <Icon size={22} style={{ filter: location.pathname === to ? 'drop-shadow(0 0 8px var(--accent))' : 'none' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Global Chat Widget */}
      <ChatWidget />

      {/* Custom Confirmation Modals */}
      <ConfirmModal 
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onConfirm={handleLogout}
        title="Purge Active Session?"
        message="Are you sure you want to discard all uploaded data and analysis? This action is irreversible and follows strict privacy protocols."
      />
    </div>
  );
}
