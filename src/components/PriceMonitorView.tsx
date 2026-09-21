import React from 'react';
import { 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  PackageX,
  Eye
} from 'lucide-react';
import { ProductLead } from '../types/hunter';

interface PriceMonitorViewProps {
  leads: ProductLead[];
  onRecheckLead: (lead: ProductLead) => void;
  onRecheckAll: () => void;
  isRechecking: boolean;
  onInspectLead: (lead: ProductLead) => void;
  minRoi: number;
}

export const PriceMonitorView: React.FC<PriceMonitorViewProps> = ({
  leads,
  onRecheckLead,
  onRecheckAll,
  isRechecking,
  onInspectLead,
  minRoi,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Automated Price & Stock Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuously monitors existing sheet leads for supplier price spikes, stock depletion, and ROI margin erosion.
          </p>
        </div>

        <button
          onClick={onRecheckAll}
          disabled={isRechecking || leads.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
          <span>{isRechecking ? 'Checking All Items...' : 'Re-check All Items Now'}</span>
        </button>
      </div>

      {/* Monitor Cards Grid */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 italic">
          No discovered leads to monitor yet. Run the agent to find products!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {leads.map((lead) => {
            const isBelowTarget = lead.roi < minRoi;
            const isOutOfStock = lead.stockStatus === 'Out of Stock';

            return (
              <div 
                key={lead.id}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  isOutOfStock ? 'border-rose-300 bg-rose-50/20' :
                  isBelowTarget ? 'border-amber-300 bg-amber-50/20' :
                  'border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                    lead.source === 'Amazon' ? 'bg-amber-100 text-amber-900' :
                    lead.source === 'AliExpress' ? 'bg-rose-100 text-rose-900' :
                    'bg-purple-100 text-purple-900'
                  }`}>
                    {lead.source}
                  </span>

                  {isOutOfStock ? (
                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                      <PackageX className="w-3 h-3" />
                      OUT OF STOCK
                    </span>
                  ) : isBelowTarget ? (
                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      ROI BELOW TARGET ({lead.roi}%)
                    </span>
                  ) : (
                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      HEALTHY MARGIN ({lead.roi}%)
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h3 
                  onClick={() => onInspectLead(lead)}
                  className="text-xs font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 cursor-pointer mb-2" 
                  title={lead.productName}
                >
                  {lead.productName}
                </h3>

                {/* Metrics Table */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Supplier Price:</span>
                    <span className="font-semibold text-slate-800">${lead.supplierPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">eBay Selling Price:</span>
                    <span className="font-semibold text-slate-800">${lead.estimatedEbayPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Net Profit / ROI:</span>
                    <span className={`font-bold ${isBelowTarget ? 'text-amber-700' : 'text-emerald-700'}`}>
                      +${lead.estimatedProfit.toFixed(2)} ({lead.roi}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-2xs pt-1 border-t border-slate-200 text-slate-400 font-mono">
                    <span>Last Checked:</span>
                    <span>{lead.lastChecked.split(' ')[1] || lead.lastChecked}</span>
                  </div>
                </div>

                {/* Note / Price Alert */}
                {lead.notes && (
                  <p className="text-3xs text-slate-500 italic line-clamp-2 mb-3">
                    {lead.notes}
                  </p>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onInspectLead(lead)}
                    className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onRecheckLead(lead)}
                    disabled={isRechecking}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-2xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Check Live</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
