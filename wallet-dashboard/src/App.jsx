import React, { useState, useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '');
const API = `${API_URL}/api/v1`;

const request = async (path, { method = 'GET', body, token } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }
  return { res, data };
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('wallet_token') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const saveToken = (newToken) => {
    localStorage.setItem('wallet_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('wallet_token');
    setToken('');
    setTransactions([]);
    setAiResponse('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (!username.trim() || !password.trim()) {
      setAuthError('All fields are required.');
      return;
    }

    const endpoint = isLoginView ? 'login' : 'register';
    setSubmitting(true);
    try {
      const { res, data } = await request(`/auth/${endpoint}`, {
        method: 'POST',
        body: { username, password }
      });

      if (!res.ok) {
        setAuthError(data?.error || `Authentication failed (HTTP ${res.status}).`);
        return;
      }

      if (isLoginView) {
        if (data?.token) {
          saveToken(data.token);
          setUsername('');
          setPassword('');
        } else {
          setAuthError('Token missing from server response.');
        }
      } else {
        setAuthMessage('Account created successfully! Please log in.');
        setIsLoginView(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Auth request failed:', err);
      setAuthError(`Cannot reach server (${API_URL}). It may be waking up, so retry in a minute.`);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const { res, data } = await request('/transactions', { token });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      setTransactions(Array.isArray(data) ? [...data].reverse() : []);
    } catch (err) {
      console.error('Failed fetching transactions:', err);
    }
  };

  useEffect(() => {
    if (token) fetchTransactions();
  }, [token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description || !token) return;

    try {
      const { res } = await request('/transactions', {
        method: 'POST',
        token,
        body: { amount: parseFloat(amount), description, category }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (err) {
      console.error('Submission failure:', err);
    }
  };

  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!query.trim() || !token) return;

    setLoadingAi(true);
    setAiResponse('');
    try {
      const { res, data } = await request('/ai/chat', {
        method: 'POST',
        token,
        body: { query }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      setAiResponse(data?.response || data?.error || `Request failed (HTTP ${res.status}).`);
    } catch (err) {
      setAiResponse('Error contacting your financial agent.');
    } finally {
      setLoadingAi(false);
    }
  };

  // --- VIEW 1: SECURITY CHECKPOINT LOGIN ---
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', fontFamily: 'system-ui, sans-serif', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#1f2937', padding: '32px', borderRadius: '16px', border: '1px solid #374151' }}>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', textAlign: 'center', margin: '0 0 8px 0' }}>📊 Smart Wallet Checkpoint</h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', margin: '0 0 24px 0' }}>
            {isLoginView ? 'Provide credentials to access your banking ledger.' : 'Register a secure user profile container.'}
          </p>

          {authError && <div style={{ backgroundColor: 'rgba(153, 27, 27, 0.2)', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{authError}</div>}
          {authMessage && <div style={{ backgroundColor: 'rgba(20, 83, 45, 0.2)', border: '1px solid #14532d', color: '#4ade80', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>{authMessage}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" style={{ width: '100%', padding: '12px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', padding: '12px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', backgroundColor: isLoginView ? '#2563eb' : '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, marginTop: '8px' }}>
              {submitting ? 'Please wait...' : isLoginView ? 'Unlock Wallet Server' : 'Create Identity Key'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
            <button type="button" onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); setAuthMessage(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}>
              {isLoginView ? "Don't have an account yet? Register here" : 'Already have an account? Log in here'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- VIEW 2: MASTER FINANCIAL DASHBOARD ---
    return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '1280px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#111827', color: '#f3f4f6' }}>
      
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>📊 Smart Wallet Auditor & AI Financial Advisor</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px', margin: 0 }}>Polyglot Microservice Setup • Spring Boot Core • Security Active</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Logout</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
        
        {/* Left Hand Side Column Group (Forms + History Ledger) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section style={{ backgroundColor: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', marginTop: 0, color: '#e5e7eb' }}>➕ Record a New Expense</h2>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Amount (INR)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 1500" style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}>
                    <option>Electronics</option>
                    <option>Utilities</option>
                    <option>Rent</option>
                    <option>Food</option>
                    <option>Entertainment</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you spend on?" style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>Audit & Save Transaction</button>
            </form>
          </section>

          <section style={{ backgroundColor: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', marginTop: 0, color: '#e5e7eb' }}>📋 Transaction History Ledger</h2>
            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>No data items found.</p>
              ) : transactions.map(tx => (
                <div key={tx.id} style={{ padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: tx.isAnomaly ? '1px solid #991b1b' : '1px solid #374151', backgroundColor: tx.isAnomaly ? 'rgba(153, 27, 27, 0.2)' : 'rgba(17, 24, 39, 0.6)' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.925rem', color: '#fff' }}>{tx.description}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{tx.category} • {new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#fff' }}>₹{tx.amount.toFixed(2)}</span>
                    <div style={{ marginTop: '6px' }}>
                      {tx.isAnomaly ? (
                        <span style={{ backgroundColor: 'rgba(153, 27, 27, 0.6)', color: '#fca5a5', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>⚠️ Anomaly ({tx.anomalyScore ? tx.anomalyScore.toFixed(2) : '-'})</span>
                      ) : (
                        <span style={{ backgroundColor: 'rgba(20, 83, 45, 0.6)', color: '#4ade80', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>✅ Safe</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div> {/* ◄── Correctly closes the left column container block */}

        {/* Right Hand Side Column Group (Gemini Copilot Advisor) */}
        <div style={{ backgroundColor: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', height: '620px', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', marginTop: 0, color: '#e5e7eb' }}>💬 Gemini Compliance Advisor</h2>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '16px', margin: '4px 0 16px 0' }}>Asks questions contextually mapped across your transaction history rows.</p>
          
          <div style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '16px', marginBottom: '16px', overflowY: 'auto', border: '1px solid #374151', fontSize: '0.875rem', lineHeight: 1.6, color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
            {aiResponse ? aiResponse : <span style={{ color: '#4b5563', fontStyle: 'italic' }}>Ask something like: "Summarize my anomalies and explain why they were flagged..."</span>}
            {loadingAi && <div style={{ color: '#60a5fa', marginTop: '8px', fontWeight: 500 }}>Connecting to Gemini model matrix...</div>}
          </div>

          <form onSubmit={handleAskAi} style={{ display: 'flex', gap: '8px', margin: 0 }}>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask your financial AI consultant..." style={{ flex: 1, padding: '12px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loadingAi} style={{ padding: '0 20px', backgroundColor: '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>Consult AI</button>
          </form>
        </div>

      </div>

    </div>
  );}
