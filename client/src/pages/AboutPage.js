import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
  const handleLogout = () => {
    // Redirect to login page (root path)
    window.location.href = '/';
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
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
              </svg>
            </div>
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
                About Us
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                Learn more about our expense-splitting platform
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link
              to="/dashboard"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'none',
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
              Dashboard
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

        {/* Main Content */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '2rem',
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            }}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 1rem 0',
              lineHeight: '1.1',
            }}>
              Splitwise Application
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Split and settle expenses effortlessly. Built for friends, roommates, families, and travel groups who value fairness and simplicity.
            </p>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #bae6fd',
              textAlign: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)',
              }}>
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6 2 11c0 2.9 1.8 5.5 4.5 7.2V22l4.4-2.4c.3 0 .6.1.9.1 5.5 0 10-4 10-9s-4.5-9-10-9z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.75rem 0',
              }}>
                Group Expenses
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0,
              }}>
                Create groups for trips, households, or events. Add expenses and instantly see who owes what.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              textAlign: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              }}>
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M17,12C17,14.42 15.28,16.44 13,16.9V21H11V16.9C8.72,16.44 7,14.42 7,12C7,9.58 8.72,7.56 11,7.1V3H13V7.1C15.28,7.56 17,9.58 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.75rem 0',
              }}>
                Fair Splitting
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0,
              }}>
                Choose equal or custom splits. Our smart calculations ensure everyone pays their fair share without confusion.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #fde68a',
              textAlign: 'center',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
              }}>
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 0.75rem 0',
              }}>
                Clear Settlements
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.5',
                margin: 0,
              }}>
                See a summary of balances at any time. Easily settle up so no debts linger between friends.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 1rem 0',
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              We believe money should never come between friendships. Our goal is to make expense sharing effortless, transparent, and fair. Whether it’s roommates, trips, or daily expenses, our platform ensures everyone stays stress-free about splitting costs.
            </p>
          </div>

          {/* Contact CTA */}
          <div style={{
            textAlign: 'center',
            padding: '2rem 0',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 1rem 0',
            }}>
              Have Questions?
            </h3>
            <p style={{
              color: '#6b7280',
              margin: '0 0 1.5rem 0',
              fontSize: '1.1rem',
            }}>
              We'd love to hear from you and help with any questions about expense sharing.
            </p>
            <Link
              to="/contact"
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'inline-block',
                transition: 'all 0.2s ease',
                boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
