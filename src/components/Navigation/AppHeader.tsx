import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  Circle,
  Coins,
  Crown,
  EyeOff,
  Globe,
  Headphones,
  Mic,
  MicOff,
  MinusCircle,
  Moon,
  Radio,
  Settings,
  Smile,
  Sparkles,
  LogOut,
  Users,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserStatus } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

const STATUS_CONFIG: Record<
  UserStatus,
  {
    labelKu: string;
    labelEn: string;
    descKu: string;
    descEn: string;
    color: string;
    badgeBg: string;
    badgeBorder: string;
  }
> = {
  online: {
    labelKu: 'سەرهێڵ (Online)',
    labelEn: 'Online',
    descKu: 'بەردەست و چالاکم بۆ پەیوەندی و چات',
    descEn: 'Available & ready to connect',
    color: '#23a55a',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
  },
  idle: {
    labelKu: 'بێکار (Idle / Away)',
    labelEn: 'Idle',
    descKu: 'کەمێک دوورکەوتوومەتەوە لە ئامێرەکە',
    descEn: 'Away from device',
    color: '#f0b232',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
  },
  dnd: {
    labelKu: 'بێزارم مەکە (Do Not Disturb)',
    labelEn: 'Do Not Disturb',
    descKu: 'ئاگادارکردنەوەکان کز بکە، کار دەکەم',
    descEn: 'Mute alerts & notifications',
    color: '#f23f43',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
  },
  offline: {
    labelKu: 'نادیار (Invisible)',
    labelEn: 'Invisible',
    descKu: 'وەک ناچالاک دەردەکەویت بەڵام کراوەیت',
    descEn: 'Appear offline to others',
    color: '#80848e',
    badgeBg: 'bg-slate-500/10',
    badgeBorder: 'border-slate-500/30',
  },
};

