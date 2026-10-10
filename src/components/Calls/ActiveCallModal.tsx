import React, { useEffect, useRef } from 'react';
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getLocalDisplayMedia, getLocalUserMedia } from '../../utils/mediaStream';
import { UserAvatar } from '../Common/UserAvatar';

export const ActiveCallModal: React.FC = () => {
  const {
    callSession,
    answerCall,
    declineCall,
    endCall,
    toggleCallMute,
    toggleCallVideo,
    toggleCallScreen,
    currentUser,
    t,
    language,
  } = useApp();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // When video call is active and connected, request real camera feed
  useEffect(() => {
    let active = true;

    if (callSession && callSession.type === 'video' && callSession.status === 'connected') {
      getLocalUserMedia({ video: true, audio: true }).then((stream) => {
        if (!active) {
          stream?.getTracks().forEach((tr) => tr.stop());
          return;
        }
        if (stream) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      });
    }

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((tr) => tr.stop());
        localStreamRef.current = null;
      }
    };
  }, [callSession?.status, callSession?.type]);

  if (!callSession || !callSession.isActive) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // INCOMING CALL PROMPT
  if (callSession.status === 'incoming') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full max-w-sm bg-[#1e1f22] border border-[#2b2d31] rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
          <div className="relative mb-4">
            <UserAvatar
              src={callSession.participant.avatarUrl}
              alt={callSession.participant.displayName}
              size="2xl"
              status={callSession.participant.status}
              isSpeaking={true}
            />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#5865f2] flex items-center justify-center text-white">
              {callSession.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            </span>
          </div>

          <h3 className="text-white text-lg font-bold">
            {callSession.participant.displayName}
          </h3>
          <p className="text-xs text-[#23a559] font-medium mt-1 animate-pulse">
            {callSession.type === 'video'
              ? (language === 'ku' ? 'پەیوەندی کامێرە (ڤیدیۆ) هاتووە...' : 'Incoming Video Call...')
              : (language === 'ku' ? 'تەلەفۆن (دەنگی) هاتووە...' : 'Incoming Voice Call...')}
          </p>

          <div className="flex items-center gap-6 mt-8">
            {/* Decline */}
            <button
              onClick={declineCall}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#f23f43] hover:bg-[#d83a3e] text-white flex items-center justify-center shadow-lg shadow-red-900/40 transition-transform group-hover:scale-110">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs text-[#949ba4] font-medium">{t.declineCall}</span>
            </button>

            {/* Accept */}
            <button
              onClick={answerCall}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#23a55a] hover:bg-[#1f8b4d] text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 transition-transform group-hover:scale-110 animate-bounce">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs text-[#23a55a] font-medium">{t.acceptCall}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE OR CALLING FULL MODAL
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col z-50">
      {/* Top Header */}
      <header className="h-14 px-6 bg-[#111214]/80 border-b border-[#2b2d31] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={callSession.participant.avatarUrl}
            alt={callSession.participant.displayName}
            size="sm"
            status={callSession.participant.status}
          />
          <div>
            <div className="text-sm font-bold text-white">
              {callSession.participant.displayName}
            </div>
            <div className="text-xs text-[#949ba4]">
              {callSession.status === 'calling' ? (
                <span className="text-amber-400 animate-pulse">{t.calling}</span>
              ) : (
                <span className="text-[#23a55a] font-semibold">
                  {formatDuration(callSession.duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-[#949ba4]">
          {callSession.type === 'video'
            ? (language === 'ku' ? 'پەیوەندی کامێرە 720p HD' : 'HD Video Call')
            : (language === 'ku' ? 'تەلەفۆنی دەنگی پارێزراو' : 'Secure Voice Call')}
        </div>
      </header>

      {/* Main Call View */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {callSession.type === 'video' ? (
          /* Video Call Layout */
          <div className="w-full h-full max-w-5xl relative flex items-center justify-center rounded-2xl overflow-hidden bg-[#18191c] border border-[#2b2d31]">
            {/* Peer Simulated Video / Avatar Stage */}
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-zinc-900 to-black">
              <img
                src={callSession.participant.bannerUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md"
              />
              <div className="relative z-10 flex flex-col items-center">
                <UserAvatar
                  src={callSession.participant.avatarUrl}
                  alt={callSession.participant.displayName}
                  size="2xl"
                  status={callSession.participant.status}
                  isSpeaking={callSession.status === 'connected'}
                />
                <span className="mt-4 text-white font-bold text-lg">
                  {callSession.participant.displayName}
                </span>
                <span className="text-xs text-[#23a55a] mt-1 bg-[#23a55a]/15 px-3 py-1 rounded-full font-semibold">
                  {callSession.status === 'connected' ? 'کامێرەی هاوڕێ سەرهێڵە' : t.calling}
                </span>
              </div>
            </div>

            {/* Local User Camera (PiP Overlay) */}
            <div className="absolute bottom-6 right-6 w-52 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-[#5865f2] bg-zinc-950 z-20">
              {callSession.isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-xs text-[#949ba4]">
                  <VideoOff className="w-6 h-6 text-[#f23f43] mb-1" />
                  <span>{language === 'ku' ? 'کامێرە داخراوە' : 'Camera Off'}</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}
              <div className="absolute bottom-1 left-2 text-[10px] text-white/80 font-bold bg-black/60 px-1.5 py-0.5 rounded">
                {currentUser.displayName}
              </div>
            </div>
          </div>
        ) : (
          /* Voice Call Layout */
          <div className="flex flex-col items-center justify-center max-w-md w-full p-8 rounded-2xl bg-[#1e1f22] border border-[#2b2d31] shadow-2xl">
            <div className="relative mb-6">
              <UserAvatar
                src={callSession.participant.avatarUrl}
                alt={callSession.participant.displayName}
                size="2xl"
                status={callSession.participant.status}
                isSpeaking={callSession.status === 'connected'}
              />
            </div>

            <h2 className="text-white text-xl font-bold mb-1">
              {callSession.participant.displayName}
            </h2>
            <div className="text-xs text-[#949ba4] mb-6">
              @{callSession.participant.username}
            </div>

            <div className="text-sm font-semibold text-[#23a55a] bg-[#23a55a]/10 px-4 py-1.5 rounded-full border border-[#23a55a]/20">
              {callSession.status === 'calling' ? t.calling : `${t.callDuration}: ${formatDuration(callSession.duration)}`}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <footer className="h-20 bg-[#111214] border-t border-[#2b2d31] flex items-center justify-center gap-4 px-6">
        {/* Toggle Mute */}
        <button
          onClick={toggleCallMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            callSession.isMuted
              ? 'bg-[#f23f43] text-white'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={callSession.isMuted ? t.unmute : t.mute}
        >
          {callSession.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Toggle Video */}
        {callSession.type === 'video' && (
          <button
            onClick={toggleCallVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              callSession.isVideoOff
                ? 'bg-[#f23f43] text-white'
                : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
            }`}
            title={callSession.isVideoOff ? t.cameraOn : t.cameraOff}
          >
            {callSession.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        {/* Screen Share */}
        <button
          onClick={toggleCallScreen}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            callSession.isScreenSharing
              ? 'bg-[#23a55a] text-white'
              : 'bg-[#2b2d31] text-white hover:bg-[#35373c]'
          }`}
          title={callSession.isScreenSharing ? t.stopShareScreen : t.shareScreen}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-[#f23f43] hover:bg-[#d83a3e] text-white flex items-center justify-center shadow-lg shadow-red-900/50 transition-transform hover:scale-105"
          title={t.endCall}
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </footer>
    </div>
  );
};
