import React, { useState } from 'react';
import { ShieldCheck, LogOut, Key, Smartphone, SmartphoneIcon, UserX, X, Check, Copy, RefreshCw, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setup2FA, verifyAndEnable2FA, disable2FA } from '../../api/userApi';

// --- Sub-components (Modals) ---

const TwoFactorModal = ({ isOpen, onClose, onRefreshUser }) => {
  const [step, setStep] = useState(1); // 1: Choose Type, 2: Setup/QR, 3: Verify, 4: Success
  const [type, setType] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChooseType = async (selectedType) => {
    setLoading(true);
    setType(selectedType);
    try {
      const data = await setup2FA(selectedType);
      if (selectedType === 'authenticator') {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep(2);
      } else {
        // Email code sent
        setStep(3);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyAndEnable2FA(code);
      await onRefreshUser();
      setStep(4);
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="security-modal-overlay">
      <motion.div 
        className="security-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="modal-header">
          <h3>Two-Factor Authentication</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="setup-step text-center">
              <h4>Choose Security Method</h4>
              <p>Select how you want to receive your security codes.</p>
              <div className="type-options" style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                <button 
                  className="btn btn-outline w-full" 
                  onClick={() => handleChooseType('authenticator')}
                  disabled={loading}
                >
                  <SmartphoneIcon size={18} style={{ marginRight: '8px' }} />
                  Authenticator App
                </button>
                <button 
                  className="btn btn-outline w-full" 
                  onClick={() => handleChooseType('email')}
                  disabled={loading}
                >
                  <Mail size={18} style={{ marginRight: '8px' }} />
                  Email Code
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-step">
              <div className="qr-sim">
                <div className="qr-box">
                  {qrCode ? (
                    <img src={qrCode} alt="2FA QR Code" style={{ width: '160px', height: '160px' }} />
                  ) : (
                    <ShieldCheck size={64} className="text-secondary" />
                  )}
                </div>
              </div>
              <div className="setup-info">
                <h4>Step 1: Scan QR Code</h4>
                <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                <div className="secret-key">
                  <span>{secret}</span>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(secret)}>
                    <Copy size={14} />
                  </button>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="verify-step">
              <h4>{type === 'email' ? 'Verify Email' : 'Step 2: Verify Code'}</h4>
              <p>Enter the 6-digit code {type === 'email' ? 'sent to your email' : 'from your app'} to verify the setup.</p>
              <input 
                type="text" 
                maxLength="6" 
                placeholder="000000" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-input"
              />
              <button 
                className="btn btn-primary w-full" 
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? <RefreshCw size={18} className="spin" /> : 'Verify & Enable'}
              </button>
              <button className="btn btn-text w-full mt-2" onClick={() => setStep(1)}>Back</button>
            </div>
          )}

          {step === 4 && (
            <div className="success-step">
              <div className="success-icon">
                <Check size={48} />
              </div>
              <h4>2FA Successfully Enabled!</h4>
              <p>Your account is now protected with real-time security.</p>
              <button className="btn btn-primary w-full" onClick={onClose}>Finish</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SessionsModal = ({ isOpen, onClose, sessions, onLogoutSession }) => {
  if (!isOpen) return null;

  return (
    <div className="security-modal-overlay">
      <motion.div 
        className="security-modal sessions-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="modal-header">
          <h3>Active Sessions</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="sessions-list-detailed">
          {sessions.map((session) => (
            <div key={session.id} className={`session-detail-item ${session.isCurrent ? 'current' : ''}`}>
              <div className="session-icon">
                {session.device.includes('iPhone') ? <Smartphone size={24} /> : <SmartphoneIcon size={24} />}
              </div>
              <div className="session-info">
                <div className="device-name">
                  {session.device}
                  {session.isCurrent && <span className="current-pill">This Device</span>}
                </div>
                <div className="device-meta">
                  <span>{session.location}</span>
                  <span className="dot">•</span>
                  <span>{session.time}</span>
                </div>
              </div>
              {!session.isCurrent && (
                <button 
                  className="logout-session-btn"
                  onClick={() => onLogoutSession(session.id)}
                >
                  Logout
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Module ---

const SecurityModule = ({ user, onLogoutSession, onLogout, sessions, is2FAEnabled, onRefreshUser }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derived from user object
  const active2FA = user?.twoFactorEnabled;
  const active2FAType = user?.twoFactorType;

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      setLoading(true);
      try {
        await disable2FA();
        await onRefreshUser();
      } catch (err) {
        alert('Failed to disable 2FA');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="security-module">
      <div className="module-header">
        <div className="header-text">
          <h2>Login & Security</h2>
          <p>Protect your account with high-security passwords and multi-factor authentication.</p>
        </div>
      </div>

      <div className="security-settings">
        {/* Password Section */}
        <div className="setting-card">
          <div className="card-item">
            <div className="item-info">
              <Key size={24} />
              <div className="text-group">
                <h3>Password</h3>
                <p>Last changed: 3 months ago</p>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          
          {showPasswordForm && (
            <motion.div 
              className="password-form-inline"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Minimum 8 characters" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Repeat new password" />
              </div>
              <button className="btn btn-primary">Update Password</button>
            </motion.div>
          )}
        </div>

        {/* 2FA Section */}
        <div className="setting-card">
          <div className="card-item">
            <div className="item-info">
              <SmartphoneIcon size={24} className={active2FA ? 'text-secondary' : ''} />
              <div className="text-group">
                <h3>Two-Factor Authentication (2FA)</h3>
                <p>Status: <strong className={active2FA ? 'text-secondary' : ''}>
                  {active2FA ? `Enabled (${active2FAType})` : 'Disabled'}
                </strong></p>
              </div>
            </div>
            <button 
                className={`btn ${active2FA ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => {
                   if (active2FA) handleDisable2FA();
                   else setShow2FAModal(true);
                }}
                disabled={loading}
            >
              {active2FA ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="setting-card">
          <div className="card-item">
            <div className="item-info">
              <ShieldCheck size={24} className="text-secondary" />
              <div className="text-group">
                <h3>Active Sessions</h3>
                <p>You are currently logged in on {sessions?.length} devices.</p>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => setShowSessionsModal(true)}>
                Manage Sessions
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="setting-card danger-zone">
          <div className="card-item">
            <div className="item-info">
              <UserX size={24} className="text-error" />
              <div className="text-group">
                <h3 className="text-error">Close Account</h3>
                <p>Permanently delete your OBSIDIAN TECH account and all data.</p>
              </div>
            </div>
            <button className="btn btn-secondary text-error">Close Account</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TwoFactorModal 
        isOpen={show2FAModal} 
        onClose={() => setShow2FAModal(false)}
        onRefreshUser={onRefreshUser}
      />

      <SessionsModal 
        isOpen={showSessionsModal} 
        onClose={() => setShowSessionsModal(false)}
        sessions={sessions}
        onLogoutSession={onLogoutSession}
      />
    </div>
  );
};

export default SecurityModule;
