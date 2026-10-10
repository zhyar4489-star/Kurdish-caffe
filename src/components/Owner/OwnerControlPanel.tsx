import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  Coins,
  Crown,
  Gift,
  HelpCircle,
  PlusCircle,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playApplePaySuccess, playCoinSound } from '../../utils/soundEffects';

export const OwnerControlPanel: React.FC = () => {
  const {
    ownerPanelOpen,
    setOwnerPanelOpen,
    currentUser,
    addCoins,
    switchUserRole,
    friends,
    t,
    language,
    allOwners,
    addAppOwner,
    removeAppOwner,
    isPrimaryOwner,
  } = useApp();

  const [customAmount, setCustomAmount] = useState<number>(50000);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [friendGiftAmount, setFriendGiftAmount] = useState<number>(5000);
  const [newOwnerInput, setNewOwnerInput] = useState<string>('');
  const [selectedOwnerFriendId, setSelectedOwnerFriendId] = useState<string>('');
  const [actionSuccessText, setActionSuccessText] = useState<string | null>(null);

  if (!ownerPanelOpen) return null;

  const triggerCelebration = (text: string) => {
    setActionSuccessText(text);
    playCoinSound();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setActionSuccessText(null);
    }, 3000);
  };

  const handleClaimFreeCoins = (amount: number) => {
    addCoins(
      amount,
      language === 'ku'
        ? `وەرگرتنی ${amount.toLocaleString()} سکە وەک خاوەنی ئەپ بە خۆڕایی 👑`
        : `Claimed ${amount.toLocaleString()} free owner coins 👑`
    );
    triggerCelebration(
      language === 'ku'
        ? `بڕی +${amount.toLocaleString()} سکە بە بەلاش خرایە سەر باڵانسی شەخسی خۆت!`
        : `+${amount.toLocaleString()} free coins added to your owner account!`
    );
  };

  const handleGiftFriend = () => {
    const friend = friends.find((f) => f.user.id === selectedFriendId);
    if (!friend || friendGiftAmount <= 0) return;

    triggerCelebration(
      language === 'ku'
        ? `بڕی ${friendGiftAmount.toLocaleString()} سکەی بەلاش بەخشرا بە ${friend.user.displayName}!`
        : `Gifted ${friendGiftAmount.toLocaleString()} free coins to ${friend.user.displayName}!`
    );
  };

  const handleAssignCoOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const target = selectedOwnerFriendId || newOwnerInput;
    if (!target) return;

    const res = addAppOwner(target);
    if (res.success) {
      triggerCelebration(res.message);
      setNewOwnerInput('');
      setSelectedOwnerFriendId('');
    } else {
      setActionSuccessText(res.message);
      setTimeout(() => setActionSuccessText(null), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={() => setOwnerPanelOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#313338] border-2 border-amber-500/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crown Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-inner">
              <Crown className="w-8 h-8 fill-amber-300 stroke-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg tracking-wide">
                  {t.ownerPanelTitle}
                </h2>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  CREATOR & CO-OWNERS
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {currentUser.displayName} ({currentUser.email})
              </p>
            </div>
          </div>

          <button
            onClick={() => setOwnerPanelOpen(false)}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Success Banner */}
          {actionSuccessText && (
            <div className="p-3.5 rounded-xl bg-[#23a55a]/20 border border-[#23a55a]/50 text-[#23a55a] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{actionSuccessText}</span>
            </div>
          )}

          {/* Current Live Coin Balance */}
          <div className="p-4 rounded-2xl bg-[#1e1f22] border border-[#2b2d31] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-[#949ba4] font-semibold">{t.coinsBalance}</div>
                <div className="text-2xl font-black text-amber-400">
                  {currentUser.coins.toLocaleString()} <span className="text-xs font-normal text-white">💎 Coins</span>
                </div>
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs font-bold text-[#23a55a] bg-[#23a55a]/15 px-3 py-1 rounded-full">
                👑 Unlimited Owner Pass
              </span>
            </div>
          </div>

          {/* SECTION 1: MULTI-OWNER & CO-OWNERS MANAGEMENT */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1e1f22] to-[#252836] border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {language === 'ku'
                    ? 'بەڕێوەبردنی خاوەنەکانی ئەپ (App Owners & Co-Owners)'
                    : 'Manage App Owners & Co-Owners'}
                </h3>
              </div>
              <span className="text-[10px] bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full">
                {allOwners.length} {language === 'ku' ? 'ئۆنەر' : 'Owners'}
              </span>
            </div>

            <p className="text-xs text-[#949ba4]">
              {language === 'ku'
                ? 'دەتوانیت زیاتر لە یەک ئۆنەر بۆ ئەپەکە دیاریبکەیت (وەک خۆت و هەژمارێکی تر). خاوەنەکان دەسەڵاتی تاجی زێڕین و پارەی خۆڕاییان دەبێت.'
                : 'Assign multiple owners to the app (e.g. you and another account). Co-owners get the golden crown and full owner privileges.'}
            </p>

            {/* Current Owners List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#949ba4] uppercase">
                {language === 'ku' ? 'لیستی خاوەنە کاراکان:' : 'Current App Owners:'}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {allOwners.map((owner) => {
                  const isPrimary = owner.id === 'user_owner_zhyar' || owner.email === 'zhyar4489@gmail.com';

                  return (
                    <div
                      key={owner.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#141824] border border-[#2b334a]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={owner.avatarUrl}
                          alt={owner.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{owner.displayName}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.2 rounded-full border border-amber-500/30 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 fill-amber-400" />
                              <span>{isPrimary ? (language === 'ku' ? 'خاوەنی سەرەکی' : 'Lead Creator') : (language === 'ku' ? 'ئۆنەری هاوبەش' : 'Co-Owner')}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8b92a5]">
                            @{owner.username} · {owner.email}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button (Allowed only for primary creator Zhyar) */}
                      {!isPrimary && isPrimaryOwner ? (
                        <button
                          type="button"
                          onClick={() => {
                            const res = removeAppOwner(owner.id);
                            triggerCelebration(res.message);
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                          title={language === 'ku' ? 'لادانی ئەم کەسە لە خاوەنی ئەپ' : 'Remove Co-Owner'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === 'ku' ? 'لادان' : 'Remove'}</span>
                        </button>
                      ) : isPrimary ? (
                        <span className="text-[10px] text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded">
                          {language === 'ku' ? 'سەرەکی' : 'Primary'}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add New Co-Owner Form (Restricted solely to primary creator Zhyar) */}
            {isPrimaryOwner ? (
              <form onSubmit={handleAssignCoOwner} className="pt-2 border-t border-[#2b334a] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#949ba4] uppercase">
                    {language === 'ku' ? 'دیاریکردنی ئۆنەرێکی نوێ:' : 'Add a New Co-Owner:'}
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {language === 'ku' ? 'تەنها لە دەسەڵاتی تۆدایە 🔒' : 'Primary Owner Privilege 🔒'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedOwnerFriendId}
                    onChange={(e) => {
                      setSelectedOwnerFriendId(e.target.value);
                      if (e.target.value) setNewOwnerInput('');
                    }}
                    className="bg-[#141824] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#2b334a] focus:border-amber-400 flex-1"
                  >
                    <option value="">-- {language === 'ku' ? 'هاوڕێیەک لە لیستەکە هەڵبژێرە' : 'Select from friends'} --</option>
                    {friends
                      .filter((f) => !allOwners.some((o) => o.id === f.user.id))
                      .map((f) => (
                        <option key={f.user.id} value={f.user.id}>
                          {f.user.displayName} (@{f.user.username})
                        </option>
                      ))}
                  </select>

                  <div className="flex items-center text-xs text-[#8b92a5] px-1 font-bold">
                    {language === 'ku' ? 'یان' : 'or'}
                  </div>

                  <input
                    type="text"
                    value={newOwnerInput}
                    onChange={(e) => {
                      setNewOwnerInput(e.target.value);
                      if (e.target.value) setSelectedOwnerFriendId('');
                    }}
                    placeholder={language === 'ku' ? 'ناوی بەکارهێنەر/ئیمەیڵ بنووسە' : 'Username / Email'}
                    className="bg-[#141824] text-white text-xs px-3 py-2.5 rounded-xl outline-none border border-[#2b334a] focus:border-amber-400 flex-1 placeholder:text-[#555d73]"
                  />

                  <button
                    type="submit"
                    disabled={!selectedOwnerFriendId && !newOwnerInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Crown className="w-3.5 h-3.5 fill-black" />
                    <span>{language === 'ku' ? 'دانان وەک ئۆنەر 👑' : 'Grant Owner 👑'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-3 border-t border-[#2b334a] p-3 rounded-xl bg-[#141824] border border-[#2b334a] flex items-center gap-2.5 text-xs text-[#8b92a5]">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  {language === 'ku'
                    ? 'دەسەڵاتی دیاریکردن یان لادانی ئۆنەر تەنها تایبەتە بە ئەکاونتی سەرەکی Zhyar. ئۆنەرەکانی تر ناتوانن ئۆنەری نوێ دابنێن.'
                    : 'Only the primary creator account (Zhyar) can assign or remove owners. Co-owners do not have this permission.'}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 2: INSTANT 1-CLICK FREE COINS FOR OWNER */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.freeUnlimitedCoins}
              </h3>
            </div>
            <p className="text-xs text-[#949ba4] mb-3">
              {language === 'ku'
                ? 'وەک خاوەنی سەرەکی ئەپەکە، دەتوانیت بە دڵی خۆت هەرچەندە پارەت ویست بە بەلاش ڕاستەوخۆ وەربگریت بەبێ هیچ پارەدانێک!'
                : 'As the owner and creator of KurdCord, you can generate and receive unlimited coins completely free with zero cost!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleClaimFreeCoins(1000)}
                className="py-3 px-4 rounded-xl bg-[#2b2d31] hover:bg-[#35373c] border border-amber-500/30 hover:border-amber-400 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all group hover:scale-[1.02]"
              >
                <span className="text-amber-400 font-extrabold text-sm group-hover:scale-110 transition-transform">
                  +1,000 Coins
                </span>
                <span className="text-[10px] text-[#23a55a] font-semibold">100% FREE (بەلاش)</span>
              </button>

              <button
                onClick={() => handleClaimFreeCoins(10000)}
                className="py-3 px-4 rounded-xl bg-gradient-to-br from-[#2b2d31] to-purple-950/40 hover:to-purple-900/50 border border-purple-500/40 hover:border-purple-400 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all group hover:scale-[1.02]"
              >
                <span className="text-purple-300 font-extrabold text-sm group-hover:scale-110 transition-transform">
                  +10,000 Coins
                </span>
                <span className="text-[10px] text-[#23a55a] font-semibold">VIP Pass (خۆڕایی)</span>
              </button>

              <button
                onClick={() => handleClaimFreeCoins(100000)}
                className="py-3 px-4 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs flex flex-col items-center gap-1 transition-all shadow-lg shadow-amber-600/20 hover:scale-[1.02]"
              >
                <span className="text-white font-black text-sm">
                  +100,000 Coins 👑
                </span>
                <span className="text-[10px] text-amber-100 font-semibold">Ultimate Creator Vault</span>
              </button>
            </div>

            {/* Custom Amount Generator */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#1e1f22] border border-[#2b2d31] flex flex-col sm:flex-row items-center gap-3">
              <div className="text-xs text-[#949ba4] font-semibold shrink-0">
                {t.customAmount}
              </div>
              <input
                type="number"
                min="100"
                max="10000000"
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full sm:w-44 bg-[#2b2d31] text-white text-sm font-bold px-3 py-2 rounded-lg outline-none border border-[#3f4147] focus:border-amber-400"
              />
              <button
                onClick={() => handleClaimFreeCoins(customAmount)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white font-bold text-xs transition-colors shrink-0 shadow-md"
              >
                {t.giveCustomCoins}
              </button>
            </div>
          </div>

          {/* SECTION 3: GIFT FREE COINS TO COMMUNITY FRIENDS */}
          <div className="border-t border-[#2b2d31] pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-pink-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.grantToFriends}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="w-full bg-[#1e1f22] text-white text-xs px-3 py-2.5 rounded-lg outline-none border border-[#2b2d31]"
              >
                <option value="">-- {t.selectFriend} --</option>
                {friends.map((f) => (
                  <option key={f.user.id} value={f.user.id}>
                    {f.user.displayName} (@{f.user.username})
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={friendGiftAmount}
                onChange={(e) => setFriendGiftAmount(Number(e.target.value))}
                className="w-full sm:w-32 bg-[#1e1f22] text-white text-xs px-3 py-2.5 rounded-lg outline-none border border-[#2b2d31]"
                placeholder="Coins"
              />

              <button
                onClick={handleGiftFriend}
                disabled={!selectedFriendId}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#eb459f] hover:bg-[#d83a8e] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                <span>{language === 'ku' ? 'بەخشین بە بەلاش' : 'Send Free Gift'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: ROLE TOGGLE (TEST REGULAR USER VS OWNER) */}
          <div className="border-t border-[#2b2d31] pt-5 flex items-center justify-between p-3.5 rounded-xl bg-[#1e1f22] border">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'ku' ? 'دۆخی هەژماری شەخسی خاوەن (Owner Mode)' : 'Owner Account Privileges'}
                </span>
              </div>
              <div className="text-[11px] text-[#949ba4] mt-0.5">
                {currentUser.isOwner
                  ? (language === 'ku' ? 'ئێستا وەک خاوەنی سەرەکی Zhyar ناسراویت' : 'Active as App Owner & Developer')
                  : (language === 'ku' ? 'لە دۆخی ئەندامی ئاسایدایت بۆ تێستکردنی کڕینی ئایتونس' : 'Testing as regular member')}
              </div>
            </div>

            <button
              onClick={() => switchUserRole(!currentUser.isOwner)}
              className="p-1 rounded-lg text-amber-400 hover:bg-[#2b2d31] transition-colors"
              title="Toggle Owner Role"
            >
              {currentUser.isOwner ? (
                <ToggleRight className="w-8 h-8 text-[#23a55a]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[#80848e]" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#2b2d31] border-t border-[#1e1f22] flex items-center justify-between text-xs text-[#949ba4]">
          <span>KurdCord Creator Engine · Authorized for {currentUser.email}</span>
          <button
            onClick={() => setOwnerPanelOpen(false)}
            className="px-4 py-1.5 bg-[#5865f2] text-white rounded-lg font-bold hover:bg-[#4752c4]"
          >
            {language === 'ku' ? 'داخستنی پەناڵ' : 'Close Panel'}
          </button>
        </div>
      </div>
    </div>
  );
};
