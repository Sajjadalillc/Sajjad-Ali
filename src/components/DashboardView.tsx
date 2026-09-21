import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Flame, 
  Award, 
  ExternalLink,
  CheckCircle,
  Eye
} from 'lucide-react';
import { ProductLead } from '../types/hunter';

interface DashboardViewProps {
  leads: ProductLead[];
  onInspectLead: (lead: ProductLead) => void;
  minRoi: number;
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];
const SUPPLIER_COLORS: Record<string, string> = {
  Amazon: '#f59e0b',
  SHEIN: '#8b5cf6',
  AliExpress: '#ef4444',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onInspectLead,
  minRoi,
}) => {
  // 1. Supplier breakdown
  const supplierData = useMemo(() => {
    const counts: Record<string, number> = { Amazon: 0, SHEIN: 0, AliExpress: 0 };
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // 2. Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [leads]);

  // 3. ROI Distribution Brackets
  const roiBrackets = useMemo(() => {
    const brackets = [
      { range: '<25% (Fail)', count: 0 },
      { range: '25-35%', count: 0 },
      { range: '35-50%', count: 0 },
      { range: '50-75%', count: 0 },
      { range: '75%+', count: 0 },
    ];
    leads.forEach((l) => {
      if (l.roi < 25) brackets[0].count++;
      else if (l.roi < 35) brackets[1].count++;
      else if (l.roi < 50) brackets[2].count++;
      else if (l.roi < 75) brackets[3].count++;
      else brackets[4].count++;
    });
    return brackets;
  }, [leads]);

  // 4. Top 5 Opportunities
  const topOpportunities = useMemo(() => {
    return [...leads]
      .filter((l) => l.roi >= minRoi)
      .sort((a, b) => b.overallOpportunityScore - a.overallOpportunityScore)
      .slice(0, 5);
  }, [leads, minRoi]);

  return (
    <div className="space-y-6">
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Chart 1: Products by Supplier */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Products by Supplier Source
            </h3>
            <p className="text-3xs text-slate-400">Distribution across Amazon, SHEIN & AliExpress</p>
          </div>
          
          <div className="h-56 w-full flex items-center justify-center">
            {leads.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {supplierData.map((entry) => (
                      <Cell key={entry.name} fill={SUPPLIER_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`${val} products`, 'Count']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-center gap-4 text-xs pt-2 border-t border-slate-100">
            {supplierData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SUPPLIER_COLORS[s.name] }} />
                <span className="text-slate-600 font-medium">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Categories */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between lg:col-span-2">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Top Discovered Categories
            </h3>
            <p className="text-3xs text-slate-400">High-yield niche category breakdown</p>
          </div>

          <div className="h-56 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    angle={-15} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip 
                    formatter={(val) => [`${val} items`, 'Leads']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: ROI Distribution & Top 5 Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ROI Bracket Histogram */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            ROI Margin Spread
          </h3>
          <p className="text-3xs text-slate-400 mb-3">Target threshold: ≥ {minRoi}%</p>
          
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiBrackets} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Qualified Opportunities Table */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Top 5 Qualified Opportunities
                </h3>
                <p className="text-3xs text-slate-400">Ranked by overall opportunity score (Profit + Demand + Low Risk)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-2xs text-slate-500 uppercase border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="py-1.5 px-2">Product Name</th>
                    <th className="py-1.5 px-2">Source</th>
                    <th className="py-1.5 px-2 text-right">Cost</th>
                    <th className="py-1.5 px-2 text-right">eBay</th>
                    <th className="py-1.5 px-2 text-right">Profit</th>
                    <th className="py-1.5 px-2 text-right">ROI</th>
                    <th className="py-1.5 px-2 text-right">Opp Score</th>
                    <th className="py-1.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                        No qualified leads available yet. Run the agent to find products!
                      </td>
                    </tr>
                  ) : (
                    topOpportunities.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium text-slate-900 max-w-[200px] truncate" title={lead.productName}>
                          {lead.productName}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`text-3xs font-bold px-1.5 py-0.2 rounded ${
                            lead.source === 'Amazon' ? 'bg-amber-100 text-amber-800' :
                            lead.source === 'AliExpress' ? 'bg-rose-100 text-rose-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-slate-700 font-mono text-2xs">${lead.supplierPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-slate-900 font-mono text-2xs font-semibold">${lead.estimatedEbayPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-bold text-emerald-700 text-2xs">+${lead.estimatedProfit.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">
                          <span className="font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded text-2xs">
                            {lead.roi}%
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-indigo-700 text-2xs">
                          {lead.overallOpportunityScore}/100
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => onInspectLead(lead)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
