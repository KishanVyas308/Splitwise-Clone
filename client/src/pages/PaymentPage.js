import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

function PaymentPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState('');
  const [selectedCreditor, setSelectedCreditor] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debts, setDebts] = useState([]);

  // Use in-memory token storage instead of browser storage
  const getUser = () => {
    try {
      // Try to get token from sessionStorage first, then localStorage as fallback
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        return JSON.parse(atob(token.split('.')[1]));
      }
      return null;
    } catch (err) {
      console.error('Error parsing user token:', err);
      return null;
    }
  };

  const user = getUser();

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const groupRes = await API.get(`/groups/${groupId}`);
      const expensesRes = await API.get(`/expenses/group/${groupId}`);
      const paymentsRes = await API.get(`/payments/group/${groupId}`);

      setGroup(groupRes.data.group);
      setPayments(paymentsRes.data.payments);
      
      // Calculate debts
      const calculatedDebts = calculateDebts(
        groupRes.data.group,
        expensesRes.data.expenses,
        paymentsRes.data.payments
      );
      setDebts(calculatedDebts);
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError('Failed to load group data');
      setTimeout(() => setError(''), 3000);
    }
  };

  const calculateBalances = (group, expenses, payments) => {
    if (!group) return [];

    const balances = {};
    group.members.forEach((m) => {
      balances[m._id.toString()] = { 
        name: m.name, 
        email: m.email,
        upiId: m.upiId,
        balance: 0,
        id: m._id
      };
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
      ...b,
      balance: Math.round(b.balance * 100) / 100
    }));
  };

  const calculateDebts = (group, expenses, payments) => {
    const balances = calculateBalances(group, expenses, payments);
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
      result.push({
        debtor: d,
        creditor: c,
        amount: amt.toFixed(2)
      });
      d.balance -= amt;
      c.balance -= amt;
      if (d.balance < 0.01) i++;
      if (c.balance < 0.01) j++;
    }

    return result;
  };

  // Simple Google Pay redirect - just redirect to Google Pay for demo
  const generateGooglePayLink = (creditor, amount, note) => {
    // For demo purposes - just redirect to Google Pay main page
    return 'https://pay.google.com/';
  };

  const handlePayment = async (debt) => {
    try {
      setLoading(true);
      setError('');

      // Simple demo redirect to Google Pay
      const paymentLink = 'https://pay.google.com/';
      
      console.log('Redirecting to Google Pay for demo');

      // Simple redirect - will definitely work
      window.open(paymentLink, '_blank');
      
      setSuccess(`Redirected to Google Pay! This demonstrates the payment integration for ₹${debt.amount}.`);
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to redirect to payment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (debt) => {
    if (!user) {
      setError('User authentication required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        groupId,
        from: debt.debtor.id,
        to: debt.creditor.id,
        amount: parseFloat(debt.amount),
        note: 'Settled via Google Pay'
      };

      console.log('Marking payment as paid:', paymentData);

      await API.post('/payments/add', paymentData);
      
      await fetchGroupData(); // Refresh data
      setSuccess('Payment marked as settled!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error marking payment:', err);
      setError(err.response?.data?.message || 'Failed to record payment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Basic validation
      if (!selectedDebtor || !selectedCreditor || !paymentAmount || paymentAmount <= 0) {
        throw new Error('Please fill all fields with valid values');
      }

      if (selectedDebtor === selectedCreditor) {
        throw new Error('Payer and recipient cannot be the same person');
      }

      const creditor = group?.members?.find(m => m._id === selectedCreditor);
      if (!creditor) {
        throw new Error('Invalid recipient selection');
      }

      // Simple demo redirect to Google Pay
      const paymentLink = 'https://pay.google.com/';
      
      console.log('Redirecting to Google Pay for custom payment demo');

      // Simple redirect - will definitely work
      window.open(paymentLink, '_blank');
      
      setSuccess(`Redirected to Google Pay for custom payment of ₹${paymentAmount} to ${creditor.name}!`);
      setTimeout(() => setSuccess(''), 5000);
      
      // Reset form
      setSelectedDebtor('');
      setSelectedCreditor('');
      setPaymentAmount('');

    } catch (error) {
      console.error('Custom payment error:', error);
      setError(error.message || 'Failed to initiate payment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Add manual payment recording for custom payments
  const recordCustomPayment = async () => {
    if (!user || !selectedDebtor || !selectedCreditor || !paymentAmount) {
      setError('Please complete a payment first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        groupId,
        from: selectedDebtor,
        to: selectedCreditor,
        amount: parseFloat(paymentAmount),
        note: 'Custom payment via Google Pay'
      };

      await API.post('/payments/add', paymentData);
      await fetchGroupData(); // Refresh data
      
      setSuccess('Custom payment recorded successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reset form
      setSelectedDebtor('');
      setSelectedCreditor('');
      setPaymentAmount('');
    } catch (err) {
      console.error('Error recording custom payment:', err);
      setError(err.response?.data?.message || 'Failed to record custom payment');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <h2>Authentication Required</h2>
          <p>Please log in to access payments.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

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

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
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
              onClick={() => navigate(`/group/${groupId}`)}
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
                Make Payments
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                {group?.name} - Google Pay Integration
              </p>
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg style={{ width: '20px', height: '20px', marginRight: '0.5rem', fill: 'white' }} viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,7L12,12L7,7H17Z"/>
            </svg>
            Google Pay
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '1px solid #10b981',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2rem',
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
            marginBottom: '2rem',
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

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
        }}>
          {/* Suggested Payments */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            gridColumn: 'span 2',
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
              Suggested Payments
            </h3>

            {debts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {debts.map((debt, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '1px solid #f59e0b',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#92400e',
                        marginBottom: '0.5rem',
                      }}>
                        {debt.debtor.name} owes {debt.creditor.name}
                      </div>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#f59e0b',
                        marginBottom: '0.5rem',
                      }}>
                        ₹{debt.amount}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#92400e',
                        opacity: 0.8,
                      }}>
                        Payment to: {debt.creditor.upiId || debt.creditor.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
                      {debt.debtor.id === user.id && (
                        <button
                          onClick={() => handlePayment(debt)}
                          disabled={loading}
                          style={{
                            padding: '1rem 1.5rem',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseOver={(e) => {
                            if (!loading) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 8px 16px rgba(66, 133, 244, 0.3)';
                            }
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <svg style={{
                            width: '16px',
                            height: '16px',
                            marginRight: '0.5rem',
                            fill: 'white',
                          }} viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,7L12,12L7,7H17Z"/>
                          </svg>
                          {loading ? 'Opening...' : 'Pay via Google Pay'}
                        </button>
                      )}
                      <button
                        onClick={() => markAsPaid(debt)}
                        disabled={loading}
                        style={{
                          padding: '0.75rem 1.25rem',
                          background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {loading ? 'Marking...' : 'Mark as Paid'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#6b7280',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <svg style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  fill: '#d1d5db',
                }} viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '600', fontSize: '1.2rem' }}>
                  All settled up!
                </h4>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  No pending payments in this group
                </p>
              </div>
            )}
          </div>

          {/* Custom Payment */}
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
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              Custom Payment
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
                  From (Payer):
                </label>
                <select
                  value={selectedDebtor}
                  onChange={(e) => setSelectedDebtor(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <option value="">Select payer</option>
                  {group?.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
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
                  To (Recipient):
                </label>
                <select
                  value={selectedCreditor}
                  onChange={(e) => setSelectedCreditor(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                >
                  <option value="">Select recipient</option>
                  {group?.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.upiId || member.email})
                    </option>
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
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
                    
              <button
                onClick={handleCustomPayment}
                disabled={loading || !selectedDebtor || !selectedCreditor || !paymentAmount || paymentAmount <= 0}
                style={{
                  padding: '1rem 2rem',
                  background: (loading || !selectedDebtor || !selectedCreditor || !paymentAmount || paymentAmount <= 0) 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: (loading || !selectedDebtor || !selectedCreditor || !paymentAmount || paymentAmount <= 0) 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1rem',
                }}
                onMouseOver={(e) => {
                  if (!loading && selectedDebtor && selectedCreditor && paymentAmount > 0) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 16px rgba(66, 133, 244, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <svg style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '0.5rem',
                  fill: 'white',
                }} viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,7L12,12L7,7H17Z"/>
                </svg>
                {loading ? 'Processing...' : 'Send Payment Request'}
              </button>

              {/* Add Record Payment button for custom payments */}
              {selectedDebtor && selectedCreditor && paymentAmount > 0 && (
                <button
                  onClick={recordCustomPayment}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <svg style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '0.5rem',
                    fill: 'white',
                  }} viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  {loading ? 'Recording...' : 'Mark Custom Payment as Complete'}
                </button>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
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
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
              </svg>
              How to Pay
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                borderRadius: '12px',
                border: '1px solid #29b6f6',
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#01579b',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: '#29b6f6',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    marginRight: '0.5rem',
                  }}>
                    1
                  </span>
                  Click "Pay via Google Pay"
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#0277bd' }}>
                  This will open Google Pay or UPI app with pre-filled payment details
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                borderRadius: '12px',
                border: '1px solid #ab47bc',
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#4a148c',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: '#ab47bc',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    marginRight: '0.5rem',
                  }}>
                    2
                  </span>
                  Complete the payment
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6a1b9a' }}>
                  Follow the instructions in your payment app to complete the transaction
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                borderRadius: '12px',
                border: '1px solid #4caf50',
              }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#1b5e20',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: '#4caf50',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    marginRight: '0.5rem',
                  }}>
                    3
                  </span>
                  Mark as paid
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#2e7d32' }}>
                  After successful payment, click "Mark as Paid" to update the group records
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
              borderRadius: '12px',
              border: '1px solid #ffc107',
            }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#856404',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '0.5rem',
                  fill: '#ffc107',
                }} viewBox="0 0 24 24">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                Troubleshooting Tips
              </div>
              <div style={{ 
                margin: 0, 
                fontSize: '0.8rem', 
                color: '#856404',
                lineHeight: '1.4',
              }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • Ensure the recipient has provided their correct UPI ID
                </p>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • Payment links work best on mobile devices
                </p>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • If popup is blocked, the page will redirect automatically
                </p>
                <p style={{ margin: 0 }}>
                  • Check your internet connection if payment fails
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;