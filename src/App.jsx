import React, { useEffect, useState } from 'react';
import { UserRound, Mail, Phone, LockKeyhole, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2, LogIn, UserPlus, Sparkles, KeyRound } from 'lucide-react';

const OTP = '123456';
const STORAGE_KEY = 'customerPortalDemoUsers';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export default function App() {
  const [page, setPage] = useState('register');
  const [form, setForm] = useState({ fullName: '', mobile: '', email: '', password: '', confirmPassword: '', terms: false });
  const [login, setLogin] = useState({ identity: '', password: '' });
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [expiry, setExpiry] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (page !== 'otp' || !expiry) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [page, expiry]);

  const remaining = Math.max(0, Math.ceil((expiry - now) / 1000));
  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
    setMessage({ type: '', text: '' });
  };

  function validateRegistration() {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Please enter your full name.';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) next.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!validEmail(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    if (!form.terms) next.terms = 'Please accept the Terms & Conditions.';
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) next.email = 'This email is already registered.';
    if (users.some(u => u.mobile === form.mobile)) next.mobile = 'This mobile number is already registered.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitRegistration(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateRegistration()) return;
    const user = {
      fullName: form.fullName.trim(), mobile: form.mobile, email: form.email.trim().toLowerCase(),
      // Demo only: never store real passwords in browser storage in a production app.
      password: form.password, accountStatus: 'PENDING', termsAccepted: true,
      createdAt: new Date().toISOString()
    };
    setPendingUser(user);
    setOtp('');
    setAttempts(0);
    setExpiry(Date.now() + 120000);
    setNow(Date.now());
    setPage('otp');
  }

  function verifyOtp(e) {
    e.preventDefault();
    if (remaining <= 0) { setMessage({ type: 'error', text: 'OTP expired. Please restart registration.' }); return; }
    if (attempts >= 3) { setMessage({ type: 'error', text: 'Maximum attempts reached. Please restart registration.' }); return; }
    if (otp !== OTP) {
      const next = attempts + 1;
      setAttempts(next);
      setMessage({ type: 'error', text: next >= 3 ? 'Maximum attempts reached. Please restart registration.' : `Incorrect OTP. ${3 - next} attempt(s) remaining.` });
      return;
    }
    const users = getUsers();
    const activeUser = { ...pendingUser, accountStatus: 'ACTIVE', mobileVerified: true };
    saveUsers([...users, activeUser]);
    setMessage({ type: 'success', text: 'Verification successful. Your account is ready.' });
    setTimeout(() => {
      setLogin({ identity: activeUser.email, password: '' });
      setPage('login');
      setMessage({ type: 'success', text: 'Account created successfully. Please log in.' });
    }, 700);
  }

  function submitLogin(e) {
    e.preventDefault();
    const users = getUsers();
    const found = users.find(u =>
      (u.email.toLowerCase() === login.identity.trim().toLowerCase() || u.mobile === login.identity.trim()) &&
      u.password === login.password && u.accountStatus === 'ACTIVE'
    );
    if (!found) { setMessage({ type: 'error', text: 'Invalid credentials. Check your details or register first.' }); return; }
    setCurrentUser(found);
    setMessage({ type: '', text: '' });
    setPage('dashboard');
  }

  function resetToRegister() {
    setPage('register'); setMessage({ type: '', text: '' }); setErrors({});
    setOtp(''); setPendingUser(null); setAttempts(0);
  }

  const titles = {
    register: ['Create your account', 'Join us today. It only takes a few minutes.'],
    otp: ['Verify your account', 'Enter the one-time password to complete registration.'],
    login: ['Welcome back', 'Sign in to continue to your customer portal.'],
    dashboard: ['You’re all set', 'Your customer portal is ready.']
  };

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); resetToRegister(); }}>
        <span className="brand-mark"><ShieldCheck size={21}/></span>
        <span>customer<span className="brand-light">portal</span></span>
      </a>
      <div className="topbar-right"><span className="secure-dot" /> Secure account demo</div>
    </header>

    <section className="layout">
      <aside className="hero-panel">
        <div className="hero-content">
          <span className="eyebrow"><Sparkles size={14}/> CUSTOMER EXPERIENCE</span>
          <h1>One account.<br/><span>Everything</span> connected.</h1>
          <p>A simple, secure way to create your account and manage your customer access.</p>
          <div className="feature-list">
            <div><span className="feature-icon"><ShieldCheck size={18}/></span><span><b>Verification first</b><small>Confirm your details before access</small></span></div>
            <div><span className="feature-icon"><LockKeyhole size={18}/></span><span><b>Protected access</b><small>Clear feedback at every step</small></span></div>
            <div><span className="feature-icon"><CheckCircle2 size={18}/></span><span><b>Simple onboarding</b><small>Register and sign in in minutes</small></span></div>
          </div>
        </div>
        <div className="hero-footer">CUS-01 · CUS-02 <span>•</span> Registration & Login</div>
        <div className="orb orb-one"/><div className="orb orb-two"/>
      </aside>

      <section className="form-side">
        <div className="form-wrap">
          {page !== 'dashboard' && <div className="tabs">
            <button className={page === 'register' || page === 'otp' ? 'tab active' : 'tab'} onClick={resetToRegister}><UserPlus size={16}/> Register</button>
            <button className={page === 'login' ? 'tab active' : 'tab'} onClick={() => { setPage('login'); setMessage({ type: '', text: '' }); }}><LogIn size={16}/> Login</button>
          </div>}
          <div className="form-heading">
            <div className="heading-icon">{page === 'login' ? <KeyRound/> : page === 'otp' ? <ShieldCheck/> : page === 'dashboard' ? <CheckCircle2/> : <UserPlus/>}</div>
            <h2>{titles[page][0]}</h2>
            <p>{titles[page][1]}</p>
          </div>

          {message.text && <div className={`notice ${message.type}`} role="status">{message.type === 'success' ? <CheckCircle2 size={17}/> : <ShieldCheck size={17}/>}<span>{message.text}</span></div>}

          {page === 'register' && <form onSubmit={submitRegistration} noValidate>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <div className={`input-wrap ${errors.fullName ? 'invalid' : ''}`}><UserRound size={17}/><input id="fullName" value={form.fullName} onChange={e => setField('fullName', e.target.value)} placeholder="Enter your full name" autoComplete="name"/></div>
              {errors.fullName && <small className="error">{errors.fullName}</small>}
            </div>
            <div className="field">
              <label htmlFor="mobile">Mobile number</label>
              <div className={`input-wrap ${errors.mobile ? 'invalid' : ''}`}><Phone size={17}/><span className="country-code">+91</span><input id="mobile" value={form.mobile} onChange={e => setField('mobile', e.target.value.replace(/\D/g, '').slice(0,10))} placeholder="10-digit mobile number" inputMode="numeric" autoComplete="tel-national"/></div>
              {errors.mobile && <small className="error">{errors.mobile}</small>}
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className={`input-wrap ${errors.email ? 'invalid' : ''}`}><Mail size={17}/><input id="email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="you@example.com" autoComplete="email"/></div>
              {errors.email && <small className="error">{errors.email}</small>}
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className={`input-wrap ${errors.password ? 'invalid' : ''}`}><LockKeyhole size={17}/><input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password"/><button className="icon-button" type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
              {errors.password && <small className="error">{errors.password}</small>}
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className={`input-wrap ${errors.confirmPassword ? 'invalid' : ''}`}><LockKeyhole size={17}/><input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} placeholder="Re-enter your password" autoComplete="new-password"/></div>
              {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}
            </div>
            <label className={`terms ${errors.terms ? 'terms-error' : ''}`}><input type="checkbox" checked={form.terms} onChange={e => setField('terms', e.target.checked)}/><span>I agree to the <a href="#terms" onClick={e => { e.preventDefault(); alert('Demo Terms & Conditions: Use accurate details and keep your login credentials private.'); }}>Terms & Conditions</a></span></label>
            {errors.terms && <small className="error terms-msg">{errors.terms}</small>}
            <button className="primary-button" type="submit">Create account <ArrowRight size={17}/></button>
            <p className="switch-copy">Already have an account? <button type="button" onClick={() => { setPage('login'); setMessage({ type: '', text: '' }); }}>Sign in</button></p>
          </form>}

          {page === 'otp' && <form onSubmit={verifyOtp} className="otp-form">
            <div className="otp-intro"><div className="otp-badge"><ShieldCheck size={26}/></div><p>We’re simulating a verification step for <b>{pendingUser?.email}</b>.</p></div>
            <label className="otp-label" htmlFor="otp">6-digit verification code</label>
            <input id="otp" className="otp-input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="••••••" inputMode="numeric" maxLength={6} autoComplete="one-time-code"/>
            <div className="otp-meta"><span>Demo code: <b>123456</b></span><span className={remaining < 20 ? 'time-low' : ''}>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} remaining</span></div>
            <button className="primary-button" type="submit" disabled={attempts >= 3 || remaining <= 0}>Verify & continue <ArrowRight size={17}/></button>
            <button className="text-button" type="button" onClick={resetToRegister}>Back to registration</button>
          </form>}

          {page === 'login' && <form onSubmit={submitLogin}>
            <div className="field">
              <label htmlFor="identity">Email or mobile number</label>
              <div className="input-wrap"><UserRound size={17}/><input id="identity" value={login.identity} onChange={e => setLogin({...login, identity: e.target.value})} placeholder="Enter email or mobile" autoComplete="username" required/></div>
            </div>
            <div className="field">
              <label htmlFor="loginPassword">Password</label>
              <div className="input-wrap"><LockKeyhole size={17}/><input id="loginPassword" type={showPassword ? 'text' : 'password'} value={login.password} onChange={e => setLogin({...login, password: e.target.value})} placeholder="Enter your password" autoComplete="current-password" required/><button className="icon-button" type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
            </div>
            <button className="primary-button" type="submit">Sign in <ArrowRight size={17}/></button>
            <p className="switch-copy">New here? <button type="button" onClick={resetToRegister}>Create an account</button></p>
          </form>}

          {page === 'dashboard' && <div className="dashboard">
            <div className="success-mark"><CheckCircle2 size={34}/></div>
            <p className="dashboard-greeting">Hello, <b>{currentUser?.fullName}</b></p>
            <p className="dashboard-copy">You have successfully signed in to the customer portal demo.</p>
            <div className="profile-card">
              <div className="profile-row"><span>Full name</span><b>{currentUser?.fullName}</b></div>
              <div className="profile-row"><span>Email</span><b>{currentUser?.email}</b></div>
              <div className="profile-row"><span>Mobile</span><b>+91 {currentUser?.mobile}</b></div>
              <div className="profile-row"><span>Account status</span><b className="status-active">Active</b></div>
            </div>
            <button className="primary-button" onClick={() => { setCurrentUser(null); setLogin({ identity: '', password: '' }); setPage('login'); setMessage({ type: 'success', text: 'You have been signed out.' }); }}>Sign out <ArrowRight size={17}/></button>
          </div>}

          <div className="form-bottom"><span><LockKeyhole size={13}/> Demo project · No data sent to a server</span><span>v1.0</span></div>
        </div>
      </section>
    </section>
    <footer className="page-footer">Customer Registration & Login <span>•</span> CUS-01 / CUS-02</footer>
  </main>;
}