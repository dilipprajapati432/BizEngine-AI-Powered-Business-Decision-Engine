import { Info, Cpu, Globe, Zap, Mail, User, ExternalLink, Code, TrendingUp, ShieldCheck, Database, Layers, FileText, Scale } from 'lucide-react';

/**
 * TechBadge Component
 */
function TechBadge({ name }) {
  return (
    <span style={{ 
      fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', 
      color: 'var(--text-secondary)', border: '1px solid var(--border)', 
      padding: '3px 10px', borderRadius: '6px', fontWeight: 500 
    }}>
      {name}
    </span>
  );
}

/**
 * PolicySection Component
 */
function PolicySection({ icon: Icon, title, content, color }) {
  return (
    <div className="card" style={{ flex: '1', minWidth: '300px', border: `1px solid ${color}15`, background: `${color}05` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Icon size={18} color={color} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: color }}>{title}</h3>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {content}
      </div>
    </div>
  );
}

/**
 * FeatureCard Component
 */
function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="card card-interactive" style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ 
        background: `${color}15`, borderRadius: '12px', width: 44, height: 44, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        border: `1px solid ${color}30`, boxShadow: `0 4px 12px ${color}10`
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#fff' }}>{title}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '5rem' }}>
      
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', paddingTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <img 
            src="/logo.png" 
            alt="BizEngine Logo" 
            style={{ 
              width: 120, height: 120, borderRadius: '30px', 
              boxShadow: '0 25px 50px rgba(99,102,241,0.25)',
              border: '1px solid rgba(255,255,255,0.12)'
            }} 
          />
        </div>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem', 
          background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', 
          padding: '8px 20px', borderRadius: '30px', fontSize: '0.85rem', 
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)'
        }}>
          <Info size={16} /> Technical Intelligence Overview
        </div>
        <h1 style={{ 
          fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', 
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          BizEngine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
          <strong>BizEngine</strong> is a professional intelligence suite built to transform raw sales data into actionable business strategies. By merging precise data forensics with conversational AI, it helps leaders identify growth patterns, stop profitability leaks, and make informed decisions with confidence.
        </p>
      </section>

      {/* ── OPERATIONAL WORKFLOW ────────────────────────────────────────── */}
      <section style={{ marginTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>The Strategic Workflow</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>A clinical approach to data ingestion and narrative generation.</p>
        </div>
        
        <div className="card" style={{ 
          background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
            {[
              { id: '01', title: 'Data Ingestion', desc: 'Securely upload your XLSX/CSV records. The engine automatically handles currency normalization and category mapping.' },
              { id: '02', title: 'Intelligence Scan', desc: 'Predictive models analyze your growth trends while the AI scans for hidden anomalies and contribution gaps.' },
              { id: '03', title: 'Executive Insight', desc: 'Receive a data-grounded narrative report and exportable strategy documents designed for the boardroom.' }
            ].map((step) => (
              <div key={step.id} style={{ textAlign: 'center', flex: '1', minWidth: '220px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'rgba(255,255,255,0.03)', marginBottom: '-1.5rem', fontFamily: 'monospace' }}>{step.id}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.6rem', position: 'relative' }}>{step.title}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE ARCHITECTURE ───────────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Intelligence & Architecture</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>High-performance core technology stack.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <FeatureCard 
            icon={Layers} color="#6366f1" 
            title="Modular Design" 
            desc="Built on a modern React-Flask foundation for high-performance data processing and a clean, responsive UI." 
          />
          <FeatureCard 
            icon={Zap} color="#22d3ee" 
            title="Conversational AI" 
            desc="Integrated fallback logic between Groq and Gemini AI ensures real-time access to strategic narratives and data queries." 
          />
          <FeatureCard 
            icon={TrendingUp} color="#10b981" 
            title="Revenue Forecasting" 
            desc="Employs Scikit-Learn powered models to calculate monthly sales trends with integrated confidence scoring." 
          />
          <FeatureCard 
            icon={ShieldCheck} color="#f59e0b" 
            title="Secure Processing" 
            desc="Privacy-first architecture with in-memory data processing. Your datasets are never stored beyond the active session." 
          />
        </div>
      </section>

      {/* ── PRIVACY & TERMS ────────────────────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <Scale size={20} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Governance & Policy</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <PolicySection 
            icon={ShieldCheck} color="#10b981"
            title="Privacy Compliance"
            content={`• Data Non-Persistence: All ingestion is temporary. Data is processed in-memory and discarded upon logout.
• Anonymized Analysis: All PII (Personal Identifiable Information) is filtered before being sent for AI inference.
• Enterprise Isolation: Your raw datasets are processed within your secure, local instance layers.`}
          />
          <PolicySection 
            icon={FileText} color="#f59e0b"
            title="Terms of Service"
            content={`• Proprietary Rights: This project is All Rights Reserved. Redistributing or cloning the source code is prohibited.
• Portfolio Showcase: This suite is shared exclusively for portfolio assessment and technical demonstration.
• AI Disclaimer: Strategic insights are AI-generated based on provided data and should be verified for human action.`}
          />
        </div>
      </section>



      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <section className="card" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Code size={18} color="var(--accent)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>System Technology Stack</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {['React 19', 'Flask', 'Pandas', 'Scikit-Learn', 'SQLAlchemy', 'Groq SDK', 'Gemini AI Integration', 'Recharts', 'Lucide Icons', 'Vite', 'Framer Motion'].map(tech => (
            <TechBadge key={tech} name={tech} />
          ))}
        </div>
      </section>

      {/* ── AUTHOR PROFILE ──────────────────────────────────────────────── */}
      <section className="card" style={{ 
        padding: '2.5rem', 
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid var(--border)',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem' }}>
          {/* Streamlined Avatar */}
          <div style={{ 
            width: '90px', height: '90px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(99,102,241,0.2)',
            flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em' }}>DP</span>
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Dilip Prajapati</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Computer Science Student & Full Stack Developer
              </div>
            </div>

            <p style={{ 
              color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', 
              lineHeight: 1.6, maxWidth: '650px'
            }}>
              I am a third-year Computer Science student with a passion for building full-stack applications that solve real-world problems. I enjoy working across the entire stack—from creating responsive UIs in React to architecting backend services in Python. **BizEngine** is my latest project, showcasing my ability to integrate AI into seamless, user-centric tools.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="mailto:dilipkohar4320@gmail.com" className="btn-primary" style={{ height: '38px', padding: '0 18px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}>
                <Mail size={16} /> Email Me
              </a>
              <a href="https://www.linkedin.com/in/dilip-kohar-014627293" className="btn-ghost" style={{ height: '38px', padding: '0 18px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
                LinkedIn <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ 
              marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: '#10b981', fontSize: '0.75rem', fontWeight: 600
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Available for Hire & Collaboration
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
