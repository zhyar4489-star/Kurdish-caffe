import React from 'react';
import {
  Bell,
  Crown,
  Globe,
  Headphones,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ServerSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setShopModalOpen,
    setOwnerPanelOpen,
    currentUser,
    language,
    setLanguage,
    t,
    requestPushPermission,
  } = useApp();

  return (
    <nav aria-label="Server and Navigation" className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0 select-none z-20 border-r border-[#111214]/50">
      {/* Home / Direct Messages & Friends */}
      <button
        onClick={() => setActiveView('friends')}
        className={`relative group w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center ${
          activeView === 'friends' || activeView === 'dm'
            ? 'bg-[#5865f2] rounded-[16px] text-white'
            : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white'
        }`}
        title={t.directMessages}
      >
        <MessageSquare className="w-6 h-6" />
        <span
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            activeView === 'friends' || activeView === 'dm'
              ? 'h-10'
              : 'h-0 group-hover:h-5'
          }`}
        />
      </button>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />

      {/* Main Community Server (KurdCord) */}
      <button
        onClick={() => setActiveView('channels')}
        className={`relative group w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center font-bold text-sm overflow-hidden ${
          activeView === 'channels'
            ? 'bg-[#5865f2] rounded-[16px] text-white ring-2 ring-[#5865f2]'
            : 'bg-[#2b2d31] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white'
        }`}
        title="KurdCord Server (ژوور و کەناڵەکان)"
      >
        <span className="text-base tracking-wider font-extrabold text-white">KC</span>
        <span
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            activeView === 'channels' ? 'h-10' : 'h-0 group-hover:h-5'
          }`}
        />
      </button>

      {/* Coin Shop & iTunes Purchase */}
      <button
        onClick={() => setShopModalOpen(true)}
        className="relative group w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex flex-col items-center justify-center bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white hover:shadow-lg hover:shadow-amber-500/20"
        title={`${t.shop} - ${currentUser.coins.toLocaleString()} Coins`}
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-[10px] font-black leading-tight mt-0.5">
          {currentUser.coins > 9999 ? `${Math.floor(currentUser.coins / 1000)}k` : currentUser.coins}
        </span>
      </button>

      {/* Owner VIP Control Panel (Available to app owner) */}
      <button
        onClick={() => setOwnerPanelOpen(true)}
        className={`relative group w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex flex-col items-center justify-center ${
          currentUser.isOwner
            ? 'bg-gradient-to-tr from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] text-white ring-2 ring-amber-400 shadow-md shadow-purple-500/30'
            : 'bg-[#2b2d31] text-amber-400 hover:bg-[#313338]'
        }`}
        title={t.ownerPanel}
      >
        <Crown className="w-6 h-6 fill-amber-300 stroke-amber-100" />
      </button>

      <div className="flex-1" />

      {/* Push Notifications Permission */}
      <button
        onClick={requestPushPermission}
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#949ba4] hover:text-white hover:bg-[#35373c] transition-colors"
        title={t.enableNotifications}
      >
        <Bell className="w-5 h-5" />
      </button>

      {/* Language Switcher */}
      <button
        onClick={() => setLanguage(language === 'ku' ? 'en' : 'ku')}
        className="w-10 h-10 rounded-full flex items-center justify-center text-[#949ba4] hover:text-white hover:bg-[#35373c] transition-colors text-xs font-bold"
        title={t.language}
      >
        <Globe className="w-4 h-4 mr-1" />
        <span>{language === 'ku' ? 'EN' : 'کوردی'}</span>
      </button>
    </nav>
  );
};
