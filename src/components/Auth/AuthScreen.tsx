import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Apple,
  Camera,
  Check,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  FolderOpen,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Radio,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserPlus,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMMUNITY_USERS, INITIAL_OWNER } from '../../data/mockData';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
];

export const AuthScreen: React.FC = () => {
  const {
    login,
    register,
    loginWithApple,
    language,
    setLanguage,
  } = useApp();

  // Mode: default to 'signup' so new users create an account first
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Sign Up Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim()) {
      setErrorMsg(language === 'ku' ? 'تکایە ناوی پڕۆفایل بنووسە' : 'Please enter your display name');
      return;
    }

    if (!username.trim()) {
      setErrorMsg(language === 'ku' ? 'تکایە ناوی بەکارهێنەر (یوزەرنەیم) بنووسە' : 'Please enter a username');
      return;
    }

    if (password.length < 4) {
      setErrorMsg(language === 'ku' ? 'وشەی تێپەڕ دەبێت لانیکەم ٤ پیت یان ژمارە بێت' : 'Password must be at least 4 characters');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg(language === 'ku' ? 'وشەی تێپەڕ لەگەڵ دووبارەکردنەوەکەیدا یەکناگرێتەوە' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = register({
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        avatarUrl: selectedAvatar,
      });

      setLoading(false);

      if (res.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg(language === 'ku' ? 'تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە' : 'Please enter username or email');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = login(loginIdentifier.trim(), loginPassword);
      setLoading(false);

      if (res.success) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  const handleQuickLogin = (identifier: string) => {
    login(identifier);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#07090e] text-[#d6dae5] flex flex-col justify-between relative overflow-y-auto select-none">
      {/* Background glowing ambient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Language Toggle */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-[#181c28] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black tracking-wider text-base">
            KC
          </div>
          <div>
            <div className="font-extrabold text-white text-base leading-tight tracking-wide flex items-center gap-1.5">
              <span>کوردکۆرد</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded-md font-bold border border-cyan-500/20">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-[#6d758d]">
              {language === 'ku' ? 'تۆڕی پەیوەندی و ژوورەکانی دەنگ' : 'Voice, Video & Community'}
            </div>
          </div>
        </div>

        {/* Language switch button */}
        <button
          onClick={() => setLanguage(language === 'ku' ? 'en' : 'ku')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-[#1c2233] border border-[#20273a] text-xs font-bold text-[#8b92a5] hover:text-white transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ku' ? 'English' : 'کوردی'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 relative z-10">
        <div className="w-full max-w-lg bg-[#11131a] border border-[#232838] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Header Description */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {authMode === 'signup'
                  ? (language === 'ku' ? 'خۆتۆمارکردن لە کوردکۆرد' : 'Create KurdCord Account')
                  : (language === 'ku' ? 'چوونەژوورەوە بۆ هەژمار' : 'Sign in to KurdCord')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {authMode === 'signup'
                ? (language === 'ku' ? 'سەرەتا ئەکاونتێک دروست بکە' : 'Create an Account to Enter')
                : (language === 'ku' ? 'بەخێربێیتەوە بۆ کوردکۆرد' : 'Welcome Back to KurdCord')}
            </h1>
            <p className="text-xs text-[#8b92a5] mt-1.5 max-w-sm mx-auto">
              {language === 'ku'
                ? 'بۆ ئەوەی بتوانیت بچیتە ناو ژوورەکانی دەنگ و نامە بنێریت، سەرەتا پێویستە ناوی خۆت تۆمار بکەیت.'
                : 'You must register or sign in before you can access voice rooms and chats.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#171a25] border border-[#23293a] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-[#8b92a5] hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'ku' ? 'دروستکردنی ئەکاونت' : 'Sign Up'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-[#8b92a5] hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>{language === 'ku' ? 'چوونەژوورەوە' : 'Log In'}</span>
            </button>
          </div>

          {/* Feedback error alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-2 flex items-center justify-between">
                  <span>{language === 'ku' ? 'وێنەی پڕۆفایل (ئەڤەتار):' : 'Profile Avatar:'}</span>
                  <span className="text-[10px] text-cyan-400 font-normal">
                    {language === 'ku' ? 'هەڵبژێرە یان لە مۆبایلەکەت دابنێ' : 'Pick one or upload'}
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  {/* Current Selected Avatar Preview with Click to Upload */}
                  <div className="relative group shrink-0">
                    <img
                      src={selectedAvatar}
                      alt="Selected"
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title="Upload from gallery"
                    >
                      <Camera className="w-5 h-5 text-cyan-400" />
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />

                  {/* Preset Avatars Row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((avUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avUrl)}
                        className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          selectedAvatar === avUrl
                            ? 'border-cyan-400 scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={avUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}

                    {/* Upload from Gallery button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 rounded-xl bg-[#1c2130] hover:bg-[#252c40] border border-[#2d354a] flex items-center justify-center text-cyan-400 shrink-0 transition-colors"
                      title={language === 'ku' ? 'وێنەیەک لە مۆبایل هەڵبژێرە' : 'Upload custom photo'}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'ناوی پڕۆفایل:' : 'Display Name:'}
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={language === 'ku' ? 'ناوی پڕۆفایلەکەت' : 'Your Name'}
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'ناوی بەکارهێنەر (یوزەرنەیم):' : 'Username:'}
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto text-sm font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="username"
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-8 pe-3 py-2.5 text-sm text-white font-mono outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Optional or Apple ID) */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                  {language === 'ku' ? 'ئیمەیڵ یان هەژماری Apple ID:' : 'Email / Apple ID:'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'وشەی تێپەڕ (Password):' : 'Password:'}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-8 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 rtl:left-2.5 rtl:right-auto text-[#626a80] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'دووبارەکردنەوە:' : 'Confirm:'}
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bonus Coins Alert */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                <span className="text-base">🎁</span>
                <span>
                  {language === 'ku'
                    ? 'دیاری تایبەت: بە دروستکردنی ئەکاونت، ١,٠٠٠ سکەی بەخۆڕایی وەردەگریت!'
                    : 'Special gift: You get +1,000 free starter coins upon registration!'}
                </span>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {loading
                    ? (language === 'ku' ? 'خەریکی دروستکردنی ئەکاونتە...' : 'Creating Account...')
                    : (language === 'ku' ? 'دروستکردنی ئەکاونت و چوونەژوورەوە' : 'Create Account & Enter')}
                </span>
              </button>
            </form>
          )}

          {/* 2. LOG IN FORM */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'ئیمەیڵ یان ناوی بەکارهێنەر (@username):' : 'Email or Username:'}
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="zhyar4489@gmail.com"
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                    {language === 'ku' ? 'وشەی تێپەڕ (Password):' : 'Password:'}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#5f6880] absolute left-3 rtl:right-3 rtl:left-auto" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#171a25] border border-[#23293a] rounded-xl ps-9 pe-8 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 rtl:left-2.5 rtl:right-auto text-[#626a80] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>
                    {loading
                      ? (language === 'ku' ? 'چاوەڕێبە...' : 'Signing in...')
                      : (language === 'ku' ? 'چوونەژوورەوە بۆ ئەکاونت' : 'Log In')}
                  </span>
                </button>
              </form>

              {/* OR Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#232838]" />
                <span className="text-[11px] font-bold text-[#626a80] uppercase">
                  {language === 'ku' ? 'یان بە ئەپڵ ئایدی' : 'OR WITH APPLE ID'}
                </span>
                <div className="flex-1 h-px bg-[#232838]" />
              </div>

              {/* Sign In with Apple ID */}
              <button
                type="button"
                onClick={loginWithApple}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Apple className="w-4 h-4 fill-black" />
                <span>
                  {language === 'ku' ? 'چوونەژوورەوەی خێرا بە Apple ID' : 'Sign in with Apple ID'}
                </span>
              </button>

              {/* Quick Demo Accounts Selection */}
              <div className="pt-2">
                <div className="text-[11px] text-[#8b92a5] font-semibold mb-2 text-start">
                  {language === 'ku' ? 'یان هەڵبژاردنی یەکێک لە ئەکاونتە ئامادەکراوەکان:' : 'Or test with a pre-configured account:'}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(INITIAL_OWNER.username)}
                    className="p-2 rounded-xl bg-[#161925] hover:bg-[#202538] border border-[#23293a] text-center flex flex-col items-center gap-1 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40">
                      <img src={INITIAL_OWNER.avatarUrl} alt="Owner" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 truncate w-full">Zhyar 👑</span>
                    <span className="text-[9px] text-[#6b738a]">Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(COMMUNITY_USERS[0].username)}
                    className="p-2 rounded-xl bg-[#161925] hover:bg-[#202538] border border-[#23293a] text-center flex flex-col items-center gap-1 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/40">
                      <img src={COMMUNITY_USERS[0].avatarUrl} alt="Alan" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate w-full">Alan</span>
                    <span className="text-[9px] text-[#6b738a]">Gamer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(COMMUNITY_USERS[1].username)}
                    className="p-2 rounded-xl bg-[#161925] hover:bg-[#202538] border border-[#23293a] text-center flex flex-col items-center gap-1 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-500/40">
                      <img src={COMMUNITY_USERS[1].avatarUrl} alt="Sara" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate w-full">Sara</span>
                    <span className="text-[9px] text-[#6b738a]">Coder</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Toggle text */}
          <div className="mt-6 pt-4 border-t border-[#232838] text-center text-xs text-[#8b92a5]">
            {authMode === 'signup' ? (
              <p>
                {language === 'ku' ? 'ئەکاونتت هەیە پێشتر؟' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline ms-1 cursor-pointer"
                >
                  {language === 'ku' ? 'لێرەوە بچۆ ژوورەوە' : 'Log in here'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'ku' ? 'هێشتا ئەکاونتت نییە؟' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline ms-1 cursor-pointer"
                >
                  {language === 'ku' ? 'ئەکاونتێکی نوێ دروست بکە' : 'Create an account'}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-[11px] text-[#5b6378] border-t border-[#181c28]">
        <span>© 2026 KurdCord PRO · Voice Lounges, Video & Chat Platform for Kurdistan</span>
      </footer>
    </div>
  );
};
