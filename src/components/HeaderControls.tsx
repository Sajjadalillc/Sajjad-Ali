import React from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  SlidersHorizontal, 
  Table, 
  Download, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eraser
} from 'lucide-react';
import { ActiveTab, HunterSettings } from '../types/hunter';

interface HeaderControlsProps {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  onRun: () => void;
  onStop: () => void;
  onPause: () => void;
  onSingleHunt: () => void;
  isHunting: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSheetsSync: () => void;
  onExportCsv: () => void;
  settings: HunterSettings;
  isGoogleConnected?: boolean;
  batchNumber?: number;
  batchCount?: number;
  onStartNextBatch?: () => void;
  onCleanAppTable?: () => void;
  activeLeadsCount?: number;
  totalArchivedCount?: number;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  status,
  onRun,
  onStop,
  onPause,
  onSingleHunt,
  isHunting,
  activeTab,
  setActiveTab,
  onOpenSheetsSync,
  onExportCsv,
  settings,
  isGoogleConnected = false,
  batchNumber = 1,
  batchCount = 0,
  onStartNextBatch,
  onCleanAppTable,
  activeLeadsCount = 0,
  totalArchivedCount = 0,
}) => {
  const isSheetTrulyActive = isGoogleConnected && Boolean(settings.googleSheetId);
  const isBatchFinished = batchCount >= (settings.itemsPerTab || 100);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  eBay Dropshipping Hunter AI
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  Target ROI ≥ {settings.minRoi}%
                </span>
                <button
                  onClick={() => setActiveTab('settings')}
                  title="Active Selling Market. Click to configure."
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span>
                    {settings.ebayMarketplace === 'UK' ? '🇬🇧' :
                     settings.ebayMarketplace === 'DE' ? '🇩🇪' :
                     settings.ebayMarketplace === 'AU' ? '🇦🇺' :
                     settings.ebayMarketplace === 'CA' ? '🇨🇦' : '🇺🇸'}
                  </span>
                  <span>Market: eBay {settings.ebayMarketplace || 'US'}</span>
                </button>

                {/* 100-Item Batch Tracker Badge */}
                <div 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                    isBatchFinished
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                  title="Automated 100 items per Google Sheets tab"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Tab: {settings.googleSheetName || `Batch ${batchNumber}`} ({batchCount}/100 items)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span>Autonomous Lead Discovery Engine</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'RUNNING' 
                      ? 'bg-emerald-500 animate-pulse' 
                      : status === 'PAUSED' 
                      ? 'bg-amber-500' 
                      : 'bg-slate-400'
                  }`} />
                  <span className="font-semibold text-slate-700">
                    Agent Status: <span className={
                      status === 'RUNNING' ? 'text-emerald-600' :
                      status === 'PAUSED' ? 'text-amber-600' : 'text-slate-600'
                    }>{status}</span>
                  </span>
                  {isHunting && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 ml-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Crawling unique lead...
                    </span>
                  )}
                </div>
                {isSheetTrulyActive && settings.googleSpreadsheetUrl && (
                  <>
                    <span className="text-slate-300">•</span>
                    <a
                      href={settings.googleSpreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 underline underline-offset-2"
                    >
                      Open Live Sheet ↗
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Controls (RUN / STOP / PAUSE) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* If batch finished, show direct Start Next Batch action */}
            {isBatchFinished && onStartNextBatch ? (
              <button
                id="btn-start-next-batch"
                onClick={onStartNextBatch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer animate-bounce"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>START BATCH {batchNumber + 1} (Next 100)</span>
              </button>
            ) : status !== 'RUNNING' ? (
              <button
                id="btn-agent-run"
                onClick={onRun}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>RUN AGENT</span>
              </button>
            ) : (
              <button
                id="btn-agent-pause"
                onClick={onPause}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>PAUSE</span>
              </button>
            )}

            {/* STOP Button */}
            <button
              id="btn-agent-stop"
              onClick={onStop}
              disabled={status === 'IDLE' || status === 'STOPPED'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP</span>
            </button>

            {/* Single Step Hunt */}
            <button
              id="btn-single-hunt"
              onClick={onSingleHunt}
              disabled={isHunting}
              title="Perform a single product search right now"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isHunting ? 'animate-spin' : ''}`} />
              <span>Hunt 1 Item</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Google Sheets Sync Button */}
            <button
              id="btn-sheets-sync"
              onClick={onOpenSheetsSync}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                isSheetTrulyActive
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSheetTrulyActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Table className={`w-4 h-4 ${isSheetTrulyActive ? 'text-emerald-600' : 'text-amber-700'}`} />
              <span>{isSheetTrulyActive ? `Sheets: Batch ${batchNumber} (${batchCount}/100)` : 'Connect Google Sheets'}</span>
            </button>

            {/* CSV Export */}
            <button
              id="btn-export-csv"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Download entire 40-column spreadsheet as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Clean App Table button */}
            {onCleanAppTable && activeLeadsCount > 0 && (
              <button
                id="btn-clean-app-table-header"
                onClick={onCleanAppTable}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-medium transition-colors cursor-pointer"
                title="Clean active leads from app table. All items remain safe in your Google Sheet and permanent deduplication memory."
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clean Table ({activeLeadsCount})</span>
              </button>
            )}

            {/* Settings Quick Tab Switch */}
            <button
              id="btn-nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Configure Hunt Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
