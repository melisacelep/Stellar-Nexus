import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import './App.css'; 

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [balances, setBalances] = useState(null);
  const [message, setMessage] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [history, setHistory] = useState([]);

  const apiBase = 'http://localhost:5000';

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const getFriendlyErrorMessage = (error, context) => {
    const code = error?.code || '';
    const raw = typeof error === 'string' ? error : error?.message || '';

    if (code === 'op_no_destination' || raw.includes('op_no_destination')) {
      return 'Destination account does not exist. Please fund it first!';
    }
    if (code === 'op_low_reserve' || raw.includes('op_low_reserve')) {
      return 'Insufficient balance for transaction fees!';
    }
    return 'Transaction failed. Please check your details and try again.';
  };

  const fetchHistory = async (targetKey) => {
    const keyToUse = targetKey || publicKey;
    if (!keyToUse || keyToUse.length < 50) return;

    try {
      const res = await fetch(`${apiBase}/api/history/${encodeURIComponent(keyToUse.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.payments || []);
      }
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  const refreshBalanceSilently = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`${apiBase}/api/balance/${encodeURIComponent(publicKey.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setBalances(data.balances || []);
      }
    } catch (e) {
      console.error("Balance refresh error:", e);
    }
  };

  const handleCreateAccount = async () => {
    if (!publicKey || publicKey.length < 50) {
      toast.error('Please enter a valid Public Key.');
      return;
    }
    setIsFunding(true);
    try {
      const res = await fetch(`${apiBase}/api/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.trim() }),
      });
      
      if (!res.ok) throw new Error('Funding failed.');
      
      toast.success('Account funded successfully!');
      triggerConfetti();
      await refreshBalanceSilently();
      await fetchHistory();
    } catch (err) {
      toast.error('Error creating account on testnet.');
    } finally {
      setIsFunding(false);
    }
  };

  const handleGetBalance = async () => {
    if (!publicKey || publicKey.length < 50) {
      toast.error('Please enter a valid Public Key.');
      return;
    }
    setIsFetchingBalance(true);
    try {
      const res = await fetch(`${apiBase}/api/balance/${encodeURIComponent(publicKey.trim())}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Balance fetch failed.');
      
      setBalances(data.balances || []);
      toast.success('Balances updated.');
      await fetchHistory();
    } catch (err) {
      toast.error('Account not found or not active yet.');
    } finally {
      setIsFetchingBalance(false);
    }
  };

  const handleSendPayment = async () => {
    if (!destination || !amount) {
      toast.error('Recipient address and amount are required.');
      return;
    }
    setIsSendingPayment(true);
    try {
      const res = await fetch(`${apiBase}/api/send-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destination.trim(), amount }),
      });
      const data = await res.json();
      
      if (!res.ok) throw data;

      toast.success('Payment sent successfully!');
      triggerConfetti();
      await refreshBalanceSilently();
      await fetchHistory();
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsSendingPayment(false);
    }
  };

  useEffect(() => {
    if (publicKey && publicKey.length > 50) {
      fetchHistory(publicKey);
    }
  }, [publicKey]);

 return (
    <>
      <Toaster position="top-right" />
      <div className="app">
        {/* JÜRİ İÇİN GİRİŞ BÖLÜMÜ */}
        <header className="header">
          <div className="badge">Blockchain Project 2026</div>
          <h1>Stellar Nexus</h1>
          <p className="subtitle">
            A next-generation decentralized application for lightning-fast 
            <strong> XLM transactions</strong> on the Stellar Testnet.
          </p>
          <div className="project-features">
            <span>✦ Real-time Balances</span>
            <span>✦ Secure Payments</span>
            <span>✦ Ledger History</span>
          </div>
        </header>

        <main className="content-grid">
          {/* LEFT SIDEBAR: Balances & History */}
          <aside className="sidebar">
            <section className="card balance-card">
              <div className="card-header">
                <span className="dot pulse"></span>
                <h2>Wallet Balances</h2>
              </div>
              {balances ? (
                <ul className="balances">
                  {balances.map((b, i) => (
                    <li key={i}>
                      <span className="asset-name">{b.asset}</span>
                      <span className="asset-value">{parseFloat(b.balance).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                   <p className="hint">No active account found. Use Friendbot to start.</p>
                </div>
              )}
            </section>

            <section className="card history-section">
              <h2>Recent Activity</h2>
              {history.length > 0 ? (
                <div className="table-container">
                  <table className="history-table">
                    <tbody>
                      {history.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <div className="tx-amount">{tx.amount} XLM</div>
                            <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="tx-link">
                            <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                              Explorer ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="hint">Waiting for transactions...</p>}
            </section>
          </aside>

          {/* MAIN SECTION: Actions */}
          <div className="main-actions">
            <section className="card action-card">
              <div className="step-number">01</div>
              <h2>Network Identity</h2>
              <p className="input-desc">Enter your Stellar Public Key to connect to the Testnet.</p>
              <input
                type="text"
                className="modern-input"
                placeholder="Ex: GCT... (Your Public Key)"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
              />
              <div className="actions">
                <button onClick={handleCreateAccount} disabled={isFunding} className="btn-secondary">
                  {isFunding ? <div className="spinner"></div> : 'Request Test XLM'}
                </button>
                <button onClick={handleGetBalance} disabled={isFetchingBalance} className="btn-primary">
                  {isFetchingBalance ? <div className="spinner"></div> : 'Sync Wallet'}
                </button>
              </div>
            </section>

            <section className="card action-card">
              <div className="step-number">02</div>
              <h2>Transfer Assets</h2>
              <p className="input-desc">Send XLM instantly across the global Stellar network.</p>
              <input
                type="text"
                className="modern-input"
                placeholder="Recipient Address (G...)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <input
                type="number"
                className="modern-input"
                placeholder="Amount to send"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button onClick={handleSendPayment} disabled={isSendingPayment} className="send-btn">
                {isSendingPayment ? "Processing..." : 'Execute Transaction'}
              </button>
            </section>
          </div>
        </main>
        
        <footer className="footer">
          <p>Built for the Future of Finance • Stellar Consensus Protocol</p>
        </footer>
      </div>
    </>
  );
}

export default App;