export const AppHeader: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setShopModalOpen,
    setOwnerPanelOpen,
    setProfileModalOpen,
    setSettingsModalOpen,
    currentUser,
    setUserStatus,
    language,
    setLanguage,
    t,
    friends,
    requestPushPermission,
    voiceState,
    toggleMute,
    toggleDeafen,
    leaveVoiceChannel,
    channels,
    logout,
  } = useApp();

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
    };

    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusMenuOpen]);

  const pendingCount = friends.filter((f) => f.status === 'pending_incoming').length;
  const currentVoiceRoom = channels.find((c) => c.id === voiceState.currentChannelId);

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#0e111a] border-b border-[#1c2233] flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Main Tabs */}
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('channels')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform font-black tracking-wider text-base">
            KC
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-white text-base leading-tight tracking-wide flex items-center gap-1.5">
              <span>کوردکۆرد</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded-md font-bold border border-cyan-500/20">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-[#6d758d]">
              {language === 'ku' ? 'پەیوەندی دەنگ، ڤیدیۆ و چات' : 'Voice, Video & Chat'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Distinct modern app tabs) */}
        <nav className="flex items-center gap-1.5 bg-[#141824] p-1 rounded-2xl border border-[#20273a]">
          {/* 1. Profile / Edit Profile Button (First item, displaying user avatar & name) */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all bg-[#1c2234] hover:bg-[#252d45] border border-cyan-500/40 text-white shadow-sm hover:shadow-cyan-500/10 group cursor-pointer"
            title={language === 'ku' ? 'دەستکاری کردنی پڕۆفایل' : 'Edit Profile'}
          >
            <UserAvatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="xs"
              status={currentUser.status}
              showStatusIndicator={true}
            />
            <span className="text-cyan-400 group-hover:text-cyan-300 font-extrabold max-w-[120px] truncate">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] text-[#8b92a5] group-hover:text-white bg-black/40 px-1.5 py-0.2 rounded font-medium">
              {language === 'ku' ? 'ئیدیت' : 'Edit'}
            </span>
          </button>

          {/* 2. Voice Lounges (ژوورەکانی دەنگ) & Settings */}
          <div className="flex items-center gap-1 bg-[#10141f] p-0.5 rounded-xl border border-[#1a2133]">
            <button
              onClick={() => setActiveView('channels')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeView === 'channels'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-[#8b92a5] hover:text-white hover:bg-[#1d2334]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'ژوورەکانی دەنگ' : 'Voice Lounges'}</span>
            </button>

            {/* Dedicated Settings Button right next to voice rooms */}
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#8b92a5] hover:text-cyan-400 hover:bg-[#1c2234] transition-all cursor-pointer group"
              title={language === 'ku' ? 'سیتینگی ژوورەکانی دەنگ و بەرنامە' : 'Voice & App Settings'}
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
              <span className="text-[11px] font-bold text-[#b5bccf] group-hover:text-white">
                {language === 'ku' ? 'سیتینگ' : 'Settings'}
              </span>
            </button>
          </div>

          {/* 3. Direct Messages & Calls */}
          <button
            onClick={() => setActiveView('dm')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeView === 'dm'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-[#8b92a5] hover:text-white hover:bg-[#1d2334]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'چاتی تایبەت و تەلەفۆن' : 'Messages & Calls'}</span>
          </button>

          {/* 4. Friends */}
          <button
            onClick={() => setActiveView('friends')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 relative ${
              activeView === 'friends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-[#8b92a5] hover:text-white hover:bg-[#1d2334]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.friends}</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Right Side: Active Voice Status, Coin Store, Owner VIP, Profile Widget */}
      <div className="flex items-center gap-3">
        {/* Active Voice Mini Indicator (if joined a room) */}
        {voiceState.currentChannelId && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="truncate max-w-[120px]">{currentVoiceRoom?.name}</span>
            <button
              onClick={leaveVoiceChannel}
              className="ms-1 text-rose-400 hover:text-rose-300 font-bold"
              title="Leave Room"
            >
              ✕
            </button>
          </div>
        )}

        {/* Coin Store Button (iTunes In-App Purchase) */}
        <button
          onClick={() => setShopModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 transition-all shadow-sm group"
          title={t.shop}
        >
          <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="font-extrabold text-xs">
            {currentUser.coins.toLocaleString()}
          </span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold text-amber-400/80 bg-amber-500/20 px-1.5 py-0.2 rounded">
            iTunes
          </span>
        </button>

        {/* Owner VIP Control Button (Special crown for app owner) */}
        <button
          onClick={() => setOwnerPanelOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            currentUser.isOwner
              ? 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white shadow-md shadow-amber-500/20 hover:scale-105'
              : 'bg-[#1a1f2e] text-amber-400 hover:bg-[#22293d] border border-[#2b334a]'
          }`}
          title={t.ownerPanel}
        >
          <Crown className="w-3.5 h-3.5 fill-amber-300 stroke-amber-100" />
          <span className="hidden sm:inline">
            {currentUser.isOwner ? (language === 'ku' ? 'پەناڵی خاوەن' : 'Owner VIP') : 'VIP'}
          </span>
        </button>

        {/* Notifications */}
        <button
          onClick={requestPushPermission}
          className="w-9 h-9 rounded-xl bg-[#141824] hover:bg-[#1d2334] border border-[#20273a] text-[#8b92a5] hover:text-white flex items-center justify-center transition-colors"
          title={t.notifications}
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ku' ? 'en' : 'ku')}
          className="w-9 h-9 rounded-xl bg-[#141824] hover:bg-[#1d2334] border border-[#20273a] text-[#8b92a5] hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
          title={t.language}
        >
          <span>{language === 'ku' ? 'EN' : 'کو'}</span>
        </button>

        {/* Dedicated Settings Button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1d2334] border border-[#20273a] hover:border-cyan-500/40 text-[#8b92a5] hover:text-white transition-all text-xs font-bold shadow-sm"
          title={language === 'ku' ? 'سیتینگ و ڕێکخستن' : 'Settings'}
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">{language === 'ku' ? 'سیتینگ' : 'Settings'}</span>
        </button>

        {/* User Profile & Availability Broadcast Section */}
        <div ref={statusMenuRef} className="relative flex items-center gap-2 ps-2 border-s border-[#1c2233]">
          {/* Main Profile & Status Pill Button */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#131722]/80 hover:bg-[#1a1f2e] border border-[#1f2638] transition-all">
            {/* Avatar with click to toggle status menu */}
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="relative p-0.5 rounded-full hover:scale-105 transition-transform cursor-pointer"
              title={language === 'ku' ? 'گۆڕینی دۆخی بەردەستبوون' : 'Change status / Broadcast availability'}
            >
              <UserAvatar
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                size="sm"
                status={currentUser.status}
              />
            </button>

            {/* User Name & Availability Trigger Pill */}
            <div className="hidden lg:flex flex-col text-start pe-1.5">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="text-xs font-bold text-white leading-tight truncate max-w-[110px] hover:text-cyan-400 transition-colors text-start"
                title={t.editProfile}
              >
                {currentUser.displayName}
              </button>

              {/* Status Broadcast Pill */}
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8b92a5] hover:text-white transition-colors cursor-pointer group/pill mt-0.5"
                title={language === 'ku' ? 'گۆڕینی دۆخی بەردەستبوون' : 'Broadcast Availability'}
              >
                <span
                  className="w-2 h-2 rounded-full relative shrink-0"
                  style={{ backgroundColor: STATUS_CONFIG[currentUser.status].color }}
                >
                  {currentUser.status === 'online' && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: STATUS_CONFIG[currentUser.status].color }}
                    />
                  )}
                </span>
                <span className="truncate max-w-[80px]">
                  {language === 'ku'
                    ? STATUS_CONFIG[currentUser.status].labelKu.split(' ')[0]
                    : STATUS_CONFIG[currentUser.status].labelEn}
                </span>
                <ChevronDown className="w-3 h-3 text-[#646d84] group-hover/pill:text-cyan-400 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Mic & Settings */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                voiceState.isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-[#141824] text-[#8b92a5] hover:text-white'
              }`}
              title={voiceState.isMuted ? t.unmute : t.mute}
            >
              {voiceState.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="w-7 h-7 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-[#8b92a5] hover:text-cyan-400 flex items-center justify-center text-xs transition-colors"
              title={language === 'ku' ? 'سیتینگ' : 'Settings'}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* STATUS SELECTOR DROPDOWN MODAL / MENU */}
          {statusMenuOpen && (
            <div className="absolute top-full mt-2 end-0 w-72 bg-[#12151f] border border-[#232a3d] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              {/* Header */}
              <div className="px-3 py-2 border-b border-[#1f2638] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'ku' ? 'دۆخی بەردەستبوون' : 'Broadcast Availability'}</span>
                  </div>
                  <div className="text-[10px] text-[#8b92a5] mt-0.5">
                    {language === 'ku'
                      ? 'دۆخی خۆت بگۆڕە بۆ هەموو هاوڕێیان و ژوورەکان'
                      : 'Broadcast your current status to everyone'}
                  </div>
                </div>
              </div>

              {/* Status Options */}
              <div className="py-1 space-y-1">
                {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((stKey) => {
                  const cfg = STATUS_CONFIG[stKey];
                  const isActive = currentUser.status === stKey;

                  return (
                    <button
                      key={stKey}
                      onClick={() => {
                        setUserStatus(stKey);
                        setStatusMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-start transition-all cursor-pointer ${
                        isActive
                          ? `${cfg.badgeBg} ${cfg.badgeBorder} border`
                          : 'hover:bg-[#181d2b] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom Dot / Indicator Icon */}
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
                          style={{
                            borderColor: cfg.color,
                            backgroundColor: `${cfg.color}20`,
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                        </div>

                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : 'text-[#cfd4e2]'
                            }`}
                          >
                            {language === 'ku' ? cfg.labelKu : cfg.labelEn}
                          </div>
                          <div className="text-[10px] text-[#788198] leading-tight">
                            {language === 'ku' ? cfg.descKu : cfg.descEn}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Status & Profile Footer */}
              <div className="pt-2 mt-1 border-t border-[#1f2638] flex flex-col gap-1">
                {currentUser.customStatusText && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#161a26] border border-[#20273a] text-[11px] text-[#cfd4e2] flex items-center gap-2 mb-1">
                    <span>{currentUser.customStatusEmoji || '✨'}</span>
                    <span className="truncate">{currentUser.customStatusText}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setStatusMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#181d2b] hover:bg-[#20273a] text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'گۆڕینی پڕۆفایل و ڕەوشی تایبەت' : 'Edit Profile & Custom Status'}</span>
                </button>

                <button
                  onClick={() => {
                    setStatusMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-500/20 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'دەرچوون لە ئەکاونت (Log Out)' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
