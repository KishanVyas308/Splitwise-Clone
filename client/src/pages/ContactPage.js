import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    // Redirect to login page (root path)
    window.location.href = '/';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate form submission (replace with actual API call)
    try {
      // This is a mock submission - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
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
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
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
                Contact Us
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                Get in touch with our team
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
            <Link
              to="/about"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'none',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Contact Form */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg style={{
                width: '28px',
                height: '28px',
                marginRight: '0.75rem',
                fill: '#667eea',
              }} viewBox="0 0 24 24">
                <path d="M22,6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z"/>
              </svg>
              Send us a Message
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.5',
            }}>
              Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            {success && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                border: '1px solid #34d399',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '0.5rem',
                  fill: '#065f46',
                }} viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.41,10.09L6,11.5L11,16.5Z"/>
                </svg>
                Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}

            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '1px solid #f87171',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
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
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
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
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
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
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit',
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
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(102, 126, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 25px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                      <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg style={{
                  width: '28px',
                  height: '28px',
                  marginRight: '0.75rem',
                  fill: '#667eea',
                }} viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
                </svg>
                Get in Touch
              </h2>
              <p style={{
                color: '#6b7280',
                marginBottom: '2.5rem',
                lineHeight: '1.5',
              }}>
                We're here to help and answer any questions you might have. We look forward to hearing from you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  borderRadius: '16px',
                  border: '1px solid #bae6fd',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0',
                    }}>
                      Email Us
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.9rem',
                    }}>
                      Send us an email anytime
                    </p>
                    <a href="mailto:kahandbhatt@gmail.com" style={{
                      color: '#0ea5e9',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                    }}>
                      kahandbhatt@gmail.com.com
                    </a>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderRadius: '16px',
                  border: '1px solid #bbf7d0',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C7.4,22 3.55,18.92 2.36,14.73L6.19,16.31C6.45,17.6 7.6,18.58 8.97,18.58C10.53,18.58 11.8,17.31 11.8,15.75V15.62L15.2,13.19H15.28C16.84,13.19 18.11,11.92 18.11,10.36C18.11,8.8 16.84,7.53 15.28,7.53H14.97L12,2M8.97,17.06C7.87,17.06 6.97,16.16 6.97,15.06C6.97,13.96 7.87,13.06 8.97,13.06C10.07,13.06 10.97,13.96 10.97,15.06C10.97,16.16 10.07,17.06 8.97,17.06M15.28,11.67C14.18,11.67 13.28,10.77 13.28,9.67C13.28,8.57 14.18,7.67 15.28,7.67C16.38,7.67 17.28,8.57 17.28,9.67C17.28,10.77 16.38,11.67 15.28,11.67Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0',
                    }}>
                      Response Time
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: 0,
                      fontSize: '0.9rem',
                    }}>
                      We typically respond within 24 hours during business days
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                  borderRadius: '16px',
                  border: '1px solid #fde68a',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 0.5rem 0',
                    }}>
                      Need Help?
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: 0,
                      fontSize: '0.9rem',
                    }}>
                      Check out our <Link to="/about" style={{ color: '#f59e0b', textDecoration: 'none' }}>About page</Link> for more information
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center',
            }}>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 1rem 0',
              }}>
                Follow Us
              </h4>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
              }}>
                {/* Social media icons - replace with actual links */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ContactPage;