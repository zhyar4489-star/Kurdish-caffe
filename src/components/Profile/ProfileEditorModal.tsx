import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Crown,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserStatus } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

const GALLERY_SAMPLES = [
  {
    title: 'ستایلی شارستانی',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'تەکنەلۆژیا و کۆد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'موزیک و هونەر',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'گەیمینگی تاریک',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  },
];

const THEME_ACCENTS = [
  '#06b6d4', // Cyan Azure
  '#8b5cf6', // Electric Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber Gold
  '#ec4899', // Pink Neon
  '#3b82f6', // Royal Blue
  '#ef4444', // Crimson
  '#6366f1', // Indigo
];

export const ProfileEditorModal: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    profileModalOpen,
    setProfileModalOpen,
    t,
    language,
  } = useApp();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl || '');
  const [bannerColor, setBannerColor] = useState(currentUser.bannerColor || '#131620');
  const [accentColor, setAccentColor] = useState(currentUser.accentColor || '#06b6d4');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [customStatusText, setCustomStatusText] = useState(currentUser.customStatusText || '');
  const [customStatusEmoji, setCustomStatusEmoji] = useState(currentUser.customStatusEmoji || '✨');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File input refs for opening native mobile/desktop photo gallery
  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);
  const bannerGalleryInputRef = useRef<HTMLInputElement>(null);

  if (!profileModalOpen) return null;

  const handleAvatarGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      username,
      bio,
      avatarUrl,
      bannerUrl,
      bannerColor,
      accentColor,
      status,
      customStatusText,
      customStatusEmoji,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setProfileModalOpen(false);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        className="w-full max-w-4xl bg-[#11131a] border border-[#232838] rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-16 px-6 bg-gradient-to-r from-[#171a24] to-[#12141c] border-b border-[#232838] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">
                {language === 'ku' ? 'دەستکاری پڕۆفایل و گەلەری وێنەکان' : 'Profile & Gallery Photo Studio'}
              </h2>
              <p className="text-xs text-[#8b92a5]">
                {language === 'ku'
                  ? 'وێنەی ئەڤەتار و بانەر لە گەلەری مۆبایلەکەت دابنێ بە دڵی خۆت'
                  : 'Select photos directly from your device gallery'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-9 h-9 rounded-xl bg-[#1d212e] text-[#8b92a5] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Editor on Left, Live Card Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Controls Form (7 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
            {/* 1. GALLERY UPLOAD SECTION */}
            <div className="p-4 rounded-2xl bg-[#171a24] border border-[#232838] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4" />
                  {language === 'ku' ? 'هەڵبژاردنی وێنە لە گەلەری' : 'Upload from Device Gallery'}
                </span>
                <span className="text-[11px] text-[#8b92a5]">PNG, JPG, WebP</span>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={avatarGalleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarGallerySelect}
              />
              <input
                ref={bannerGalleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerGallerySelect}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pick Avatar from Gallery */}
                <button
                  type="button"
                  onClick={() => avatarGalleryInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-[#1d212e] hover:bg-[#252b3b] border border-[#2d3447] hover:border-cyan-400/50 flex items-center gap-3 transition-all text-start group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black shrink-0 ring-2 ring-cyan-500/40 group-hover:scale-105 transition-transform">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {language === 'ku' ? 'گۆڕینی ئەڤەتار لە گەلەری' : 'Pick Avatar from Gallery'}
                    </div>
                    <div className="text-[10px] text-[#8b92a5]">
                      {language === 'ku' ? 'کلیک بکە بۆ هەڵبژاردن' : 'Click to select photo'}
                    </div>
                  </div>
                </button>

                {/* Pick Banner from Gallery */}
                <button
                  type="button"
                  onClick={() => bannerGalleryInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-[#1d212e] hover:bg-[#252b3b] border border-[#2d3447] hover:border-cyan-400/50 flex items-center gap-3 transition-all text-start group"
                >
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-black shrink-0 ring-2 ring-cyan-500/40 group-hover:scale-105 transition-transform">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#131620]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {language === 'ku' ? 'گۆڕینی بانەر لە گەلەری' : 'Pick Banner from Gallery'}
                    </div>
                    <div className="text-[10px] text-[#8b92a5]">
                      {language === 'ku' ? 'کلیک بکە بۆ هەڵبژاردنی وێنە' : 'Click to select banner'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Gallery Presets / Suggestions */}
              <div>
                <div className="text-[11px] text-[#8b92a5] mb-2 font-medium">
                  {language === 'ku' ? 'یان شێوازێکی ئامادەکراو هەڵبژێرە:' : 'Or choose a preset style:'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GALLERY_SAMPLES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(sample.avatar);
                        setBannerUrl(sample.banner);
                      }}
                      className="p-2 rounded-xl bg-[#12141c] hover:bg-[#1d212e] border border-[#232838] text-start flex flex-col gap-1.5 transition-all group"
                    >
                      <div className="h-10 w-full rounded-md overflow-hidden relative">
                        <img src={sample.banner} alt={sample.title} className="w-full h-full object-cover" />
                        <img
                          src={sample.avatar}
                          alt="Avatar"
                          className="w-5 h-5 rounded-full absolute -bottom-1 left-1 border border-black"
                        />
                      </div>
                      <span className="text-[10px] text-[#8b92a5] group-hover:text-white font-medium truncate">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                  {t.displayName}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#171a24] border border-[#232838] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                  {t.username}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 rtl:right-3 rtl:left-auto text-sm text-[#5d6479]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#171a24] border border-[#232838] rounded-xl ps-7 pe-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Custom Status */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                {t.customStatus}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customStatusEmoji}
                  onChange={(e) => setCustomStatusEmoji(e.target.value)}
                  className="w-12 text-center bg-[#171a24] border border-[#232838] rounded-xl text-lg text-white outline-none"
                  title="Emoji"
                />
                <input
                  type="text"
                  value={customStatusText}
                  onChange={(e) => setCustomStatusText(e.target.value)}
                  placeholder={t.customStatusPlaceholder}
                  className="flex-1 bg-[#171a24] border border-[#232838] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Accent Theme Colors */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                {t.accentColor}
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {THEME_ACCENTS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                      accentColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {accentColor === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
                  title="Custom Color"
                />
              </div>
            </div>

            {/* About Me Bio */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-1.5">
                {t.bio}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.bioPlaceholder}
                rows={2}
                className="w-full bg-[#171a24] border border-[#232838] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232838]">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-[#8b92a5] hover:text-white"
              >
                {language === 'ku' ? 'داخستن' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'ku' ? 'پاشەکەوتکرا!' : 'Saved!'}</span>
                  </>
                ) : (
                  <span>{t.saveChanges}</span>
                )}
              </button>
            </div>
          </form>

          {/* Live Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold uppercase text-[#8b92a5] mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{t.previewCard}</span>
            </div>

            {/* Modern Glass Profile Card (Distinct, non-Discord aesthetic) */}
            <div
              className="w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl border bg-gradient-to-b from-[#181b26] to-[#0f1118]"
              style={{ borderColor: `${accentColor}60` }}
            >
              {/* Banner Area */}
              <div
                className="h-32 w-full relative bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
                  backgroundColor: bannerColor,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#181b26]/90" />
                {currentUser.isOwner && (
                  <div className="absolute top-3 right-3 bg-amber-500/90 text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-black uppercase shadow-lg">
                    <Crown className="w-3 h-3 fill-black" />
                    <span>OWNER</span>
                  </div>
                )}
              </div>

              {/* Avatar Cutout */}
              <div className="px-5 relative -mt-12 mb-3 flex items-end justify-between">
                <div className="p-1 rounded-full bg-[#181b26] ring-2 ring-cyan-500/30">
                  <UserAvatar
                    src={avatarUrl}
                    alt={displayName}
                    size="xl"
                    status={status}
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#12141c] px-2.5 py-1 rounded-full border border-[#232838]">
                  <span className="text-xs">✨</span>
                  <span className="text-[11px] font-bold text-white">VIP</span>
                </div>
              </div>

              {/* Details Box */}
              <div className="p-5 pt-0 space-y-3">
                <div>
                  <div className="text-white font-black text-lg">{displayName}</div>
                  <div className="text-xs text-cyan-400 font-semibold">@{username}</div>

                  {customStatusText && (
                    <div className="mt-2 text-xs text-[#cfd4e2] bg-[#12141c] p-2 rounded-xl border border-[#232838] flex items-center gap-2">
                      <span>{customStatusEmoji}</span>
                      <span className="truncate">{customStatusText}</span>
                    </div>
                  )}
                </div>

                {/* About me */}
                <div className="text-xs text-[#8b92a5] leading-relaxed">
                  {bio || (language === 'ku' ? 'هیچ زانیارییەک نەنووسراوە' : 'No bio written')}
                </div>

                <div className="pt-2 border-t border-[#232838] text-[11px] text-[#5d6479] flex items-center justify-between">
                  <span>{language === 'ku' ? 'ئەندامە لە:' : 'Joined:'}</span>
                  <span className="text-[#8b92a5] font-medium">{currentUser.joinedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
