import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Apple,
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Fingerprint,
  Gift,
  History,
  KeyRound,
  Lock,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_ITUNES_CARDS, SHOP_PACKAGES } from '../../data/mockData';
import { AppleTransaction, PresetGiftCard, ShopPackage } from '../../types';
import { playApplePaySuccess, playCoinSound } from '../../utils/soundEffects';

type ShopTab = 'packages' | 'redeem' | 'history';

export const ShopModal: React.FC = () => {
  const {
    shopModalOpen,
    setShopModalOpen,
    currentUser,
    appleIdBalance,
    appleTransactions,
    redeemAppleGiftCard,
    purchaseWithAppleId,
    language,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ShopTab>('packages');
  const [selectedPackage, setSelectedPackage] = useState<ShopPackage | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'idle' | 'processing' | 'success' | 'insufficient'>('idle');
  const [applePassword, setApplePassword] = useState('AppleID#Pass2026');
  const [showPassword, setShowPassword] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<AppleTransaction | null>(null);

  // Redeem Gift Card State
  const [cardCode, setCardCode] = useState('');
  const [redeemDestination, setRedeemDestination] = useState<'coins' | 'balance'>('coins');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!shopModalOpen) return null;

  // Handle Apple ID In-App Purchase
  const handleOpenPurchaseSheet = (pkg: ShopPackage) => {
    setSelectedPackage(pkg);
    if (appleIdBalance < pkg.priceUSD) {
      setPurchaseStep('insufficient');
    } else {
      setPurchaseStep('idle');
    }
  };

  const handleConfirmPurchaseWithAppleId = () => {
    if (!selectedPackage) return;
    setPurchaseStep('processing');

    setTimeout(() => {
      const res = purchaseWithAppleId(selectedPackage, applePassword);
      if (res.success) {
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        const totalCoins = selectedPackage.coins + selectedPackage.bonusCoins;
        const receipt: AppleTransaction = {
          id: res.receiptId || `ITN-${Math.floor(100000 + Math.random() * 900000)}-AAPL`,
          type: 'apple_id_purchase',
          title: language === 'ku' ? selectedPackage.titleKu : selectedPackage.titleEn,
          amountUSD: selectedPackage.priceUSD,
          coinsReceived: totalCoins,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          timestamp: Date.now(),
          appleId: currentUser.email || 'zhyar4489@gmail.com',
          status: 'Approved',
        };
        setActiveReceipt(receipt);
        setPurchaseStep('success');
      } else {
        setPurchaseStep('insufficient');
      }
    }, 1200);
  };

  // Handle Card Redemption
  const handleRedeemCard = (codeToRedeem?: string) => {
    const finalCode = (codeToRedeem || cardCode).trim();
    if (!finalCode) {
      setRedeemError(
        language === 'ku'
          ? 'تکایە کۆدی کارتی ئایتوونس بنووسە یان یەکێک لە کارتە ئامادەکراوەکان هەڵبژێرە.'
          : 'Please enter an iTunes card code or pick one of the preset cards.'
      );
      return;
    }

    setRedeemError('');
    setIsRedeeming(true);

    setTimeout(() => {
      const result = redeemAppleGiftCard(finalCode, redeemDestination);
      setIsRedeeming(false);

      if (result.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        setRedeemSuccessMsg(result.message);
        setCardCode('');

        const receipt: AppleTransaction = {
          id: result.receiptId,
          type: 'itunes_card_redeem',
          title: `$${result.amountUSD} Apple Gift Card (${redeemDestination === 'coins' ? `${result.coinsGranted?.toLocaleString()} سکە` : 'Apple ID Balance'})`,
          amountUSD: result.amountUSD,
          coinsReceived: result.coinsGranted || 0,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          timestamp: Date.now(),
          appleId: currentUser.email || 'zhyar4489@gmail.com',
          status: 'Completed',
          cardCodeMasked: `${finalCode.slice(0, 4)}-••••-••••-${finalCode.slice(-4)}`,
        };
        setActiveReceipt(receipt);
      } else {
        setRedeemError(result.message);
      }
    }, 1000);
  };

  const handleApplyPresetCard = (preset: PresetGiftCard) => {
    setCardCode(preset.code);
    setRedeemError('');
    setRedeemSuccessMsg('');
    setCopiedCode(preset.code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const closeCheckoutSheet = () => {
    setSelectedPackage(null);
    setPurchaseStep('idle');
    setActiveReceipt(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={() => setShopModalOpen(false)}
    >
      <div
        className="w-full max-w-4xl bg-[#11131a] border border-[#232838] rounded-3xl overflow-hidden shadow-2xl flex flex-col my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#181c28] via-[#12151f] to-[#181c28] border-b border-[#232838] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Apple className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-extrabold text-base sm:text-lg">
                  {language === 'ku' ? 'کۆگای فەرمی Apple iTunes و سکەکان' : 'Official Apple iTunes & Coin Store'}
                </h2>
                <span className="text-[10px] bg-sky-500/15 text-sky-400 font-extrabold px-2 py-0.5 rounded-full border border-sky-500/30">
                  App Store
                </span>
              </div>
              <p className="text-xs text-[#8b92a5]">
                {language === 'ku'
                  ? 'کڕین و داخلکردنی پارە بە کارتی ئایتوونس و ئەکاونتی Apple ID'
                  : 'Purchase and redeem with Apple Gift Cards & Apple ID Balance'}
              </p>
            </div>
          </div>

          {/* Quick Dual Balances: Coins & Apple ID Balance */}
          <div className="flex items-center gap-3">
            {/* Apple ID Balance */}
            <div className="flex items-center gap-2 bg-[#1a1f2e] px-3.5 py-1.5 rounded-2xl border border-sky-500/30 shadow-inner">
              <Wallet className="w-4 h-4 text-sky-400" />
              <div className="text-start">
                <div className="text-[10px] text-[#8b92a5] uppercase font-bold leading-none">
                  {language === 'ku' ? 'باڵانسی ئەپل ئایدی' : 'Apple ID Balance'}
                </div>
                <div className="text-sm font-black text-sky-300">
                  ${appleIdBalance.toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* KurdCord Coin Balance */}
            <div className="flex items-center gap-2 bg-[#1a1f2e] px-3.5 py-1.5 rounded-2xl border border-amber-500/30 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="text-start">
                <div className="text-[10px] text-[#8b92a5] uppercase font-bold leading-none">
                  {language === 'ku' ? 'سکەی کوردکۆرد' : 'App Coins'}
                </div>
                <div className="text-sm font-black text-amber-300">
                  {currentUser.coins.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShopModalOpen(false)}
              className="w-9 h-9 rounded-xl bg-[#1c212f] text-[#8b92a5] hover:text-white hover:bg-[#252c3f] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-0 bg-[#0d0f15] border-b border-[#202534] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'packages'
                ? 'border-sky-400 text-white bg-[#151824]'
                : 'border-transparent text-[#8b92a5] hover:text-white hover:bg-[#131520]'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'پاکێجەکانی سکە بە Apple ID' : 'Buy Coins via Apple ID'}</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 relative ${
              activeTab === 'redeem'
                ? 'border-amber-400 text-white bg-[#151824]'
                : 'border-transparent text-[#8b92a5] hover:text-white hover:bg-[#131520]'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ku' ? 'داخڵکردنی کارتی ئایتوونس (iTunes Card)' : 'Redeem iTunes Gift Card'}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
              16 Code
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-emerald-400 text-white bg-[#151824]'
                : 'border-transparent text-[#8b92a5] hover:text-white hover:bg-[#131520]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'مێژووی پسوولەکانی ئایتوونس' : 'iTunes Receipts & History'}</span>
            <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.2 rounded-full">
              {appleTransactions.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Packages with Apple ID Balance & Password */}
        {activeTab === 'packages' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Apple ID Info Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-purple-950/40 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-md shrink-0">
                  <Apple className="w-7 h-7 fill-black" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <span>{language === 'ku' ? 'هەژماری پەیوەستکراوی Apple ID' : 'Connected Apple ID Account'}</span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.2 rounded-full border border-emerald-500/30">
                      چالاکە
                    </span>
                  </div>
                  <div className="text-xs text-sky-300 font-mono mt-0.5">
                    {currentUser.email || 'zhyar4489@gmail.com'}
                  </div>
                  <div className="text-xs text-[#8b92a5] mt-1">
                    {language === 'ku'
                      ? `باڵانسی ئامادە لە ئەپل ئایدی: $${appleIdBalance.toFixed(2)} USD (دەتوانی لەڕێگەی وشەی تێپەڕی ئەپل ئایدیەوە کڕین ئەنجام بدەیت)`
                      : `Available Apple ID Balance: $${appleIdBalance.toFixed(2)} USD (Authorized with Apple ID Password)`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('redeem')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Gift className="w-4 h-4 fill-black" />
                  <span>{language === 'ku' ? 'داخڵکردنی کارتی ئایتوونس' : 'Redeem Gift Card'}</span>
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHOP_PACKAGES.map((pkg) => {
                const totalCoins = pkg.coins + pkg.bonusCoins;
                const canAfford = appleIdBalance >= pkg.priceUSD;

                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-3xl p-5 bg-[#161924] border transition-all flex flex-col justify-between group ${
                      pkg.popular
                        ? 'border-sky-500/60 shadow-xl shadow-sky-500/10'
                        : 'border-[#222736] hover:border-[#343b52]'
                    }`}
                  >
                    {pkg.badge && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                        {pkg.badge}
                      </div>
                    )}

                    <div>
                      <div className="text-[11px] font-mono text-[#8b92a5] mb-1">
                        {pkg.itunesId}
                      </div>
                      <div className="text-white font-bold text-base mb-2">
                        {language === 'ku' ? pkg.titleKu : pkg.titleEn}
                      </div>

                      <div className="flex items-baseline gap-2 my-2">
                        <span className="text-3xl font-black text-amber-400">
                          {totalCoins.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#8b92a5] font-semibold">{t.coins} 💎</span>
                      </div>

                      {pkg.bonusCoins > 0 && (
                        <div className="text-xs text-emerald-400 font-semibold mb-3">
                          +{pkg.bonusCoins.toLocaleString()} {t.bonus} بەخۆڕایی
                        </div>
                      )}

                      {/* Apple ID Balance indicator for this item */}
                      <div className="text-[11px] mb-4 flex items-center gap-1.5">
                        {canAfford ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {language === 'ku' ? 'باڵانسی ئەپل ئایدیت بەش دەکات' : 'Apple ID Balance Sufficient'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {language === 'ku'
                              ? `پێویستی بە $${(pkg.priceUSD - appleIdBalance).toFixed(2)} زیاتر هەیە`
                              : `Needs $${(pkg.priceUSD - appleIdBalance).toFixed(2)} more`}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPurchaseSheet(pkg)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                        canAfford
                          ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-blue-500/20'
                          : 'bg-[#1e2333] hover:bg-[#262c40] text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      <Apple className="w-4 h-4 fill-current" />
                      <span>
                        {language === 'ku'
                          ? `کڕین بە $${pkg.priceUSD.toFixed(2)} (Apple ID)`
                          : `Buy for $${pkg.priceUSD.toFixed(2)} (Apple ID)`}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Redeem Apple iTunes Gift Card */}
        {activeTab === 'redeem' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Apple Gift Card Visual Banner */}
            <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#171a25] via-[#22283a] to-[#171a25] border border-[#2b334a] shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center sm:text-start max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/15">
                    <Apple className="w-3.5 h-3.5 fill-white" />
                    <span>Apple iTunes & App Store Gift Card</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {language === 'ku' ? 'داخڵکردنی کۆدی کارتی ئایتوونس' : 'Redeem Apple iTunes Gift Card'}
                  </h3>
                  <p className="text-xs text-[#8b92a5] leading-relaxed">
                    {language === 'ku'
                      ? 'کۆدی ١٦ ژمارەیی کارتی ئایتوونس بنووسە. دۆلارەکە ڕاستەوخۆ دەبێتە سکەی ئەپەکە، یان دەتوانی زیادی بکەیت بۆ باڵانسی ئەپل ئایدی بۆ کڕینی داهاتوو!'
                      : 'Enter your 16-character Apple Gift Card code. You can convert directly to app coins or add to your Apple ID balance.'}
                  </p>
                </div>

                {/* Metallic Apple Card Graphic */}
                <div className="w-64 h-38 rounded-2xl p-4 bg-gradient-to-tr from-zinc-800 via-zinc-700 to-zinc-900 border border-white/20 shadow-2xl flex flex-col justify-between shrink-0 transform sm:-rotate-2 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between">
                    <Apple className="w-8 h-8 fill-white drop-shadow" />
                    <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                      App Store & iTunes
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-mono">Gift Card Code</div>
                    <div className="font-mono text-sm tracking-widest text-white font-bold">
                      {cardCode || 'X••••-••••-••••-••••'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Input Form */}
            <div className="p-6 rounded-3xl bg-[#151824] border border-[#232838] space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-2 flex items-center justify-between">
                  <span>{language === 'ku' ? 'کۆدی کارتی ئایتوونس (١٦ ژمارە/پیت):' : 'iTunes Gift Card Code (16 chars):'}</span>
                  <span className="text-[11px] text-sky-400 font-normal">نموونە: X98B-7M2Q-4KL9-PT6X</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={cardCode}
                    onChange={(e) => {
                      setCardCode(e.target.value.toUpperCase());
                      setRedeemError('');
                      setRedeemSuccessMsg('');
                    }}
                    placeholder="X98B-7M2Q-4KL9-PT6X"
                    className="w-full bg-[#1c2130] border border-[#2c344a] rounded-2xl px-4 py-3.5 text-base font-mono uppercase text-white outline-none focus:border-cyan-400 placeholder-[#555d73] tracking-wider"
                  />
                  {cardCode && (
                    <button
                      onClick={() => setCardCode('')}
                      className="absolute right-3 rtl:left-3 rtl:right-auto text-[#8b92a5] hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Destination Radio: Coins vs Apple ID Balance */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#8b92a5] mb-2">
                  {language === 'ku' ? 'دەتەوێت دۆلارەکە چۆن دابنرێت؟' : 'Where would you like to receive the value?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRedeemDestination('coins')}
                    className={`p-4 rounded-2xl border text-start flex items-start gap-3 transition-all ${
                      redeemDestination === 'coins'
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-[#1c2130] border-[#293044] hover:border-[#38425d]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{language === 'ku' ? 'ڕاستەوخۆ ببێتە سکەی کوردکۆرد' : 'Direct App Coins'}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-black">
                          پێشنیارکراو
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8b92a5] mt-1 leading-snug">
                        {language === 'ku'
                          ? 'کارتەکە یەکسەر دەگۆڕدرێت بۆ سکەی ئەپەکە (بۆ نموونە $10 دەبێتە 1,250 سکە، $25 دەبێتە 3,800 سکە)'
                          : 'Card is converted straight into App Coins with maximum bonuses'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRedeemDestination('balance')}
                    className={`p-4 rounded-2xl border text-start flex items-start gap-3 transition-all ${
                      redeemDestination === 'balance'
                        ? 'bg-sky-500/10 border-sky-500/60 shadow-lg shadow-sky-500/10'
                        : 'bg-[#1c2130] border-[#293044] hover:border-[#38425d]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {language === 'ku' ? 'زیادکردنی دۆلار بۆ باڵانسی Apple ID' : 'Add to Apple ID Balance ($)'}
                      </div>
                      <div className="text-[11px] text-[#8b92a5] mt-1 leading-snug">
                        {language === 'ku'
                          ? 'پارەکە وەک دۆلاری ڕاستەقینە دەچێتە ناو Apple ID و دەتوانی لەڕێگەی پاسوۆردەوە خەرجی بکەیت'
                          : 'Funds stay in your Apple ID balance for on-demand purchases with password'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error or Success feedback */}
              {redeemError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{redeemError}</span>
                </div>
              )}

              {redeemSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{redeemSuccessMsg}</span>
                </div>
              )}

              {/* Submit Redeem Button */}
              <button
                onClick={() => handleRedeemCard()}
                disabled={isRedeeming}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Apple className="w-4 h-4 fill-black" />
                <span>
                  {isRedeeming
                    ? (language === 'ku' ? 'پشکنینی کۆدی کارت لە سێرڤەری Apple...' : 'Verifying with Apple...')
                    : (language === 'ku' ? 'داخلکردنی کارتی ئایتوونس ئێستا (Redeem Now)' : 'Redeem iTunes Card Now')}
                </span>
              </button>
            </div>

            {/* Quick Preset Gift Cards (Click to Test Instantly) */}
            <div className="p-5 rounded-3xl bg-[#151824] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase text-[#8b92a5] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ku' ? 'کارتە ئامادەکراوەکانی ئایتوونس (تێستی خێرا):' : 'Preset iTunes Cards (Click to Test):'}</span>
                </div>
                <span className="text-[11px] text-[#8b92a5]">
                  {language === 'ku' ? 'کلیک بکە بۆ کۆپیکردن و داخلکردن' : 'Click any card to load code'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESET_ITUNES_CARDS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-[#1c2130] hover:bg-[#23293d] border border-[#2b3348] hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-black text-white">{preset.label}</span>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          ${preset.valueUSD}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#8b92a5] group-hover:text-cyan-300 truncate">
                        {preset.code}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        💎 {preset.equivalentCoins.toLocaleString()} سکە
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#262c3e] flex items-center gap-2">
                      <button
                        onClick={() => handleApplyPresetCard(preset)}
                        className="flex-1 py-1.5 rounded-xl bg-[#262e42] hover:bg-[#313b54] text-xs font-bold text-white transition-colors"
                      >
                        {copiedCode === preset.code ? 'کۆدەکە دانرا!' : (language === 'ku' ? 'دانانی کۆد' : 'Fill Code')}
                      </button>
                      <button
                        onClick={() => handleRedeemCard(preset.code)}
                        className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                        title="Redeem directly"
                      >
                        {language === 'ku' ? 'کڕین' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Receipts & Transaction History */}
        {activeTab === 'history' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#232838]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ku' ? 'پسوولە فەرمییەکانی Apple iTunes' : 'Official Apple iTunes Receipts'}</span>
                </h3>
                <p className="text-xs text-[#8b92a5]">
                  {language === 'ku'
                    ? 'هەموو کڕینەکان لەڕێگەی هەژماری Apple ID تۆ تۆمارکراون'
                    : 'All transactions verified and billed to your Apple ID'}
                </p>
              </div>

              <div className="text-xs font-mono text-[#8b92a5]">
                Apple ID: <span className="text-sky-300 font-bold">{currentUser.email || 'zhyar4489@gmail.com'}</span>
              </div>
            </div>

            {appleTransactions.length === 0 ? (
              <div className="py-12 text-center text-[#8b92a5]">
                {language === 'ku' ? 'هیچ کڕینێک تا ئێستا نەکراوە' : 'No transactions recorded yet'}
              </div>
            ) : (
              <div className="space-y-3">
                {appleTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-[#161924] border border-[#232838] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'itunes_card_redeem'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}
                      >
                        {tx.type === 'itunes_card_redeem' ? <Gift className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{tx.title}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded-full font-bold">
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8b92a5] flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{tx.id}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          {tx.cardCodeMasked && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-amber-300">{tx.cardCodeMasked}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <div className="text-sm font-black text-white">${tx.amountUSD.toFixed(2)} USD</div>
                      {tx.coinsReceived > 0 && (
                        <div className="text-xs text-amber-400 font-bold">
                          +{tx.coinsReceived.toLocaleString()} سکە
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* APPLE ITUNES / APP STORE CHECKOUT SHEET MODAL */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center z-60 p-4"
          onClick={closeCheckoutSheet}
        >
          <div
            className="w-full max-w-md bg-[#1c1c1e] text-white rounded-3xl p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md">
                  KC
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                    App Store In-App Purchase
                  </div>
                  <div className="text-sm font-bold text-white">KurdCord PRO</div>
                </div>
              </div>
              <button
                onClick={closeCheckoutSheet}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* IDLE STEP: Ready to pay with Apple ID */}
            {purchaseStep === 'idle' && (
              <div className="py-4 space-y-4">
                {/* Item Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-white">
                      {language === 'ku' ? selectedPackage.titleKu : selectedPackage.titleEn}
                    </div>
                    <div className="text-xs text-amber-400 font-semibold">
                      {(selectedPackage.coins + selectedPackage.bonusCoins).toLocaleString()} Coins 💎
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ${selectedPackage.priceUSD.toFixed(2)}
                  </div>
                </div>

                {/* Account & Payment Source Info */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-white/80">
                    <span>Apple ID:</span>
                    <span className="font-semibold text-white font-mono">
                      {currentUser.email || 'zhyar4489@gmail.com'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-sky-400">
                      Apple ID Balance (${appleIdBalance.toFixed(2)} available)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white/80 pt-1 border-t border-white/10">
                    <span>Balance After Purchase:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${(appleIdBalance - selectedPackage.priceUSD).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Apple ID Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-white/70 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      {language === 'ku' ? 'وشەی تێپەڕی Apple ID:' : 'Apple ID Password:'}
                    </span>
                    <span className="text-[10px] text-white/50">تەئکیدکردنەوەی کڕین</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={applePassword}
                      onChange={(e) => setApplePassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-sky-400"
                      placeholder="Enter Apple ID Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Face ID / Touch ID Affirmation */}
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-white/60">
                  <Fingerprint className="w-4 h-4 text-sky-400" />
                  <span>
                    {language === 'ku'
                      ? 'یان پەسەندکردن بە دوو کلیک لە دوگمەی سەرەکی'
                      : 'Double click side button to confirm'}
                  </span>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleConfirmPurchaseWithAppleId}
                  className="w-full py-3.5 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Apple className="w-4 h-4 fill-white" />
                  <span>
                    {language === 'ku'
                      ? `پارەدان لەڕێگەی Apple ID ($${selectedPackage.priceUSD.toFixed(2)})`
                      : `Pay with Apple ID ($${selectedPackage.priceUSD.toFixed(2)})`}
                  </span>
                </button>
              </div>
            )}

            {/* INSUFFICIENT BALANCE STEP */}
            {purchaseStep === 'insufficient' && (
              <div className="py-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {language === 'ku' ? 'باڵانسی ئەپل ئایدیت بەش ناکات!' : 'Insufficient Apple ID Balance'}
                  </h4>
                  <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto leading-relaxed">
                    {language === 'ku'
                      ? `باڵانسی تۆ $${appleIdBalance.toFixed(2)}یە، بەڵام ئەم پاکێجە پێویستی بە $${selectedPackage.priceUSD.toFixed(2)}ە. تکایە کۆدی کارتی ئایتوونس داخڵ بکە بۆ زیادکردنی دۆلار.`
                      : `Your balance is $${appleIdBalance.toFixed(2)}, but item requires $${selectedPackage.priceUSD.toFixed(2)}. Please redeem an iTunes Gift Card to top up.`}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-start space-y-1">
                  <div className="flex justify-between text-white/70">
                    <span>Package Price:</span>
                    <span className="font-bold text-white">${selectedPackage.priceUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Your Apple ID Balance:</span>
                    <span className="font-bold text-rose-400">${appleIdBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/70 pt-1 border-t border-white/10 font-bold">
                    <span>Shortage (بڕی کەم):</span>
                    <span className="text-amber-400">${(selectedPackage.priceUSD - appleIdBalance).toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      closeCheckoutSheet();
                      setActiveTab('redeem');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Gift className="w-4 h-4 fill-black" />
                    <span>{language === 'ku' ? 'داخڵکردنی کارتی ئایتوونس ئێستا' : 'Redeem iTunes Card Now'}</span>
                  </button>

                  <button
                    onClick={closeCheckoutSheet}
                    className="w-full py-2.5 rounded-xl bg-white/10 text-white/80 hover:text-white text-xs font-semibold"
                  >
                    {language === 'ku' ? 'داخستن' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING STEP */}
            {purchaseStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#0071e3] border-t-transparent animate-spin mb-4" />
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ku' ? 'پەیوەندی بە سێرڤەری Apple Store دەکرێت...' : 'Authorizing with Apple Store...'}
                </h4>
                <p className="text-xs text-white/60">
                  {language === 'ku' ? 'تەئکیدکردنەوەی وشەی نهێنی و باڵانسی ئەپل ئایدی' : 'Verifying Apple ID credentials & balance'}
                </p>
              </div>
            )}

            {/* SUCCESS STEP */}
            {purchaseStep === 'success' && activeReceipt && (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 animate-in zoom-in-50 duration-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  {language === 'ku' ? 'کڕینەکە بە سەرکەوتوویی تەواوبوو!' : 'Purchase Authorized!'}
                </h4>
                <p className="text-xs text-white/70 max-w-xs mb-4">
                  {language === 'ku'
                    ? `بڕی ${activeReceipt.coinsReceived.toLocaleString()} سکە بۆ باڵانسی ئەپەکەت زیادکرا لەڕێگەی ئەپل ئایدی.`
                    : `${activeReceipt.coinsReceived.toLocaleString()} coins added to your KurdCord balance.`}
                </p>

                {/* Digital Receipt */}
                <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-start space-y-2 mb-5">
                  <div className="flex justify-between text-white/70">
                    <span>{t.itunesTransactionId}</span>
                    <span className="font-mono text-white font-bold">{activeReceipt.id}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Apple ID:</span>
                    <span className="font-mono text-sky-400">{activeReceipt.appleId}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Amount Paid:</span>
                    <span className="text-white font-bold">${activeReceipt.amountUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Remaining Apple ID Balance:</span>
                    <span className="font-mono text-emerald-400 font-bold">${appleIdBalance.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={closeCheckoutSheet}
                  className="w-full py-3.5 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'ku' ? 'تەواو (Done)' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
