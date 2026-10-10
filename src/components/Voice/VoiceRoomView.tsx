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
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../Common/UserAvatar';

export const VoiceRoomView: React.FC = () => {
  const {
    channels,
    voiceState,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
    toggleVoiceVideo,
    toggleVoiceScreenShare,
    localVideoStream,
    localScreenStream,
    currentUser,
    t,
    language,
  } = useApp();

  const currentChannel = channels.find((c) => c.id === voiceState.currentChannelId);
  const activeParticipants = currentChannel?.activeUsers || [currentUser];

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local video stream
  useEffect(() => {
    if (localVideoRef.current && localVideoStream) {
      localVideoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  // Attach local screen share stream
  useEffect(() => {
    if (screenVideoRef.current && localScreenStream) {
      screenVideoRef.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  if (!voiceState.currentChannelId) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#111214] overflow-hidden select-none">
      {/* Top Voice Header */}
      <header className="h-12 px-4 bg-[#1e1f22] border-b border-[#2b2d31] flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Volume2 className="w-5 h-5 text-[#23a559]" />
          <span className="font-bold text-sm">{currentChannel?.name || t.voiceChannel}</span>
          <span className="text-xs text-[#23a559] bg-[#23a559]/15 px-2 py-0.5 rounded-full font-bold">
            {t.voiceConnected} · RTC 24ms
          </span>
        </div>

        <div className="text-xs text-[#949ba4]">
          {activeParticipants.length} {language === 'ku' ? 'ئەندام لە ژوورەکەن' : 'members connected'}
        </div>
      </header>

      {/* Screen Share Stage (if screen share active) */}
      {voiceState.isScreenSharing && (
        <div className="p-4 bg-black flex flex-col items-center justify-center max-h-[45vh] border-b border-[#2b2d31]">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center bg-zinc-950 rounded-lg overflow-hidden border border-[#2b2d31]">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-[11px] text-white flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-[#23a559]" />
              <span>{currentUser.displayName} - Screen Share (1080p 60FPS)</span>
            </div>
          </div>
        </div>
      )}

      {/* Participants Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto h-full">
          {activeParticipants.map((user) => {
            const isMe = user.id === currentUser.id;
            const isSpeaking = voiceState.speakingUsers.includes(user.id);
            const isMuted = isMe ? voiceState.isMuted : false;
            const isDeaf = isMe ? voiceState.isDeafened : false;
            const hasVideo = isMe && voiceState.isVideoOn && localVideoStream;

            return (
              <div
                key={user.id}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[#2b2d31] border transition-all ${
                  isSpeaking
                    ? 'border-[#23a559] shadow-lg shadow-[#23a559]/15'
                    : 'border-[#1e1f22]'
                }`}
              >
                {/* Video element or Avatar */}
                {hasVideo ? (
                  <div className="w-full h-full absolute inset-0 rounded-2xl overflow-hidden bg-black">
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

                    {/* Animated Sound Wave Bars when speaking */}
                    {isSpeaking && (
                      <div className="flex items-center gap-1 mt-3">
                        <span className="w-1 h-3 bg-[#23a559] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-5 bg-[#23a559] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-4 bg-[#23a559] rounded-full animate-bounce" />
                        <span className="w-1 h-2 bg-[#23a559] rounded-full animate-bounce [animation-delay:-0.2s]" />
                      </div>
                    )}
                  </div>
                )}

                {/* Name Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg text-white text-xs z-10">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold truncate">{user.displayName}</span>
                    {user.isOwner && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isMuted && <MicOff className="w-3.5 h-3.5 text-[#f23f43]" />}
                    {isDeaf && <Headphones className="w-3.5 h-3.5 text-[#f23f43]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Media Bar */}
      <footer className="p-4 bg-[#1e1f22] border-t border-[#2b2d31] flex items-center justify-center gap-3">
        {/* Camera Toggle */}
        <button
          onClick={toggleVoiceVideo}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
            voiceState.isVideoOn
              ? 'bg-white text-black hover:bg-slate-200'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={voiceState.isVideoOn ? t.cameraOff : t.cameraOn}
        >
          {voiceState.isVideoOn ? <Video className="w-4 h-4 text-[#23a559]" /> : <VideoOff className="w-4 h-4" />}
          <span>{voiceState.isVideoOn ? t.cameraOff : t.cameraOn}</span>
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleVoiceScreenShare}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${
            voiceState.isScreenSharing
              ? 'bg-[#23a559] text-white'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={voiceState.isScreenSharing ? t.stopShareScreen : t.shareScreen}
        >
          {voiceState.isScreenSharing ? (
            <MonitorOff className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
          <span>{voiceState.isScreenSharing ? t.stopShareScreen : t.shareScreen}</span>
        </button>

        {/* Mic Toggle */}
        <button
          onClick={toggleMute}
          className={`p-2.5 rounded-xl transition-colors ${
            voiceState.isMuted
              ? 'bg-[#f23f43] text-white'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={voiceState.isMuted ? t.unmute : t.mute}
        >
          {voiceState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Deafen Toggle */}
        <button
          onClick={toggleDeafen}
          className={`p-2.5 rounded-xl transition-colors ${
            voiceState.isDeafened
              ? 'bg-[#f23f43] text-white'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={voiceState.isDeafened ? t.undeafen : t.deafen}
        >
          <Headphones className="w-5 h-5" />
        </button>

        {/* Disconnect / Leave Voice Button */}
        <button
          onClick={leaveVoiceChannel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f23f43] hover:bg-[#d83a3e] text-white font-bold text-xs transition-colors shadow-lg shadow-red-900/30"
          title={t.disconnectVoice}
        >
          <PhoneOff className="w-4 h-4" />
          <span>{t.disconnectVoice}</span>
        </button>
      </footer>
    </div>
  );
};
