import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, CheckCircle, XCircle, AlertCircle, Database, BarChart3 } from 'lucide-react';
import api from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(''); setResult(null); setUploadProgress(0);
    const form = new FormData();
    form.append('file', file);
    
    // Smooth progress simulation (at least 2 seconds)
    let currentPercent = 0;
    const interval = setInterval(() => {
        if (currentPercent < 95) {
            currentPercent += Math.random() * 8;
            setUploadProgress(Math.min(95, Math.floor(currentPercent)));
        }
    }, 150);

    try {
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          // If real progress is slower than simulation, we could use it, 
          // but for this BI engine, simulation during processing feels better
        }
      });
      
      // Wait for at least 1s of "Analyzing" if it was too fast
      await new Promise(r => setTimeout(r, 800));
      
      clearInterval(interval);
      setUploadProgress(100);
      setResult(res.data);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || 'Upload failed.');
    } finally { 
      clearInterval(interval);
      setUploading(false); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', width: '100%' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Upload Dataset</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Upload a CSV or Excel file to start analyzing your business data
        </p>
      </div>

      {/* 1. Drop Zone */}
      <div
        className="card"
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '16px', textAlign: 'center', cursor: 'pointer', padding: '3rem 2rem',
          transition: 'all 0.2s',
          background: dragging ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
          boxShadow: dragging ? '0 0 30px var(--accent-glow)' : 'none',
        }}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
        <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Upload size={28} color="var(--accent)" />
        </div>
        {file ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <File size={18} color="var(--accent)" /> <strong>{file.name}</strong>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(file.size / 1024).toFixed(1)} KB — click to change</p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Drag & drop your file here</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>or click to browse — CSV, XLSX, XLS supported</p>
          </div>
        )}
      </div>

      {/* 2. Upload Progress Bar */}
      {uploading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '10px', height: '12px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ 
              width: `${uploadProgress}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
              transition: 'width 0.4s cubic-bezier(0.1, 0, 0.3, 1)'
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>
            {uploadProgress}% {uploadProgress < 30 ? 'Uploading...' : uploadProgress < 90 ? 'Processing Data...' : 'Finalizing analysis...'}
          </div>
        </div>
      )}

      {/* 3. The Analyzer Button */}
      <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading} style={{ width: '100%', transition: 'all 0.3s', height: '50px' }}>
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            <span>{uploadProgress < 100 ? `Analyzing ${uploadProgress}%` : 'Done!'}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Database size={18} /> <span>Upload & Analyze Data</span>
          </div>
        )}
      </button>

      {/* 4. Error Message */}
      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.87rem' }}>
          <XCircle size={16} /> {error}
        </div>
      )}

      {/* 5. Format Hints */}
      {!uploading && !result && (
        <div className="card" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Expected Columns</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.7 }}>
                Your CSV/Excel should contain columns like: <strong>date, product, category, region, units_sold, unit_price, revenue</strong>.<br />
                AI will automatically calculate <em>revenue</em> if it's missing from your file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Success & Preview */}
      {result && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.87rem', marginBottom: '1rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CheckCircle size={16} /> {result.message} — {result.total_rows} rows processed.
            </div>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <BarChart3 size={14} /> View Dashboard
            </button>
          </div>

          <div className="card" style={{ overflowX: 'auto', padding: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Data Preview (first 10 rows)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  {result.columns?.map(col => (
                    <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview?.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {result.columns?.map(col => (
                      <td key={col} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {row[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
