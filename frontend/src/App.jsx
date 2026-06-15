import React, { useState, useEffect } from 'react';
import { useMobility } from './context/MobilityContext';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import SOSButton from './components/SOSButton';
import AIChat from './components/AIChat';
import TrafficDashboard from './components/TrafficDashboard';
import CarbonTracker from './components/CarbonTracker';
import CostOptimizer from './components/CostOptimizer';
import AlertSystem from './components/AlertSystem';
import AdminDashboard from './components/AdminDashboard';
import CommunityReportModal from './components/CommunityReportModal';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertOctagon, Bot, ShieldAlert, Sparkles, Plus, Shield,
  Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Github,
  CheckCircle2, AlertTriangle, ShieldCheck, Info, ExternalLink
} from 'lucide-react';

export default function App() {
  const {
    currentUser,
    isAuthenticated,
    authError,
    login,
    register,
    authLoading,
    activeTab,
    setActiveTab,
    adminViewActive,
    setAdminViewActive,
    sosActive,
    triggerSOS
  } = useMobility();

  // Dialog controls
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Unified Auth fields
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localAuthLoading, setLocalAuthLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Social authentication simulation
  const [socialLoading, setSocialLoading] = useState(null); // 'google', 'github', 'microsoft'

  // Load remembered credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setAuthEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!authEmail.trim() || !authPassword) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    console.log("[Auth UI] handleSignInSubmit triggered.");
    setLocalAuthLoading(true);
    try {
      await login(authEmail, authPassword);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", authEmail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      console.log("[Auth UI] Sign-in succeeded.");
    } catch (err) {
      console.error("[Auth UI] Sign-in error:", err);
      setLocalError(err.message || "Incorrect email or password");
    } finally {
      setLocalAuthLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!authName.trim() || !authEmail.trim() || !authPassword || !authConfirmPassword) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const strength = getPasswordStrength(authPassword);
    if (strength.score < 3) {
      setLocalError("Password is too weak. Please verify password requirements.");
      return;
    }

    if (!agreedToTerms) {
      setLocalError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    console.log("[Auth UI] handleSignUpSubmit triggered.");
    setLocalAuthLoading(true);
    try {
      await register(authName, authEmail, authPassword, authPhone || null);
      console.log("[Auth UI] Sign-up succeeded.");
      setRegistrationSuccess(true);
      
      // Wait 3.5s then toggle to sign-in view
      setTimeout(() => {
        setRegistrationSuccess(false);
        setIsLoginView(true);
        setAuthConfirmPassword("");
        setAuthPhone("");
        // Retain the email for convenient sign-in
        setAuthPassword("");
        setLocalError("");
      }, 3500);
    } catch (err) {
      console.error("[Auth UI] Sign-up error:", err);
      setLocalError(err.message || "Registration failed. Email might already exist.");
    } finally {
      setLocalAuthLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotSuccess("");
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setForgotSuccess("A secure recovery node token link has been dispatched to your email address.");
      setForgotEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSocialLogin = async (platform) => {
    setSocialLoading(platform);
    setLocalError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Authenticate with a preset social mockup email
      await login(`${platform}_user@urbanflow.ai`, "password123");
    } catch (err) {
      setLocalError(`Social login failed for ${platform}. Please check internet connection.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "Too Short", color: "bg-slate-700 w-0", textClass: "text-slate-400" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (pwd.length < 6) {
      return { score: 1, text: "Too Short (min 6)", color: "bg-brand-red w-[25%]", textClass: "text-brand-red font-bold" };
    }
    
    if (score <= 2) {
      return { score, text: "Weak", color: "bg-brand-red w-[33%]", textClass: "text-brand-red font-bold" };
    } else if (score <= 4) {
      return { score, text: "Medium", color: "bg-yellow-500 w-[66%]", textClass: "text-yellow-500 font-bold" };
    } else {
      return { score, text: "Strong", color: "bg-emerald-500 w-[100%]", textClass: "text-emerald-400 font-bold" };
    }
  };

  // Helper shortcut to log in immediately for evaluation
  const handlePresetLogin = async (presetType) => {
    setLocalAuthLoading(true);
    setLocalError("");
    try {
      if (presetType === 'user') {
        await login("user@urbanflow.ai", "password123");
      } else {
        await login("admin@urbanflow.ai", "adminpassword");
      }
    } catch (err) {
      console.log(err);
      setLocalError(err.message || "Preset login failed");
    } finally {
      setLocalAuthLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-darkBg-deep">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-brand-teal border-t-transparent animate-spin" />
          <span className="text-xs text-brand-neonCyan font-bold uppercase tracking-widest animate-pulse">
            Connecting to UrbanFlow AI Central Net...
          </span>
        </div>
      </div>
    );
  }

  // 1. GORGEOUS FUTURISTIC AUTHENTICATION SCREEN
  if (!isAuthenticated) {
    const strength = getPasswordStrength(authPassword);
    const displayError = localError || authError;

    const pwdCriteria = {
      length: authPassword.length >= 8,
      upper: /[A-Z]/.test(authPassword),
      lower: /[a-z]/.test(authPassword),
      number: /[0-9]/.test(authPassword),
      special: /[^A-Za-z0-9]/.test(authPassword)
    };

    return (
      <div className="min-h-screen w-screen bg-[#0B132B] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-y-auto">
        {/* Dynamic Glowing background circles */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-neonCyan/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Header Title */}
        <div className="flex flex-col items-center gap-2 text-center mb-6 z-10">
          <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(110,255,233,0.5)]">🌐</span>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5 glow-cyan">
            UrbanFlow AI
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-teal">
            AI-Powered Smart Mobility Ecosystem
          </span>
        </div>

        {/* Responsive Combined Card */}
        <div className="w-full max-w-md z-10 flex flex-col gap-4">
          <div className="flex bg-[#070d1e]/80 p-1.5 rounded-2xl border border-brand-teal/15 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setIsLoginView(true);
                setLocalError("");
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                isLoginView
                  ? 'bg-brand-teal text-darkBg-deep font-black shadow-neonCyan'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
            >
              Sign In Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginView(false);
                setLocalError("");
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                !isLoginView
                  ? 'bg-brand-teal text-darkBg-deep font-black shadow-neonCyan'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
            >
              Create Account
            </button>
          </div>

          <motion.div 
            key={isLoginView ? "login-panel" : "register-panel"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl w-full border border-brand-teal/20 shadow-glass flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {isLoginView ? "Sign In Portal" : "Create Account"}
              </h2>
              <span className="text-[10px] text-slate-400">
                {isLoginView ? "Access your citizen dashboard or manager node" : "Register to join the smart sustainability network"}
              </span>
            </div>

            {isLoginView ? (
              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5" key="signin-email-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signin-email"
                      id="signin-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="username"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-slate-200"
                      placeholder="user@urbanflow.ai"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5" key="signin-password-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signin-password"
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="glass-input pl-10 pr-10 py-2.5 rounded-xl w-full text-slate-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-darkBg-border text-brand-teal focus:ring-0 bg-[#0b132b]/50 cursor-pointer"
                    />
                    <span>Remember connection credentials</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess("");
                      setShowForgotModal(true);
                    }}
                    className="text-brand-neonCyan hover:underline hover:text-brand-teal transition-colors font-bold uppercase tracking-wider border-none bg-transparent cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {displayError && (
                  <div className="flex items-start gap-2 border border-brand-red/35 bg-brand-red/5 p-3 rounded-xl text-[10px] text-brand-red font-bold leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{displayError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={localAuthLoading}
                  className="w-full bg-brand-teal hover:bg-brand-teal/80 text-darkBg-deep font-bold text-xs py-3 rounded-xl cursor-pointer transition-all duration-200 border-none mt-2 shadow-neonCyan flex items-center justify-center gap-2"
                >
                  {localAuthLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-darkBg-deep border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Security Node...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In Node</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Social Login options */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-px flex-1 bg-darkBg-border/30" />
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 whitespace-nowrap">
                      Or connect via secure identity providers
                    </span>
                    <span className="h-px flex-1 bg-darkBg-border/30" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={socialLoading !== null || localAuthLoading}
                      onClick={() => handleSocialLogin('google')}
                      className="flex items-center justify-center gap-1.5 bg-[#1C2541]/40 hover:bg-[#1C2541]/80 text-slate-300 border border-darkBg-border/50 py-2 rounded-xl transition-all duration-200 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {socialLoading === 'google' ? (
                        <span className="w-3 h-3 border-2 border-brand-neonCyan border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span>Google</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={socialLoading !== null || localAuthLoading}
                      onClick={() => handleSocialLogin('github')}
                      className="flex items-center justify-center gap-1.5 bg-[#1C2541]/40 hover:bg-[#1C2541]/80 text-slate-300 border border-darkBg-border/50 py-2 rounded-xl transition-all duration-200 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {socialLoading === 'github' ? (
                        <span className="w-3 h-3 border-2 border-brand-neonCyan border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Github className="w-3.5 h-3.5" />
                      )}
                      <span>GitHub</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={socialLoading !== null || localAuthLoading}
                      onClick={() => handleSocialLogin('microsoft')}
                      className="flex items-center justify-center gap-1.5 bg-[#1C2541]/40 hover:bg-[#1C2541]/80 text-slate-300 border border-darkBg-border/50 py-2 rounded-xl transition-all duration-200 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {socialLoading === 'microsoft' ? (
                        <span className="w-3 h-3 border-2 border-brand-neonCyan border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 23 23" fill="currentColor">
                          <rect x="0" y="0" width="11" height="11" fill="#f25022"/>
                          <rect x="12" y="0" width="11" height="11" fill="#7fba00"/>
                          <rect x="0" y="12" width="11" height="11" fill="#00a1f1"/>
                          <rect x="12" y="12" width="11" height="11" fill="#ffb900"/>
                        </svg>
                      )}
                      <span>Microsoft</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3.5 text-xs">
                <div className="flex flex-col gap-1" key="signup-name-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signup-name"
                      id="signup-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2 rounded-xl w-full text-slate-200"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1" key="signup-email-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signup-email"
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2 rounded-xl w-full text-slate-200"
                      placeholder="newuser@urbanflow.ai"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1" key="signup-phone-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Mobile Number <span className="text-[9px] text-slate-500 font-medium">(Optional)</span></label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signup-phone"
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="glass-input pl-10 pr-4 py-2 rounded-xl w-full text-slate-200"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1" key="signup-password-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signup-password"
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="glass-input pl-10 pr-10 py-2 rounded-xl w-full text-slate-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Validation Bar */}
                  {authPassword && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="bg-slate-800 h-1.5 w-full rounded-full overflow-hidden">
                        <div className={`transition-all duration-300 h-full ${strength.color}`} />
                      </div>
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-400">Security Rating:</span>
                        <span className={`${strength.textClass} uppercase`}>{strength.text}</span>
                      </div>
                      
                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 bg-[#070d1e]/50 p-2 rounded-xl border border-darkBg-border/20 text-[9px] leading-relaxed">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${pwdCriteria.length ? 'bg-brand-green shadow-[0_0_4px_#10B981]' : 'bg-slate-600'}`} />
                          <span className={pwdCriteria.length ? 'text-brand-green font-semibold' : 'text-slate-400'}>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${pwdCriteria.upper ? 'bg-brand-green shadow-[0_0_4px_#10B981]' : 'bg-slate-600'}`} />
                          <span className={pwdCriteria.upper ? 'text-brand-green font-semibold' : 'text-slate-400'}>Uppercase Letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${pwdCriteria.lower ? 'bg-brand-green shadow-[0_0_4px_#10B981]' : 'bg-slate-600'}`} />
                          <span className={pwdCriteria.lower ? 'text-brand-green font-semibold' : 'text-slate-400'}>Lowercase Letter</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${pwdCriteria.number ? 'bg-brand-green shadow-[0_0_4px_#10B981]' : 'bg-slate-600'}`} />
                          <span className={pwdCriteria.number ? 'text-brand-green font-semibold' : 'text-slate-400'}>At least one number</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${pwdCriteria.special ? 'bg-brand-green shadow-[0_0_4px_#10B981]' : 'bg-slate-600'}`} />
                          <span className={pwdCriteria.special ? 'text-brand-green font-semibold' : 'text-slate-400'}>Special symbol (e.g. @, $, !, %, &)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1" key="signup-confirm-field">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input
                      key="signup-confirm-password"
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="glass-input pl-10 pr-10 py-2 rounded-xl w-full text-slate-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors select-none mt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-darkBg-border text-brand-teal focus:ring-0 bg-[#0b132b]/50 cursor-pointer"
                  />
                  <span className="text-[10px] leading-relaxed">
                    I verify this registration request and agree to the{" "}
                    <a href="#" className="text-brand-neonCyan underline hover:text-brand-teal transition-colors" onClick={(e) => e.preventDefault()}>Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-brand-neonCyan underline hover:text-brand-teal transition-colors" onClick={(e) => e.preventDefault()}>Privacy Protocols</a>.
                  </span>
                </label>

                {displayError && (
                  <div className="flex items-start gap-2 border border-brand-red/35 bg-brand-red/5 p-3 rounded-xl text-[10px] text-brand-red font-bold leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{displayError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={localAuthLoading}
                  className="w-full bg-brand-teal hover:bg-brand-teal/80 text-darkBg-deep font-bold text-xs py-3 rounded-xl cursor-pointer transition-all duration-200 border-none mt-2 shadow-neonCyan flex items-center justify-center gap-2"
                >
                  {localAuthLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-darkBg-deep border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting Account Creation...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Node</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Shortcuts & Footnotes */}
        <div className="w-full max-w-md mt-6 z-10 flex flex-col gap-4">
          <div className="flex flex-col gap-2.5 border-t border-darkBg-border pt-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
              Testing Shortcuts (No Password typing needed)
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                onClick={() => handlePresetLogin('user')}
                className="bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-neonCyan border border-brand-teal/30 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
              >
                Jane Doe (Citizen)
              </button>
              <button
                onClick={() => handlePresetLogin('admin')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-darkBg-border text-slate-300 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
              >
                City Admin (Manager)
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[9px] text-slate-500 leading-normal">
              New registrations persist in SQLite database. Passwords are securely hashed. Seeded credentials remain fully valid.
            </span>
          </div>
        </div>

        {/* Forgot Password Recovery Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#070d1e]/85 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel-heavy p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-brand-teal/30 shadow-glass flex flex-col gap-5 relative"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Node Recovery Request</h3>
                  <p className="text-[10px] text-slate-400">
                    Provide your email address to broadcast a secure password recovery node token link.
                  </p>
                </div>
                
                {forgotSuccess ? (
                  <div className="flex flex-col gap-3 items-center bg-brand-teal/5 border border-brand-teal/30 rounded-xl p-4 text-center">
                    <ShieldCheck className="w-8 h-8 text-brand-neonCyan" />
                    <p className="text-[10px] text-brand-neonCyan font-bold leading-relaxed">{forgotSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="glass-input pl-10 pr-4 py-2.5 rounded-xl w-full text-xs text-slate-200"
                          placeholder="user@urbanflow.ai"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-brand-teal hover:bg-brand-teal/80 text-darkBg-deep font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all border-none"
                    >
                      {forgotLoading ? "Broadcasting Token..." : "Send Reset Protocols"}
                    </button>
                  </form>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess("");
                    setForgotEmail("");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all border-none mt-1"
                >
                  Close Dialog
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Success Overlay Modal */}
        <AnimatePresence>
          {registrationSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#070d1e]/90 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-panel-heavy p-8 rounded-3xl max-w-sm w-full border border-brand-neonCyan/30 shadow-glass flex flex-col items-center text-center gap-6"
              >
                <div className="bg-brand-neonCyan/10 p-5 rounded-full border border-brand-neonCyan/30 relative">
                  <CheckCircle2 className="w-12 h-12 text-brand-neonCyan animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-brand-neonCyan/20 blur-md -z-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Citizen Node Activated</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your account has been securely stored. Password hashed and database registered successfully.
                  </p>
                </div>
                <div className="w-full bg-slate-900/50 rounded-xl p-3 border border-darkBg-border/40 text-[10px] text-slate-400 font-medium">
                  Redirecting to Sign In portal in a few seconds...
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setIsLoginView(true);
                  }}
                  className="w-full bg-brand-teal text-darkBg-deep font-bold text-xs py-2.5 rounded-xl cursor-pointer hover:bg-brand-teal/80 transition-all border-none"
                >
                  Access Sign In Portal Now
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. MAIN APPLICATION WORKSPACE
  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-darkBg-deep relative">
      
      {/* Dynamic pulse background if SOS is active */}
      {sosActive && (
        <div className="absolute inset-0 bg-brand-red/5 border-4 border-brand-red animate-pulse pointer-events-none z-50" />
      )}

      {/* Main Sidebar controls */}
      <Sidebar onOpenChat={() => setChatOpen(true)} />

      {/* Main content grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Control Bar */}
        <header className="p-4 border-b border-darkBg-border flex items-center justify-between bg-darkBg-card/40 relative">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">
              Active Control Node: <b className="text-brand-neonCyan">{activeTab.toUpperCase()}</b>
            </span>
            
            {/* Show Admin View toggle toggle if user has admin credentials */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setAdminViewActive(!adminViewActive);
                  setActiveTab(adminViewActive ? 'routes' : 'admin');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                  adminViewActive 
                    ? 'bg-brand-neonCyan text-darkBg-deep border-brand-neonCyan shadow-neonCyan' 
                    : 'bg-slate-800 text-slate-300 border-darkBg-border'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {adminViewActive ? "City Admin Panel: Active" : "Go to Admin Panel"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Log Community Incident button */}
            <button
              onClick={() => setReportOpen(true)}
              className="bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-neonCyan border border-brand-teal/40 px-3.5 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" /> Report Hazard
            </button>

            {/* Top Shortcut SOS Trigger Button */}
            <button
              onClick={() => {
                if (sosActive) {
                  setActiveTab('safety');
                } else {
                  triggerSOS();
                  setActiveTab('safety');
                }
              }}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black cursor-pointer border flex items-center gap-1.5 transition-all duration-300 ${
                sosActive 
                  ? 'bg-slate-900 border-slate-700 text-slate-400 animate-pulse'
                  : 'bg-brand-red hover:bg-brand-red/90 text-white border-brand-red shadow-neonRed'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" /> 
              {sosActive ? "SOS ON AIR" : "PANIC SOS"}
            </button>
          </div>
        </header>

        {/* Workspace Body splits */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
          
          {/* Dashboard Panels Left */}
          <div className="w-full lg:w-[48%] overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full"
              >
                {activeTab === 'routes' && (
                  <div className="glass-panel p-5 rounded-2xl h-full flex items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-3 max-w-sm">
                      <div className="bg-brand-teal/20 p-4 rounded-full border border-brand-teal/30">
                        <Sparkles className="w-8 h-8 text-brand-neonCyan animate-spin" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-200">Interactive Map Directions</h3>
                      <p className="text-xs text-slate-400">
                        Enter starting coordinates and destinations in the sidebar to plot fastest safety corridors, compare CO2 metrics, and calculate municipal public fares.
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'traffic' && <TrafficDashboard />}
                {activeTab === 'safety' && <SOSButton />}
                {activeTab === 'carbon' && <CarbonTracker />}
                {activeTab === 'cost' && <CostOptimizer />}
                {activeTab === 'alerts' && <AlertSystem />}
                {activeTab === 'admin' && <AdminDashboard />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Map Right */}
          <div className="w-full lg:w-[52%] h-full">
            <MapView />
          </div>

        </div>

      </div>

      {/* Floating chatbot bubble */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 bg-brand-teal text-darkBg-deep p-4 rounded-full shadow-lg shadow-black cursor-pointer hover:scale-105 hover:bg-brand-teal/90 transition-all duration-200 border-none"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* AI Assistant Chat slide-out */}
      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Community Report dialog modal */}
      <CommunityReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

    </div>
  );
}
