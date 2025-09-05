import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [splitDetails, setSplitDetails] = useState({});
  const [settleTo, setSettleTo] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Use sessionToken instead of localStorage for Claude.ai compatibility
  const user = JSON.parse(atob((window.sessionToken || localStorage.getItem('token')).split('.')[1]));

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const groupRes = await API.get(`/groups/${groupId}`);
      const expensesRes = await API.get(`/expenses/group/${groupId}`);
      const paymentsRes = await API.get(`/payments/group/${groupId}`);

      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setPayments(paymentsRes.data.payments);
    } catch (err) {
      setError('Failed to load group data');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviteLoading(true);
    try {
      await API.post(`/groups/${groupId}/invite`, { email: inviteEmail });
      setInviteEmail('');
      await fetchGroupData();
      setSuccess('User invited successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  const openSplitModal = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      return setError('Enter a valid amount first.');
    }

    try {
      const groupRes = await API.get(`/groups/${groupId}`);
      const latestGroup = groupRes.data.group;
      setGroup(latestGroup);

      const initialSplits = {};
      latestGroup.members.forEach((m) => (initialSplits[m._id] = ''));
      setSplitDetails(initialSplits);
      setShowModal(true);
    } catch {
      setError('Failed to load group data');
    }
  };

  const handleSplitChange = (memberId, value) => {
    setSplitDetails({ ...splitDetails, [memberId]: value });
  };

  const submitExpense = async () => {
    const totalSplit = Object.values(splitDetails).reduce((sum, val) => sum + Number(val), 0);
    if (totalSplit !== Number(amount)) {
      return alert(`Split total must be ₹${amount}, but it's ₹${totalSplit}`);
    }

    const splits = {};
    const splitAmong = [];
    for (const [id, val] of Object.entries(splitDetails)) {
      if (Number(val) > 0) {
        splits[id] = Number(val);
        splitAmong.push(id);
      }
    }

    setLoading(true);
    try {
      await API.post('/expenses/add', {
        groupId,
        description,
        amount,
        paidBy: user.id,
        splitAmong,
        splits
      });
      setDescription('');
      setAmount('');
      setShowModal(false);
      await fetchGroupData();
    } catch {
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const submitSettleUp = async () => {
    if (!settleTo || !settleAmount || settleAmount <= 0) {
      return alert('Please enter valid user and amount');
    }

    setLoading(true);
    try {
      await API.post('/payments/add', {
        groupId,
        from: user.id,
        to: settleTo,
        amount: Number(settleAmount),
        note: 'Settled up'
      });
      setSettleAmount('');
      setSettleTo('');
      setShowSettle(false);
      await fetchGroupData();
    } catch {
      setError('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = () => {
    if (!group) return [];

    const balances = {};
    group.members.forEach((m) => {
      balances[m._id.toString()] = { name: m.name, balance: 0 };
    });

    expenses.forEach((exp) => {
      const amount = Number(exp.amount);
      const payerId = exp.paidBy._id?.toString() || exp.paidBy.toString();
      const useSplits = exp.splits && Object.keys(exp.splits).length > 0;

      if (useSplits) {
        for (const [uid, val] of Object.entries(exp.splits)) {
          if (!balances[uid]) continue;
          balances[uid].balance -= Number(val);
        }
      } else {
        const share = amount / exp.splitAmong.length;
        exp.splitAmong.forEach((u) => {
          const uid = u._id?.toString() || u.toString();
          if (!balances[uid]) return;
          balances[uid].balance -= share;
        });
      }

      if (balances[payerId]) balances[payerId].balance += amount;
    });

    payments.forEach((p) => {
      const fromId = p.from._id?.toString() || p.from.toString();
      const toId = p.to._id?.toString() || p.to.toString();
      const amt = Number(p.amount);

      if (balances[fromId]) balances[fromId].balance += amt;
      if (balances[toId]) balances[toId].balance -= amt;
    });

    return Object.values(balances).map((b) => ({
      name: b.name,
      balance: Math.round(b.balance * 100) / 100
    }));
  };

  const calculateDebts = () => {
    const balances = calculateBalances();
    const creditors = [], debtors = [];

    balances.forEach((b) => {
      if (b.balance > 0.01) creditors.push({ ...b });
      else if (b.balance < -0.01) debtors.push({ ...b, balance: -b.balance });
    });

    const result = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i], c = creditors[j];
      const amt = Math.min(d.balance, c.balance);
      result.push(`${d.name} owes ${c.name} ₹${amt.toFixed(2)}`);
      d.balance -= amt;
      c.balance -= amt;
      if (d.balance < 0.01) i++;
      if (c.balance < 0.01) j++;
    }

    return result;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '10px',
                marginRight: '1rem',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg width="24" height="24" fill="#667eea" viewBox="0 0 24 24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
            </button>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                lineHeight: '1.2',
              }}>
                {group?.name || 'Loading...'}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                Expense Management
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
        }}>
          {/* Group Info & Actions */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            gridColumn: 'span 2',
          }}>
            {/* Group Members */}
            {group && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <svg style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '0.5rem',
                    fill: '#667eea',
                  }} viewBox="0 0 24 24">
                    <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                  </svg>
                  Members ({group.members?.length || 0})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {group.members?.map((m) => (
                    <div key={m._id} style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}>
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {m.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite & Expense Forms */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}>
              {/* Invite Form */}
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <svg style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '0.5rem',
                    fill: '#667eea',
                  }} viewBox="0 0 24 24">
                    <path d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"/>
                  </svg>
                  Invite Member
                </h3>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address..."
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#f9fafb',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: inviteLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: inviteLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inviteLoading ? 'Inviting...' : 'Invite'}
                  </button>
                </form>
              </div>

              {/* Add Expense Form */}
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <svg style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '0.5rem',
                    fill: '#667eea',
                  }} viewBox="0 0 24 24">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                  Add Expense
                </h3>
                <form onSubmit={openSplitModal} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this expense for?"
                    required
                    style={{
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#f9fafb',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      required
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#f9fafb',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Split
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettle(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Settle
                    </button>
                    
                  </div>
                </form>
              </div>
            </div>
            <button
  onClick={() => navigate(`/group/${groupId}/payments`)}
  style={{
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  }}
>
  Make Payments
</button>

            {/* Success/Error Messages */}
            {success && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '12px',
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '0.5rem',
                  fill: '#10b981',
                }} viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '1px solid #f87171',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '12px',
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '0.5rem',
                  fill: '#dc2626',
                }} viewBox="0 0 24 24">
                  <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
                </svg>
                {error}
              </div>
            )}
          </div>
          

          {/* Balances */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg style={{
                width: '24px',
                height: '24px',
                marginRight: '0.75rem',
                fill: '#667eea',
              }} viewBox="0 0 24 24">
                <path d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9Z"/>
              </svg>
              Balances
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calculateBalances().map((b, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: b.balance > 0 ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' :
                           b.balance < 0 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                           'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: `1px solid ${b.balance > 0 ? '#10b981' : b.balance < 0 ? '#f87171' : '#e2e8f0'}`,
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{b.name}</span>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: b.balance > 0 ? '#065f46' : b.balance < 0 ? '#dc2626' : '#6b7280'
                  }}>
                    ₹{b.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Who Owes Whom */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg style={{
                width: '24px',
                height: '24px',
                marginRight: '0.75rem',
                fill: '#667eea',
              }} viewBox="0 0 24 24">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
              </svg>
              Settlement Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {calculateDebts().length ? calculateDebts().map((line, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '1px solid #f59e0b',
                  color: '#92400e',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <svg style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '0.5rem',
                    fill: '#f59e0b',
                  }} viewBox="0 0 24 24">
                    <path d="M14,12L10,8V11H2V13H10V16L14,12Z"/>
                  </svg>
                  {line}
                </div>
              )) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <svg style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 1rem',
                    fill: '#d1d5db',
                  }} viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  <p style={{ margin: 0, fontWeight: '500' }}>All settled up! 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg style={{
                width: '24px',
                height: '24px',
                marginRight: '0.75rem',
                fill: '#667eea',
              }} viewBox="0 0 24 24">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
              </svg>
              All Expenses ({expenses.length})
            </h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              {expenses.length ? expenses.map((e) => (
                <div key={e._id} style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                      {e.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      Paid by {e.paidBy?.name || 'Unknown'}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#667eea',
                  }}>
                    ₹{e.amount}
                  </div>
                </div>
              )) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <svg style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 1rem',
                    fill: '#d1d5db',
                  }} viewBox="0 0 24 24">
                    <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
                  </svg>
                  <p style={{ margin: 0, fontWeight: '500' }}>No expenses yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Payments */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg style={{
                width: '24px',
                height: '24px',
                marginRight: '0.75rem',
                fill: '#667eea',
              }} viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
              Settled Payments ({payments.length})
            </h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              {payments.length ? payments.map((p) => (
                <div key={p._id} style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  borderRadius: '12px',
                  border: '1px solid #10b981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ color: '#065f46' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {p.from?.name || 'Unknown'} → {p.to?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      Settlement payment
                    </div>
                  </div>
                  <div style={{
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#10b981',
                  }}>
                    ₹{p.amount}
                  </div>
                </div>
              )) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <svg style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 1rem',
                    fill: '#d1d5db',
                  }} viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  <p style={{ margin: 0, fontWeight: '500' }}>No payments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Modal */}
      {showModal && group && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              Split ₹{amount}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {group.members.map((m) => (
                <div key={m._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    {m.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', fontWeight: '500' }}>₹</span>
                    <input
                      type="number"
                      value={splitDetails[m._id] || ''}
                      onChange={(e) => handleSplitChange(m._id, e.target.value)}
                      style={{
                        width: '100px',
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        textAlign: 'right',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={submitExpense}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {loading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem',
                  }} />
                )}
                {loading ? 'Adding...' : 'Confirm Split'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {showSettle && group && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              Settle Up
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Pay to:
                </label>
                <select
                  value={settleTo}
                  onChange={(e) => setSettleTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <option value="">--Select Member--</option>
                  {group.members.filter((m) => m._id !== user.id).map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Amount (₹):
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={submitSettleUp}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {loading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem',
                  }} />
                )}
                {loading ? 'Settling...' : 'Submit Payment'}
              </button>
              <button
                onClick={() => setShowSettle(false)}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GroupPage;