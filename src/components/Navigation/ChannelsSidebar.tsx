import React, { useState } from 'react';
import {
  Crown,
  Hash,
  Headphones,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Plus,
  Radio,
  Settings,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserStatus } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

export const ChannelsSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    channels,
    currentChannelId,
    selectChannel,
    activeDmUser,
    selectDm,
    friends,
    currentUser,
    setUserStatus,
    voiceState,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
    setProfileModalOpen,
    t,
  } = useApp();

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Filter pending friends count
  const pendingCount = friends.filter((f) => f.status === 'pending_incoming').length;
  const acceptedFriends = friends.filter((f) => f.status === 'friend');

  const voiceChannels = channels.filter((c) => c.type === 'voice');
  const textChannels = channels.filter((c) => c.type === 'text');

  const currentVoiceChannel = channels.find((c) => c.id === voiceState.currentChannelId);

  const statuses: { label: string; value: UserStatus; color: string; descKu: string }[] = [
    { label: t.statusOnline, value: 'online', color: 'bg-[#23a55a]', descKu: 'سەرهێڵ و ئامادەی چات' },
    { label: t.statusIdle, value: 'idle', color: 'bg-[#f0b232]', descKu: 'کەمێک دوورکەوتوومەتەوە' },
    { label: t.statusDnd, value: 'dnd', color: 'bg-[#f23f43]', descKu: 'ئاگادارییەکان بێدەنگ بکە' },
    { label: t.statusOffline, value: 'offline', color: 'bg-[#80848e]', descKu: 'وەک نادیار دەربکەوە' },
  ];

  return (
    <aside aria-label="Channels and Direct Messages" className="w-60 bg-[#2b2d31] flex flex-col shrink-0 select-none z-10 border-r border-[#1e1f22]">
      {/* Top Header */}
      {activeView === 'channels' ? (
        <header className="h-12 px-4 border-b border-[#1f2023] flex items-center justify-between font-bold text-white shadow-sm">
          <span className="truncate">کوردکۆرد (KurdCord)</span>
          <span className="w-2 h-2 rounded-full bg-[#23a55a] animate-pulse" title="Server Online" />
        </header>
      ) : (
        <header className="h-12 px-3 border-b border-[#1f2023] flex items-center">
          <button
            onClick={() => setActiveView('friends')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold text-sm transition-colors ${
              activeView === 'friends'
                ? 'bg-[#404249] text-white'
                : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
            }`}
          >
            <Users className="w-5 h-5 text-[#949ba4]" />
            <span className="flex-1 text-start">{t.friends}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 text-xs font-bold bg-[#f23f43] text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </header>
      )}

      {/* Main Channels or DMs list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {activeView === 'channels' ? (
          <>
            {/* Text Channels */}
            <div>
              <div className="px-2 mb-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#949ba4] uppercase">
                <span>{t.textChannels}</span>
              </div>
              <div className="space-y-0.5">
                {textChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => selectChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors group ${
                      currentChannelId === channel.id
                        ? 'bg-[#404249] text-white font-medium'
                        : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                    }`}
                  >
                    <Hash className="w-4 h-4 text-[#80848e] group-hover:text-white shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Channels */}
            <div>
              <div className="px-2 mb-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#949ba4] uppercase">
                <span>{t.voiceChannels}</span>
              </div>
              <div className="space-y-1">
                {voiceChannels.map((channel) => {
                  const isConnectedHere = voiceState.currentChannelId === channel.id;
                  const activeList = channel.activeUsers || [];

                  return (
                    <div key={channel.id} className="rounded-md">
                      <button
                        onClick={() => {
                          if (isConnectedHere) {
                            leaveVoiceChannel();
                          } else {
                            joinVoiceChannel(channel.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors group ${
                          isConnectedHere
                            ? 'bg-[#23a559]/15 text-[#23a559] font-medium'
                            : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Volume2
                            className={`w-4 h-4 shrink-0 ${
                              isConnectedHere ? 'text-[#23a559] animate-pulse' : 'text-[#80848e]'
                            }`}
                          />
                          <span className="truncate">{channel.name}</span>
                        </div>
                        {isConnectedHere && (
                          <span className="text-[10px] bg-[#23a559] text-white px-1.5 py-0.5 rounded font-bold">
                            CONNECTED
                          </span>
                        )}
                      </button>

                      {/* Active Users in this voice room */}
                      {activeList.length > 0 && (
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          {activeList.map((user) => {
                            const isSpeaking = voiceState.speakingUsers.includes(user.id);
                            return (
                              <div
                                key={user.id}
                                className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#35373c]/50 text-xs text-[#dbdee1]"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <UserAvatar
                                    src={user.avatarUrl}
                                    alt={user.displayName}
                                    size="xs"
                                    status={user.status}
                                    isSpeaking={isSpeaking}
                                  />
                                  <span className="truncate font-medium">{user.displayName}</span>
                                </div>
                                {user.isOwner && (
                                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Direct Messages List */
          <div>
            <div className="px-2 mb-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#949ba4] uppercase">
              <span>{t.directMessages}</span>
              <button
                onClick={() => setActiveView('friends')}
                className="hover:text-white"
                title={t.addFriend}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-0.5">
              {acceptedFriends.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-[#949ba4]">
                  {t.noFriendsYet}
                </div>
              ) : (
                acceptedFriends.map((rel) => {
                  const friend = rel.user;
                  const isSelected = activeDmUser?.id === friend.id;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => selectDm(friend)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-[#404249] text-white font-medium'
                          : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                      }`}
                    >
                      <UserAvatar
                        src={friend.avatarUrl}
                        alt={friend.displayName}
                        size="sm"
                        status={friend.status}
                      />
                      <div className="flex-1 text-start truncate">
                        <div className="font-medium truncate text-white text-xs">
                          {friend.displayName}
                        </div>
                        <div className="text-[11px] text-[#949ba4] truncate">
                          {friend.customStatusText || `@${friend.username}`}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voice Connected Banner (if in voice channel) */}
      {voiceState.currentChannelId && (
        <div className="px-3 py-2 bg-[#232428] border-t border-[#1e1f22]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-[#23a559] animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#23a559] truncate leading-tight">
                  {t.voiceConnected}
                </div>
                <div className="text-[11px] text-[#949ba4] truncate">
                  {currentVoiceChannel?.name || 'Voice Room'}
                </div>
              </div>
            </div>
            <button
              onClick={leaveVoiceChannel}
              className="p-1.5 hover:bg-[#35373c] text-[#f23f43] rounded transition-colors"
              title={t.disconnectVoice}
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom User Bar */}
      <footer className="h-[54px] px-2 bg-[#232428] border-t border-[#1e1f22] flex items-center justify-between relative">
        {/* User Info (Click to open status dropdown or profile) */}
        <div className="relative">
          <button
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#35373c] transition-colors max-w-[130px]"
          >
            <UserAvatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="sm"
              status={currentUser.status}
            />
            <div className="text-start truncate">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                <span className="truncate">{currentUser.displayName}</span>
                {currentUser.isOwner && (
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-[#949ba4] truncate">
                {currentUser.customStatusText || `@${currentUser.username}`}
              </div>
            </div>
          </button>

          {/* Status Selection Popup */}
          {statusMenuOpen && (
            <div
              className="absolute bottom-14 left-0 w-52 bg-[#111214] border border-[#2b2d31] rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 text-[11px] font-bold text-[#949ba4] uppercase border-b border-[#2b2d31]/50 mb-1">
                {t.status}
              </div>
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setUserStatus(s.value);
                    setStatusMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs text-start hover:bg-[#5865f2] hover:text-white transition-colors ${
                    currentUser.status === s.value ? 'bg-[#35373c] text-white' : 'text-[#dbdee1]'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${s.color} shrink-0`} />
                  <div className="flex-1">
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-[10px] opacity-75">{s.descKu}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Media Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-md hover:bg-[#35373c] transition-colors ${
              voiceState.isMuted ? 'text-[#f23f43] bg-[#f23f43]/10' : 'text-[#dbdee1]'
            }`}
            title={voiceState.isMuted ? t.unmute : t.mute}
          >
            {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-1.5 rounded-md hover:bg-[#35373c] transition-colors ${
              voiceState.isDeafened ? 'text-[#f23f43] bg-[#f23f43]/10' : 'text-[#dbdee1]'
            }`}
            title={voiceState.isDeafened ? t.undeafen : t.deafen}
          >
            {voiceState.isDeafened ? (
              <Headphones className="w-4 h-4 text-[#f23f43] line-through" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="p-1.5 rounded-md hover:bg-[#35373c] text-[#dbdee1] transition-colors"
            title={t.editProfile}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </aside>
  );
};
