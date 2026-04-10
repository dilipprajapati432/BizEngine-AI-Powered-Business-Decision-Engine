import { useState, useEffect } from 'react';
import { Lightbulb, Target, TrendingUp, AlertCircle, RefreshCw, Download, FileText, Flame, Info, BarChart3, Cpu, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const chartStyle = { fontSize: '0.75rem', fill: 'var(--text-secondary)' };
const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.82rem' };

function ContributionChip({ label, name, pct, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: '10px', padding: '0.5rem 1rem',
      fontSize: '0.82rem', flex: '1', minWidth: '200px'
    }}>
      <BarChart3 size={14} color={color} />
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {name} <span style={{ color, fontWeight: 800 }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function PairedInsightCard({ pair, index }) {
  const isKey = pair.is_key;
  return (
    <div 
      className={`insight-card ${isKey ? 'key-insight' : ''}`}
      style={{
        background: isKey ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
        border: isKey ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)',
        borderRadius: '12px', padding: '1.25rem', position: 'relative'
      }}>
      {isKey && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
          borderRadius: '6px', padding: '2px 10px', fontSize: '0.72rem',
          fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Flame size={12} /> Key Insight
        </div>
      )}

      {/* Insight */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div style={{
          background: isKey ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
          borderRadius: '6px', padding: '4px', display: 'flex', flexShrink: 0, marginTop: 2
        }}>
          <Lightbulb size={14} color={isKey ? '#f59e0b' : 'var(--accent)'} />
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{pair.insight}</p>
      </div>

      {/* Linked Recommendation */}
      <div style={{
        display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
        background: 'rgba(16,185,129,0.06)', borderRadius: '8px', padding: '0.65rem 0.85rem',
        borderLeft: '3px solid var(--success)'
      }}>
        <Target size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{pair.recommendation}</p>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('insights');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load insights.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  const downloadFile = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report. Please try again.");
    }
  };

  const handleExportReport = () => {
    downloadFile('export/report', 'BizEngine_Intelligence_Report.csv');
  };

  const handleExportPDF = () => {
    downloadFile('export/pdf', 'BizEngine_Intelligence_Report.pdf');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-secondary)' }}>Generating AI insights…</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400, padding: '2.5rem' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>No Insights Available</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {error} Upload a dataset first.
        </p>
        <button className="btn-primary" onClick={fetchInsights}><RefreshCw size={14} /> Retry</button>
      </div>
    </div>
  );

  const { paired_insights, contributions, warnings, forecast, forecast_meta } = data;
  const forecastChartData = forecast || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Insights & Forecasts</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Data-driven intelligence and ML-powered revenue predictions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary" onClick={handleExportPDF} style={{ fontSize: '0.82rem' }}><FileText size={14} /> Export PDF</button>
          <button className="btn-ghost" onClick={handleExportReport}><Download size={14} /> CSV Report</button>
          <button className="btn-ghost" onClick={fetchInsights}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* Warnings */}
      {warnings?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              display: 'flex', gap: '0.5rem', alignItems: 'center',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.82rem', color: '#f59e0b'
            }}>
              <AlertTriangle size={14} /> {w}
            </div>
          ))}
        </div>
      )}

      {/* Contribution Chips */}
      {contributions && Object.keys(contributions).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {contributions.top_product && (
            <ContributionChip label="Top Product" name={contributions.top_product.name} pct={contributions.top_product.pct} color="#6366f1" />
          )}
          {contributions.top_region && (
            <ContributionChip label="Top Region" name={contributions.top_region.name} pct={contributions.top_region.pct} color="#22d3ee" />
          )}
          {contributions.top_category && (
            <ContributionChip label="Top Category" name={contributions.top_category.name} pct={contributions.top_category.pct} color="#10b981" />
          )}
        </div>
      )}

      {/* Paired Insights */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <Lightbulb size={18} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Business Insights & Recommendations</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Each insight is paired with a specific actionable recommendation</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {paired_insights?.map((pair, i) => (
            <PairedInsightCard key={i} pair={pair} index={i} />
          ))}
          {(!paired_insights || paired_insights.length === 0) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No insights generated. Try uploading more data.</p>
          )}
        </div>
      </div>

      {/* ML Forecast Chart */}
      {forecastChartData.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(34,211,238,0.15)', borderRadius: '8px', padding: '6px', display: 'flex' }}>
              <TrendingUp size={18} color="#22d3ee" />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>ML Revenue Forecast</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Next 6 months predicted via Linear Regression</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={chartStyle} />
              <YAxis tick={chartStyle} />
              <Tooltip 
                contentStyle={tooltipStyle} 
                itemStyle={{ color: 'var(--text-primary)' }}
                labelStyle={{ color: 'var(--text-secondary)' }}
                cursor={false} 
                formatter={(value, name) => {
                  if (value === null) return [null, null];
                  const cleanName = name === 'actual' ? 'Historical Revenue' : 'Predicted Revenue';
                  return [`$${value.toLocaleString()}`, cleanName];
                }} />
              <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="predicted" stroke="#22d3ee" strokeWidth={2.5} strokeDasharray="6 3"
                dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem', gap: '1rem' }}>
            <span className="badge" style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
              Historical Data
            </span>
            <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
              <TrendingUp size={12} /> Forecast prediction
            </span>
          </div>

          {/* ML Context Information Block */}
          {forecast_meta && (
            <div style={{
              marginTop: '1.25rem', background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Cpu size={14} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Model Information</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1', minWidth: '180px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Model</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{forecast_meta.model}</div>
                </div>
                <div style={{ flex: '1', minWidth: '180px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Basis</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{forecast_meta.basis}</div>
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Data Points</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{forecast_meta.data_points} months</div>
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence</div>
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: forecast_meta.confidence === 'High' ? '#10b981' : forecast_meta.confidence === 'Medium' ? '#f59e0b' : '#ef4444'
                  }}>
                    {forecast_meta.confidence === 'High' ? '🟢' : forecast_meta.confidence === 'Medium' ? '🟡' : '🔴'} {forecast_meta.confidence}
                    {forecast_meta.r_squared !== undefined && ` (R² = ${forecast_meta.r_squared})`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
