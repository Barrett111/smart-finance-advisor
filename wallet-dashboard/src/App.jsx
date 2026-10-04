import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '');
const API = `${API_URL}/api/v1`;

const request = async (path, { method = 'GET', body, token } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty or non-JSON body */ }
    return { res, data };
  } finally {
    clearTimeout(timer);
  }
};

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortDate = (t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('wallet_token') || '');
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const saveToken = (t) => { localStorage.setItem('wallet_token', t); setToken(t); };

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
      setAuthError('Enter both a username and a password.');
      return;
    }
    const endpoint = isLoginView ? 'login' : 'register';
    setSubmitting(true);
    try {
      const { res, data } = await request(`/auth/${endpoint}`, { method: 'POST', body: { username, password } });
      if (!res.ok) {
        setAuthError(data?.error || `The server rejected the request (HTTP ${res.status}).`);
        return;
      }
      if (isLoginView) {
        if (data?.token) { saveToken(data.token); setUsername(''); setPassword(''); }
        else setAuthError('Signed in, but the server sent no token. Try again.');
      } else {
        setAuthMessage('Account created. Sign in to continue.');
        setIsLoginView(true);
        setPassword('');
      }
    } catch (err) {
      console.error('Auth request failed:', err);
      setAuthError('Could not reach the server. It may be starting up, so try again in a minute.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const { res, data } = await request('/transactions', { token });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      setTransactions(Array.isArray(data) ? [...data].reverse() : []);
    } catch (err) {
      console.error('Failed fetching transactions:', err);
    }
  };

  useEffect(() => { if (token) fetchTransactions(); }, [token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description || !token) return;
    try {
      const { res } = await request('/transactions', {
        method: 'POST', token,
        body: { amount: parseFloat(amount), description, category }
      });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
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
      const { res, data } = await request('/ai/chat', { method: 'POST', token, body: { query } });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      setAiResponse(data?.response || data?.error || `The advisor did not answer (HTTP ${res.status}).`);
    } catch (err) {
      setAiResponse('The advisor could not be reached. Try again in a moment.');
    } finally {
      setLoadingAi(false);
    }
  };

  /* ---------- sign in / register ---------- */
  if (!token) {
    return (
      <main className="auth">
        <div className="auth-sheet">
          <h1>{isLoginView ? 'Sign in to your ledger' : 'Open a ledger'}</h1>
          <p>{isLoginView ? 'Your expenses, checked for anything unusual.' : 'Choose a username and password to start.'}</p>

          {authError && <div className="note error" role="alert">{authError}</div>}
          {authMessage && <div className="note good">{authMessage}</div>}
          {submitting && <div className="note wait">Waiting for the server. The first request can take up to a minute.</div>}

          <form onSubmit={handleAuthSubmit}>
            <label className="field">
              <span>Username</span>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isLoginView ? 'current-password' : 'new-password'} />
            </label>
            <button type="submit" className="btn btn-wide" disabled={submitting}>
              {submitting ? 'Please wait...' : isLoginView ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="switch">
            <button type="button" className="link" onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); setAuthMessage(''); }}>
              {isLoginView ? 'New here? Create an account' : 'Have an account? Sign in'}
            </button>
          </p>
        </div>
      </main>
    );
  }

  /* ---------- ledger ---------- */
  const total = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const flaggedCount = transactions.filter((t) => t.isAnomaly).length;

  return (
    <div className="app">
      <header className="top">
        <h1>Smart Wallet</h1>
        <div className="sum">
          Total spent <b className="num">{inr(total)}</b>
          {flaggedCount > 0 && <> &nbsp;|&nbsp; <span className="flagged">{flaggedCount} flagged</span></>}
          &nbsp;&nbsp;<button className="link" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="layout">
        <section className="ledger" aria-label="Expenses">
          <form className="entry" onSubmit={handleAddTransaction}>
            <label>
              <span>Amount (₹)</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" />
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Electronics</option>
                <option>Utilities</option>
                <option>Rent</option>
                <option>Food</option>
                <option>Entertainment</option>
              </select>
            </label>
            <label className="wide">
              <span>What was it for?</span>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Electricity bill" />
            </label>
            <button type="submit" className="btn">Add expense</button>
          </form>

          {transactions.length === 0 ? (
            <p className="empty">No expenses yet. Add your first one above.</p>
          ) : (
            <ul className="rows">
              {transactions.map((tx) => (
                <li key={tx.id} className={`row${tx.isAnomaly ? ' flagged' : ''}`}>
                  <span className="date">{shortDate(tx.timestamp)}</span>
                  <div>
                    <div className="desc">{tx.description}</div>
                    <div className="meta">
                      {tx.category}
                      {tx.isAnomaly && <> &nbsp;<span className="why">Flagged as unusual{tx.anomalyScore != null ? ` (score ${tx.anomalyScore.toFixed(2)})` : ''}</span></>}
                    </div>
                  </div>
                  <span className="amt num">{inr(tx.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="advisor">
          <h2>Ask about your spending</h2>
          <p>Answers use the expenses in your ledger.</p>
          <div className={`answer${aiResponse || loadingAi ? '' : ' hint'}`} aria-live="polite">
            {loadingAi ? 'Reading your ledger...' : aiResponse || 'Try: "Which expenses were flagged, and why?"'}
          </div>
          <form className="ask" onSubmit={handleAskAi}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a question" />
            <button type="submit" className="btn" disabled={loadingAi}>Ask</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
