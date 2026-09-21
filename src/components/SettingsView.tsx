import React from 'react';
import { 
  Save, 
  RotateCcw, 
  Check, 
  Sliders, 
  DollarSign, 
  Percent, 
  Globe, 
  Layers, 
  Clock, 
  Table,
  ShieldAlert,
  Eraser,
  Sparkles
} from 'lucide-react';
import { HunterSettings } from '../types/hunter';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../utils/calculator';

interface SettingsViewProps {
  settings: HunterSettings;
  onUpdateSettings: (newSettings: HunterSettings) => void;
  onResetDefaults: () => void;
  onOpenSheetsModal?: () => void;
  onCleanAppTable?: () => void;
  activeLeadsCount?: number;
  totalArchivedCount?: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
  onOpenSheetsModal,
  onCleanAppTable,
  activeLeadsCount = 0,
  totalArchivedCount = 0,
}) => {
  const [form, setForm] = React.useState<HunterSettings>(settings);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleChange = (field: keyof HunterSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSupplierToggle = (supplier: 'amazon' | 'shein' | 'aliexpress') => {
    setForm((prev) => ({
      ...prev,
      preferredSuppliers: {
        ...prev.preferredSuppliers,
        [supplier]: !prev.preferredSuppliers[supplier],
      },
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setForm((prev) => {
      const exists = prev.enabledCategories.includes(category);
      const updated = exists 
        ? prev.enabledCategories.filter((c) => c !== category)
        : [...prev.enabledCategories, category];
      return { ...prev, enabledCategories: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Save Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between sticky top-16 z-20">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Hunter Parameters & Economics Settings</h2>
          <p className="text-xs text-slate-500">Fine-tune the qualification criteria, supplier filters, and fee calculations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULT_SETTINGS);
              onResetDefaults();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Core Financial & Qualification Thresholds */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600" />
          1. Financial & Profit Targets (Default Min ROI: 25%)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Minimum Target ROI (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={500}
                step={1}
                value={form.minRoi}
                onChange={(e) => handleChange('minRoi', Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
            <p className="text-3xs text-slate-400 mt-1">Leads under this ROI are routed to Rejected Products.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Minimum Profit per Item ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={1}
                max={200}
                step={0.5}
                value={form.minProfit}
                onChange={(e) => handleChange('minProfit', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-3xs text-slate-400 mt-1">Net profit after all eBay, shipping & ad deductions.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Maximum Supplier Cost ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={5}
                max={1000}
                step={5}
                value={form.maxSupplierCost}
                onChange={(e) => handleChange('maxSupplierCost', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-3xs text-slate-400 mt-1">Limits upfront capital required to purchase inventory.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Min eBay Selling Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={5}
                max={500}
                step={1}
                value={form.minSellingPrice}
                onChange={(e) => handleChange('minSellingPrice', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Max eBay Selling Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={20}
                max={2000}
                step={10}
                value={form.maxSellingPrice}
                onChange={(e) => handleChange('maxSellingPrice', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              eBay Target Marketplace
            </label>
            <select
              value={form.ebayMarketplace}
              onChange={(e) => handleChange('ebayMarketplace', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="US">eBay US (ebay.com)</option>
              <option value="UK">eBay UK (ebay.co.uk)</option>
              <option value="DE">eBay Germany (ebay.de)</option>
              <option value="AU">eBay Australia (ebay.com.au)</option>
              <option value="CA">eBay Canada (ebay.ca)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. Fee Calculator Settings */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          2. eBay Fees & Advertising Cost Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              eBay Final Value Fee (%)
            </label>
            <input
              type="number"
              step={0.05}
              value={form.ebayFeePercent}
              onChange={(e) => handleChange('ebayFeePercent', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            />
            <p className="text-3xs text-slate-400 mt-1">Standard: 13.25%</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              eBay Fixed Fee per Order ($)
            </label>
            <input
              type="number"
              step={0.05}
              value={form.ebayFixedFee}
              onChange={(e) => handleChange('ebayFixedFee', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            />
            <p className="text-3xs text-slate-400 mt-1">Standard: $0.30/order</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Promoted Listing / Ad Rate (%)
            </label>
            <input
              type="number"
              step={0.1}
              value={form.promotedListingPercent}
              onChange={(e) => handleChange('promotedListingPercent', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            />
            <p className="text-3xs text-slate-400 mt-1">Recommended: 2.0% - 3.5%</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Other Costs Buffer ($)
            </label>
            <input
              type="number"
              step={0.1}
              value={form.otherCostsEstimate}
              onChange={(e) => handleChange('otherCostsEstimate', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            />
            <p className="text-3xs text-slate-400 mt-1">Returns / payment reserve</p>
          </div>

        </div>
      </div>

      {/* 3. Product Sources */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" />
          3. Preferred Product Sources
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
            form.preferredSuppliers.amazon ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <input
              type="checkbox"
              checked={form.preferredSuppliers.amazon}
              onChange={() => handleSupplierToggle('amazon')}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">Amazon</span>
              <span className="text-3xs text-slate-500">Fast Prime domestic shipping & high trust</span>
            </div>
          </label>

          <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
            form.preferredSuppliers.shein ? 'border-purple-400 bg-purple-50/40' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <input
              type="checkbox"
              checked={form.preferredSuppliers.shein}
              onChange={() => handleSupplierToggle('shein')}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">SHEIN</span>
              <span className="text-3xs text-slate-500">Viral fashion, home organization & accessories</span>
            </div>
          </label>

          <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
            form.preferredSuppliers.aliexpress ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <input
              type="checkbox"
              checked={form.preferredSuppliers.aliexpress}
              onChange={() => handleSupplierToggle('aliexpress')}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-xs text-slate-900 block">AliExpress</span>
              <span className="text-3xs text-slate-500">Highest price margins & trending novelty tools</span>
            </div>
          </label>

        </div>
      </div>

      {/* 4. Target Categories */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            4. Rotational Search Categories ({form.enabledCategories.length} active)
          </h3>
          <div className="flex items-center gap-2 text-2xs">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, enabledCategories: [...DEFAULT_CATEGORIES] }))}
              className="text-teal-700 hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, enabledCategories: [] }))}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {DEFAULT_CATEGORIES.map((cat) => {
            const isChecked = form.enabledCategories.includes(cat);
            return (
              <label
                key={cat}
                className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  isChecked ? 'border-teal-300 bg-teal-50/60 text-slate-900 font-medium' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="truncate">{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Crawl Frequency & Limits */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          5. Crawling Frequency & Daily Quotas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Search Delay Between Cycles (Seconds)
            </label>
            <input
              type="number"
              min={2}
              max={60}
              value={form.searchFrequencySeconds}
              onChange={(e) => handleChange('searchFrequencySeconds', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
            <p className="text-3xs text-slate-400 mt-1">Default 4s. Respects API rate limits and prevents throttling.</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Maximum Products Found per Day
            </label>
            <input
              type="number"
              min={10}
              max={500}
              value={form.maxProductsPerDay}
              onChange={(e) => handleChange('maxProductsPerDay', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
            <p className="text-3xs text-slate-400 mt-1">Agent automatically stops after finding this quota.</p>
          </div>
        </div>
      </div>

      {/* 6. Google Sheets Integration Target */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            6. Direct Google Sheets Live Auto-Sync
          </h3>
          {onOpenSheetsModal && (
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1 text-2xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <span>Manage Google Sheets & Auth ↗</span>
            </button>
          )}
        </div>

        <div className="text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Google Sheet ID or Full URL
              </label>
              <input
                type="text"
                placeholder="Paste Google Sheet URL or ID"
                value={form.googleSpreadsheetUrl || form.googleSheetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  handleChange('googleSpreadsheetUrl', val);
                  // also update googleSheetId
                  const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                  handleChange('googleSheetId', match ? match[1] : val);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-2xs"
              />
              <p className="text-3xs text-slate-400 mt-1">
                Auto-appends newly discovered product leads (with Selling Market, source links, costs, profit & ROI) directly to this sheet.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Sheet Tab Name
              </label>
              <input
                type="text"
                placeholder="Product Leads"
                value={form.googleSheetName || 'Product Leads'}
                onChange={(e) => handleChange('googleSheetName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
              />
              {form.googleSheetId && (
                <a
                  href={form.googleSpreadsheetUrl || `https://docs.google.com/spreadsheets/d/${form.googleSheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-3xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline mt-1"
                >
                  Open in Google Sheets ↗
                </a>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
            <input
              type="checkbox"
              checked={form.autoSyncGoogleSheets}
              onChange={(e) => handleChange('autoSyncGoogleSheets', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-slate-800 font-bold block">
                Automatically append newly discovered leads to Google Sheet in real-time
              </span>
              <span className="text-3xs text-slate-500">
                Whenever the agent validates a dropshipping opportunity, a new row with all 41 columns is immediately added to your Google Sheet.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 7. 100-Item Batching & App Workspace Auto-Clean */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            7. 100-Item Tab Batching & App Table Clean
          </h3>
          {onCleanAppTable && activeLeadsCount > 0 && (
            <button
              type="button"
              onClick={onCleanAppTable}
              className="inline-flex items-center gap-1.5 text-2xs px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold border border-slate-300 hover:border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clean App Table ({activeLeadsCount})</span>
            </button>
          )}
        </div>

        <div className="text-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Items per Tab / Batch
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={form.itemsPerTab || 100}
                onChange={(e) => handleChange('itemsPerTab', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              />
              <p className="text-3xs text-slate-400 mt-1">Default 100 items per Google Sheets tab.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Current Batch Number
              </label>
              <input
                type="number"
                min={1}
                value={form.currentBatchNumber || 1}
                onChange={(e) => handleChange('currentBatchNumber', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              />
              <p className="text-3xs text-slate-400 mt-1">Current batch tab: {form.currentBatchTabName || `Batch ${form.currentBatchNumber || 1}`}</p>
            </div>
          </div>

          {/* Option A: Clean on new tab & start from start */}
          <label className="flex items-start gap-2.5 cursor-pointer bg-teal-50/40 p-3 rounded-lg border border-teal-200">
            <input
              type="checkbox"
              checked={form.cleanOnNewTab !== false}
              onChange={(e) => handleChange('cleanOnNewTab', e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
            />
            <div>
              <span className="text-slate-900 font-bold block">
                Clean data from app and start working from start when a new tab is created
              </span>
              <span className="text-3xs text-slate-600 leading-relaxed block mt-0.5">
                When 100 items are reached and a new tab is created, the app table is cleaned (reset to 0/100) so the agent starts working from start. All previous items remain safely stored in your Google Sheet, and the deduplication memory prevents any duplicates.
              </span>
            </div>
          </label>

          {/* Option B: Clean after putting into sheet */}
          <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={Boolean(form.cleanAfterSheetSync)}
              onChange={(e) => handleChange('cleanAfterSheetSync', e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
            />
            <div>
              <span className="text-slate-900 font-bold block">
                Clean data from app table immediately after putting into Google Sheet
              </span>
              <span className="text-3xs text-slate-600 leading-relaxed block mt-0.5">
                Automatically clears each product from the active app table once it is confirmed saved in Google Sheets, keeping the app workspace clean and ultra-fast.
              </span>
            </div>
          </label>

          {/* Stop every 100 items toggle */}
          <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={form.stopEvery100Items !== false}
              onChange={(e) => handleChange('stopEvery100Items', e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
            />
            <div>
              <span className="text-slate-900 font-bold block">
                Stop agent every 100 items and create new Google Sheets tab
              </span>
              <span className="text-3xs text-slate-600 leading-relaxed block mt-0.5">
                Ensures clean 100-item milestones. Pauses the agent, creates the next tab, and lets you review or immediately start the next batch.
              </span>
            </div>
          </label>

          <div className="bg-slate-100/80 rounded-lg p-3 text-3xs text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Permanent Multi-Factor Deduplication Guarantee</strong>
              Even when the visible table in the app is cleaned, the AI Hunter permanently remembers every ASIN, product ID, and title ever found or saved in your spreadsheet. The agent will never add duplicate items to any tab.
            </div>
          </div>

        </div>
      </div>

    </form>
  );
};
