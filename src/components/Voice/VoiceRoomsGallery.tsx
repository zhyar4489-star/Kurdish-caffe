import React, { useEffect, useRef } from 'react';
import {
  Crown,
  Headphones,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Radio,
  Settings,
  Sparkles,
  Users,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../Common/UserAvatar';

export const VoiceRoomsGallery: React.FC = () => {
  const {
    channels,
    voiceState,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
    toggleVoiceVideo,
    toggleVoiceScreenShare,
    localVideoStream,
    localScreenStream,
    currentUser,
    setSettingsModalOpen,
    t,
    language,
  } = useApp();

  const voiceChannels = channels.filter((c) => c.type === 'voice');
  const activeRoom = channels.find((c) => c.id === voiceState.currentChannelId);
  const activeParticipants = activeRoom?.activeUsers || [currentUser];

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localVideoStream) {
      localVideoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  useEffect(() => {
    if (screenVideoRef.current && localScreenStream) {
      screenVideoRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  return (
    <div className="flex-1 flex flex-col bg-[#0a0c12] overflow-hidden select-none">
      {/* If currently connected to a voice lounge, show the Active Lounge Stage */}
      {voiceState.currentChannelId ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Active Lounge Header */}
          <div className="h-14 px-6 bg-[#0f121b] border-b border-[#1c2233] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeRoom?.name}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    LIVE HD
                  </span>
                </div>
                <div className="text-[11px] text-[#6d758d]">
                  {activeParticipants.length} {language === 'ku' ? 'ئەندام لەم ژوورەن' : 'members in lounge'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings button in voice room */}
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#171a26] hover:bg-[#202536] text-[#8b92a5] hover:text-cyan-400 border border-[#252c3f] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title={language === 'ku' ? 'سیتینگی ژوورەکان و دەنگ' : 'Voice Settings'}
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ku' ? 'سیتینگ' : 'Settings'}</span>
              </button>

              {/* Leave Room Button */}
              <button
                onClick={leaveVoiceChannel}
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>{t.disconnectVoice}</span>
              </button>
            </div>
          </div>

          {/* Screen Share Stage (if active) */}
          {voiceState.isScreenSharing && (
            <div className="p-4 bg-black flex items-center justify-center max-h-[42vh] border-b border-[#1c2233]">
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden border border-[#232838]">
                <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-lg text-xs text-white flex items-center gap-2 border border-white/10">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentUser.displayName} (Screen Share 1080p 60fps)</span>
                </div>
              </div>
            </div>
          )}

          {/* Participants Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto h-full">
              {activeParticipants.map((user) => {
                const isMe = user.id === currentUser.id;
                const isSpeaking = voiceState.speakingUsers.includes(user.id);
                const isMuted = isMe ? voiceState.isMuted : false;
                const hasVideo = isMe && voiceState.isVideoOn && localVideoStream;

                return (
                  <div
                    key={user.id}
                    className={`relative rounded-3xl p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#131622] to-[#0d0f17] border transition-all ${
                      isSpeaking
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                        : 'border-[#1f2638]'
                    }`}
                  >
                    {hasVideo ? (
                      <div className="w-full h-full absolute inset-0 rounded-3xl overflow-hidden bg-black">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center">
                        <UserAvatar
                          src={user.avatarUrl}
                          alt={user.displayName}
                          size="2xl"
                          status={user.status}
                          isSpeaking={isSpeaking}
                        />

                        {/* Animated Voice Equalizer */}
                        {isSpeaking ? (
                          <div className="flex items-center gap-1.5 mt-4">
                            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                          </div>
                        ) : (
                          <div className="h-6 mt-4" />
                        )}
                      </div>
                    )}

                    {/* User Label Card */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs border border-white/10 z-10">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold truncate">{user.displayName}</span>
                        {user.isOwner && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Glass Control Dock */}
          <footer className="p-4 bg-[#0e111a] border-t border-[#1c2233] flex items-center justify-center gap-3">
            <button
              onClick={toggleVoiceVideo}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                voiceState.isVideoOn
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-[#181d2a] hover:bg-[#202738] text-[#8b92a5] hover:text-white border border-[#252e42]'
              }`}
            >
              {voiceState.isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span>{voiceState.isVideoOn ? t.cameraOff : t.cameraOn}</span>
            </button>

            <button
              onClick={toggleVoiceScreenShare}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                voiceState.isScreenSharing
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#181d2a] hover:bg-[#202738] text-[#8b92a5] hover:text-white border border-[#252e42]'
              }`}
            >
              {voiceState.isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              <span>{voiceState.isScreenSharing ? t.stopShareScreen : t.shareScreen}</span>
            </button>

            <button
              onClick={toggleMute}
              className={`p-3 rounded-2xl transition-all ${
                voiceState.isMuted
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-[#181d2a] hover:bg-[#202738] text-white border border-[#252e42]'
              }`}
            >
              {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleDeafen}
              className={`p-3 rounded-2xl transition-all ${
                voiceState.isDeafened
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-[#181d2a] hover:bg-[#202738] text-white border border-[#252e42]'
              }`}
            >
              <Headphones className="w-4 h-4" />
            </button>

            <button
              onClick={leaveVoiceChannel}
              className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{t.disconnectVoice}</span>
            </button>
          </footer>
        </div>
      ) : (
        /* Voice Lounges Gallery View (Cards) */
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Radio className="w-6 h-6 text-cyan-400" />
                <span>{language === 'ku' ? 'هۆڵ و ژوورەکانی دەنگی ڕاستەوخۆ' : 'Live Voice Lounges'}</span>
              </h2>
              <p className="text-xs text-[#8b92a5] mt-1">
                {language === 'ku'
                  ? 'بچۆ ناو هەر ژوورێک کە دەتەوێت و ڕاستەوخۆ قسە بکە بە مایکرۆفۆن یان کامێرە و شاشە هاوبەش بکە'
                  : 'Join any room to talk via mic, share camera, or present screen'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#8b92a5] bg-[#141824] px-3 py-1.5 rounded-xl border border-[#20273a]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{voiceChannels.length} {language === 'ku' ? 'ژووری چالاک' : 'Active Lounges'}</span>
              </div>

              {/* Dedicated Settings Button in Voice Header */}
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1d2334] border border-[#20273a] hover:border-cyan-500/40 text-[#8b92a5] hover:text-white transition-all text-xs font-bold shadow-sm cursor-pointer"
                title={language === 'ku' ? 'سیتینگی ژوورەکان و ئەپ' : 'Voice & App Settings'}
              >
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ku' ? 'سیتینگی دەنگ' : 'Voice Settings'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {voiceChannels.map((channel) => {
              const activeCount = channel.activeUsers?.length || 0;

              return (
                <div
                  key={channel.id}
                  className="rounded-3xl p-5 bg-gradient-to-b from-[#131622] to-[#0e111a] border border-[#20273a] hover:border-cyan-500/40 transition-all shadow-xl hover:shadow-cyan-500/5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-[11px] border border-cyan-500/20">
                        {language === 'ku' ? 'دەنگی کوالێتی بەرز' : 'HD AUDIO'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[#8b92a5] font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{activeCount}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors mb-1">
                      {channel.name}
                    </h3>
                    <p className="text-xs text-[#6d758d] line-clamp-2 leading-relaxed mb-4">
                      {channel.topic}
                    </p>

                    {/* Member Avatars Stack */}
                    <div className="flex items-center gap-2 mb-4">
                      {channel.activeUsers && channel.activeUsers.length > 0 ? (
                        <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                          {channel.activeUsers.map((u) => (
                            <img
                              key={u.id}
                              src={u.avatarUrl}
                              alt={u.displayName}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#131622] object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#555d73]">
                          {language === 'ku' ? 'ژوورەکە بەتاڵە، یەکەمین کەس بە پەیوەست ببێت' : 'Empty room, be the first to join'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Join Lounge Button */}
                  <button
                    onClick={() => joinVoiceChannel(channel.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'چوونە ژووری دەنگ' : 'Join Voice Lounge'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
