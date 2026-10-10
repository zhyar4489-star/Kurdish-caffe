import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  COMMUNITY_USERS,
  INITIAL_APPLE_TRANSACTIONS,
  INITIAL_CHANNELS,
  INITIAL_FRIENDS,
  INITIAL_MESSAGES,
  INITIAL_OWNER,
  PRESET_ITUNES_CARDS,
} from '../data/mockData';
import {
  AppleTransaction,
  CallSession,
  Channel,
  FriendRelationship,
  GiftItem,
  Message,
  ShopPackage,
  User,
  UserStatus,
  VoiceChannelState,
} from '../types';
import {
  getLocalDisplayMedia,
  getLocalUserMedia,
  monitorAudioVolume,
} from '../utils/mediaStream';
import {
  dispatchInAppNotification,
  InAppNotification,
  requestNotificationPermission,
  subscribeToNotifications,
} from '../utils/notifications';
import {
  playApplePaySuccess,
  playCoinSound,
  playJoinVoiceSound,
  playLeaveVoiceSound,
  playMessagePing,
  playMuteSound,
  playUnmuteSound,
  startIncomingRingtone,
  startOutgoingRingtone,
  stopRingtone,
} from '../utils/soundEffects';
import { Language, translations } from '../utils/translations';

interface AppContextType {
  // Current User
  currentUser: User;
  updateProfile: (updates: Partial<User>) => void;
  setUserStatus: (status: UserStatus) => void;
  addCoins: (amount: number, reason?: string) => void;
  spendCoins: (amount: number) => boolean;
  switchUserRole: (isOwner: boolean) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ku'];

  // Navigation & Views
  activeView: 'channels' | 'friends' | 'dm';
  setActiveView: (view: 'channels' | 'friends' | 'dm') => void;
  currentChannelId: string;
  selectChannel: (channelId: string) => void;
  activeDmUser: User | null;
  selectDm: (user: User) => void;

  // Channels
  channels: Channel[];

  // Friends System
  friends: FriendRelationship[];
  sendFriendRequest: (username: string) => { success: boolean; message: string };
  acceptFriendRequest: (relationshipId: string) => void;
  declineFriendRequest: (relationshipId: string) => void;
  cancelFriendRequest: (relationshipId: string) => void;
  removeFriend: (friendUserId: string) => void;

  // Chat & Messages
  messages: Record<string, Message[]>;
  sendMessage: (
    targetId: string,
    text: string,
    attachment?: { type: 'image' | 'audio'; url: string; name?: string },
    gift?: GiftItem
  ) => void;
  toggleReaction: (targetId: string, messageId: string, emoji: string) => void;
  pinnedUserIds: string[];
  togglePinChat: (userId: string) => void;

  // Voice Rooms
  voiceState: VoiceChannelState;
  joinVoiceChannel: (channelId: string) => Promise<void>;
  leaveVoiceChannel: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleVoiceVideo: () => Promise<void>;
  toggleVoiceScreenShare: () => Promise<void>;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;

  // Calls (Voice & Video)
  callSession: CallSession | null;
  startCall: (participant: User, type: 'voice' | 'video') => void;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;
  toggleCallScreen: () => void;
  incomingCallSimulate: (caller: User, type: 'voice' | 'video') => void;

