import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Eye, 
  RefreshCw,
  Sliders,
  DollarSign,
  Eraser,
  Sparkles,
  Play
} from 'lucide-react';
import { ProductLead, SupplierSource } from '../types/hunter';

interface GoogleSheetTableProps {
  leads: ProductLead[];
  title: string;
  tabType: 'qualified' | 'all' | 'rejected' | 'monitor';
  onInspectLead: (lead: ProductLead) => void;
  onRecheckLead?: (lead: ProductLead) => void;
  isRechecking?: boolean;
  googleSheetId?: string;
  googleSpreadsheetUrl?: string;
  autoSyncGoogleSheets?: boolean;
  onOpenSheetsModal?: () => void;
  onCleanAppTable?: () => void;
  activeLeadsCount?: number;
  batchNumber?: number;
  batchCount?: number;
  currentBatchTabName?: string;
  totalArchivedCount?: number;
  cleanOnNewTab?: boolean;
  cleanAfterSheetSync?: boolean;
  onRunAgent?: () => void;
}

export const GoogleSheetTable: React.FC<GoogleSheetTableProps> = ({
  leads,
  title,
  tabType,
  onInspectLead,
  onRecheckLead,
  isRechecking = false,
  googleSheetId,
  googleSpreadsheetUrl,
  autoSyncGoogleSheets,
  onOpenSheetsModal,
  onCleanAppTable,
  activeLeadsCount,
  batchNumber = 1,
  batchCount = 0,
  currentBatchTabName,
  totalArchivedCount = 0,
  cleanOnNewTab,
  cleanAfterSheetSync,
  onRunAgent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'roi' | 'profit' | 'opportunity' | 'trend' | 'date'>('roi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [compactView, setCompactView] = useState(false);

  // Filter & Sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (selectedSource !== 'ALL' && lead.source !== selectedSource) return false;
        if (selectedMarket !== 'ALL' && (lead.sellingMarket || 'eBay US') !== selectedMarket) return false;
        if (selectedCategory !== 'ALL' && lead.category !== selectedCategory) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            lead.productName.toLowerCase().includes(q) ||
            lead.mainKeyword.toLowerCase().includes(q) ||
            lead.productId.toLowerCase().includes(q) ||
            (lead.sellingMarket && lead.sellingMarket.toLowerCase().includes(q)) ||
            lead.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortBy === 'roi') { valA = a.roi; valB = b.roi; }
        else if (sortBy === 'profit') { valA = a.estimatedProfit; valB = b.estimatedProfit; }
        else if (sortBy === 'opportunity') { valA = a.overallOpportunityScore; valB = b.overallOpportunityScore; }
        else if (sortBy === 'trend') { valA = a.trendScore; valB = b.trendScore; }
        else if (sortBy === 'date') { return sortOrder === 'desc' ? b.dateFound.localeCompare(a.dateFound) : a.dateFound.localeCompare(b.dateFound); }

        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [leads, selectedSource, selectedMarket, selectedCategory, searchTerm, sortBy, sortOrder]);

  const categories = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.category))).filter(Boolean);
  }, [leads]);

  const markets = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.sellingMarket || 'eBay US'))).filter(Boolean);
  }, [leads]);

  const handleSort = (field: 'roi' | 'profit' | 'opportunity' | 'trend' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Google Sheet Column Letters (A through AO: 41 columns)
  const COL_LETTERS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
    'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
      
      {/* Table Toolbar / Google Sheet Formula & Filter bar */}
      <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-sheet-search"
              type="text"
              placeholder="Search product, keyword, ASIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 sm:w-64"
            />
          </div>

          {/* Supplier Filter */}
          <select
            id="select-supplier-filter"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="Amazon">Amazon</option>
            <option value="SHEIN">SHEIN</option>
            <option value="AliExpress">AliExpress</option>
          </select>

          {/* Selling Market Filter */}
          <select
            id="select-market-filter"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Selling Markets</option>
            <option value="eBay US">🇺🇸 eBay US</option>
            <option value="eBay UK">🇬🇧 eBay UK</option>
            <option value="eBay DE">🇩🇪 eBay DE</option>
            <option value="eBay AU">🇦🇺 eBay AU</option>
            <option value="eBay CA">🇨🇦 eBay CA</option>
          </select>

          {/* Category Filter */}
          <select
            id="select-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

        </div>

        {/* Right: Quick Sort & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Sort:</span>
            <button
              onClick={() => handleSort('roi')}
              className={`px-2 py-1 rounded text-2xs font-semibold cursor-pointer ${
                sortBy === 'roi' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              ROI {sortBy === 'roi' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSort('profit')}
              className={`px-2 py-1 rounded text-2xs font-semibold cursor-pointer ${
                sortBy === 'profit' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              Profit {sortBy === 'profit' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSort('opportunity')}
              className={`px-2 py-1 rounded text-2xs font-semibold cursor-pointer ${
                sortBy === 'opportunity' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              Opp Score {sortBy === 'opportunity' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          <button
            onClick={() => setCompactView(!compactView)}
            className="px-2 py-1 rounded text-2xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            {compactView ? 'Standard Mode' : 'Compact Mode'}
          </button>

          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-semibold border transition-all cursor-pointer ${
                googleSheetId 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title={googleSheetId ? "Connected to Google Sheet. Click to manage." : "Connect Google Sheets to auto-sync leads."}
            >
              <span className={`w-2 h-2 rounded-full ${googleSheetId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{googleSheetId ? 'Google Sheet Active' : 'Connect Google Sheet'}</span>
              {autoSyncGoogleSheets && (
                <span className="text-3xs bg-emerald-200 text-emerald-900 px-1 rounded font-bold">LIVE</span>
              )}
            </button>
          )}

          {onCleanAppTable && leads.length > 0 && (
            <button
              onClick={onCleanAppTable}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-semibold text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Clean active leads from app workspace. Data remains permanently safe in Google Sheets and deduplication archive."
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clean App Table ({leads.length})</span>
            </button>
          )}

          <span className="text-xs text-slate-500 font-medium pl-1">
            {filteredLeads.length} rows
          </span>
        </div>

      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
        <table className="w-full text-left border-collapse font-sans text-xs">
          
          {/* Header Row 1: Column Letters (A, B, C...) */}
          <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300 text-slate-400 select-none text-3xs font-mono uppercase">
            <tr>
              <th className="w-10 px-2 py-0.5 text-center border-r border-slate-200 bg-slate-200/70 text-slate-600 font-bold sticky left-0 z-30">
                #
              </th>
              <th className="w-12 px-2 py-0.5 text-center border-r border-slate-200 bg-slate-200/70 sticky left-10 z-30 text-slate-600 font-semibold">
                ACT
              </th>
              {COL_LETTERS.map((col, idx) => (
                <th key={idx} className="px-3 py-0.5 border-r border-slate-200 text-center font-bold">
                  {col}
                </th>
              ))}
            </tr>

            {/* Header Row 2: 41 Field Labels */}
            <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 text-2xs font-semibold">
              <th className="px-2 py-2 border-r border-slate-200 text-center sticky left-0 z-30 bg-slate-100">
                Row
              </th>
              <th className="px-2 py-2 border-r border-slate-200 text-center sticky left-10 z-30 bg-slate-100">
                View
              </th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[130px]">1. Date Found</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[240px]">2. Product Name</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[120px] font-bold text-blue-700">3. Selling Market</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px]">4. Source</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[120px]">5. Supplier Link</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[120px]">6. eBay Search Link</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px]">7. Product ID / ASIN</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[140px]">8. Category</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[160px]">9. Main Keyword</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px] text-right">10. Supplier Cost</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">11. Shipping</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px] text-right">12. Est. eBay Price</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">13. eBay Fee %</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">14. eBay Fee</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[90px] text-right">15. Ad Fee %</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[90px] text-right">16. Ad Cost</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[90px] text-right">17. Other Costs</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px] text-right">18. Total Cost</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px] text-right font-bold text-emerald-800">19. Est. Profit</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right font-bold text-emerald-800">20. ROI %</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[140px]">21. Monthly Demand</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px]">22. Competition</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px]">23. Supplier Rating</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px]">24. Product Rating</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px]">25. Orders/Sales</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">26. Trend Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">27. Demand Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px] text-right">28. Comp. Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px] text-right">29. Profit Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[90px] text-right">30. Risk Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px] text-right font-bold text-indigo-700">31. Opp. Score</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[95px]">32. Stock Status</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px]">33. Shipping Time</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[90px]">34. Seasonal</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px]">35. Brand/IP Risk</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px]">36. Product Status</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[200px]">37. Notes</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[130px]">38. Last Checked</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[140px]">39. Data Source</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[110px]">40. Duplicate Check</th>
              <th className="px-3 py-2 border-r border-slate-200 min-w-[100px]">41. Agent Version</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={43} className="py-16 text-center bg-slate-50/50">
                  <div className="max-w-md mx-auto space-y-3 px-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {leads.length === 0 
                          ? `Workspace Clean — Starting Fresh for Batch ${batchNumber}` 
                          : 'No items match current filters'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {leads.length === 0
                          ? `All previous leads are safely saved in your Google Sheet. The app starts working from 0 (item 1 to 100) for tab "${currentBatchTabName || `Batch ${batchNumber}`}" with permanent deduplication active.`
                          : 'Try clearing your search query or switching filters above.'}
                      </p>
                    </div>
                    {leads.length === 0 && onRunAgent && (
                      <div className="pt-2">
                        <button
                          onClick={onRunAgent}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Batch {batchNumber} (Find Next 100 Items)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, idx) => (
                <tr 
                  key={lead.id} 
                  className={`hover:bg-slate-50/80 transition-colors group ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  
                  {/* Row Number */}
                  <td className="px-2 py-2 text-center border-r border-slate-200 font-mono text-2xs text-slate-400 sticky left-0 z-10 bg-inherit font-semibold">
                    {idx + 1}
                  </td>

                  {/* Actions / Inspect */}
                  <td className="px-2 py-2 text-center border-r border-slate-200 sticky left-10 z-10 bg-inherit">
                    <button
                      onClick={() => onInspectLead(lead)}
                      title="Inspect full lead breakdown"
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>

                  {/* 1. Date Found */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-600 font-mono text-3xs whitespace-nowrap">
                    {lead.dateFound}
                  </td>

                  {/* 2. Product Name */}
                  <td className="px-3 py-2 border-r border-slate-200 font-medium text-slate-900 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectLead(lead)}
                        className="truncate hover:text-emerald-700 cursor-pointer text-left font-semibold"
                        title={lead.productName}
                      >
                        {lead.productName}
                      </button>
                    </div>
                  </td>

                  {/* 3. Selling Market */}
                  <td className="px-3 py-2 border-r border-slate-200 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {(lead.sellingMarket || 'eBay US').includes('UK') ? '🇬🇧' :
                       (lead.sellingMarket || 'eBay US').includes('DE') ? '🇩🇪' :
                       (lead.sellingMarket || 'eBay US').includes('AU') ? '🇦🇺' :
                       (lead.sellingMarket || 'eBay US').includes('CA') ? '🇨🇦' : '🇺🇸'} {lead.sellingMarket || 'eBay US'}
                    </span>
                  </td>

                  {/* 4. Source */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <span className={`inline-block text-3xs font-bold px-1.5 py-0.5 rounded ${
                      lead.source === 'Amazon' ? 'bg-amber-100 text-amber-900' :
                      lead.source === 'AliExpress' ? 'bg-rose-100 text-rose-900' :
                      'bg-purple-100 text-purple-900'
                    }`}>
                      {lead.source}
                    </span>
                  </td>

                  {/* 4. Supplier Link */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <a
                      href={lead.supplierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-2xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>Supplier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  {/* 5. eBay Search Link */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <a
                      href={lead.ebayListingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-2xs text-emerald-600 hover:text-emerald-800 hover:underline font-medium"
                    >
                      <span>eBay Search</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  {/* 6. Product ID / ASIN */}
                  <td className="px-3 py-2 border-r border-slate-200 font-mono text-3xs text-slate-700">
                    {lead.productId}
                  </td>

                  {/* 7. Category */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                    {lead.category}
                  </td>

                  {/* 8. Main Keyword */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-600 text-2xs truncate max-w-[160px]" title={lead.mainKeyword}>
                    {lead.mainKeyword}
                  </td>

                  {/* 9. Supplier Price */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-900">
                    ${lead.supplierPrice.toFixed(2)}
                  </td>

                  {/* 10. Shipping Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-600">
                    {lead.shippingCost > 0 ? `$${lead.shippingCost.toFixed(2)}` : 'Free'}
                  </td>

                  {/* 11. Estimated eBay Selling Price */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-900">
                    ${lead.estimatedEbayPrice.toFixed(2)}
                  </td>

                  {/* 12. eBay Fee % */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-500">
                    {lead.ebayFeePercent}%
                  </td>

                  {/* 13. eBay Fee */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-700">
                    ${lead.ebayFee.toFixed(2)}
                  </td>

                  {/* 14. Ad Fee % */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-500">
                    {lead.advertisingFeePercent}%
                  </td>

                  {/* 15. Ad Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-700">
                    ${lead.advertisingCost.toFixed(2)}
                  </td>

                  {/* 16. Other Costs */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-500">
                    ${lead.otherCosts.toFixed(2)}
                  </td>

                  {/* 17. Total Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-800">
                    ${lead.totalCost.toFixed(2)}
                  </td>

                  {/* 18. Estimated Profit */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-bold text-emerald-700">
                    +${lead.estimatedProfit.toFixed(2)}
                  </td>

                  {/* 19. ROI % */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right">
                    <span className={`inline-block font-bold px-1.5 py-0.5 rounded text-2xs ${
                      lead.roi >= 50 ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300' :
                      lead.roi >= 25 ? 'bg-emerald-50 text-emerald-800' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {lead.roi}%
                    </span>
                  </td>

                  {/* 20. Monthly Demand */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-600 text-3xs whitespace-nowrap">
                    {lead.monthlyDemandEstimate}
                  </td>

                  {/* 21. Competition */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <span className={`text-3xs font-semibold px-1.5 py-0.5 rounded ${
                      lead.competitionLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                      lead.competitionLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {lead.competitionLevel}
                    </span>
                  </td>

                  {/* 22. Supplier Rating */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-700">
                    ⭐ {lead.supplierRating}
                  </td>

                  {/* 23. Product Rating */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-700">
                    ⭐ {lead.productRating}
                  </td>

                  {/* 24. Orders/Sales */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-700 text-3xs whitespace-nowrap">
                    {lead.ordersSales}
                  </td>

                  {/* 25. Trend Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-bold text-teal-700">
                    {lead.trendScore}/100
                  </td>

                  {/* 26. Demand Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-600">
                    {lead.demandScore}/25
                  </td>

                  {/* 27. Competition Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-600">
                    {lead.competitionScore}/20
                  </td>

                  {/* 28. Profit Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-600">
                    {lead.profitScore}/25
                  </td>

                  {/* 29. Risk Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right text-slate-600">
                    {lead.riskScore}/10
                  </td>

                  {/* 30. Overall Opportunity Score */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right">
                    <span className="font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-2xs">
                      {lead.overallOpportunityScore}/100
                    </span>
                  </td>

                  {/* 31. Stock Status */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <span className={`text-3xs font-semibold px-1.5 py-0.5 rounded ${
                      lead.stockStatus === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                      lead.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {lead.stockStatus}
                    </span>
                  </td>

                  {/* 32. Shipping Time */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-600 text-3xs whitespace-nowrap">
                    {lead.shippingTime}
                  </td>

                  {/* 33. Seasonal */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-600 text-3xs">
                    {lead.seasonal}
                  </td>

                  {/* 34. Brand/IP Risk */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <span className={`text-3xs font-bold px-1.5 py-0.5 rounded ${
                      lead.brandIpRisk === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                      lead.brandIpRisk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {lead.brandIpRisk}
                    </span>
                  </td>

                  {/* 35. Product Status */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                      lead.productStatus === 'VALIDATED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      lead.productStatus === 'NEW' ? 'bg-blue-100 text-blue-900' :
                      lead.productStatus === 'WATCH' ? 'bg-amber-100 text-amber-900' :
                      lead.productStatus === 'PRICE CHANGED' ? 'bg-orange-100 text-orange-900' :
                      lead.productStatus === 'OUT OF STOCK' ? 'bg-red-100 text-red-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      {lead.productStatus}
                    </span>
                  </td>

                  {/* 36. Notes */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-500 text-3xs truncate max-w-[200px]" title={lead.notes}>
                    {lead.notes}
                  </td>

                  {/* 37. Last Checked */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-400 font-mono text-3xs whitespace-nowrap">
                    {lead.lastChecked}
                  </td>

                  {/* 38. Data Source */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-500 text-3xs truncate max-w-[140px]" title={lead.dataSource}>
                    {lead.dataSource}
                  </td>

                  {/* 39. Duplicate Check */}
                  <td className="px-3 py-2 border-r border-slate-200 text-3xs font-medium text-slate-600">
                    {lead.duplicateCheck}
                  </td>

                  {/* 40. Agent Version */}
                  <td className="px-3 py-2 border-r border-slate-200 text-slate-400 font-mono text-3xs">
                    {lead.agentVersion}
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};
