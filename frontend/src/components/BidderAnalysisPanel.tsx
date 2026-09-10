import React, { useMemo } from 'react';
import {
  Award,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Bid } from '../types';
import { formatCurrency } from '../pages/source/sourceUtils';

interface BidderAnalysisPanelProps {
  bids: Bid[];
  expectedPrice: number;
  onSelectBid: (bid: Bid) => void;
}

export interface AnalyzedBid extends Bid {
  compositeScore: number; // 0 - 100
  priceScore: number;
  speedScore: number;
  reputationScore: number;
  isBestOverall: boolean;
  isHighestPrice: boolean;
  isFastest: boolean;
  recommendationReason: string;
}

const BidderAnalysisPanel: React.FC<BidderAnalysisPanelProps> = ({
  bids,
  expectedPrice,
  onSelectBid,
}) => {
  const analyzedBids = useMemo<AnalyzedBid[]>(() => {
    if (bids.length === 0) return [];

    const scored = bids.map((bid) => {
      // 1. Price Score (40%): normalized to maxPrice
      const priceRatio = expectedPrice > 0 ? bid.offeredPrice / expectedPrice : 1;
      const priceScore = Math.min(100, Math.round(priceRatio * 85));

      // 2. Speed / Proximity Score (30%)
      const dist = bid.distanceKm || 5;
      const speedScore = Math.max(40, Math.min(100, Math.round(100 - dist * 8)));

      // 3. Reputation & Verification Score (30%)
      const rating = bid.collectorRating || 4.5;
      const pickups = bid.collectorCompletedPickups || 100;
      const repScore = Math.min(100, Math.round((rating / 5) * 80 + Math.min(20, pickups / 15)));

      // Weighted Composite: 40% Price + 30% Speed + 30% Reputation
      const compositeScore = Math.round(priceScore * 0.4 + speedScore * 0.3 + repScore * 0.3);

      return {
        ...bid,
        compositeScore,
        priceScore,
        speedScore,
        reputationScore: repScore,
        isBestOverall: false,
        isHighestPrice: false,
        isFastest: false,
        recommendationReason: '',
      };
    });

    // Identify winners
    const highestPriceVal = Math.max(...scored.map((b) => b.offeredPrice));
    const fastestMinsVal = Math.min(...scored.map((b) => b.estimatedArrivalMins || 999));
    const highestScoreVal = Math.max(...scored.map((b) => b.compositeScore));

    return scored.map((b) => {
      const isBestOverall = b.compositeScore === highestScoreVal;
      const isHighestPrice = b.offeredPrice === highestPriceVal;
      const isFastest = (b.estimatedArrivalMins || 999) === fastestMinsVal;

      let reason = '';
      if (isBestOverall) {
        reason = `Top recommendation based on balanced payout (₹${b.offeredPrice.toLocaleString('en-IN')}), close proximity (${b.distanceKm} km), and verified CPCB rating (${b.collectorRating}★).`;
      } else if (isHighestPrice) {
        reason = `Highest immediate monetary return for your asset.`;
      } else if (isFastest) {
        reason = `Earliest pickup arrival window (${b.estimatedArrivalMins} mins).`;
      } else {
        reason = `Verified collector with active route in your zone.`;
      }

      return {
        ...b,
        isBestOverall,
        isHighestPrice,
        isFastest,
        recommendationReason: reason,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [bids, expectedPrice]);

  const topPick = analyzedBids[0];

  if (bids.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top AI Strategic Recommendation Banner */}
      {topPick && (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/50 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold text-emerald-300 tracking-wider">
                  AI Collector Analysis
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  Score: {topPick.compositeScore}/100
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                Recommended Bidder: {topPick.collectorName}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {topPick.recommendationReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Offer Amount</span>
              <span className="text-xl font-extrabold text-emerald-400">
                {formatCurrency(topPick.offeredPrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectBid(topPick)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5"
            >
              Accept Top Bid <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Comparative Bidder Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {analyzedBids.map((b) => (
          <div
            key={b.id}
            className={`card p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              b.isBestOverall
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {b.collectorName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {b.isBestOverall && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Award size={10} /> Top Pick
                    </span>
                  )}
                  {b.isHighestPrice && !b.isBestOverall && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <TrendingUp size={10} /> Top Payout
                    </span>
                  )}
                  {b.isFastest && !b.isBestOverall && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Zap size={10} /> Fastest
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(b.offeredPrice)}
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Rating: {b.collectorRating}★ ({b.collectorCompletedPickups})
                </span>
              </div>

              {/* Progress bars for multi-criteria analysis */}
              <div className="mt-3 flex flex-col gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div>
                  <div className="flex justify-between">
                    <span>Payout Yield</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{b.priceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${b.priceScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span>Proximity & Speed</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{b.speedScore}% ({b.distanceKm} km · {b.estimatedArrivalMins}m)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${b.speedScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectBid(b)}
              className="w-full py-2 rounded-xl border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all text-center"
            >
              Choose This Collector
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidderAnalysisPanel;
