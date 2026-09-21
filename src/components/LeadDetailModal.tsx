import React from 'react';
import { 
  X, 
  ExternalLink, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Flame, 
  CheckCircle2,
  BarChart2,
  Clock,
  Layers
} from 'lucide-react';
import { ProductLead } from '../types/hunter';

interface LeadDetailModalProps {
  lead: ProductLead | null;
  onClose: () => void;
  onRecheck?: (lead: ProductLead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onRecheck,
}) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                lead.source === 'Amazon' ? 'bg-amber-100 text-amber-900' :
                lead.source === 'AliExpress' ? 'bg-rose-100 text-rose-900' :
                'bg-purple-100 text-purple-900'
              }`}>
                {lead.source}
              </span>
              <span className="text-2xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {(lead.sellingMarket || 'eBay US').includes('UK') ? '🇬🇧' :
                 (lead.sellingMarket || 'eBay US').includes('DE') ? '🇩🇪' :
                 (lead.sellingMarket || 'eBay US').includes('AU') ? '🇦🇺' :
                 (lead.sellingMarket || 'eBay US').includes('CA') ? '🇨🇦' : '🇺🇸'} {lead.sellingMarket || 'eBay US'}
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {lead.category}
              </span>
              <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                lead.productStatus === 'VALIDATED' ? 'bg-emerald-100 text-emerald-800' :
                lead.productStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {lead.productStatus}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {lead.productName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
              <span>ID: {lead.productId}</span>
              <span>•</span>
              <span>Found: {lead.dateFound}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Score Cards */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* ROI */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-center">
              <span className="text-3xs uppercase font-bold text-emerald-700 tracking-wider">Estimated ROI</span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{lead.roi}%</div>
              <span className="text-3xs text-emerald-600 font-medium">Target ≥ 25%</span>
            </div>

            {/* Net Profit */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-3xs uppercase font-bold text-slate-500 tracking-wider">Net Profit</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">+${lead.estimatedProfit.toFixed(2)}</div>
              <span className="text-3xs text-slate-500">per unit sold</span>
            </div>

            {/* Opportunity Score */}
            <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-xl text-center">
              <span className="text-3xs uppercase font-bold text-indigo-700 tracking-wider">Opp. Score</span>
              <div className="text-2xl font-black text-indigo-700 mt-0.5">{lead.overallOpportunityScore}<span className="text-sm font-normal text-indigo-400">/100</span></div>
              <span className="text-3xs text-indigo-600 font-medium">Trend & Margin</span>
            </div>

          </div>

          {/* Economics & Fee Breakdown */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              eBay Dropshipping Economics Breakdown
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Expected eBay Selling Price:</span>
                <span className="font-bold text-slate-900">${lead.estimatedEbayPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Supplier Price ({lead.source}):</span>
                <span className="font-semibold text-slate-800">-${lead.supplierPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Supplier Shipping:</span>
                <span className="text-slate-700">-${lead.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">eBay Final Value Fee ({lead.ebayFeePercent}% + $0.30):</span>
                <span className="text-slate-700">-${lead.ebayFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Promoted Listing / Advertising ({lead.advertisingFeePercent}%):</span>
                <span className="text-slate-700">-${lead.advertisingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Other Costs (Reserves & Packing):</span>
                <span className="text-slate-700">-${lead.otherCosts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-300 bg-slate-100/60 px-2 rounded font-semibold text-slate-800">
                <span>Total Cost of Sale:</span>
                <span>${lead.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 px-2 rounded bg-emerald-100/70 text-emerald-900 font-bold text-sm">
                <span>Estimated Net Profit:</span>
                <span>+${lead.estimatedProfit.toFixed(2)} ({lead.roi}% ROI)</span>
              </div>
            </div>
          </div>

          {/* Trending & Demand Analysis */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Trend Score Breakdown ({lead.trendScore}/100)
            </h3>
            
            {lead.trendBreakdown ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Demand Growth (25 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.demandGrowth} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Sales Velocity (20 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.salesVelocity} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Search Interest (20 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.searchInterest} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Competition Opp. (15 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.competitionOpportunity} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Freshness (10 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.productFreshness} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-3xs text-slate-500 block">Social Signals (10 max)</span>
                  <strong className="text-slate-800 text-sm">{lead.trendBreakdown.socialSignals} pts</strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Overall calculated trend score: {lead.trendScore}/100</p>
            )}
          </div>

          {/* Supplier & Risk Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-500" />
                Supplier Reliability
              </h4>
              <p><span className="text-slate-500">Rating:</span> ⭐ {lead.supplierRating} / 5.0</p>
              <p><span className="text-slate-500">Product Rating:</span> ⭐ {lead.productRating} / 5.0</p>
              <p><span className="text-slate-500">Stock Status:</span> <strong className="text-emerald-700">{lead.stockStatus}</strong></p>
              <p><span className="text-slate-500">Delivery Estimate:</span> {lead.shippingTime}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                IP Safety & VERO Verification
              </h4>
              <p>
                <span className="text-slate-500">Risk Assessment:</span>{' '}
                <strong className={`px-1.5 py-0.5 rounded text-2xs ${
                  lead.brandIpRisk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {lead.brandIpRisk} Risk
                </strong>
              </p>
              <p><span className="text-slate-500">Trademark Status:</span> Generic / Unbranded mold</p>
              <p><span className="text-slate-500">Notes:</span> <span className="italic text-slate-600">{lead.notes}</span></p>
            </div>

          </div>

          {/* Outbound Link Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            <a
              href={lead.supplierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Open in {lead.source}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={lead.ebayListingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>View eBay Competitor Listings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onRecheck && (
              <button
                onClick={() => onRecheck(lead)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer ml-auto"
              >
                <span>Re-check Live Price</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
