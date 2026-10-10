import React, { useRef, useState } from 'react';
import {
  Ban,
  Clock,
  ExternalLink,
  MessageSquare,
  MoreVertical,
  Pin,
  PinOff,
  Plus,
  Search,
  Shield,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FriendRelationship, User } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

export const DirectMessagesSidebar: React.FC = () => {
  const {
    friends,
    activeDmUser,
    selectDm,
    setActiveView,
    messages,
    language,
    t,
    pinnedUserIds,
    togglePinChat,
    closedDmUserIds,
    closeDm,
    blockedUserIds,
    blockUser,
    unblockUser,
    openUserContextMenu,
    typingUsers,
  } = useApp();

  const [search, setSearch] = useState('');
  const [activeContactMenu, setActiveContactMenu] = useState<{
    user: User;
    pos: { x: number; y: number };
  } | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const acceptedFriends = friends.filter((f) => f.status === 'friend');

  // Filter contacts (hiding closed DMs unless searched or currently open)
  const filtered = acceptedFriends.filter((f) => {
    if (
      !search &&
      closedDmUserIds.includes(f.user.id) &&
      activeDmUser?.id !== f.user.id
    ) {
      return false;
    }
    return (
      f.user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      f.user.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  const pinnedContacts = filtered.filter((f) => pinnedUserIds.includes(f.user.id));
  const otherContacts = filtered.filter((f) => !pinnedUserIds.includes(f.user.id));

  const startLongPress = (user: User, e: React.MouseEvent | React.TouchEvent) => {
    isLongPressTriggeredRef.current = false;
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setActiveContactMenu({ user, pos: { x: clientX, y: clientY } });
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const renderContactItem = (rel: FriendRelationship, isPinned: boolean) => {
    const user = rel.user;
    const isSelected = activeDmUser?.id === user.id;
    const userMsgs = messages[user.id] || [];
    const lastMsg = userMsgs[userMsgs.length - 1];
    const isBlocked = blockedUserIds.includes(user.id);
    const isUserTyping = (typingUsers[user.id] || []).length > 0;

    return (
      <div
        key={user.id}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          cancelLongPress();
          setActiveContactMenu({ user, pos: { x: e.clientX, y: e.clientY } });
        }}
        onTouchStart={(e) => startLongPress(user, e)}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onMouseDown={(e) => {
          if (e.button === 0) startLongPress(user, e);
        }}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        className={`group relative flex items-center justify-between p-2 rounded-2xl transition-all cursor-pointer select-none ${
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border border-cyan-500/30'
            : isPinned
            ? 'bg-[#151926]/90 border border-amber-500/20 hover:border-amber-500/40'
            : 'hover:bg-[#151926] border border-transparent'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (!isLongPressTriggeredRef.current) {
              selectDm(user);
            }
          }}
          className="flex-1 flex items-center gap-3 text-start min-w-0"
        >
          <UserAvatar
            src={user.avatarUrl}
            alt={user.displayName}
            size="md"
            status={user.status}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{user.displayName}</span>
                {isPinned && (
                  <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                )}
                {isBlocked && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1 rounded font-bold">
                    بلۆک
                  </span>
                )}
              </span>
              {lastMsg && (
                <span className="text-[10px] text-[#555d73] shrink-0">
                  {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {isUserTyping ? (
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold mt-0.5 truncate">
                <span className="flex items-center gap-0.5 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="truncate">
                  {language === 'ku' ? 'خەریکی نووسینە...' : 'is typing...'}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-[#6d758d] truncate mt-0.5">
                {lastMsg ? lastMsg.text : `@${user.username}`}
              </p>
            )}
          </div>
        </button>

        {/* Action icons on hover / touch */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Context Menu Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setActiveContactMenu({
                user,
                pos: { x: rect.left, y: rect.bottom + 5 },
              });
            }}
            className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 text-[#6d758d] hover:text-white hover:bg-[#1f2538] transition-all"
            title={language === 'ku' ? 'کردارەکان (کلۆس، بلۆک، پین)' : 'Actions'}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Pin Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePinChat(user.id);
            }}
            className={`p-1.5 rounded-xl transition-all ${
              isPinned
                ? 'text-amber-400 hover:text-rose-400 bg-amber-500/10 hover:bg-rose-500/10'
                : 'opacity-0 group-hover:opacity-100 text-[#6d758d] hover:text-amber-400 hover:bg-[#1f2538]'
            }`}
            title={
              isPinned
                ? language === 'ku'
                  ? 'لادانی پین (Unpin)'
                  : 'Unpin chat'
                : language === 'ku'
                ? 'پینکردنی ئەم چاتە لە سەرەوە'
                : 'Pin chat to top'
            }
          >
            {isPinned ? (
              <Pin className="w-3.5 h-3.5 fill-amber-400" />
            ) : (
              <Pin className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-72 bg-[#0e111a] border-r border-[#1c2233] flex flex-col shrink-0 select-none relative">
      {/* Search Header */}
      <div className="p-3.5 border-b border-[#1c2233]">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'ku' ? 'گەڕان بەدوای چات...' : 'Search messages...'
            }
            className="w-full bg-[#151926] text-white text-xs rounded-xl ps-8 pe-3 py-2 outline-none border border-[#20273a] focus:border-cyan-400 placeholder:text-[#555d73]"
          />
          <Search className="w-3.5 h-3.5 text-[#555d73] absolute left-2.5 top-2.5 rtl:right-2.5 rtl:left-auto" />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Section 1: Pinned Chats */}
        {pinnedContacts.length > 0 && (
          <div>
            <div className="px-3 py-1 text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pin className="w-3 h-3 fill-amber-400" />
                <span>{language === 'ku' ? 'پینکراوەکان' : 'Pinned'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-bold">
                  {pinnedContacts.length}
                </span>
              </span>
            </div>
            <div className="space-y-1 mt-1">
              {pinnedContacts.map((rel) => renderContactItem(rel, true))}
            </div>
          </div>
        )}

        {/* Section 2: All Other Chats */}
        <div>
          <div className="px-3 py-1 text-[10px] font-black uppercase text-[#6d758d] tracking-wider flex items-center justify-between">
            <span>
              {pinnedContacts.length > 0
                ? language === 'ku'
                  ? 'چاتەکانی تر'
                  : 'All Messages'
                : language === 'ku'
                ? 'چات و نامەکان'
                : 'Conversations'}
            </span>
            <button
              onClick={() => setActiveView('friends')}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-bold text-[10px]"
            >
              <Plus className="w-3 h-3" />
              <span>{t.addFriend}</span>
            </button>
          </div>

          <div className="space-y-1 mt-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#555d73]">
                {language === 'ku'
                  ? 'هیچ چاتێک نەدۆزرایەوە'
                  : 'No conversations found'}
              </div>
            ) : otherContacts.length === 0 && pinnedContacts.length > 0 ? (
              <div className="p-2 text-center text-[11px] text-[#555d73]">
                {language === 'ku'
                  ? 'هەموو چاتەکانت پینکراون'
                  : 'All chats are pinned'}
              </div>
            ) : (
              otherContacts.map((rel) => renderContactItem(rel, false))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Context Menu on Long-Press / Right-Click (Close DM, Block, Pin) */}
      {activeContactMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center sm:block"
          onClick={() => setActiveContactMenu(null)}
        >
          <div
            style={{
              position: 'fixed',
              left: `${Math.min(
                Math.max(10, activeContactMenu.pos.x),
                window.innerWidth - 240
              )}px`,
              top: `${Math.min(
                Math.max(10, activeContactMenu.pos.y),
                window.innerHeight - 200
              )}px`,
            }}
            className="w-56 bg-[#131622] border-2 border-[#2b334d] rounded-2xl overflow-hidden shadow-2xl p-1.5 space-y-1 text-white z-50 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contact Header */}
            <div className="px-3 py-2 border-b border-[#20273a] flex items-center gap-2">
              <UserAvatar
                src={activeContactMenu.user.avatarUrl}
                alt={activeContactMenu.user.displayName}
                size="sm"
                status={activeContactMenu.user.status}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {activeContactMenu.user.displayName}
                </div>
                <div className="text-[10px] text-cyan-400 truncate">
                  @{activeContactMenu.user.username}
                </div>
              </div>
            </div>

            {/* 1. Pin / Unpin */}
            <button
              type="button"
              onClick={() => {
                togglePinChat(activeContactMenu.user.id);
                setActiveContactMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#1d2334] text-[#8b92a5] hover:text-white transition-colors"
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  pinnedUserIds.includes(activeContactMenu.user.id)
                    ? 'text-amber-400 fill-amber-400'
                    : ''
                }`}
              />
              <span className="flex-1 text-start">
                {pinnedUserIds.includes(activeContactMenu.user.id)
                  ? language === 'ku'
                    ? 'لادانی پین (Unpin)'
                    : 'Unpin Chat'
                  : language === 'ku'
                  ? 'پینکردن لە سەرەوە (Pin)'
                  : 'Pin to Top'}
              </span>
            </button>

            {/* 2. Close DM (کلۆس دیئێم) */}
            <button
              type="button"
              onClick={() => {
                closeDm(activeContactMenu.user.id);
                setActiveContactMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#1d2334] text-[#8b92a5] hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span className="flex-1 text-start">
                {language === 'ku' ? 'کلۆس دیئێم (Close DM)' : 'Close DM'}
              </span>
            </button>

            {/* 3. Block / Unblock (بلۆک) */}
            <button
              type="button"
              onClick={() => {
                if (blockedUserIds.includes(activeContactMenu.user.id)) {
                  unblockUser(activeContactMenu.user.id);
                } else {
                  blockUser(activeContactMenu.user.id);
                }
                setActiveContactMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                blockedUserIds.includes(activeContactMenu.user.id)
                  ? 'text-emerald-400 hover:bg-emerald-500/15'
                  : 'text-rose-400 hover:bg-rose-500/15'
              }`}
            >
              {blockedUserIds.includes(activeContactMenu.user.id) ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="flex-1 text-start">
                    {language === 'ku' ? 'لادانی بلۆک (Unblock)' : 'Unblock User'}
                  </span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span className="flex-1 text-start">
                    {language === 'ku' ? 'بلۆککردن (Block User)' : 'Block User'}
                  </span>
                </>
              )}
            </button>

            {/* Full Profile View */}
            <div className="pt-1 border-t border-[#20273a]">
              <button
                type="button"
                onClick={() => {
                  const user = activeContactMenu.user;
                  setActiveContactMenu(null);
                  openUserContextMenu(user);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="flex-1 text-start">
                  {language === 'ku' ? 'بینینی تەواوی پڕۆفایل' : 'View Profile'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
