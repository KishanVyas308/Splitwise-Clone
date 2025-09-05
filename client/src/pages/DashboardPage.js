import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [user, setUser] = useState(null); // State for user data

  // Get current time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Extract user name from token or localStorage if available
  const getUserInfo = () => {
    try {
      // Try to get user info from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      // Try to decode JWT token to get user info
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id || payload.userId,
          name: payload.name,
          username: payload.username,
          email: payload.email
        };
      }
    } catch (err) {
      console.log('Could not extract user info from token');
    }
    return null;
  };

  // Load user data and groups on mount
  useEffect(() => {
    const fetchUserAndGroups = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Try to get user info from stored data or token first
        const localUser = getUserInfo();
        if (localUser) {
          setUser(localUser);
        }

        // Fetch groups
        try {
          const groupsRes = await API.get('/groups');
          setGroups(groupsRes.data.groups || groupsRes.data || []);
        } catch (groupErr) {
          console.error('Groups fetch error:', groupErr);
          if (groupErr.response?.status === 401 || groupErr.response?.status === 403) {
            handleLogout();
            return;
          }
          setError('Failed to load groups');
        }

        // Try to fetch user profile (optional - fallback if token doesn't have user info)
        if (!localUser) {
          try {
            const userRes = await API.get('/user/profile');
            const userData = userRes.data.user || userRes.data;
            setUser(userData);
            // Store user data for future use
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (userErr) {
            console.log('User profile fetch failed, using token data or guest mode');
            // This is okay - we'll just show greeting without name
          }
        }

      } catch (err) {
        console.error('General fetch error:', err);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
          return;
        }
        
        setError('Failed to load data');
      }
    };

    fetchUserAndGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await API.post('/groups/create', {
        name: groupName
      });
      setGroups([...groups, res.data.group || res.data]);
      setGroupName('');
    } catch (err) {
      console.error(err);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(groupId);
    try {
      await API.delete(`/groups/${groupId}`);
      setGroups(groups.filter(group => group._id !== groupId));
    } catch (err) {
      console.error(err);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/';
  };

  // Generate display name for greeting
  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return '';
  };

  const displayName = getDisplayName();

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
        {/* Header with Greeting */}
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
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              {/* Enhanced Personalized Greeting */}
              <div style={{
                marginBottom: '0.25rem',
                fontSize: '1.1rem',
                color: '#6b7280',
                fontWeight: '500',
              }}>
                {getTimeBasedGreeting()}{displayName ? `, ${displayName}` : ''}! 👋
              </div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                lineHeight: '1.2',
              }}>
                Dashboard
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                {displayName ? `Welcome back! ` : ''}Manage your groups and collections
              </p>
            </div>
          </div>

          {/* Navigation and Logout */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link
              to="/about"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                display: 'inline-block',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(99, 102, 241, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
              }}
            >
              About
            </Link>
            <Link
              to="/contact"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                display: 'inline-block',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              Contact
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 25px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Create Group Form */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem',
        }}>
          <h2 style={{
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
            Create New Group
          </h2>

          <form onSubmit={handleCreateGroup} style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#374151',
              }}>
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                placeholder="Enter group name..."
                onChange={(e) => setGroupName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
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
            </div>
            <button
              type="submit"
              disabled={loading || !groupName.trim()}
              style={{
                padding: '1rem 2rem',
                background: loading || !groupName.trim() ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading || !groupName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading || !groupName.trim() ? 'none' : '0 8px 20px rgba(102, 126, 234, 0.3)',
                whiteSpace: 'nowrap',
              }}
              onMouseOver={(e) => {
                if (!loading && groupName.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 25px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && groupName.trim()) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem',
                  }} />
                  Creating...
                </div>
              ) : (
                'Create Group'
              )}
            </button>
          </form>

          {/* Error Message */}
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

        {/* Groups List */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <h2 style={{
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
              <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
            </svg>
            Your Groups ({groups.length})
          </h2>

          {groups.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: '#6b7280',
            }}>
              <svg style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1rem',
                fill: '#d1d5db',
              }} viewBox="0 0 24 24">
                <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
              </svg>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                No groups yet
              </h3>
              <p style={{ fontSize: '1rem', margin: 0 }}>
                Create your first group to get started organizing your collections
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}>
              {groups.map((group) => (
                <div
                  key={group._id}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    }}>
                      <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                        <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                      </svg>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group._id, group.name)}
                      disabled={deleteLoading === group._id}
                      style={{
                        background: deleteLoading === group._id ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: deleteLoading === group._id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: deleteLoading === group._id ? 0.6 : 1,
                      }}
                      onMouseOver={(e) => {
                        if (deleteLoading !== group._id) {
                          e.target.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (deleteLoading !== group._id) {
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {deleteLoading === group._id ? (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                      ) : (
                        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                          <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  <Link
                    to={`/group/${group._id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0',
                      wordBreak: 'break-word',
                    }}>
                      {group.name}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <svg style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '0.5rem',
                        fill: '#9ca3af',
                      }} viewBox="0 0 24 24">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                      </svg>
                      Click to view details
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default DashboardPage;