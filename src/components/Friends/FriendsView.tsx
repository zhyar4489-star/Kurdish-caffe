import React, { useState } from 'react';
import {
  Check,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FriendRelationship, User } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

export const FriendsView: React.FC = () => {
  const {
    friends,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    selectDm,
    startCall,
    t,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'add'>('online');
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [requestFeedback, setRequestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendToRemove, setFriendToRemove] = useState<User | null>(null);

  const acceptedFriends = friends.filter((f) => f.status === 'friend');
  const onlineFriends = acceptedFriends.filter((f) => f.user.status !== 'offline');
  const incomingRequests = friends.filter((f) => f.status === 'pending_incoming');
  const outgoingRequests = friends.filter((f) => f.status === 'pending_outgoing');
  const totalPending = incomingRequests.length + outgoingRequests.length;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendUsernameInput.trim()) return;
    const res = sendFriendRequest(friendUsernameInput.trim());
    setRequestFeedback(res);
    if (res.success) {
      setFriendUsernameInput('');
    }
  };

  const getFilteredFriends = () => {
    let list: FriendRelationship[] = [];
    if (activeTab === 'online') list = onlineFriends;
    else if (activeTab === 'all') list = acceptedFriends;

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (f) =>
        f.user.displayName.toLowerCase().includes(query) ||
        f.user.username.toLowerCase().includes(query)
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0c12] overflow-hidden">
      {/* Top Secondary Filter Bar */}
      <header className="h-14 px-6 bg-[#0e111a] border-b border-[#1c2233] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'online'
                ? 'bg-[#181d2a] text-cyan-400 border border-cyan-500/30'
                : 'text-[#8b92a5] hover:text-white'
            }`}
          >
            {t.online} ({onlineFriends.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'all'
                ? 'bg-[#181d2a] text-cyan-400 border border-cyan-500/30'
                : 'text-[#8b92a5] hover:text-white'
            }`}
          >
            {t.allFriends} ({acceptedFriends.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#181d2a] text-cyan-400 border border-cyan-500/30'
                : 'text-[#8b92a5] hover:text-white'
            }`}
          >
            <span>{t.pending}</span>
            {totalPending > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addFriend}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* ADD FRIEND TAB */}
        {activeTab === 'add' && (
          <div className="max-w-xl">
            <h2 className="text-xl font-black text-white mb-1">{t.addFriend}</h2>
            <p className="text-xs text-[#8b92a5] mb-5">
              {language === 'ku'
                ? 'ناوی بەکارهێنەری هاوڕێکەت بنووسە بۆ ناردنی داواکاری پەیوەندی'
                : 'Enter your friend username to connect'}
            </p>

            <form
              onSubmit={handleSendRequest}
              className="flex items-center gap-2 bg-[#141824] p-2 rounded-2xl border border-[#20273a] focus-within:border-cyan-400 transition-colors"
            >
              <input
                type="text"
                value={friendUsernameInput}
                onChange={(e) => {
                  setFriendUsernameInput(e.target.value);
                  setRequestFeedback(null);
                }}
                placeholder={t.addFriendPlaceholder}
                className="flex-1 bg-transparent text-sm text-white px-3 outline-none placeholder:text-[#555d73]"
              />
              <button
                type="submit"
                disabled={!friendUsernameInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
              >
                {t.sendFriendRequest}
              </button>
            </form>

            {requestFeedback && (
              <div
                className={`mt-3 p-3.5 rounded-xl text-xs font-semibold ${
                  requestFeedback.success
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {requestFeedback.message}
              </div>
            )}
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-[#8b92a5] tracking-wider mb-3">
                {language === 'ku' ? 'داواکارییە هاتووەکان' : 'Incoming Requests'} ({incomingRequests.length})
              </h3>
              {incomingRequests.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#141824] text-xs text-[#555d73] border border-[#20273a]">
                  {t.noPendingRequests}
                </div>
              ) : (
                <div className="space-y-2">
                  {incomingRequests.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 rounded-2xl bg-[#141824] border border-[#20273a] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar src={rel.user.avatarUrl} alt={rel.user.displayName} size="md" status={rel.user.status} />
                        <div>
                          <div className="text-sm font-bold text-white">{rel.user.displayName}</div>
                          <div className="text-xs text-cyan-400">@{rel.user.username}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptFriendRequest(rel.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.accept}</span>
                        </button>
                        <button
                          onClick={() => declineFriendRequest(rel.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-black uppercase text-[#8b92a5] tracking-wider mb-3">
                {language === 'ku' ? 'داواکارییە نێردراوەکان' : 'Outgoing Requests'} ({outgoingRequests.length})
              </h3>
              {outgoingRequests.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#141824] text-xs text-[#555d73] border border-[#20273a]">
                  {t.noPendingRequests}
                </div>
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 rounded-2xl bg-[#141824] border border-[#20273a] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar src={rel.user.avatarUrl} alt={rel.user.displayName} size="md" status={rel.user.status} />
                        <div>
                          <div className="text-sm font-bold text-white">{rel.user.displayName}</div>
                          <div className="text-xs text-[#8b92a5]">@{rel.user.username}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelFriendRequest(rel.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#1d2334] hover:bg-rose-500 text-[#8b92a5] hover:text-white font-bold text-xs transition-colors"
                      >
                        {t.cancelRequest}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONLINE & ALL FRIENDS LIST */}
        {(activeTab === 'online' || activeTab === 'all') && (
          <div>
            <div className="relative mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ku' ? 'گەڕان بەدوای هاوڕێ...' : 'Filter friends...'}
                className="w-full bg-[#141824] text-white text-xs rounded-2xl ps-9 pe-3 py-2.5 outline-none border border-[#20273a] focus:border-cyan-400 placeholder:text-[#555d73]"
              />
              <Search className="w-4 h-4 text-[#555d73] absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
            </div>

            {getFilteredFriends().length === 0 ? (
              <div className="p-8 text-center text-xs text-[#555d73] bg-[#141824] rounded-2xl border border-[#20273a]">
                {t.noFriendsYet}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getFilteredFriends().map((rel) => {
                  const friend = rel.user;

                  return (
                    <div
                      key={friend.id}
                      className="p-3.5 rounded-2xl bg-[#141824] hover:bg-[#181d2a] border border-[#20273a] hover:border-cyan-500/30 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar src={friend.avatarUrl} alt={friend.displayName} size="md" status={friend.status} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{friend.displayName}</div>
                          <div className="text-xs text-cyan-400 truncate">@{friend.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => selectDm(friend)}
                          className="w-8 h-8 rounded-xl bg-[#1d2334] hover:bg-cyan-500 text-white flex items-center justify-center transition-colors"
                          title={t.message}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startCall(friend, 'voice')}
                          className="w-8 h-8 rounded-xl bg-[#1d2334] hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                          title={t.startVoiceCall}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startCall(friend, 'video')}
                          className="w-8 h-8 rounded-xl bg-[#1d2334] hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                          title={t.startVideoCall}
                        >
                          <Video className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFriendToRemove(friend)}
                          className="w-8 h-8 rounded-xl bg-[#1d2334] hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
                          title={t.removeFriend}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Remove Friend Dialog */}
      {friendToRemove && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setFriendToRemove(null)}
        >
          <div
            className="w-full max-w-sm bg-[#141824] border border-[#20273a] rounded-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-base mb-2">
              {t.removeFriend} ({friendToRemove.displayName})
            </h3>
            <p className="text-xs text-[#8b92a5] mb-5">{t.removeFriendConfirm}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setFriendToRemove(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8b92a5] hover:text-white"
              >
                {t.cancelRequest}
              </button>
              <button
                onClick={() => {
                  removeFriend(friendToRemove.id);
                  setFriendToRemove(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-rose-500/20"
              >
                {t.removeFriend}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
