import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Copy, 
  ExternalLink, 
  X, 
  Wallet,
  Gift,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardItem, RedeemedVoucher } from '../types';
import { playMindfulChime } from '../utils/audio';

interface RewardsMarketplaceProps {
  rewards: RewardItem[];
  spendablePoints: number;
  redeemedVouchers: RedeemedVoucher[];
  onRedeemReward: (reward: RewardItem) => boolean;
  onOpenReportModal: () => void;
}

export const RewardsMarketplace: React.FC<RewardsMarketplaceProps> = ({
  rewards,
  spendablePoints,
  redeemedVouchers,
  onRedeemReward,
  onOpenReportModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'wallet'>('catalog');
  const [viewingVoucher, setViewingVoucher] = useState<RedeemedVoucher | null>(null);
  const [confirmReward, setConfirmReward] = useState<RewardItem | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const filteredRewards = rewards.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  const handleExecuteRedeem = (reward: RewardItem) => {
    const success = onRedeemReward(reward);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#52b788', '#f4a261', '#d8f3dc', '#1b4332']
      });
      playMindfulChime('redeem');
      setConfirmReward(null);
      setActiveTab('wallet');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner & Wallet Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white shadow-md border border-[#52b788]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#52b788]/20 border border-[#52b788]/30 text-[#d8f3dc] text-xs font-semibold">
            <Gift className="w-3.5 h-3.5 text-[#52b788]" />
            <span>Mindful Karma Exchange & Ecological Loop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">The Rewards Marketplace</h2>
          <p className="text-xs sm:text-sm text-[#d8f3dc]/85 leading-relaxed">
            Redeem your stewardship points for authentic Gelephu experiences—from geothermal hot springs (Tshachu) to zero-emission cableway transit and organic valley harvests.
          </p>
        </div>

        {/* Spendable Karma Balance Pod */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#081c15]/70 border border-[#52b788]/40 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#52b788]/20 flex items-center justify-center text-2xl">
            ✨
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#d8f3dc]/70">Available Spendable Karma</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{spendablePoints}</span>
              <span className="text-xs font-semibold text-[#74c69d]">Karma pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation (Catalog vs. My Vouchers Wallet) */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
              activeTab === 'catalog'
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mindful Catalog ({rewards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
              activeTab === 'wallet'
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>My Active Vouchers ({redeemedVouchers.length})</span>
          </button>
        </div>

        {activeTab === 'catalog' && (
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] items-center space-x-1"
          >
            <span>Need more points? Log Observation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { id: 'all', label: 'All Rewards' },
              { id: 'wellness', label: '♨️ Thermal & Wellness' },
              { id: 'transit', label: '🚠 Clean Mobility' },
              { id: 'market', label: '🧺 Organic Harvest' },
              { id: 'nature', label: '🪴 Nature & Seedlings' },
              { id: 'energy', label: '⚡ Clean Energy Microgrid' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#2d6a4f] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredRewards.map((item) => {
              const canAfford = spendablePoints >= item.pointsCost;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#52b788] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    
                    {/* Icon & Highlight Tag */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {item.imageEmoji}
                      </div>

                      {item.highlightTag && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-[#f4f1de] text-[#1b4332] border border-[#e07a5f]/30">
                          {item.highlightTag}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1b4332] leading-snug">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
                      <span className="truncate">{item.location}</span>
                    </div>

                  </div>

                  {/* Bottom Cost & Redeem CTA */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-gray-500 font-semibold">Cost</span>
                      <span className="text-base font-extrabold text-[#1b4332]">{item.pointsCost} <span className="text-xs font-normal">pts</span></span>
                    </div>

                    <button
                      onClick={() => setConfirmReward(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                        canAfford
                          ? 'bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] shadow-xs hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem Pass' : 'Need Points'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WALLET VIEW (My Active Vouchers) */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          {redeemedVouchers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-2xl">
                🎫
              </div>
              <h3 className="text-base font-bold text-[#1b4332]">Your Voucher Wallet is Empty</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Redeem your earned stewardship points for geothermal hot springs, organic produce, or clean transit passes.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-bold text-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedVouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-5 rounded-3xl bg-white border border-[#52b788] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-2xl flex-shrink-0">
                      {v.imageEmoji}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          Active Pass
                        </span>
                        <span className="text-[10px] text-gray-500">{v.redeemedAt}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1b4332]">{v.title}</h4>
                      <p className="text-xs font-mono font-bold text-[#2d6a4f]">{v.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => setViewingVoucher(v)}
                      className="px-3.5 py-2 rounded-xl bg-[#1b4332] text-white text-xs font-bold flex items-center space-x-1 hover:bg-[#2d6a4f]"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-5 text-center">
            <button
              onClick={() => setConfirmReward(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-3xl shadow-sm">
              {confirmReward.imageEmoji}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1b4332]">Redeem {confirmReward.title}?</h3>
              <p className="text-xs text-gray-600 leading-relaxed px-2">{confirmReward.description}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f8f9f6] border border-gray-200 text-xs space-y-1.5 text-left">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Karma Points Required:</span>
                <span className="text-[#1b4332] font-bold">-{confirmReward.pointsCost} pts</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Remaining Balance:</span>
                <span className="text-[#2d6a4f] font-bold">{spendablePoints - confirmReward.pointsCost} pts</span>
              </div>
              <div className="pt-2 text-[10px] text-gray-500 border-t border-gray-200">
                Terms: {confirmReward.terms}
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmReward(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteRedeem(confirmReward)}
                className="flex-1 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md"
              >
                Confirm & Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Voucher Modal */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4 text-center">
            <button
              onClick={() => setViewingVoucher(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
              GMC Verified Digital Voucher
            </span>

            <h3 className="text-base font-bold text-[#1b4332]">{viewingVoucher.title}</h3>

            {/* Visual QR Code Generator */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#2d6a4f] inline-block shadow-inner">
              <div className="w-44 h-44 bg-gray-900 rounded-xl p-3 flex flex-col justify-between text-white">
                <div className="grid grid-cols-6 gap-1 h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 5 === 0) ? 'bg-white' : 'bg-gray-800'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f8f9f6] border border-gray-200 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#1b4332]">{viewingVoucher.code}</span>
              <button
                onClick={() => handleCopyCode(viewingVoucher.code)}
                className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-[10px] text-gray-500">
              Present this digital pass at the venue entrance or scan at autonomous transit pods.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
