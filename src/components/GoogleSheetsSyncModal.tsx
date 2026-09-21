import React, { useState } from 'react';
import { 
  X, 
  Table, 
  ExternalLink, 
  Download, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  FileSpreadsheet,
  Eraser
} from 'lucide-react';
import { User } from 'firebase/auth';
import { HunterSettings, ProductLead } from '../types/hunter';
import { GoogleSignInButton } from './GoogleSignInButton';
import { extractSpreadsheetId, createHunterSpreadsheet, appendRows, leadToRow, createNewSheetTab } from '../utils/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HunterSettings;
  onUpdateSettings: (newSettings: Partial<HunterSettings>) => void;
  onExportCsv: () => void;
  leads: ProductLead[];
  accessToken: string | null;
  googleUser: User | null;
  onSignInGoogle: () => Promise<string | null>;
  onSignOutGoogle: () => Promise<void>;
  onCleanAppTable?: () => void;
  totalArchivedCount?: number;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportCsv,
  leads,
  accessToken,
  googleUser,
  onSignInGoogle,
  onSignOutGoogle,
  onCleanAppTable,
  totalArchivedCount = 0,
}) => {
  if (!isOpen) return null;

  const [inputUrlOrId, setInputUrlOrId] = useState(settings.googleSpreadsheetUrl || settings.googleSheetId || '');
  const [sheetTabName, setSheetTabName] = useState(settings.googleSheetName || 'Product Leads');
  const [autoSync, setAutoSync] = useState(settings.autoSyncGoogleSheets);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  // Sign in handler
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const token = await onSignInGoogle();
      if (token) {
        setFeedback({ type: 'success', text: 'Google Account connected successfully! You can now link or create a Google Sheet.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Google Sign-in failed. Please allow popups.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await onSignOutGoogle();
      setFeedback({ type: 'info', text: 'Disconnected from Google Account.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to sign out.' });
    }
  };

  // One-click create new Google Sheet
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setFeedback({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    setIsCreatingSheet(true);
    setFeedback(null);

    try {
      const initialTab = `Batch 1 (Items 1-100)`;
      const result = await createHunterSpreadsheet(accessToken, `eBay Dropshipping Hunter - Leads Tracker`, initialTab);
      onUpdateSettings({
        googleSheetId: result.spreadsheetId,
        googleSpreadsheetUrl: result.spreadsheetUrl,
        googleSheetName: initialTab,
        currentBatchTabName: initialTab,
        currentBatchNumber: 1,
        currentBatchCount: 0,
        autoSyncGoogleSheets: true
      });
      setAutoSync(true);
      setInputUrlOrId(result.spreadsheetUrl);
      setSheetTabName(initialTab);
      setFeedback({ 
        type: 'success', 
        text: `Created new Google Sheet! Tab "Batch 1 (Items 1-100)" initialized with 41 columns and auto-sync enabled.` 
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: `Failed to create sheet: ${err?.message || err}` });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Connect existing sheet
  const handleSaveExistingSheet = () => {
    const trimmed = inputUrlOrId.trim();
    if (!trimmed) {
      onUpdateSettings({
        googleSheetId: '',
        googleSpreadsheetUrl: '',
        autoSyncGoogleSheets: false
      });
      setFeedback({ type: 'info', text: 'Google Sheet disconnected.' });
      return;
    }

    const sheetId = extractSpreadsheetId(trimmed);
    const fullUrl = trimmed.startsWith('http') ? trimmed : `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

    onUpdateSettings({
      googleSheetId: sheetId,
      googleSpreadsheetUrl: fullUrl,
      googleSheetName: sheetTabName.trim() || 'Product Leads',
      autoSyncGoogleSheets: autoSync
    });

    setFeedback({
      type: 'success',
      text: `Connected to Google Sheet (ID: ${sheetId.substring(0, 10)}...). Auto-sync is ${autoSync ? 'active' : 'paused'}.`
    });
  };

  // Sync all current leads to Google Sheet
  const handleExecuteSyncAll = async () => {
    setShowConfirmSync(false);

    const sheetId = settings.googleSheetId || extractSpreadsheetId(inputUrlOrId);
    if (!accessToken) {
      setFeedback({ type: 'error', text: 'Please sign in with Google first to append leads.' });
      return;
    }

    if (!sheetId) {
      setFeedback({ type: 'error', text: 'Please create or connect a Google Sheet first.' });
      return;
    }

    if (leads.length === 0) {
      setFeedback({ type: 'info', text: 'No product leads found to sync yet.' });
      return;
    }

    setIsSyncingAll(true);
    setFeedback(null);

    try {
      const rows = leads.map(leadToRow);
      const res = await appendRows(accessToken, sheetId, sheetTabName || 'Product Leads', rows);
      setFeedback({
        type: 'success',
        text: `Successfully synced ${res.updatedRows || leads.length} product leads into your Google Sheet!`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `Sync error: ${err?.message || 'Failed to append rows to sheet. Ensure the sheet exists and permissions are granted.'}`
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const activeSheetId = settings.googleSheetId || extractSpreadsheetId(inputUrlOrId);
  const activeSheetUrl = settings.googleSpreadsheetUrl || (activeSheetId ? `https://docs.google.com/spreadsheets/d/${activeSheetId}/edit` : '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Table className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Google Sheets Direct Auto-Sync
                <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                  Live API
                </span>
              </h2>
              <p className="text-2xs text-emerald-100">
                Automatically add newly discovered eBay dropshipping leads into your Google Sheet
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto text-xs text-slate-700">

          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              feedback.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" /> :
               feedback.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" /> :
               <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
              <div className="text-xs font-medium">{feedback.text}</div>
            </div>
          )}

          {/* 1. Google Account Connection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-2xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                1. Google Account Authorization
              </span>
              {googleUser && (
                <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Authenticated
                </span>
              )}
            </div>

            {!googleUser ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Connect your Google Account</p>
                  <p className="text-3xs text-slate-500">Allows the agent to write leads to your personal Google Drive Sheets securely.</p>
                </div>
                <GoogleSignInButton onClick={handleSignIn} isLoading={isSigningIn} />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img 
                      src={googleUser.photoURL} 
                      alt={googleUser.displayName || 'User'} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {(googleUser.displayName || googleUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{googleUser.displayName || 'Google User'}</div>
                    <div className="text-3xs text-slate-500">{googleUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-2xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* 2. Google Sheet Target Destination */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-2xs flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              2. Target Google Spreadsheet
            </span>

            {/* Quick Create Option */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200">
              <div>
                <p className="font-bold text-emerald-900 text-xs">Create New Dedicated Leads Tracker</p>
                <p className="text-3xs text-emerald-700">Initializes a new Google Sheet in your Drive with all 41 columns pre-formatted.</p>
              </div>
              <button
                type="button"
                onClick={handleCreateNewSheet}
                disabled={!googleUser || isCreatingSheet}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isCreatingSheet ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Creating Sheet...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    + Create New Google Sheet
                  </>
                )}
              </button>
            </div>

            {/* Connect Existing Sheet URL or ID */}
            <div className="space-y-2 pt-2">
              <label className="block text-2xs font-bold text-slate-700">
                Or Paste Existing Google Sheet URL or Spreadsheet ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X.../edit or sheet ID"
                  value={inputUrlOrId}
                  onChange={(e) => setInputUrlOrId(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveExistingSheet}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Sheet Tab Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-2xs font-semibold text-slate-600 mb-1">
                  Sheet Tab Name
                </label>
                <input
                  type="text"
                  placeholder="Product Leads"
                  value={sheetTabName}
                  onChange={(e) => setSheetTabName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                />
              </div>

              {/* Active Sheet Link */}
              {activeSheetUrl && (
                <div className="flex flex-col justify-end">
                  <a
                    href={activeSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-emerald-700 font-bold text-xs border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Open Connected Sheet in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 3. Auto-Sync Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => {
                  setAutoSync(e.target.checked);
                  onUpdateSettings({ autoSyncGoogleSheets: e.target.checked });
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Automatically Append Every Discovered Lead in Real-Time
                </span>
                <span className="text-3xs text-slate-500">
                  When the hunter agent is running, every qualified product (with Selling Market, supplier link, eBay link, ROI, and profit) is appended to your Google Sheet without manual intervention.
                </span>
              </div>
            </label>
          </div>

          {/* 4. Automated 100-Item Tab Batching Policy */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5">
                <Table className="w-4 h-4 text-emerald-600" />
                4. Automated 100-Item Tab System
              </span>
              <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Active Policy
              </span>
            </div>
            <p className="text-xs text-slate-600">
              The AI Agent automatically organizes items into tabs of <strong>100 products</strong> (e.g. <em>Batch 1 (Items 1-100)</em>). Once 100 items are added, the agent stops automatically, creates the new tab in your Google Sheet with all 41 headers initialized, and waits for you to trigger the next batch.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
              <span className="text-slate-600 font-medium">
                Current Target Tab: <strong className="text-slate-900">{settings.googleSheetName || 'Batch 1 (Items 1-100)'}</strong>
              </span>
              <span className="text-slate-600 font-medium">
                Items Limit: <strong className="text-emerald-700">100 items per tab</strong>
              </span>
            </div>
          </div>

          {/* 5. Batch Actions & User Confirmation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmSync(true)}
                disabled={!activeSheetId || !accessToken || isSyncingAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Syncing Rows...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync All Current Leads ({leads.length}) Now
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export CSV Backup
              </button>

              {onCleanAppTable && leads.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Clean ${leads.length} active leads from the app? All data is permanently preserved in your Google Sheet.`)) {
                      onCleanAppTable();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs border border-slate-300 transition-colors cursor-pointer"
                  title="Clean active table while keeping permanent deduplication history"
                >
                  <Eraser className="w-3.5 h-3.5 text-slate-500" />
                  Clean Table ({leads.length})
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Confirmation Modal for Workspace Mutating Operation */}
          {showConfirmSync && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-3 mt-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">Confirm Adding Leads to Google Sheet</h4>
                  <p className="text-2xs text-amber-800 mt-0.5">
                    Are you sure you want to append all <strong>{leads.length}</strong> product leads to your Google Sheet tab <strong>"{sheetTabName || 'Product Leads'}"</strong>? This will insert new rows into your Google Drive spreadsheet.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSync(false)}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg font-medium text-xs hover:bg-amber-100/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSyncAll}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-2xs"
                >
                  Confirm & Append Rows
                </button>
              </div>
            </div>
          )}

          {/* 41 Google Sheet Columns Reference */}
          <div className="pt-2 border-t border-slate-200">
            <details className="group">
              <summary className="font-semibold text-2xs text-slate-500 cursor-pointer hover:text-slate-800 flex items-center justify-between">
                <span>View 41 Columns Appended to Your Sheet</span>
                <span className="text-3xs text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-3xs font-mono text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-36 overflow-y-auto">
                <div>1. Date Found</div>
                <div>2. Product Name</div>
                <div className="text-blue-700 font-bold">3. Selling Market</div>
                <div>4. Source</div>
                <div>5. Supplier Link</div>
                <div>6. eBay Search Link</div>
                <div>7. Product ID / ASIN</div>
                <div>8. Category</div>
                <div>9. Main Keyword</div>
                <div>10. Supplier Cost</div>
                <div>11. Shipping Cost</div>
                <div>12. Est. eBay Price</div>
                <div>13. eBay Fee %</div>
                <div>14. eBay Fee ($)</div>
                <div>15. Ad Fee %</div>
                <div>16. Ad Cost ($)</div>
                <div>17. Other Costs ($)</div>
                <div>18. Total Cost ($)</div>
                <div className="text-emerald-700 font-bold">19. Est. Profit ($)</div>
                <div className="text-emerald-700 font-bold">20. ROI %</div>
                <div>21. Monthly Demand</div>
                <div>22. Competition Level</div>
                <div>23. Supplier Rating</div>
                <div>24. Product Rating</div>
                <div>25. Orders/Sales</div>
                <div>26. Trend Score</div>
                <div>27. Demand Score</div>
                <div>28. Comp. Score</div>
                <div>29. Profit Score</div>
                <div>30. Risk Score</div>
                <div>31. Opp. Score</div>
                <div>32. Stock Status</div>
                <div>33. Shipping Time</div>
                <div>34. Seasonal</div>
                <div>35. Brand/IP Risk</div>
                <div>36. Product Status</div>
                <div>37. Notes</div>
                <div>38. Last Checked</div>
                <div>39. Data Source</div>
                <div>40. Duplicate Check</div>
                <div>41. Agent Version</div>
              </div>
            </details>
          </div>

        </div>

      </div>
    </div>
  );
};
