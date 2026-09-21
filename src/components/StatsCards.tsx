import React from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Package, 
  DollarSign, 
  Flame, 
  Globe, 
  ExternalLink 
} from 'lucide-react';
import { ProductLead, SupplierSource } from '../types/hunter';

interface StatsCardsProps {
  totalFound: number;
  qualifiedCount: number;
  todayCount: number;
  averageRoi: number;
  averageProfit: number;
  currentCategory: string;
  currentSource: SupplierSource;
  lastProduct: ProductLead | null;
  minRoi: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalFound,
  qualifiedCount,
  todayCount,
  averageRoi,
  averageProfit,
  currentCategory,
  currentSource,
  lastProduct,
  minRoi,
}) => {
  const qualificationRate = totalFound > 0 ? ((qualifiedCount / totalFound) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      
      {/* 1. Products Found */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Products Found</span>
          <Package className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{totalFound}</span>
          <span className="text-2xs text-slate-500 font-medium">all crawler logs</span>
        </div>
      </div>

      {/* 2. Qualified Leads */}
      <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-emerald-700 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Qualified Leads</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-700">{qualifiedCount}</span>
          <span className="text-2xs text-emerald-600 font-medium bg-emerald-100/80 px-1.5 py-0.5 rounded">
            {qualificationRate}% Pass Rate
          </span>
        </div>
      </div>

      {/* 3. Products Found Today */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Found Today</span>
          <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Daily</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{todayCount}</span>
          <span className="text-2xs text-slate-500">items</span>
        </div>
      </div>

      {/* 4. Average ROI */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Average ROI</span>
          <TrendingUp className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-teal-700">{averageRoi}%</span>
          <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            ≥ {minRoi}% target
          </span>
        </div>
      </div>

      {/* 5. Average Profit */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Profit / Item</span>
          <DollarSign className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">${averageProfit.toFixed(2)}</span>
          <span className="text-2xs text-slate-500">net/sale</span>
        </div>
      </div>

      {/* 6. Active Crawl Target */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Current Search</span>
          <Globe className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="truncate">
          <span className="text-xs font-bold text-slate-800 block truncate">{currentCategory}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-2xs font-semibold px-1.5 py-0.2 rounded ${
              currentSource === 'Amazon' ? 'bg-amber-100 text-amber-800' :
              currentSource === 'AliExpress' ? 'bg-rose-100 text-rose-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {currentSource}
            </span>
            <span className="text-2xs text-slate-400">Rotating</span>
          </div>
        </div>
      </div>

    </div>
  );
};