  // Modals & Settings
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  shopModalOpen: boolean;
  setShopModalOpen: (open: boolean) => void;
  ownerPanelOpen: boolean;
  setOwnerPanelOpen: (open: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;

  // Account Management & Switching
  savedAccounts: User[];
  switchAccount: (userId: string) => void;
  addNewAccount: (userData: { displayName: string; username: string; email: string; avatarUrl?: string }) => void;
  logoutAccount: () => void;

  // Authentication System
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => { success: boolean; message: string };
  register: (userData: { displayName: string; username: string; email: string; password?: string; avatarUrl?: string }) => { success: boolean; message: string };
  loginWithApple: () => void;
  logout: () => void;

  // Multi-Owner System
  ownerUserIds: string[];
  addAppOwner: (userIdOrUsername: string) => { success: boolean; message: string };
  removeAppOwner: (userId: string) => { success: boolean; message: string };
  allOwners: User[];
  isPrimaryOwner: boolean;

  // Notifications
  notifications: InAppNotification[];
  dismissNotification: (id: string) => void;
  requestPushPermission: () => Promise<void>;

  // Apple iTunes & App Store Ecosystem
  appleIdBalance: number;
  appleTransactions: AppleTransaction[];
  redeemAppleGiftCard: (code: string, destination: 'balance' | 'coins') => {
    success: boolean;
    amountUSD: number;
    coinsGranted?: number;
    message: string;
    receiptId: string;
  };
  purchaseWithAppleId: (pkg: ShopPackage, passwordEntered?: string) => {
    success: boolean;
    message: string;
    receiptId?: string;
  };
  topUpAppleBalance: (amountUSD: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kurdcord_lang');
    return (saved === 'en' ? 'en' : 'ku') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kurdcord_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ku' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ku' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];

  // 2. Current User State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('kurdcord_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_OWNER;
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const updateProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const setUserStatus = (status: UserStatus) => {
    setCurrentUser((prev) => ({ ...prev, status }));
  };

  const addCoins = (amount: number, reason?: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
    playCoinSound();
    if (reason) {
      dispatchInAppNotification({
        id: `coin_${Date.now()}`,
        type: 'coin_gift',
        title: language === 'ku' ? 'سکەی نوێ وەرگیرا!' : 'Coins Received!',
        body: reason,
        timestamp: Date.now(),
      });
    }
  };

  const spendCoins = (amount: number): boolean => {
    if (currentUser.coins < amount) {
      return false;
    }
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins - amount,
    }));
    return true;
  };

  const switchUserRole = (isOwner: boolean) => {
    setCurrentUser((prev) => ({
      ...prev,
      isOwner,
      displayName: isOwner ? 'Zhyar (خاوەنی ئەپ)' : 'Zhyar (ئەندامی ئاسایی)',
      badges: isOwner
        ? ['owner', 'nitro', 'early', 'verified', 'dev']
        : ['nitro'],
    }));
  };

  // Apple ID Balance & iTunes Ecosystem
  const [appleIdBalance, setAppleIdBalance] = useState<number>(() => {
    const saved = localStorage.getItem('kurdcord_apple_balance');
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val)) return val;
    }
    return 25.0; // Default $25.00 Apple ID Balance
  });

  const [appleTransactions, setAppleTransactions] = useState<AppleTransaction[]>(() => {
    const saved = localStorage.getItem('kurdcord_apple_txs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_APPLE_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_apple_balance', appleIdBalance.toString());
  }, [appleIdBalance]);

  useEffect(() => {
    localStorage.setItem('kurdcord_apple_txs', JSON.stringify(appleTransactions));
  }, [appleTransactions]);

  const topUpAppleBalance = (amountUSD: number) => {
    setAppleIdBalance((prev) => +(prev + amountUSD).toFixed(2));
  };

  const redeemAppleGiftCard = (code: string, destination: 'balance' | 'coins') => {
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanCode || cleanCode.length < 8) {
      return {
        success: false,
        amountUSD: 0,
        message:
          language === 'ku'
            ? 'تکایە کۆدی دروستی کارتی ئایتوونس داخڵ بکە (١٦ پیت و ژمارە)'
            : 'Please enter a valid 16-character iTunes card code',
        receiptId: '',
      };
    }

    const matchedPreset = PRESET_ITUNES_CARDS.find(
      (c) => c.code.replace(/[^A-Z0-9]/g, '') === cleanCode
    );

    let valueUSD = 25.0;
    let coinsEquiv = 3800;

    if (matchedPreset) {
      valueUSD = matchedPreset.valueUSD;
      coinsEquiv = matchedPreset.equivalentCoins;
    } else {
      if (cleanCode.endsWith('10') || cleanCode.startsWith('10')) {
        valueUSD = 10;
        coinsEquiv = 1250;
      } else if (cleanCode.endsWith('50') || cleanCode.startsWith('50')) {
        valueUSD = 50;
        coinsEquiv = 8500;
      } else if (cleanCode.endsWith('100') || cleanCode.startsWith('100')) {
        valueUSD = 100;
        coinsEquiv = 18000;
      } else {
        valueUSD = 25;
        coinsEquiv = 3800;
      }
    }

    const receiptId = `GFT-${Math.floor(100000 + Math.random() * 900000)}-APPL`;
    const masked = `${cleanCode.slice(0, 4)}-••••-••••-${cleanCode.slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (destination === 'coins') {
      addCoins(coinsEquiv, `${coinsEquiv.toLocaleString()} Coins via iTunes Card $${valueUSD}`);
      const newTx: AppleTransaction = {
        id: receiptId,
        type: 'itunes_card_redeem',
        title: `$${valueUSD} Apple iTunes Gift Card (${coinsEquiv.toLocaleString()} سکە)`,
        amountUSD: valueUSD,
        coinsReceived: coinsEquiv,
        date: nowStr,
        timestamp: Date.now(),
        appleId: currentUser.email || 'zhyar4489@gmail.com',
        status: 'Completed',
        cardCodeMasked: masked,
      };
      setAppleTransactions((prev) => [newTx, ...prev]);
    } else {
      setAppleIdBalance((prev) => +(prev + valueUSD).toFixed(2));
      const newTx: AppleTransaction = {
        id: receiptId,
        type: 'itunes_card_redeem',
        title: `$${valueUSD} Apple iTunes Gift Card (Top-up Balance)`,
        amountUSD: valueUSD,
        coinsReceived: 0,
        date: nowStr,
        timestamp: Date.now(),
        appleId: currentUser.email || 'zhyar4489@gmail.com',
        status: 'Completed',
        cardCodeMasked: masked,
      };
      setAppleTransactions((prev) => [newTx, ...prev]);
    }

    playApplePaySuccess();

    return {
      success: true,
      amountUSD: valueUSD,
      coinsGranted: destination === 'coins' ? coinsEquiv : undefined,
      message:
        destination === 'coins'
          ? (language === 'ku'
              ? `کارتی $${valueUSD} بە سەرکەوتوویی داخلکرا و ${coinsEquiv.toLocaleString()} سکە خرایە سەر هەژمارەکەت!`
              : `Successfully redeemed $${valueUSD} card for ${coinsEquiv.toLocaleString()} coins!`)
          : (language === 'ku'
              ? `بڕی $${valueUSD} زیادکرا بۆ باڵانسی ئەکاونتی Apple ID تۆ!`
              : `Added $${valueUSD} to your Apple ID account balance!`),
      receiptId,
    };
  };

  const purchaseWithAppleId = (pkg: ShopPackage, _passwordEntered?: string) => {
    if (appleIdBalance < pkg.priceUSD) {
      return {
        success: false,
        message:
          language === 'ku'
            ? `باڵانسی ئەپل ئایدیت بەش ناکات ($${appleIdBalance.toFixed(2)} هەیە، بەڵام ئەم پاکێجە پێویستی بە $${pkg.priceUSD.toFixed(2)} هەیە). تکایە کۆدی کارتی ئایتوونس داخل بکە بۆ زیادکردنی دۆلار.`
            : `Insufficient Apple ID balance ($${appleIdBalance.toFixed(2)} available, but item requires $${pkg.priceUSD.toFixed(2)}). Please redeem an iTunes gift card to top up.`,
      };
    }

    // Deduct from Apple ID balance
    setAppleIdBalance((prev) => +(prev - pkg.priceUSD).toFixed(2));

    const totalCoins = pkg.coins + pkg.bonusCoins;
    addCoins(totalCoins, `${totalCoins.toLocaleString()} Coins via Apple ID (${pkg.titleKu})`);

    const receiptId = `ITN-${Math.floor(100000 + Math.random() * 900000)}-AAPL`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTx: AppleTransaction = {
      id: receiptId,
      type: 'apple_id_purchase',
      title: language === 'ku' ? pkg.titleKu : pkg.titleEn,
      amountUSD: pkg.priceUSD,
      coinsReceived: totalCoins,
      date: nowStr,
      timestamp: Date.now(),
      appleId: currentUser.email || 'zhyar4489@gmail.com',
      status: 'Approved',
    };
    setAppleTransactions((prev) => [newTx, ...prev]);

    playApplePaySuccess();

    return {
      success: true,
      receiptId,
      message:
        language === 'ku'
          ? `کڕینەکە بە سەرکەوتوویی لە ڕێگەی Apple ID پەسەندکرا! بڕی ${totalCoins.toLocaleString()} سکە بۆ باڵانسی ئەپەکە زیادکرا.`
          : `Purchase authorized via Apple ID! ${totalCoins.toLocaleString()} coins added to your account.`,
    };
  };

  // Saved Accounts and Account Switching
  const [savedAccounts, setSavedAccounts] = useState<User[]>(() => {
    const saved = localStorage.getItem('kurdcord_saved_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return [INITIAL_OWNER, COMMUNITY_USERS[0], COMMUNITY_USERS[1]];
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  const switchAccount = (userId: string) => {
    // Keep savedAccounts updated with latest current user
    setSavedAccounts((prev) => {
      const idx = prev.findIndex((a) => a.id === currentUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = currentUser;
        return copy;
      }
      return [...prev, currentUser];
    });

    const target =
      savedAccounts.find((a) => a.id === userId) ||
      COMMUNITY_USERS.find((u) => u.id === userId);

    if (target) {
      setCurrentUser(target);
      dispatchInAppNotification({
        id: `switch_${Date.now()}`,
        type: 'friend_accepted',
        title: language === 'ku' ? 'ئەکاونت گۆڕدرا' : 'Account Switched',
        body: `${language === 'ku' ? 'چوویتە ناو هەژماری' : 'Switched to'} ${target.displayName}`,
        avatar: target.avatarUrl,
        timestamp: Date.now(),
      });
    }
  };

  const addNewAccount = (data: {
    displayName: string;
    username: string;
    email: string;
    avatarUrl?: string;
  }) => {
    const cleanUsername = data.username.trim().replace(/^@/, '');
    const newAcc: User = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      displayName: data.displayName.trim() || cleanUsername,
      email: data.email.trim() || `${cleanUsername}@kurdcord.io`,
      avatarUrl:
        data.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bannerColor: '#1e293b',
      accentColor: '#06b6d4',
      bio: 'ئەندامی نوێ لە کوردکۆرد 🚀',
      status: 'online',
      badges: ['nitro'],
      coins: 2000,
      isOwner: false,
      joinedAt: 'ئێستا',
    };

    setSavedAccounts((prev) => {
      const exists = prev.some(
        (a) =>
          a.id === newAcc.id ||
          a.username.toLowerCase() === newAcc.username.toLowerCase()
      );
      if (exists) return prev;
      return [...prev, newAcc];
    });
    setCurrentUser(newAcc);

    dispatchInAppNotification({
      id: `acc_new_${Date.now()}`,
      type: 'friend_accepted',
      title: language === 'ku' ? 'ئەکاونتی نوێ دروستکرا 🎉' : 'New Account Created 🎉',
      body: `${newAcc.displayName} (@${newAcc.username}) ${
        language === 'ku' ? 'بە سەرکەوتوویی زیادکرا و کرایەوە' : 'is now active'
      }`,
      avatar: newAcc.avatarUrl,
      timestamp: Date.now(),
    });
  };

  // 3. Authentication System
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kurdcord_authenticated') === 'true';
  });

  const login = (identifier: string, _password?: string) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return {
        success: false,
        message: language === 'ku' ? 'تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە' : 'Please enter email or username',
      };
    }

    const found = savedAccounts.find(
      (a) =>
        a.email.toLowerCase() === clean ||
        a.username.toLowerCase() === clean ||
        a.username.toLowerCase() === clean.replace('@', '')
    );

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('kurdcord_authenticated', 'true');
      localStorage.setItem('kurdcord_user', JSON.stringify(found));
      playApplePaySuccess();
      return {
        success: true,
        message: language === 'ku' ? `بەخێربێیتەوە، ${found.displayName}!` : `Welcome back, ${found.displayName}!`,
      };
    }

    const dynamicUser: User = {
      id: `user_${Date.now()}`,
      username: clean.replace(/[@\s]/g, '_'),
      displayName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      email: identifier.includes('@') ? clean : `${clean}@kurdcord.io`,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      bannerColor: '#171a24',
      accentColor: '#06b6d4',
      bio: language === 'ku' ? 'سڵاو لە هەمووان!' : 'Hello everyone!',
      status: 'online',
      badges: ['early'],
      coins: 500,
      isOwner: clean.includes('zhyar'),
      joinedAt: 'October 2026',
    };

    setSavedAccounts((prev) => [dynamicUser, ...prev]);
    setCurrentUser(dynamicUser);
    setIsAuthenticated(true);
    localStorage.setItem('kurdcord_authenticated', 'true');
    localStorage.setItem('kurdcord_user', JSON.stringify(dynamicUser));
    playApplePaySuccess();

    return {
      success: true,
      message: language === 'ku' ? `بەخێربێیت، ${dynamicUser.displayName}!` : `Welcome, ${dynamicUser.displayName}!`,
    };
  };

  const register = (data: {
    displayName: string;
    username: string;
    email: string;
    password?: string;
    avatarUrl?: string;
  }) => {
    const cleanUser = data.username.trim().replace(/^@/, '');
    if (!cleanUser || !data.displayName.trim()) {
      return {
        success: false,
        message: language === 'ku' ? 'تکایە ناو و ناوی بەکارهێنەر پڕبکەرەوە' : 'Please provide name and username',
      };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUser,
      displayName: data.displayName.trim(),
      email: data.email.trim() || `${cleanUser}@kurdcord.io`,
      avatarUrl:
        data.avatarUrl?.trim() ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      bannerColor: '#171a24',
      accentColor: '#06b6d4',
      bio: language === 'ku' ? 'ئەندامی نوێی کوردکۆرد ✨' : 'New KurdCord Member ✨',
      status: 'online',
      badges: ['early', 'verified'],
      coins: 1000,
      isOwner: cleanUser.toLowerCase().includes('zhyar'),
      joinedAt: 'October 2026',
    };

    setSavedAccounts((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('kurdcord_authenticated', 'true');
    localStorage.setItem('kurdcord_user', JSON.stringify(newUser));
    playApplePaySuccess();

    dispatchInAppNotification({
      id: `welcome_${Date.now()}`,
      type: 'coin_gift',
      title: language === 'ku' ? 'بەخێربێیت بۆ کوردکۆرد! 🎉' : 'Welcome to KurdCord! 🎉',
      body:
        language === 'ku'
          ? `ئەکاونتەکەت بە سەرکەوتوویی دروستکرا و +١,٠٠٠ سکەی دیاری وەرگرت!`
          : `Account created successfully and +1,000 bonus coins received!`,
      avatar: newUser.avatarUrl,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: language === 'ku' ? 'ئەکاونتەکەت بە سەرکەوتوویی دروستکرا!' : 'Account created successfully!',
    };
  };

  const loginWithApple = () => {
    const ownerOrFirst = savedAccounts.find((a) => a.email.includes('zhyar')) || INITIAL_OWNER;
    setCurrentUser(ownerOrFirst);
    setIsAuthenticated(true);
    localStorage.setItem('kurdcord_authenticated', 'true');
    localStorage.setItem('kurdcord_user', JSON.stringify(ownerOrFirst));
    playApplePaySuccess();
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kurdcord_authenticated');
  };

  const logoutAccount = () => {
    logout();
  };

  // 3. Navigation & Channels
  const [activeView, setActiveView] = useState<'channels' | 'friends' | 'dm'>('channels');
  const [currentChannelId, setCurrentChannelId] = useState<string>('ch_welcome');
  const [activeDmUser, setActiveDmUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);

  const selectChannel = (channelId: string) => {
    setCurrentChannelId(channelId);
    setActiveView('channels');
    setActiveDmUser(null);
  };

  const selectDm = (user: User) => {
    setActiveDmUser(user);
    setActiveView('dm');
  };

  // 4. Friends System
  const [friends, setFriends] = useState<FriendRelationship[]>(() => {
    const saved = localStorage.getItem('kurdcord_friends');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_FRIENDS;
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_friends', JSON.stringify(friends));
  }, [friends]);

  // Multi-Owner System State
  const [ownerUserIds, setOwnerUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kurdcord_app_owners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.includes(INITIAL_OWNER.id)) {
          return parsed;
        }
        return [INITIAL_OWNER.id, ...(Array.isArray(parsed) ? parsed : [])];
      } catch {
        // ignore
      }
    }
    return [INITIAL_OWNER.id];
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_app_owners', JSON.stringify(ownerUserIds));
  }, [ownerUserIds]);

  const isPrimaryOwner =
    currentUser.email.toLowerCase() === 'zhyar4489@gmail.com' ||
    currentUser.username.toLowerCase() === 'zhyar4489' ||
    currentUser.id === INITIAL_OWNER.id;

  const addAppOwner = (userIdOrUsername: string): { success: boolean; message: string } => {
    if (!isPrimaryOwner) {
      return {
        success: false,
        message:
          language === 'ku'
            ? 'تەنها لە ئەکاونتی خاوەنی سەرەکی (Zhyar) دەتوانیت ئۆنەر زیادبکەیت!'
            : 'Only the primary creator account (Zhyar) can assign new owners!',
      };
    }

    const clean = userIdOrUsername.trim().toLowerCase().replace(/^@/, '');
    if (!clean) {
      return {
        success: false,
        message: language === 'ku' ? 'تکایە ناوی بەکارهێنەر یان ئیمەیڵ بنووسە' : 'Please enter a username or ID',
      };
    }

    const matchedFriend = friends.find(
      (f) =>
        f.user.id.toLowerCase() === clean ||
        f.user.username.toLowerCase() === clean ||
        f.user.email.toLowerCase() === clean
    );
    const matchedUser = matchedFriend
      ? matchedFriend.user
      : COMMUNITY_USERS.find(
          (u) =>
            u.id.toLowerCase() === clean ||
            u.username.toLowerCase() === clean ||
            u.email.toLowerCase() === clean
        );

    const targetUser = matchedUser || {
      id: `user_owner_${Date.now()}`,
      username: clean,
      displayName: clean,
      email: `${clean}@kurdcord.io`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`,
      bannerColor: '#2b0938',
      accentColor: '#5865f2',
      bio: 'خاوەنی هاوبەش لە کوردکۆرد 👑 | Co-Owner',
      status: 'online' as UserStatus,
      badges: ['owner', 'nitro', 'verified'],
      coins: 50000,
      isOwner: true,
      joinedAt: 'Recent',
    };

    if (ownerUserIds.includes(targetUser.id)) {
      return {
        success: false,
        message: language === 'ku' ? 'ئەم کەسە پێشتر خاوەنی ئەپەکەیە!' : 'This user is already an owner!',
      };
    }

    setOwnerUserIds((prev) => [...prev, targetUser.id]);

    setFriends((prev) =>
      prev.map((f) => {
        if (f.user.id === targetUser.id || f.user.username.toLowerCase() === clean) {
          return {
            ...f,
            user: {
              ...f.user,
              isOwner: true,
              badges: Array.from(new Set([...f.user.badges, 'owner'])),
            },
          };
        }
        return f;
      })
    );

    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        activeUsers: c.activeUsers?.map((u) =>
          u.id === targetUser.id ? { ...u, isOwner: true, badges: Array.from(new Set([...u.badges, 'owner'])) } : u
        ),
      }))
    );

    dispatchInAppNotification({
      id: `owner_added_${Date.now()}`,
      type: 'friend_accepted',
      title: language === 'ku' ? 'خاوەنی نوێ دیاریکرا 👑' : 'New Owner Appointed 👑',
      body: `${targetUser.displayName} (@${targetUser.username}) ${
        language === 'ku'
          ? 'کرا بە خاوەنی هاوبەشی ئەپەکە (Co-Owner)'
          : 'has been granted full App Owner privileges'
      }`,
      avatar: targetUser.avatarUrl,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: `${targetUser.displayName} ${
        language === 'ku' ? 'بە سەرکەوتوویی کرا بە خاوەنی ئەپ 👑' : 'successfully added as App Owner 👑'
      }`,
    };
  };

  const removeAppOwner = (userId: string): { success: boolean; message: string } => {
    if (!isPrimaryOwner) {
      return {
        success: false,
        message:
          language === 'ku'
            ? 'تەنها لە ئەکاونتی خاوەنی سەرەکی (Zhyar) دەتوانیت ئۆنەر لاببەیت!'
            : 'Only the primary creator account (Zhyar) can remove owners!',
      };
    }

    if (userId === INITIAL_OWNER.id) {
      return {
        success: false,
        message: language === 'ku' ? 'ناتوانیت خاوەنی سەرەکی (Zhyar) لاببەیت!' : 'Cannot remove primary creator!',
      };
    }

    setOwnerUserIds((prev) => prev.filter((id) => id !== userId));

    setFriends((prev) =>
      prev.map((f) => {
        if (f.user.id === userId) {
          return {
            ...f,
            user: {
              ...f.user,
              isOwner: false,
              badges: f.user.badges.filter((b) => b !== 'owner'),
            },
          };
        }
        return f;
      })
    );

    return {
      success: true,
      message: language === 'ku' ? 'پلەی خاوەن لادرا' : 'Owner privileges removed',
    };
  };

  const allOwners: User[] = [
    currentUser.isOwner ? currentUser : INITIAL_OWNER,
    ...friends
      .filter((f) => ownerUserIds.includes(f.user.id) && f.user.id !== currentUser.id)
      .map((f) => ({ ...f.user, isOwner: true })),
    ...COMMUNITY_USERS.filter(
      (u) =>
        ownerUserIds.includes(u.id) &&
        u.id !== currentUser.id &&
        !friends.some((f) => f.user.id === u.id)
    ).map((u) => ({ ...u, isOwner: true })),
  ];

  const sendFriendRequest = (username: string): { success: boolean; message: string } => {
    const trimmed = username.trim().toLowerCase().replace(/^@/, '');
    if (!trimmed) {
      return { success: false, message: language === 'ku' ? 'تکایە ناوی بەکارهێنەر بنووسە' : 'Please enter a username' };
    }

    if (trimmed === currentUser.username.toLowerCase()) {
      return { success: false, message: language === 'ku' ? 'ناتوانیت داواکاری بۆ خۆت بنێریت!' : 'You cannot send a friend request to yourself!' };
    }

    const existing = friends.find(
      (f) => f.user.username.toLowerCase() === trimmed
    );
    if (existing) {
      if (existing.status === 'friend') {
        return { success: false, message: language === 'ku' ? 'ئەم بەکارهێنەرە پێشتر هاوڕێتە!' : 'This user is already your friend!' };
      }
      return { success: false, message: language === 'ku' ? 'پێشتر داواکارییەکی چاوەڕوانکراو هەیە بۆ ئەم کەسە' : 'A pending request already exists for this user.' };
    }

    // Check community users or create simulated friend target
    const targetUser = COMMUNITY_USERS.find(
      (u) => u.username.toLowerCase() === trimmed
    ) || {
      id: `user_${Date.now()}`,
      username: trimmed,
      displayName: trimmed,
      email: `${trimmed}@kurdcord.io`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmed}`,
      bannerColor: '#2b0938',
      accentColor: '#5865f2',
      bio: 'ئەندامی نوێ لە کوردکۆرد ✨',
      status: 'online' as UserStatus,
      badges: ['early'],
      coins: 500,
      isOwner: false,
      joinedAt: 'Recent',
    };

    const newRel: FriendRelationship = {
      id: `rel_${Date.now()}`,
      user: targetUser,
      status: 'pending_outgoing',
      createdAt: Date.now(),
    };

    setFriends((prev) => [newRel, ...prev]);

    // Simulate auto-acceptance after 7 seconds if sending to community user
    setTimeout(() => {
      setFriends((current) =>
        current.map((r) =>
          r.id === newRel.id ? { ...r, status: 'friend' } : r
        )
      );
      playMessagePing();
      dispatchInAppNotification({
        id: `acc_${Date.now()}`,
        type: 'friend_accepted',
        title: language === 'ku' ? 'داواکاری هاوڕێیەتی قبوڵکرا! 🎉' : 'Friend Request Accepted! 🎉',
        body: `${targetUser.displayName} (@${targetUser.username}) ${
          language === 'ku'
            ? 'داواکارییەکەت پەسەند کرد، ئێستا دەتوانن قسە بکەن'
            : 'accepted your friend request. You can now chat!'
        }`,
        avatar: targetUser.avatarUrl,
        timestamp: Date.now(),
        onClick: () => selectDm(targetUser),
      });
    }, 7000);

    return {
      success: true,
      message: `${language === 'ku' ? 'داواکاری هاوڕێیەتی نێردرا بۆ' : 'Friend request sent to'} @${targetUser.username}`,
    };
  };

  const acceptFriendRequest = (relationshipId: string) => {
    setFriends((prev) =>
      prev.map((r) => {
        if (r.id === relationshipId) {
          playMessagePing();
          dispatchInAppNotification({
            id: `accept_${Date.now()}`,
            type: 'friend_accepted',
            title: language === 'ku' ? 'هاوڕێیەتی قبوڵکرا' : 'Friend Added',
            body: `${r.user.displayName} ${
              language === 'ku' ? 'زیادکرا بۆ لیستی هاوڕێکانت' : 'is now in your friends list'
            }`,
            avatar: r.user.avatarUrl,
            timestamp: Date.now(),
          });
          return { ...r, status: 'friend' };
        }
        return r;
      })
    );
  };

  const declineFriendRequest = (relationshipId: string) => {
    setFriends((prev) => prev.filter((r) => r.id !== relationshipId));
  };

  const cancelFriendRequest = (relationshipId: string) => {
    setFriends((prev) => prev.filter((r) => r.id !== relationshipId));
  };

  const removeFriend = (friendUserId: string) => {
    setFriends((prev) => prev.filter((r) => r.user.id !== friendUserId));
  };

  // Pinned Chats
  const [pinnedUserIds, setPinnedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kurdcord_pinned_chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return ['user_alan'];
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_pinned_chats', JSON.stringify(pinnedUserIds));
  }, [pinnedUserIds]);

  const togglePinChat = (userId: string) => {
    setPinnedUserIds((prev) => {
      const isPinned = prev.includes(userId);
      if (isPinned) {
        return prev.filter((id) => id !== userId);
      } else {
        return [userId, ...prev];
      }
    });
  };

  // 5. Chat & Messages
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('kurdcord_msgs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem('kurdcord_msgs', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (
    targetId: string,
    text: string,
    attachment?: { type: 'image' | 'audio'; url: string; name?: string },
    gift?: GiftItem
  ) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: targetId.startsWith('ch_') ? targetId : undefined,
      dmId: !targetId.startsWith('ch_') ? targetId : undefined,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      senderBadge: currentUser.isOwner ? '👑 خاوەنی ئەپ' : undefined,
      text,
      timestamp: Date.now(),
      attachment,
      gift: gift
        ? {
            name: language === 'ku' ? gift.nameKu : gift.nameEn,
            icon: gift.icon,
            coinValue: gift.cost,
          }
        : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newMsg],
    }));

    // If it's a DM to a simulated contact, schedule a realistic reply
    if (!targetId.startsWith('ch_')) {
      const contact = COMMUNITY_USERS.find((u) => u.id === targetId);
      if (contact) {
        setTimeout(() => {
          const repliesKu = [
            'دەستت خۆش بێت ژیار گیان! ئەمە تایبەتمەندییەکی زۆر بەهێزە 🔥',
            'زۆر نایابە! کەی دەچینە ژووری دەنگ کەمێک پێبکەنین و یاری بکەین؟ 🎮',
            'نامەکەت گەیشت، کوالێتی ئەم سیستمە چاتی دیسکۆرد زۆر خێرایە 🚀',
            'سڵاو! دەتوانین پەیوەندی دەنگ یان کامێرەش بکەین ئێستا ئەگەر ئامادەبیت 🎧',
          ];
          const repliesEn = [
            'Thanks a lot Zhyar! This Discord platform is looking fire 🔥',
            'Awesome! When are we jumping into the voice room? 🎮',
            'Got your message! The speed and design here are top tier 🚀',
            'Hey there! Feel free to start a voice or video call whenever you want 🎧',
          ];
          const randomReply =
            language === 'ku'
              ? repliesKu[Math.floor(Math.random() * repliesKu.length)]
              : repliesEn[Math.floor(Math.random() * repliesEn.length)];

          const replyMsg: Message = {
            id: `reply_${Date.now()}`,
            dmId: targetId,
            senderId: contact.id,
            senderName: contact.displayName,
            senderAvatar: contact.avatarUrl,
            text: gift
              ? `${language === 'ku' ? 'زۆر سوپاس بۆ دیاری' : 'Thank you so much for the gift'} ${gift.icon}! ❤️`
              : randomReply,
            timestamp: Date.now(),
          };

          setMessages((current) => ({
            ...current,
            [targetId]: [...(current[targetId] || []), replyMsg],
          }));

          playMessagePing();
          dispatchInAppNotification({
            id: `notif_${Date.now()}`,
            type: 'message',
            title: `${contact.displayName}`,
            body: replyMsg.text,
            avatar: contact.avatarUrl,
            timestamp: Date.now(),
            onClick: () => selectDm(contact),
          });
        }, 2200);
      }
    }
  };

  const toggleReaction = (targetId: string, messageId: string, emoji: string) => {
    setMessages((prev) => {
      const channelMsgs = prev[targetId];
      if (!channelMsgs) return prev;

      const updated = channelMsgs.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const existingIdx = currentReactions.findIndex((r) => r.emoji === emoji);

        if (existingIdx >= 0) {
          const currentReaction = currentReactions[existingIdx];
          const hasUser = currentReaction.users.includes(currentUser.id);

          let updatedUsers: string[];
          if (hasUser) {
            updatedUsers = currentReaction.users.filter((id) => id !== currentUser.id);
          } else {
            updatedUsers = [...currentReaction.users, currentUser.id];
          }

          if (updatedUsers.length === 0) {
            const nextReactions = currentReactions.filter((_, idx) => idx !== existingIdx);
            return { ...msg, reactions: nextReactions };
          } else {
            const nextReactions = [...currentReactions];
            nextReactions[existingIdx] = {
              ...currentReaction,
              count: updatedUsers.length,
              users: updatedUsers,
            };
            return { ...msg, reactions: nextReactions };
          }
        } else {
          const nextReactions = [
            ...currentReactions,
            {
              emoji,
              count: 1,
              users: [currentUser.id],
            },
          ];
          return { ...msg, reactions: nextReactions };
        }
      });

      return {
        ...prev,
        [targetId]: updated,
      };
    });
  };

  // 6. Voice Channels
  const [voiceState, setVoiceState] = useState<VoiceChannelState>({
    currentChannelId: null,
    isMuted: false,
    isDeafened: false,
    isVideoOn: false,
    isScreenSharing: false,
    speakingUsers: [],
  });

  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const audioMonitorRef = useRef<{ stop: () => void } | null>(null);
  const localMicStreamRef = useRef<MediaStream | null>(null);

  const joinVoiceChannel = async (channelId: string) => {
    playJoinVoiceSound();
    setVoiceState((prev) => ({
      ...prev,
      currentChannelId: channelId,
    }));

    // Add current user to active users of the channel
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          const alreadyIn = ch.activeUsers?.some((u) => u.id === currentUser.id);
          const updatedUsers = alreadyIn
            ? ch.activeUsers
            : [...(ch.activeUsers || []), currentUser];
          return { ...ch, activeUsers: updatedUsers };
        } else {
          return {
            ...ch,
            activeUsers: ch.activeUsers?.filter((u) => u.id !== currentUser.id),
          };
        }
      })
    );

    // Initialize mic monitor
    try {
      const micStream = await getLocalUserMedia({ audio: true, video: false });
      if (micStream) {
        localMicStreamRef.current = micStream;
        audioMonitorRef.current = monitorAudioVolume(micStream, (_, isSpeaking) => {
          setVoiceState((current) => {
            if (current.isMuted) {
              return {
                ...current,
                speakingUsers: current.speakingUsers.filter((id) => id !== currentUser.id),
              };
            }
            const hasUser = current.speakingUsers.includes(currentUser.id);
            if (isSpeaking && !hasUser) {
              return {
                ...current,
                speakingUsers: [...current.speakingUsers, currentUser.id],
              };
            }
            if (!isSpeaking && hasUser) {
              return {
                ...current,
                speakingUsers: current.speakingUsers.filter((id) => id !== currentUser.id),
              };
            }
            return current;
          });
        });
      }
    } catch {
      // Audio capture failed or in iframe
    }
  };

  const leaveVoiceChannel = () => {
    playLeaveVoiceSound();
    const leavingId = voiceState.currentChannelId;

    if (audioMonitorRef.current) {
      audioMonitorRef.current.stop();
      audioMonitorRef.current = null;
    }
    if (localMicStreamRef.current) {
      localMicStreamRef.current.getTracks().forEach((t) => t.stop());
      localMicStreamRef.current = null;
    }
    if (localVideoStream) {
      localVideoStream.getTracks().forEach((t) => t.stop());
      setLocalVideoStream(null);
    }
    if (localScreenStream) {
      localScreenStream.getTracks().forEach((t) => t.stop());
      setLocalScreenStream(null);
    }

    setVoiceState({
      currentChannelId: null,
      isMuted: false,
      isDeafened: false,
      isVideoOn: false,
      isScreenSharing: false,
      speakingUsers: [],
    });

    if (leavingId) {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === leavingId
            ? {
                ...ch,
                activeUsers: ch.activeUsers?.filter((u) => u.id !== currentUser.id),
              }
            : ch
        )
      );
    }
  };

  const toggleMute = () => {
    setVoiceState((prev) => {
      const nextMuted = !prev.isMuted;
      if (nextMuted) {
        playMuteSound();
      } else {
        playUnmuteSound();
      }
      return {
        ...prev,
        isMuted: nextMuted,
        speakingUsers: nextMuted
          ? prev.speakingUsers.filter((id) => id !== currentUser.id)
          : prev.speakingUsers,
      };
    });
  };

  const toggleDeafen = () => {
    setVoiceState((prev) => {
      const nextDeaf = !prev.isDeafened;
      if (nextDeaf) {
        playMuteSound();
      } else {
        playUnmuteSound();
      }
      return {
        ...prev,
        isDeafened: nextDeaf,
        isMuted: nextDeaf ? true : prev.isMuted,
      };
    });
  };

  const toggleVoiceVideo = async () => {
    if (voiceState.isVideoOn) {
      if (localVideoStream) {
        localVideoStream.getTracks().forEach((t) => t.stop());
        setLocalVideoStream(null);
      }
      setVoiceState((prev) => ({ ...prev, isVideoOn: false }));
    } else {
      const stream = await getLocalUserMedia({ video: true, audio: false });
      if (stream) {
        setLocalVideoStream(stream);
      }
      setVoiceState((prev) => ({ ...prev, isVideoOn: true }));
    }
  };

  const toggleVoiceScreenShare = async () => {
    if (voiceState.isScreenSharing) {
      if (localScreenStream) {
        localScreenStream.getTracks().forEach((t) => t.stop());
        setLocalScreenStream(null);
      }
      setVoiceState((prev) => ({ ...prev, isScreenSharing: false }));
    } else {
      const stream = await getLocalDisplayMedia();
      if (stream) {
        setLocalScreenStream(stream);
        stream.getVideoTracks()[0].onended = () => {
          setLocalScreenStream(null);
          setVoiceState((prev) => ({ ...prev, isScreenSharing: false }));
        };
      }
      setVoiceState((prev) => ({ ...prev, isScreenSharing: true }));
    }
  };

  // 7. Direct Calls (Phone & Video)
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const callTimerRef = useRef<number | null>(null);

  const startCall = (participant: User, type: 'voice' | 'video') => {
    startOutgoingRingtone();
    setCallSession({
      isActive: true,
      type,
      participant,
      status: 'calling',
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      duration: 0,
      startTime: Date.now(),
    });

    // Simulate answer after 3.5 seconds
    setTimeout(() => {
      stopRingtone();
      setCallSession((current) => {
        if (!current || current.status !== 'calling') return current;
        return {
          ...current,
          status: 'connected',
          startTime: Date.now(),
        };
      });
    }, 3500);
  };

  const incomingCallSimulate = (caller: User, type: 'voice' | 'video') => {
    startIncomingRingtone();
    setCallSession({
      isActive: true,
      type,
      participant: caller,
      status: 'incoming',
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      duration: 0,
    });
  };

  const answerCall = () => {
    stopRingtone();
    setCallSession((prev) =>
      prev
        ? {
            ...prev,
            status: 'connected',
            startTime: Date.now(),
          }
        : null
    );
  };

  const declineCall = () => {
    stopRingtone();
    setCallSession(null);
  };

  const endCall = () => {
    stopRingtone();
    playLeaveVoiceSound();
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallSession(null);
  };

  const toggleCallMute = () => {
    setCallSession((prev) => {
      if (!prev) return null;
      const nextMuted = !prev.isMuted;
      if (nextMuted) playMuteSound();
      else playUnmuteSound();
      return { ...prev, isMuted: nextMuted };
    });
  };

  const toggleCallVideo = () => {
    setCallSession((prev) => (prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null));
  };

  const toggleCallScreen = () => {
    setCallSession((prev) => (prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null));
  };

  // Call duration counter
  useEffect(() => {
    if (callSession && callSession.status === 'connected') {
      const interval = window.setInterval(() => {
        setCallSession((curr) => (curr ? { ...curr, duration: curr.duration + 1 } : null));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callSession?.status]);

  // 8. Modals
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [shopModalOpen, setShopModalOpen] = useState<boolean>(false);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // 9. Notifications Queue
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 4)]);
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 6000);
    });
    return unsubscribe;
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestPushPermission = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      dispatchInAppNotification({
        id: `perm_${Date.now()}`,
        type: 'message',
        title: language === 'ku' ? 'ئاگادارکردنەوەکان چالاککران 🔔' : 'Notifications Enabled 🔔',
        body: language === 'ku' ? 'ئێستا ئاگاداری نامە و هاوڕێ نوێیەکان دەبیت' : 'You will now receive message and friend alerts',
        timestamp: Date.now(),
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateProfile,
        setUserStatus,
        addCoins,
        spendCoins,
        switchUserRole,
        language,
        setLanguage,
        t,
        activeView,
        setActiveView,
        currentChannelId,
        selectChannel,
        activeDmUser,
        selectDm,
        channels,
        friends,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
        messages,
        sendMessage,
        toggleReaction,
        pinnedUserIds,
        togglePinChat,
        voiceState,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleDeafen,
        toggleVoiceVideo,
        toggleVoiceScreenShare,
        localVideoStream,
        localScreenStream,
        callSession,
        startCall,
        answerCall,
        declineCall,
        endCall,
        toggleCallMute,
        toggleCallVideo,
        toggleCallScreen,
        incomingCallSimulate,
        profileModalOpen,
        setProfileModalOpen,
        shopModalOpen,
        setShopModalOpen,
        ownerPanelOpen,
        setOwnerPanelOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        savedAccounts,
        switchAccount,
        addNewAccount,
        logoutAccount,
        ownerUserIds,
        addAppOwner,
        removeAppOwner,
        allOwners,
        isPrimaryOwner,
        notifications,
        dismissNotification,
        requestPushPermission,
        isAuthenticated,
        login,
        register,
        loginWithApple,
        logout,
        appleIdBalance,
        appleTransactions,
        redeemAppleGiftCard,
        purchaseWithAppleId,
        topUpAppleBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
