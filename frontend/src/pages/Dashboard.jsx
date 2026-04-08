import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, Package, Download, Upload, Lightbulb,
  Info, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#a78bfa'];

function KpiCard({ title, value, sub, icon: Icon, color = 'var(--accent)', trend }) {
  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="truncate" style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', maxWidth: '80%' }}>{title}</span>
        <div style={{ background: `${color}22`, borderRadius: '8px', padding: '6px', display: 'flex' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

function QuickActionCard({ to, title, description, icon: Icon, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="card card-interactive" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Background */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          zIndex: 0
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
          <div style={{
            background: `${color}15`,
            padding: '10px',
            borderRadius: '12px',
            border: `1px solid ${color}33`,
            display: 'flex'
          }}>
            <Icon size={20} color={color} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{title}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to access</span>
          </div>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          margin: '0.25rem 0',
          zIndex: 1
        }}>
          {description}
        </p>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: color,
          zIndex: 1
        }}>
          Get Started <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

const chartStyle = { fontSize: '0.75rem', fill: 'var(--text-secondary)' };
const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.82rem' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ product: '', region: '', date_from: '', date_to: '' });
  const [applied, setApplied] = useState({});

  const fetchData = async (f = {}) => {
    setLoading(true); setError('');
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
      const res = await api.get('/analytics', { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const applyFilters = () => { setApplied({ ...filters }); fetchData(filters); };
  const resetFilters = () => { setFilters({ product: '', region: '', date_from: '', date_to: '' }); setApplied({}); fetchData(); };

  const handleExport = () => { window.open('/api/export/csv', '_blank'); };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-secondary)' }}>Loading analytics…</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome to BizEngine</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Get started by navigating to a modular section below</p>
        </div>
      </div>

      {/* Quick Access Grid (Visible even without data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <QuickActionCard
          to="/upload"
          title="Supply Chain Ingestion"
          description="Upload your business datasets (CSV/Excel) to trigger automated analytics and forecasting."
          icon={Upload}
          color="var(--accent)"
        />
        <QuickActionCard
          to="/insights"
          title="Narrative Intelligence"
          description="View AI-generated executive summaries and predictive revenue trends for your business."
          icon={Lightbulb}
          color="#22d3ee"
        />
        <QuickActionCard
          to="/about"
          title="Systems Governance"
          description="Review the platform architecture, author profile, and the technical governance policies."
          icon={Info}
          color="#10b981"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400, padding: '2.5rem' }}>
          <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Data Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error} Upload a dataset from the <strong>Upload Data</strong> page to get started.
          </p>
          <button className="btn-primary" onClick={() => fetchData()}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );

  const { kpis, top_products, region_data, category_data, sales_trend, filter_options } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header with Mesh Glow */}
      <div style={{ 
        position: 'relative', 
        padding: '1.5rem 0',
        marginBottom: '0.5rem',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
          zIndex: 0
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 className="truncate" style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics Dashboard</h1>
            <p className="truncate" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: 500 }}>Real-time business intelligence overview</p>
          </div>
          <button className="btn-ghost" onClick={handleExport} style={{ backdropFilter: 'blur(8px)' }}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Access Section (Visible with data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <QuickActionCard
          to="/upload"
          title="Data Ingestion"
          description="Upload fresh business datasets to refresh your dashboard's strategic outlook."
          icon={Upload}
          color="var(--accent)"
        />
        <QuickActionCard
          to="/insights"
          title="Strategic Insights"
          description="Deep-dive into AI narratives and monthly predictive revenue forecasts."
          icon={Lightbulb}
          color="#22d3ee"
        />
        <QuickActionCard
          to="/about"
          title="Project Profile"
          description="View developer credentials, architecture details, and project documentation."
          icon={Info}
          color="#10b981"
        />
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1.25rem 1.75rem', borderBottom: '2px solid rgba(99, 102, 241, 0.1)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Focus</label>
            <select className="input-field" style={{ width: 220, padding: '0.6rem 0.85rem' }}
              value={filters.product} onChange={e => setFilters({ ...filters, product: e.target.value })}>
              <option value="">All Products</option>
              {filter_options?.products?.map(p => <option key={p} value={p}>{p.length > 30 ? p.slice(0, 30) + '…' : p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Regional Scope</label>
            <select className="input-field" style={{ width: 180, padding: '0.6rem 0.85rem' }}
              value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}>
              <option value="">Global Regions</option>
              {filter_options?.regions?.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline Start</label>
            <input type="date" className="input-field" style={{ width: 160, padding: '0.6rem 0.85rem' }}
              value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline End</label>
            <input type="date" className="input-field" style={{ width: 160, padding: '0.6rem 0.85rem' }}
              value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={applyFilters} style={{ padding: '0.65rem 1.75rem' }}>Apply Filters</button>
          <button className="btn-ghost" onClick={resetFilters} style={{ padding: '0.6rem 1.25rem' }}><RefreshCw size={14} /> Reset</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <KpiCard 
          title="Total Revenue" 
          value={typeof kpis?.total_revenue === 'number' ? `$${kpis.total_revenue.toLocaleString()}` : '$0'} 
          icon={DollarSign} 
          color="#22d3ee" 
          trend={kpis?.growth_rate} 
        />
        <KpiCard 
          title="Total Units Sold" 
          value={typeof kpis?.total_units === 'number' ? kpis.total_units.toLocaleString() : '0'} 
          icon={Package} 
          color="#10b981" 
        />
        <KpiCard 
          title="Avg Order Value" 
          value={typeof kpis?.avg_order_value === 'number' ? `$${kpis.avg_order_value.toLocaleString()}` : '$0'} 
          icon={DollarSign} 
          color="#f59e0b" 
        />
        <KpiCard 
          title="Growth Rate" 
          value={typeof kpis?.growth_rate === 'number' ? `${kpis.growth_rate > 0 ? '+' : ''}${kpis.growth_rate}%` : '0%'}
          icon={kpis?.growth_rate >= 0 ? TrendingUp : TrendingDown}
          color={kpis?.growth_rate >= 0 ? '#10b981' : '#ef4444'} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="responsive-grid">
        {/* Sales Trend */}
        <div className="card" style={{ minWidth: 0, overflow: 'hidden', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={18} color="var(--accent)" /> Revenue Trend
          </h3>
          {sales_trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={sales_trend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={chartStyle} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} dy={10} />
                <YAxis tick={chartStyle} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Revenue']}
                  itemStyle={{ color: 'var(--text-primary)' }} 
                  labelStyle={{ color: 'var(--text-secondary)' }} 
                  cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }} 
                />
                <Area type="linear" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Insufficient data for revenue trend</p>
            </div>
          )}
        </div>

        {/* Top Products Bar */}
        <div className="card" style={{ minWidth: 0, overflow: 'hidden', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={18} color="#22d3ee" /> Top Products
          </h3>
          {top_products?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={top_products} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={chartStyle} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} />
                <YAxis dataKey="product" type="category" tick={chartStyle} width={100} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Revenue']}
                  itemStyle={{ color: 'var(--text-primary)' }} 
                  labelStyle={{ color: 'var(--text-secondary)' }} 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                />
                <Bar dataKey="total_revenue" radius={0} barSize={20}>
                  {top_products?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No product data found</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="responsive-grid">
        {/* Region Pie */}
        <div className="card" style={{ minWidth: 0, overflow: 'hidden', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Info size={18} color="#10b981" /> Regional Distribution
          </h3>
          {region_data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={region_data} dataKey="total_revenue" nameKey="region" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {region_data?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} labelStyle={{ color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No regional breakdown available</p>
            </div>
          )}
        </div>

        {/* Category Bar */}
        <div className="card" style={{ minWidth: 0, overflow: 'hidden', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lightbulb size={18} color="#f59e0b" /> Revenue by Category
          </h3>
          {category_data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={category_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="category" tick={chartStyle} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} dy={10} />
                <YAxis tick={chartStyle} axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Revenue']}
                  itemStyle={{ color: 'var(--text-primary)' }} 
                  labelStyle={{ color: 'var(--text-secondary)' }} 
                  cursor={false} 
                />
                <Bar dataKey="total_revenue" radius={0} barSize={35}>
                  {category_data?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No category data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
