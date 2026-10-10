export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  bannerUrl?: string;
  bannerColor: string;
  accentColor: string;
  bio: string;
  status: UserStatus;
  customStatusText?: string;
  customStatusEmoji?: string;
  badges: string[];
  coins: number;
  isOwner: boolean;
  joinedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  category: 'general' | 'voice' | 'gaming';
  topic?: string;
  activeUsers?: User[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs or display names
}

export interface Message {
  id: string;
  channelId?: string;
  dmId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderBadge?: string;
  text: string;
  timestamp: number;
  attachment?: {
    type: 'image' | 'audio';
    url: string;
    name?: string;
  };
  gift?: {
    name: string;
    icon: string;
    coinValue: number;
  };
  reactions?: MessageReaction[];
}

export interface DirectMessageConversation {
  id: string;
  participant: User;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export interface CallSession {
  isActive: boolean;
  type: 'voice' | 'video';
  participant: User;
  status: 'calling' | 'incoming' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  duration: number;
  startTime?: number;
}

export interface VoiceChannelState {
  currentChannelId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  speakingUsers: string[];
}

export interface ShopPackage {
  id: string;
  titleKu: string;
  titleEn: string;
  coins: number;
  bonusCoins: number;
  priceUSD: number;
  badge?: string;
  popular?: boolean;
  itunesId: string;
}

export interface AppleTransaction {
  id: string;
  type: 'itunes_card_redeem' | 'apple_id_purchase';
  title: string;
  amountUSD: number;
  coinsReceived: number;
  date: string;
  timestamp: number;
  appleId: string;
  status: 'Approved' | 'Completed';
  cardCodeMasked?: string;
}

export interface PresetGiftCard {
  id: string;
  code: string;
  valueUSD: number;
  equivalentCoins: number;
  label: string;
}

export interface GiftItem {
  id: string;
  nameKu: string;
  nameEn: string;
  icon: string;
  cost: number;
  descriptionKu: string;
  descriptionEn: string;
}

export type FriendRequestType = 'incoming' | 'outgoing';

export interface FriendRelationship {
  id: string;
  user: User;
  status: 'friend' | 'pending_incoming' | 'pending_outgoing';
  createdAt: number;
}

