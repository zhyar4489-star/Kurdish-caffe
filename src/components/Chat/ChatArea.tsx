import React, { useEffect, useRef, useState } from 'react';
import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  Image as ImageIcon,
  Mic,
  MicOff,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Send,
  ShoppingBag,
  Smile,
  Sparkles,
  Square,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMMUNITY_USERS, GIFT_ITEMS } from '../../data/mockData';
import { GiftItem, User } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

const QUICK_REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '🎉', '👑', '💎', '✨'];

export const ChatArea: React.FC = () => {
  const {
    activeView,
    currentChannelId,
    channels,
    activeDmUser,
    messages,
    sendMessage,
    toggleReaction,
    currentUser,
    startCall,
    spendCoins,
    t,
    language,
    setShopModalOpen,
    pinnedUserIds,
    togglePinChat,
    acceptCoinGift,
    setCoinMarketModalOpen,
    isUserBlocked,
    unblockUser,
    openUserContextMenu,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChannel = channels.find((c) => c.id === currentChannelId);
  const targetId = activeView === 'channels' ? currentChannelId : activeDmUser?.id || '';
  const currentMessages = targetId ? messages[targetId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    sendMessage(
      targetId,
      inputText.trim(),
      selectedImage ? { type: 'image', url: selectedImage, name: 'Attachment' } : undefined
    );

    setInputText('');
    setSelectedImage(null);
  };

  const handleSendGift = (gift: GiftItem) => {
    const success = spendCoins(gift.cost);
    if (!success) {
      alert(
        language === 'ku'
          ? `باڵانسی سکەکانت بەش ناکات (${currentUser.coins} سکەت هەیە). دەتوانیت لە کۆگای ئایتونس سکە بکڕیت.`
          : `Not enough coins (${currentUser.coins} available). You can purchase more from the iTunes store!`
      );
      setShopModalOpen(true);
      return;
    }

    sendMessage(
      targetId,
      language === 'ku'
        ? `دیاری ${gift.nameKu}ی بەخشی بە بەهای ${gift.cost} سکە! ✨`
        : `Sent ${gift.nameEn} worth ${gift.cost} coins! ✨`,
      undefined,
      gift
    );

    setShowGiftPicker(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecordingVoice(false);
      sendMessage(targetId, `🎙️ دەنگی تۆمارکراو (${voiceSeconds} چرکە)`);
      setVoiceSeconds(0);
    } else {
      setIsRecordingVoice(true);
      setVoiceSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setVoiceSeconds((s) => s + 1);
      }, 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0c12] overflow-hidden">
      {/* Top Conversation Header */}
      <header className="h-16 px-6 bg-[#0e111a] border-b border-[#1c2233] flex items-center justify-between select-none">
        {activeDmUser ? (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={(e) => openUserContextMenu(activeDmUser, e)}
              className="flex items-center gap-3 text-start hover:opacity-85 transition-opacity"
              title={language === 'ku' ? 'کلیک بکە بۆ بینینی پڕۆفایل و بلۆککردن' : 'Click for profile & block menu'}
            >
              <UserAvatar
                src={activeDmUser.avatarUrl}
                alt={activeDmUser.displayName}
                size="md"
                status={activeDmUser.status}
              />
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{activeDmUser.displayName}</span>
                  {activeDmUser.isOwner && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                      خاوەنی ئەپ 👑
                    </span>
                  )}
                  {isUserBlocked(activeDmUser.id) && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold border border-rose-500/30 flex items-center gap-1">
                      <Ban className="w-2.5 h-2.5" />
                      <span>{language === 'ku' ? 'بلۆککراو' : 'Blocked'}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6d758d]">
                  {activeDmUser.customStatusText || `@${activeDmUser.username}`}
                </div>
              </div>
            </button>

            {/* Shopping Coin Marketplace, Pin, Calls & Context Menu */}
            <div className="flex items-center gap-2">
              {/* Shopping / Coin Gifting Market Button */}
              <button
                type="button"
                onClick={() => setCoinMarketModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 hover:from-amber-500 hover:to-yellow-500 text-amber-300 hover:text-black border border-amber-500/40 font-black text-xs transition-all shadow-sm"
                title={language === 'ku' ? 'بازاڕی بەخشینی سکە بە هاوڕێکان 🛍️' : 'Coin Gifting Market 🛍️'}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'ku' ? 'بازاڕی سکە 🛍️' : 'Coin Market'}
                </span>
              </button>

              {/* Pin Chat Toggle */}
              <button
                onClick={() => togglePinChat(activeDmUser.id)}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border ${
                  pinnedUserIds.includes(activeDmUser.id)
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-[#151926] hover:bg-[#1f2538] border-[#252e42] text-[#8b92a5] hover:text-white'
                }`}
                title={
                  pinnedUserIds.includes(activeDmUser.id)
                    ? (language === 'ku' ? 'چاتەکە پینکراوە (کلیک بکە بۆ لادان)' : 'Pinned chat (Click to unpin)')
                    : (language === 'ku' ? 'پینکردنی ئەم چاتە لە سەرەوە' : 'Pin this chat')
                }
              >
                <Pin className={`w-3.5 h-3.5 ${pinnedUserIds.includes(activeDmUser.id) ? 'fill-amber-400' : ''}`} />
                <span className="hidden sm:inline">
                  {pinnedUserIds.includes(activeDmUser.id)
                    ? (language === 'ku' ? 'پینکراوە' : 'Pinned')
                    : (language === 'ku' ? 'پین بکە' : 'Pin')}
                </span>
              </button>

              <button
                onClick={() => startCall(activeDmUser, 'voice')}
                disabled={isUserBlocked(activeDmUser.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 disabled:opacity-30 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold text-xs transition-all shadow-sm"
                title={t.startVoiceCall}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.startVoiceCall}</span>
              </button>

              <button
                onClick={() => startCall(activeDmUser, 'video')}
                disabled={isUserBlocked(activeDmUser.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 disabled:opacity-30 text-cyan-400 hover:text-white border border-cyan-500/30 font-bold text-xs transition-all shadow-sm"
                title={t.startVideoCall}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t.startVideoCall}</span>
              </button>

              {/* User Context Menu Trigger */}
              <button
                type="button"
                onClick={(e) => openUserContextMenu(activeDmUser, e)}
                className="p-2 rounded-xl bg-[#151926] hover:bg-[#1f2538] border border-[#252e42] text-[#8b92a5] hover:text-white transition-colors"
                title={language === 'ku' ? 'هەڵبژاردن و بلۆککردن' : 'Profile & Block Menu'}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-white font-bold text-sm">
            {activeChannel?.name || 'چاتی گشتی'}
          </div>
        )}
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-3xl bg-[#141824] border border-[#20273a] flex items-center justify-center text-cyan-400 mb-3">
              <Smile className="w-8 h-8" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">
              {language === 'ku' ? 'هیچ نامەیەک لێرە نییە' : 'No messages here yet'}
            </h3>
            <p className="text-xs text-[#6d758d] max-w-sm">
              {language === 'ku'
                ? 'نامەیەک بنووسە، وێنە دابنێ، دیاری بنێرە، یان پەیوەندی تەلەفۆن و کامێرە دەستپێبکە'
                : 'Send a message, photo, gift, or start a phone or video call'}
            </p>
          </div>
        ) : (
          currentMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id || index}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    const senderUser: User =
                      isMe
                        ? currentUser
                        : (activeDmUser?.id === msg.senderId ? activeDmUser : null) ||
                          COMMUNITY_USERS.find((u) => u.id === msg.senderId) ||
                          friends.find((f) => f.user.id === msg.senderId)?.user || {
                            id: msg.senderId,
                            username: msg.senderName.toLowerCase().replace(/\s+/g, '_'),
                            displayName: msg.senderName,
                            email: `${msg.senderId}@kurdcord.io`,
                            avatarUrl: msg.senderAvatar,
                            bannerColor: '#1e293b',
                            accentColor: '#5865f2',
                            bio: 'ئەندام لە کوردکۆرد',
                            status: 'online',
                            badges: msg.senderBadge ? ['owner'] : [],
                            coins: 1000,
                            isOwner: !!msg.senderBadge,
                            joinedAt: 'Recent',
                          };
                    openUserContextMenu(senderUser, e);
                  }}
                  className="hover:opacity-85 transition-opacity shrink-0"
                  title={language === 'ku' ? 'کلیک بکە بۆ پڕۆفایل و بلۆککردن' : 'Click for profile & block menu'}
                >
                  <UserAvatar
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    size="md"
                    showStatusIndicator={false}
                  />
                </button>

                <div className={`max-w-[75%] ${isMe ? 'items-end text-end' : ''} group/msg relative`}>
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        const senderUser: User =
                          isMe
                            ? currentUser
                            : (activeDmUser?.id === msg.senderId ? activeDmUser : null) ||
                              COMMUNITY_USERS.find((u) => u.id === msg.senderId) ||
                              friends.find((f) => f.user.id === msg.senderId)?.user || {
                                id: msg.senderId,
                                username: msg.senderName.toLowerCase().replace(/\s+/g, '_'),
                                displayName: msg.senderName,
                                email: `${msg.senderId}@kurdcord.io`,
                                avatarUrl: msg.senderAvatar,
                                bannerColor: '#1e293b',
                                accentColor: '#5865f2',
                                bio: 'ئەندام لە کوردکۆرد',
                                status: 'online',
                                badges: msg.senderBadge ? ['owner'] : [],
                                coins: 1000,
                                isOwner: !!msg.senderBadge,
                                joinedAt: 'Recent',
                              };
                        openUserContextMenu(senderUser, e);
                      }}
                      className="font-bold text-white hover:text-cyan-400 transition-colors"
                    >
                      {msg.senderName}
                    </button>
                    <span className="text-[10px] text-[#555d73]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Bubble & Action Bar */}
                  <div className="relative inline-block group">
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-[#151926] border border-[#20273a] text-[#d6dae5] rounded-tl-none'
                      }`}
                    >
                      {msg.text}

                      {msg.attachment?.type === 'image' && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                          <img src={msg.attachment.url} alt="att" className="max-h-64 rounded-xl object-cover" />
                        </div>
                      )}

                      {msg.gift && (
                        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/40 flex items-center gap-2">
                          <span className="text-2xl">{msg.gift.icon}</span>
                          <div className="text-xs text-amber-300 font-bold">
                            {t.sentAGift} {msg.gift.name} ({msg.gift.coinValue} 💎)
                          </div>
                        </div>
                      )}

                      {/* 24-Hour Interactive Coin Gift Card */}
                      {msg.coinGift && (
                        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#1a1710] via-[#211a0d] to-[#16130b] border-2 border-amber-500/50 shadow-xl space-y-3 min-w-[250px] sm:min-w-[290px] text-start">
                          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                                <Coins className="w-5 h-5 fill-amber-300" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                                  {language === 'ku' ? 'دیاری تایبەتی سکە 🎁' : 'Coin Gift Pass 🎁'}
                                </span>
                                <div className="text-sm font-black text-white">
                                  +{msg.coinGift.amount.toLocaleString()} سکە
                                </div>
                              </div>
                            </div>

                            {msg.coinGift.isOwnerFreeGift && (
                              <span className="text-[9px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-full shrink-0">
                                👑 ئۆنەر
                              </span>
                            )}
                          </div>

                          {/* 24H Expiration Timer & Acceptance Status */}
                          <div className="flex items-center justify-between text-xs text-[#949ba4]">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{language === 'ku' ? 'ماوەی بەسەرچوون:' : 'Expires:'}</span>
                            </span>

                            {msg.coinGift.status === 'accepted' ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{language === 'ku' ? 'وەرگیراوە ✅' : 'Accepted ✅'}</span>
                              </span>
                            ) : Date.now() > msg.coinGift.expiresAt || msg.coinGift.status === 'expired' ? (
                              <span className="text-rose-400 font-bold text-[11px]">
                                {language === 'ku' ? '⌛ بەسەرچوو (Expired)' : '⌛ Expired'}
                              </span>
                            ) : (
                              <span className="text-amber-400 font-bold text-[11px]">
                                {Math.max(
                                  1,
                                  Math.round((msg.coinGift.expiresAt - Date.now()) / (1000 * 60 * 60))
                                )}{' '}
                                {language === 'ku' ? 'کاتژمێر ماوە (24h)' : 'hours remaining'}
                              </span>
                            )}
                          </div>

                          {/* Action Button: ACCEPT (ئەکسێپت) or Claimed Status */}
                          {msg.coinGift.status === 'pending' && Date.now() <= msg.coinGift.expiresAt ? (
                            currentUser.id === msg.coinGift.recipientId || !isMe ? (
                              <button
                                type="button"
                                onClick={() => acceptCoinGift(targetId, msg.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>{language === 'ku' ? 'ئەکسێپت (وەرگرتنی سکەکان) 💎' : 'Accept Gift (ئەکسێپت) 💎'}</span>
                              </button>
                            ) : (
                              <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center text-[11px] text-amber-200/80 font-semibold">
                                {language === 'ku'
                                  ? 'چاوەڕوانی ئەکسێپت کردنی کەسی بەرامبەرە...'
                                  : 'Waiting for recipient to accept...'}
                              </div>
                            )
                          ) : msg.coinGift.status === 'accepted' ? (
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {language === 'ku'
                                  ? `ئەم دیارییە وەرگیرا لە کاتژمێر ${new Date(msg.coinGift.acceptedAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  : 'Gift accepted and added to balance'}
                              </span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center text-[11px] text-rose-400 font-bold">
                              {language === 'ku'
                                ? 'ئەم دیارییە لە ماوەی ٢٤ کاتژمێردا وەرنەگیرا و بەسەرچوو'
                                : 'Gift expired after 24 hours without being accepted'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Reaction Button (Appears on hover or always accessible) */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isMe ? '-left-8' : '-right-8'
                      } opacity-0 group-hover:opacity-100 group-hover/msg:opacity-100 transition-opacity z-10`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionMsgId(
                            activeReactionMsgId === msg.id ? null : msg.id
                          )
                        }
                        className="w-7 h-7 rounded-full bg-[#181d2a] hover:bg-[#22293d] border border-[#2c354e] text-[#8b92a5] hover:text-cyan-400 flex items-center justify-center transition-colors shadow-md"
                        title={language === 'ku' ? 'دانانی کاردانەوەی ئیمۆجی' : 'Add emoji reaction'}
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Emoji Reaction Floating Picker Bar */}
                    {activeReactionMsgId === msg.id && (
                      <div
                        className={`absolute -top-11 ${
                          isMe ? 'right-0' : 'left-0'
                        } bg-[#121520] border border-[#2c354e] rounded-full p-1 shadow-2xl flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-150`}
                      >
                        {QUICK_REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              toggleReaction(targetId, msg.id, emoji);
                              setActiveReactionMsgId(null);
                            }}
                            className="w-8 h-8 rounded-full hover:bg-[#1d2334] flex items-center justify-center text-base hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rendered Reaction Badges */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      className={`flex flex-wrap items-center gap-1.5 mt-1.5 ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.reactions.map((reaction) => {
                        const hasReacted = reaction.users.includes(currentUser.id);

                        return (
                          <button
                            key={reaction.emoji}
                            type="button"
                            onClick={() =>
                              toggleReaction(targetId, msg.id, reaction.emoji)
                            }
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition-all border ${
                              hasReacted
                                ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-300 font-bold shadow-xs'
                                : 'bg-[#151926] hover:bg-[#1f2538] border-[#252e42] text-[#8b92a5] hover:text-white'
                            }`}
                            title={`${reaction.count} ${
                              hasReacted
                                ? (language === 'ku' ? '(تۆ کاردانەوەت داناوە)' : '(You reacted)')
                                : ''
                            }`}
                          >
                            <span className="text-sm leading-none">{reaction.emoji}</span>
                            <span className="text-[11px] font-bold">{reaction.count}</span>
                          </button>
                        );
                      })}

                      {/* Small plus button to add another emoji */}
                      <button
                        type="button"
                        onClick={() =>
                          setActiveReactionMsgId(
                            activeReactionMsgId === msg.id ? null : msg.id
                          )
                        }
                        className="w-5 h-5 rounded-full bg-[#151926] hover:bg-[#1f2538] border border-[#252e42] text-[#8b92a5] hover:text-white flex items-center justify-center text-[10px] transition-colors"
                        title={language === 'ku' ? 'کاردانەوەی تر' : 'Add reaction'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Upload Preview */}
      {selectedImage && (
        <div className="px-6 py-2 bg-[#121520] border-t border-[#1c2233] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={selectedImage} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-[#20273a]" />
            <span className="text-xs text-cyan-400 font-medium">
              {language === 'ku' ? 'وێنەی گەلەری ئامادەیە بۆ ناردن' : 'Gallery image ready to send'}
            </span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-rose-400 hover:underline"
          >
            {language === 'ku' ? 'لابردن' : 'Remove'}
          </button>
        </div>
      )}

      {/* Input Dock */}
      <div className="p-4 bg-[#0e111a] border-t border-[#1c2233]">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#151926] border border-[#20273a] focus-within:border-cyan-400 rounded-2xl px-3 py-2 transition-colors"
        >
          {/* File Picker from Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#8b92a5] hover:text-white rounded-xl hover:bg-[#1f2538] transition-colors"
            title={language === 'ku' ? 'دانانی وێنە لە گەلەری' : 'Upload photo from gallery'}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-xl transition-colors ${
              isRecordingVoice
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-[#8b92a5] hover:text-white hover:bg-[#1f2538]'
            }`}
            title={isRecordingVoice ? t.stopRecording : t.recordVoiceMemo}
          >
            {isRecordingVoice ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isRecordingVoice}
            placeholder={
              isRecordingVoice
                ? `${language === 'ku' ? 'تۆمارکردنی دەنگ...' : 'Recording voice memo...'} (${voiceSeconds}s)`
                : `${t.messagePlaceholder} @${activeDmUser?.displayName || 'Chat'}...`
            }
            className="flex-1 bg-transparent text-sm text-white px-2 outline-none placeholder:text-[#555d73]"
          />

          {/* Gift Button */}
          <button
            type="button"
            onClick={() => setShowGiftPicker(!showGiftPicker)}
            className="p-2 text-[#8b92a5] hover:text-amber-400 rounded-xl hover:bg-[#1f2538] transition-colors"
            title={t.sendGift}
          >
            <Gift className="w-4 h-4" />
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 text-white rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        {/* Gift Selector */}
        {showGiftPicker && (
          <div className="mt-3 p-4 bg-[#141824] border border-[#20273a] rounded-2xl shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#20273a]">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t.sendGift}
              </span>
              <span className="text-xs font-extrabold text-amber-400">
                {currentUser.coins.toLocaleString()} {t.coins} 🪙
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {GIFT_ITEMS.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-col items-center p-3 rounded-xl bg-[#0e111a] hover:bg-[#1c2233] border border-transparent hover:border-amber-400/40 transition-all text-center group"
                >
                  <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">{gift.icon}</span>
                  <span className="text-xs font-bold text-white truncate max-w-full">
                    {language === 'ku' ? gift.nameKu : gift.nameEn}
                  </span>
                  <span className="text-[10px] text-amber-400 font-extrabold mt-0.5">
                    {gift.cost} {t.coins}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
