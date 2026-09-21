import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { AgentLogEntry, ProductLead } from '../types/hunter';

interface AgentActivityFeedProps {
  logs: AgentLogEntry[];
  lastProduct: ProductLead | null;
  onInspectLead: (lead: ProductLead) => void;
  status: string;
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  logs,
  lastProduct,
  onInspectLead,
  status,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs mb-4 overflow-hidden">
      
      {/* Top Banner: Last Discovered Product & Activity Status */}
      <div className="p-3.5 bg-slate-50/60 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Last Product Summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                Last Found Lead
              </span>
              {lastProduct && (
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                  lastProduct.roi >= 25 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  ROI: {lastProduct.roi}%
                </span>
              )}
            </div>
            {lastProduct ? (
              <div className="flex items-center gap-2 truncate">
                <button
                  onClick={() => onInspectLead(lastProduct)}
                  className="text-xs font-bold text-slate-900 hover:text-emerald-600 truncate cursor-pointer text-left"
                >
                  {lastProduct.productName}
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-2xs text-slate-500">
                  Cost: <strong className="text-slate-700">${lastProduct.supplierPrice}</strong> → eBay: <strong className="text-slate-700">${lastProduct.estimatedEbayPrice}</strong>
                </span>
                <span className="text-2xs font-semibold text-emerald-600">
                  (+${lastProduct.estimatedProfit} net)
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {status === 'RUNNING' ? 'Hunting live opportunities...' : 'Click "RUN AGENT" to start autonomous discovery'}
              </p>
            )}
          </div>
        </div>

        {/* Toggle Log View */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Live Agent Logs ({logs.length})</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Expandable Terminal Log Stream */}
      {isExpanded && (
        <div className="p-3 bg-slate-950 text-slate-300 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 border-t border-slate-800">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No events logged yet. Start the agent to see live actions.</p>
          ) : (
            logs.slice(0, 30).map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 text-2xs select-none shrink-0 pt-0.5">
                  [{log.timestamp.split(' ')[1] || log.timestamp}]
                </span>
                
                {log.type === 'lead' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                {log.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                {log.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                {log.type === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                {log.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />}

                <span className={`flex-1 break-all ${
                  log.type === 'lead' ? 'text-emerald-300 font-semibold' :
                  log.type === 'error' ? 'text-rose-400' :
                  log.type === 'warn' ? 'text-amber-300' :
                  'text-slate-300'
                }`}>
                  {log.message}
                </span>

                {log.roi !== undefined && (
                  <span className="text-2xs font-bold px-1 rounded bg-slate-800 text-emerald-400 shrink-0">
                    ROI {log.roi}%
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
