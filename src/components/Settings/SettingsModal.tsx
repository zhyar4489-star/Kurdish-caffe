import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  Coins,
  Crown,
  Gift,
  Globe,
  Headphones,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Plus,
  PlusCircle,
  Radio,
  Send,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Volume2,
  Wand2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { playCoinSound } from '../../utils/soundEffects';
import { UserAvatar } from '../Common/UserAvatar';

type SettingsTab = 'account' | 'owners' | 'coins' | 'general';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    currentUser,
    savedAccounts,
    switchAccount,
    addNewAccount,
    logoutAccount,
    allOwners,
    addAppOwner,
    removeAppOwner,
    isPrimaryOwner,
    addCoins,
    friends,
    language,
    setLanguage,
    t,
    voiceState,
    toggleMute,
    toggleDeafen,
    requestPushPermission,
    setShopModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Account Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccAvatar, setNewAccAvatar] = useState('');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);

  // Owner Form State
  const [selectedOwnerFriendId, setSelectedOwnerFriendId] = useState('');
  const [ownerInputUsername, setOwnerInputUsername] = useState('');

  // Coins State
  const [customCoinAmount, setCustomCoinAmount] = useState<number>(25000);
  const [giftFriendId, setGiftFriendId] = useState<string>('');
  const [giftCoinAmount, setGiftCoinAmount] = useState<number>(5000);

  // Logout confirmation state
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!settingsModalOpen) return null;

  const triggerSuccessFeedback = (text: string) => {
    setFeedbackMsg({ text, type: 'success' });
    playCoinSound();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccUsername.trim()) return;

    addNewAccount({
      displayName: newAccName.trim() || newAccUsername.trim(),
      username: newAccUsername.trim(),
      email: newAccEmail.trim(),
      avatarUrl: newAccAvatar.trim() || undefined,
    });

    setNewAccName('');
    setNewAccUsername('');
    setNewAccEmail('');
    setNewAccAvatar('');
    setShowAddAccountForm(false);
    triggerSuccessFeedback(
      language === 'ku'
        ? 'ئەکاونتی نوێ بە سەرکەوتوویی دروستکرا و کرایەوە!'
        : 'New account created and activated successfully!'
    );
  };

  const handleAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const target = selectedOwnerFriendId || ownerInputUsername.trim();
    if (!target) return;

    const res = addAppOwner(target);
    if (res.success) {
      triggerSuccessFeedback(res.message);
      setSelectedOwnerFriendId('');
      setOwnerInputUsername('');
    } else {
      setFeedbackMsg({ text: res.message, type: 'error' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleClaimCoins = (amount: number) => {
    addCoins(
      amount,
      language === 'ku'
        ? `وەرگرتنی +${amount.toLocaleString()} سکەی بەلاش لە سیتینگ 🪙`
        : `Claimed +${amount.toLocaleString()} free coins from Settings 🪙`
    );
    triggerSuccessFeedback(
      language === 'ku'
        ? `بڕی +${amount.toLocaleString()} سکە بە بەلاش خرایە سەر هەژمارەکەت!`
        : `+${amount.toLocaleString()} free coins added to your account!`
    );
  };

  const handleGiftCoins = (e: React.FormEvent) => {
    e.preventDefault();
    const friend = friends.find((f) => f.user.id === giftFriendId);
    if (!friend || giftCoinAmount <= 0) return;

    triggerSuccessFeedback(
      language === 'ku'
        ? `بڕی ${giftCoinAmount.toLocaleString()} سکەی بەلاش بەخشرا بە ${friend.user.displayName}!`
        : `Gifted ${giftCoinAmount.toLocaleString()} free coins to ${friend.user.displayName}!`
    );
    setGiftFriendId('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto"
      onClick={() => setSettingsModalOpen(false)}
    >
      <div
        className="w-full max-w-4xl bg-[#10131d] border border-[#232b40] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[88vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Settings Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0a0c13] border-b md:border-b-0 md:border-r border-[#1c2233] p-4 flex flex-col justify-between shrink-0 select-none">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1c2233]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <SettingsIcon className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white leading-tight">
                    {language === 'ku' ? 'سیتینگ و ڕێکخستن' : 'Settings'}
                  </h2>
                  <p className="text-[10px] text-[#6d758d]">KurdCord Control Panel</p>
                </div>
              </div>

              <button
                onClick={() => setSettingsModalOpen(false)}
                className="md:hidden w-7 h-7 rounded-lg bg-[#181d2a] text-[#8b92a5] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Tabs */}
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'account'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-[#8b92a5] hover:text-white hover:bg-[#151926]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="flex-1 text-start">
                  {language === 'ku' ? 'ئەکاونت و گۆڕین' : 'Account & Switch'}
                </span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-bold">
                  {savedAccounts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('owners')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'owners'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold shadow-md shadow-amber-500/20'
                    : 'text-[#8b92a5] hover:text-amber-400 hover:bg-[#151926]'
                }`}
              >
                <Crown className="w-4 h-4 fill-current" />
                <span className="flex-1 text-start">
                  {language === 'ku' ? 'زیادکردنی ئۆنەر 👑' : 'Add App Owners'}
                </span>
                {isPrimaryOwner && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 py-0.2 rounded font-black">
                    VIP
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('coins')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'coins'
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300'
                    : 'text-[#8b92a5] hover:text-amber-300 hover:bg-[#151926]'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="flex-1 text-start">
                  {language === 'ku' ? 'زیادکردنی پارە و سکە' : 'Coins & Currency'}
                </span>
                <span className="text-[10px] text-amber-400 font-extrabold">
                  {currentUser.coins.toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'general'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-[#8b92a5] hover:text-white hover:bg-[#151926]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="flex-1 text-start">
                  {language === 'ku' ? 'گشتی و زمان' : 'General & Voice'}
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Active User Indicator & Logout in Sidebar */}
          <div className="pt-4 mt-4 border-t border-[#1c2233] space-y-2">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141824] border border-[#20273a]">
              <UserAvatar
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                size="sm"
                status={currentUser.status}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>{currentUser.displayName}</span>
                  {currentUser.isOwner && (
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-cyan-400 truncate">@{currentUser.username}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('account');
                setConfirmLogout(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'لۆگ ئاوت (دەرچوون)' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#10131d]">
          {/* Header Bar */}
          <div className="h-14 px-6 border-b border-[#1c2233] flex items-center justify-between shrink-0">
            <div className="text-xs font-bold text-[#8b92a5]">
              {activeTab === 'account' && (language === 'ku' ? 'بەڕێوەبردنی ئەکاونت، لۆگ ئاوت و دانانی ئەکاونتی تر' : 'Account Management, Switch & Logout')}
              {activeTab === 'owners' && (language === 'ku' ? 'دیاریکردن و زیادکردنی ئۆنەری ئەپەکە 👑' : 'Add App Owners & Permissions')}
              {activeTab === 'coins' && (language === 'ku' ? 'زیادکردنی پارە و سکەی بێسنوور بۆ هەژمارەکەت 🪙' : 'Free Coin Generator & Balance')}
              {activeTab === 'general' && (language === 'ku' ? 'ڕێکخستنە گشتییەکان، زمان و دەنگ' : 'General, Language & Audio')}
            </div>

            <button
              onClick={() => setSettingsModalOpen(false)}
              className="hidden md:flex w-8 h-8 rounded-xl bg-[#141824] hover:bg-[#1d2334] text-[#8b92a5] hover:text-white items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div
              className={`mx-6 mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ========================================================= */}
            {/* TAB 1: ACCOUNTS, SWITCH ACCOUNTS, ADD NEW ACCOUNT, LOGOUT */}
            {/* ========================================================= */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Active Account Card */}
                <div className="p-4 rounded-2xl bg-[#151926] border border-[#20273a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <UserAvatar
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      size="lg"
                      status={currentUser.status}
                    />
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{currentUser.displayName}</span>
                        {currentUser.isOwner && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-3 h-3 fill-amber-300" />
                            <span>{language === 'ku' ? 'خاوەنی ئەپ' : 'Owner'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyan-400">@{currentUser.username}</div>
                      <div className="text-[11px] text-[#6d758d] mt-0.5">{currentUser.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmLogout(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'لۆگ ئاوت' : 'Log Out'}</span>
                    </button>
                  </div>
                </div>

                {/* Logout Confirmation Prompt */}
                {confirmLogout && (
                  <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>
                        {language === 'ku'
                          ? 'دڵنیایت دەتەوێت لە هەژمارەکەت لۆگ ئاوت بکەیت؟'
                          : 'Are you sure you want to log out of your account?'}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-300/80">
                      {language === 'ku'
                        ? 'دەتوانیت هەر کاتێک بگەڕێیتەوە یان ئەکاونتێکی تر هەڵبژێریت لە خوارەوە.'
                        : 'You can switch back anytime or choose another account below.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          logoutAccount();
                          setConfirmLogout(false);
                          setSettingsModalOpen(false);
                          triggerSuccessFeedback(
                            language === 'ku' ? 'بە سەرکەوتوویی لۆگ ئاوت بوویت' : 'Logged out successfully'
                          );
                        }}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20"
                      >
                        {language === 'ku' ? 'بەڵێ، لۆگ ئاوت بە' : 'Yes, Log Out'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(false)}
                        className="px-3 py-1.5 text-xs text-[#8b92a5] hover:text-white"
                      >
                        {language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Section: Switch Between Accounts & Add Another Account */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-white tracking-wider">
                        {language === 'ku' ? 'گۆڕینی ئەکاونت و هەژمارەکان' : 'Switch Stored Accounts'}
                      </h3>
                      <p className="text-[11px] text-[#6d758d]">
                        {language === 'ku'
                          ? 'هەر کاتێک بتەوێت دەتوانیت بە یەک کلیک لە نێوان ئەکاونتەکانتدا بسوڕێیتەوە'
                          : 'Switch instantly between multiple accounts'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddAccountForm(!showAddAccountForm)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-white text-xs font-bold transition-all border border-cyan-500/30 flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'دانانی ئەکاونتی تر' : 'Add Another Account'}</span>
                    </button>
                  </div>

                  {/* Add New Account Form */}
                  {showAddAccountForm && (
                    <form
                      onSubmit={handleCreateAccount}
                      className="p-4 rounded-2xl bg-[#141824] border border-cyan-500/30 space-y-3 animate-in fade-in duration-150"
                    >
                      <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4" />
                        <span>{language === 'ku' ? 'دروستکردنی هەژماری نوێ' : 'Create New Account'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#8b92a5] block mb-1">
                            {language === 'ku' ? 'ناوی دیاریکراو (Display Name)' : 'Display Name'}
                          </label>
                          <input
                            type="text"
                            required
                            value={newAccName}
                            onChange={(e) => setNewAccName(e.target.value)}
                            placeholder="بۆ نموونە: دیار سلێمانی"
                            className="w-full bg-[#0e111a] text-white text-xs px-3 py-2 rounded-xl outline-none border border-[#20273a] focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8b92a5] block mb-1">
                            {language === 'ku' ? 'ناوی بەکارهێنەر (Username)' : 'Username'}
                          </label>
                          <input
                            type="text"
                            required
                            value={newAccUsername}
                            onChange={(e) => setNewAccUsername(e.target.value)}
                            placeholder="diyar_kurd"
                            className="w-full bg-[#0e111a] text-white text-xs px-3 py-2 rounded-xl outline-none border border-[#20273a] focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8b92a5] block mb-1">
                            {language === 'ku' ? 'ئیمەیڵ (Email)' : 'Email'}
                          </label>
                          <input
                            type="email"
                            value={newAccEmail}
                            onChange={(e) => setNewAccEmail(e.target.value)}
                            placeholder="diyar@kurdcord.io"
                            className="w-full bg-[#0e111a] text-white text-xs px-3 py-2 rounded-xl outline-none border border-[#20273a] focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#8b92a5] block mb-1">
                            {language === 'ku' ? 'لینکی وێنە (Avatar URL ئارەزوومەندانە)' : 'Avatar URL (Optional)'}
                          </label>
                          <input
                            type="url"
                            value={newAccAvatar}
                            onChange={(e) => setNewAccAvatar(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-[#0e111a] text-white text-xs px-3 py-2 rounded-xl outline-none border border-[#20273a] focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAccountForm(false)}
                          className="px-3 py-1.5 text-xs text-[#8b92a5] hover:text-white"
                        >
                          {language === 'ku' ? 'داخستن' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
                        >
                          {language === 'ku' ? 'دروستکردن و چوونەژوورەوە' : 'Create & Switch Now'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Accounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAccounts.map((acc) => {
                      const isActive = currentUser.id === acc.id;

                      return (
                        <div
                          key={acc.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                              : 'bg-[#151926] hover:bg-[#1a1f2e] border-[#20273a]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar
                              src={acc.avatarUrl}
                              alt={acc.displayName}
                              size="md"
                              status={acc.status}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                <span>{acc.displayName}</span>
                                {acc.isOwner && (
                                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                                )}
                              </div>
                              <div className="text-[10px] text-cyan-400 truncate">@{acc.username}</div>
                              <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                                {acc.coins.toLocaleString()} 🪙
                              </div>
                            </div>
                          </div>

                          <div>
                            {isActive ? (
                              <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-white font-black text-[10px] flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3" />
                                <span>{language === 'ku' ? 'چالاکە' : 'Active'}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => switchAccount(acc.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#1d2334] hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
                              >
                                {language === 'ku' ? 'گۆڕین' : 'Switch'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: ADD APP OWNERS (ONLY PRIMARY ACCOUNT ZHYAR ALLOWED) */}
            {/* ========================================================= */}
            {activeTab === 'owners' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Crown className="w-6 h-6 fill-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {language === 'ku' ? 'بەڕێوەبردنی ئۆنەرەکانی ئەپ' : 'App Owners Management'}
                      </h3>
                      <p className="text-[11px] text-[#8b92a5]">
                        {isPrimaryOwner
                          ? (language === 'ku'
                              ? 'تەنها لە ئەکاونتی سەرەکی خۆتەوە (Zhyar) دەتوانیت ئۆنەر زیادبکەیت یان لایببەیت 🔒'
                              : 'Primary Owner Authority: Only you can assign or remove co-owners 🔒')
                          : (language === 'ku'
                              ? 'ئۆنەرە هاوبەشەکان ناتوانن ئۆنەری تر دابنێن، تەنها لای خاوەنی سەرەکییە'
                              : 'Co-owners do not have permission to appoint new owners')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                    {allOwners.length} {language === 'ku' ? 'ئۆنەر' : 'Owners'}
                  </span>
                </div>

                {/* Authority Lock Notice for Non-Primary Accounts */}
                {!isPrimaryOwner && (
                  <div className="p-4 rounded-2xl bg-[#141824] border border-amber-500/30 flex items-start gap-3 text-xs text-[#8b92a5]">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">
                        {language === 'ku' ? 'دەسەڵاتی سنووردارکراو 🔒' : 'Restricted Permission 🔒'}
                      </span>
                      <span>
                        {language === 'ku'
                          ? 'تەنها لە ئەکاونتی سەرەکی Zhyar دەتوانرێت ئۆنەری تر دابنرێت یان لاببرێت. وەک ئۆنەری هاوبەش هەموو تایبەتمەندییە شەخسییەکانت چالاکە بەڵام ناتوانیت ئۆنەری نوێ دابنێیت.'
                          : 'Only the primary creator account (Zhyar) can assign or remove owners. Other owners cannot add anyone.'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Add New Co-Owner Form (Exclusively for Primary Creator Zhyar) */}
                {isPrimaryOwner && (
                  <form
                    onSubmit={handleAddOwner}
                    className="p-4 rounded-2xl bg-[#141824] border border-amber-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <Crown className="w-4 h-4 fill-amber-400" />
                        <span>{language === 'ku' ? 'زیادکردنی ئۆنەری نوێ (Add Co-Owner)' : 'Add a New Co-Owner'}</span>
                      </span>
                      <span className="text-[10px] bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full">
                        {language === 'ku' ? 'دەسەڵاتی تۆیە 👑' : 'Lead Creator Only'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <select
                        value={selectedOwnerFriendId}
                        onChange={(e) => {
                          setSelectedOwnerFriendId(e.target.value);
                          if (e.target.value) setOwnerInputUsername('');
                        }}
                        className="bg-[#0e111a] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#2b334a] focus:border-amber-400 flex-1"
                      >
                        <option value="">-- {language === 'ku' ? 'هاوڕێیەک لە لیستەکەت هەڵبژێرە' : 'Select from friends'} --</option>
                        {friends
                          .filter((f) => !allOwners.some((o) => o.id === f.user.id))
                          .map((f) => (
                            <option key={f.user.id} value={f.user.id}>
                              {f.user.displayName} (@{f.user.username})
                            </option>
                          ))}
                      </select>

                      <div className="flex items-center text-xs text-[#8b92a5] px-1 font-bold">
                        {language === 'ku' ? 'یان' : 'or'}
                      </div>

                      <input
                        type="text"
                        value={ownerInputUsername}
                        onChange={(e) => {
                          setOwnerInputUsername(e.target.value);
                          if (e.target.value) setSelectedOwnerFriendId('');
                        }}
                        placeholder={language === 'ku' ? 'ناوی بەکارهێنەر/ئیمەیڵ بنووسە' : 'Username / Email'}
                        className="bg-[#0e111a] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#2b334a] focus:border-amber-400 flex-1 placeholder:text-[#555d73]"
                      />

                      <button
                        type="submit"
                        disabled={!selectedOwnerFriendId && !ownerInputUsername.trim()}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Crown className="w-3.5 h-3.5 fill-black" />
                        <span>{language === 'ku' ? 'دانان وەک ئۆنەر 👑' : 'Grant Owner 👑'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Current Owners List */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase text-[#8b92a5] tracking-wider">
                    {language === 'ku' ? 'خاوەنە کاراکانی ئێستای ئەپ:' : 'Current App Owners:'}
                  </div>

                  <div className="space-y-2">
                    {allOwners.map((owner) => {
                      const isPrimary =
                        owner.id === 'user_owner_zhyar' || owner.email === 'zhyar4489@gmail.com';

                      return (
                        <div
                          key={owner.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#141824] border border-[#20273a]"
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={owner.avatarUrl}
                              alt={owner.displayName}
                              size="md"
                              status={owner.status}
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{owner.displayName}</span>
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.2 rounded-full border border-amber-500/30 flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5 fill-amber-300" />
                                  <span>
                                    {isPrimary
                                      ? (language === 'ku' ? 'خاوەنی سەرەکی (Lead Creator)' : 'Lead Creator')
                                      : (language === 'ku' ? 'ئۆنەری هاوبەش (Co-Owner)' : 'Co-Owner')}
                                  </span>
                                </span>
                              </div>
                              <div className="text-[11px] text-[#8b92a5]">
                                @{owner.username} · {owner.email}
                              </div>
                            </div>
                          </div>

                          {/* Delete Button (Only visible and usable by Primary Creator Zhyar) */}
                          {!isPrimary && isPrimaryOwner ? (
                            <button
                              type="button"
                              onClick={() => {
                                const res = removeAppOwner(owner.id);
                                triggerSuccessFeedback(res.message);
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                              title={language === 'ku' ? 'لادانی ئۆنەر' : 'Remove Co-Owner'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{language === 'ku' ? 'لادان' : 'Remove'}</span>
                            </button>
                          ) : isPrimary ? (
                            <span className="text-[10px] text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded">
                              {language === 'ku' ? 'سەرەکی' : 'Primary'}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: ADD COINS & MONEY GENERATOR (FREE OWNER PERKS) */}
            {/* ========================================================= */}
            {activeTab === 'coins' && (
              <div className="space-y-6">
                {/* Balance Display */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-[#8b92a5] font-bold">
                        {language === 'ku' ? 'باڵانسی سکەکانی تۆ' : 'Your Coin Balance'}
                      </div>
                      <div className="text-2xl font-black text-amber-400">
                        {currentUser.coins.toLocaleString()}{' '}
                        <span className="text-xs text-white font-normal">سکە 💎</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsModalOpen(false);
                      setShopModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all shadow-md"
                  >
                    {language === 'ku' ? 'کۆگای ئایتونس' : 'iTunes Store'}
                  </button>
                </div>

                {/* Instant 1-Click Free Coins */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      {language === 'ku' ? 'زیادکردنی سکەی خۆڕایی بە یەک کلیک (100% Free)' : '1-Click Free Coin Generator'}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#6d758d] mb-3">
                    {language === 'ku'
                      ? 'وەک ئۆنەر و بەڕێوەبەری ئەپ، دەتوانیت بە دڵی خۆت پارە و سکەی بێسنوور بخەیتە سەر هەژمارەکەت:'
                      : 'Generate unlimited coins instantly with zero charge:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleClaimCoins(2500)}
                      className="p-3.5 rounded-2xl bg-[#141824] hover:bg-[#1a1f2e] border border-amber-500/30 text-center transition-all group"
                    >
                      <div className="text-amber-400 font-black text-base group-hover:scale-105 transition-transform">
                        +2,500 سکە
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-1">100% بەلاش (خۆڕایی)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClaimCoins(15000)}
                      className="p-3.5 rounded-2xl bg-[#141824] hover:bg-[#1a1f2e] border border-purple-500/40 text-center transition-all group"
                    >
                      <div className="text-purple-300 font-black text-base group-hover:scale-105 transition-transform">
                        +15,000 سکە
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-1">VIP Pack (بەلاش)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClaimCoins(100000)}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400 text-center transition-all group shadow-md"
                    >
                      <div className="text-amber-300 font-black text-base group-hover:scale-105 transition-transform">
                        +100,000 سکە 👑
                      </div>
                      <div className="text-[10px] text-amber-200 font-bold mt-1">Ultimate Creator Vault</div>
                    </button>
                  </div>

                  {/* Custom Coin Amount */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#141824] border border-[#20273a] flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-xs text-[#8b92a5] font-bold shrink-0">
                      {language === 'ku' ? 'بڕی دڵخواز بنووسە:' : 'Custom amount:'}
                    </span>
                    <input
                      type="number"
                      min="100"
                      max="1000000"
                      value={customCoinAmount}
                      onChange={(e) => setCustomCoinAmount(Number(e.target.value))}
                      className="w-full sm:w-44 bg-[#0e111a] text-white text-xs px-3 py-2 rounded-xl outline-none border border-[#2b334a] focus:border-amber-400 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleClaimCoins(customCoinAmount)}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shrink-0"
                    >
                      {language === 'ku' ? 'زیادکردنی پارە بە بەلاش' : 'Add Free Coins'}
                    </button>
                  </div>
                </div>

                {/* Gift Coins to Friends */}
                <div className="pt-4 border-t border-[#1c2233]">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      {language === 'ku' ? 'بەخشینی سکە بە هاوڕێکان بە خۆڕایی' : 'Gift Free Coins to Friends'}
                    </h3>
                  </div>

                  <form onSubmit={handleGiftCoins} className="flex flex-col sm:flex-row items-center gap-2.5">
                    <select
                      value={giftFriendId}
                      onChange={(e) => setGiftFriendId(e.target.value)}
                      className="w-full bg-[#141824] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#20273a] focus:border-pink-400"
                    >
                      <option value="">-- {language === 'ku' ? 'هاوڕێیەک دیاریبکە' : 'Select a friend'} --</option>
                      {friends.map((f) => (
                        <option key={f.user.id} value={f.user.id}>
                          {f.user.displayName} (@{f.user.username})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={giftCoinAmount}
                      onChange={(e) => setGiftCoinAmount(Number(e.target.value))}
                      className="w-full sm:w-32 bg-[#141824] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#20273a] focus:border-pink-400 font-bold"
                      placeholder="Amount"
                    />

                    <button
                      type="submit"
                      disabled={!giftFriendId}
                      className="w-full sm:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20"
                    >
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>{language === 'ku' ? 'ناردنی دیاری' : 'Send Gift'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: GENERAL, AUDIO, LANGUAGE, NOTIFICATIONS */}
            {/* ========================================================= */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Language Switch */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-[#20273a] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">
                      {language === 'ku' ? 'زمانی ئەپەکە (App Language)' : 'Application Language'}
                    </h3>
                    <p className="text-[11px] text-[#6d758d]">
                      {language === 'ku' ? 'گۆڕینی زمان لە نێوان کوردی و ئینگلیزی' : 'Switch between Kurdish & English'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0e111a] p-1 rounded-xl border border-[#20273a]">
                    <button
                      type="button"
                      onClick={() => setLanguage('ku')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'ku'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'text-[#8b92a5] hover:text-white'
                      }`}
                    >
                      کوردی
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'en'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'text-[#8b92a5] hover:text-white'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Audio & Mic Settings */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-[#20273a] space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'ku' ? 'دەنگ و مایکرۆفۆن (Audio & Mic)' : 'Audio & Microphone'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        voiceState.isMuted
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : 'bg-[#0e111a] border-[#20273a] text-white hover:border-cyan-400'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {voiceState.isMuted
                          ? (language === 'ku' ? 'مایکرۆفۆن بێدەنگکراوە (Muted)' : 'Microphone Muted')
                          : (language === 'ku' ? 'مایکرۆفۆن کارایە (Unmuted)' : 'Microphone Active')}
                      </span>
                      {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleDeafen}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        voiceState.isDeafened
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                          : 'bg-[#0e111a] border-[#20273a] text-white hover:border-cyan-400'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {voiceState.isDeafened
                          ? (language === 'ku' ? 'کەڕکراوە (Deafened)' : 'Audio Deafened')
                          : (language === 'ku' ? 'دەنگی هۆڵەکان کارایە' : 'Audio Normal')}
                      </span>
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications Permission */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-[#20273a] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">
                      {language === 'ku' ? 'ئاگادارکردنەوەکان (Push Notifications)' : 'Push Notifications'}
                    </h3>
                    <p className="text-[11px] text-[#6d758d]">
                      {language === 'ku'
                        ? 'ئاگاداری نامە نوێیەکان و پەیوەندییەکان ببە'
                        : 'Receive alerts for incoming calls & new direct messages'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={requestPushPermission}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
                  >
                    {language === 'ku' ? 'چالاککردن' : 'Enable Alerts'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#0a0c13] border-t border-[#1c2233] flex items-center justify-between text-xs text-[#6d758d]">
            <span>KurdCord Pro Engine · v2.5</span>
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
            >
              {language === 'ku' ? 'تەواو (داخستن)' : 'Done'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
