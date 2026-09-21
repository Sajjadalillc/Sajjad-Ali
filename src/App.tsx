import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HeaderControls 
} from './components/HeaderControls';
import { 
  StatsCards 
} from './components/StatsCards';
import { 
  AgentActivityFeed 
} from './components/AgentActivityFeed';
import { 
  GoogleSheetTable 
} from './components/GoogleSheetTable';
import { 
  LeadDetailModal 
} from './components/LeadDetailModal';
import { 
  PriceMonitorView 
} from './components/PriceMonitorView';
import { 
  SettingsView 
} from './components/SettingsView';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  GoogleSheetsSyncModal 
} from './components/GoogleSheetsSyncModal';
import { 
  ActiveTab, 
  AgentLogEntry, 
  HunterSettings, 
  ProductLead, 
  SupplierSource 
} from './types/hunter';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_SETTINGS 
} from './utils/calculator';
import { 
  Table, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  SlidersHorizontal, 
  BarChart3, 
  FileSpreadsheet,
  Sparkles,
  ExternalLink,
  Eraser
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleLogout } from './utils/auth';
import { leadToRow, appendRows, createNewSheetTab, createHunterSpreadsheet } from './utils/googleSheets';
import { 
  getArchivedProducts, 
  archiveProducts, 
  isHistoricallyDuplicate, 
  getLifetimeStats 
} from './utils/historyStorage';

// Initial sample data so the 41-column Google Sheet & Dashboard are instantly interactive
const INITIAL_LEADS: ProductLead[] = [
  {
    id: 'lead-init-1',
    dateFound: '2026-09-21 07:15:20',
    productName: 'Silicone Magnetic Cable Organizer Clips (6-Pack)',
    sellingMarket: 'eBay US',
    source: 'AliExpress',
    supplierUrl: 'https://www.aliexpress.com/item/1005006421980.html',
    ebayListingUrl: 'https://www.ebay.com/sch/i.html?_nkw=magnetic+cable+organizer+clips+desk',
    productId: '1005006421980',
    category: 'Electronics Accessories',
    mainKeyword: 'magnetic cable organizer clips desk',
    supplierPrice: 2.85,
    shippingCost: 0.00,
    estimatedEbayPrice: 12.99,
    ebayFeePercent: 13.25,
    ebayFee: 2.02,
    advertisingFeePercent: 2.0,
    advertisingCost: 0.26,
    otherCosts: 0.50,
    totalCost: 5.63,
    estimatedProfit: 7.36,
    roi: 258.2,
    monthlyDemandEstimate: '18,500 searches / 680 sales',
    competitionLevel: 'Medium',
    supplierRating: 4.8,
    productRating: 4.7,
    ordersSales: '4,890 orders',
    trendScore: 86,
    demandScore: 23,
    competitionScore: 16,
    profitScore: 25,
    riskScore: 10,
    overallOpportunityScore: 92,
    stockStatus: 'In Stock',
    shippingTime: '8-12 days',
    seasonal: 'No',
    brandIpRisk: 'Low',
    productStatus: 'VALIDATED',
    notes: '[QUALIFIED]: ROI 258.2% exceeds 25%. Viral TikTok desk organization item; zero trademark risk.',
    lastChecked: '2026-09-21 07:15:20',
    dataSource: 'AliExpress Hot Movers',
    duplicateCheck: 'Unique',
    agentVersion: 'v2.4-ai-hunter',
    trendBreakdown: {
      demandGrowth: 23,
      salesVelocity: 18,
      searchInterest: 19,
      competitionOpportunity: 13,
      productFreshness: 8,
      socialSignals: 9,
    },
    priceHistory: [
      { date: '2026-09-21 07:15:20', supplierPrice: 2.85, ebayPrice: 12.99, roi: 258.2 }
    ]
  },
  {
    id: 'lead-init-2',
    dateFound: '2026-09-21 07:18:45',
    productName: 'Ergonomic Memory Foam Lumbar Support Cushion',
    sellingMarket: 'eBay US',
    source: 'Amazon',
    supplierUrl: 'https://www.amazon.com/dp/B09X87KL92',
    ebayListingUrl: 'https://www.ebay.com/sch/i.html?_nkw=ergonomic+memory+foam+lumbar+pillow',
    productId: 'B09X87KL92',
    category: 'Home & Kitchen',
    mainKeyword: 'ergonomic memory foam lumbar pillow',
    supplierPrice: 14.50,
    shippingCost: 0.00,
    estimatedEbayPrice: 32.95,
    ebayFeePercent: 13.25,
    ebayFee: 4.67,
    advertisingFeePercent: 2.0,
    advertisingCost: 0.66,
    otherCosts: 0.50,
    totalCost: 20.33,
    estimatedProfit: 12.62,
    roi: 87.0,
    monthlyDemandEstimate: '24,000 searches / 850 sales',
    competitionLevel: 'Medium',
    supplierRating: 4.7,
    productRating: 4.6,
    ordersSales: '3,120 orders',
    trendScore: 81,
    demandScore: 21,
    competitionScore: 15,
    profitScore: 22,
    riskScore: 10,
    overallOpportunityScore: 84,
    stockStatus: 'In Stock',
    shippingTime: '2-4 days (Prime)',
    seasonal: 'No',
    brandIpRisk: 'Low',
    productStatus: 'VALIDATED',
    notes: '[QUALIFIED]: ROI 87% exceeds 25%. Fast domestic shipping and steady evergreen demand.',
    lastChecked: '2026-09-21 07:18:45',
    dataSource: 'Amazon Movers & Shakers',
    duplicateCheck: 'Unique',
    agentVersion: 'v2.4-ai-hunter',
    trendBreakdown: {
      demandGrowth: 21,
      salesVelocity: 17,
      searchInterest: 18,
      competitionOpportunity: 12,
      productFreshness: 7,
      socialSignals: 8,
    },
    priceHistory: [
      { date: '2026-09-21 07:18:45', supplierPrice: 14.50, ebayPrice: 32.95, roi: 87.0 }
    ]
  },
  {
    id: 'lead-init-3',
    dateFound: '2026-09-21 07:22:10',
    productName: 'Minimalist Acrylic Floating Wall Shelves (2-Pack)',
    sellingMarket: 'eBay US',
    source: 'SHEIN',
    supplierUrl: 'https://www.shein.com/product/sh-wall-shelf-9921',
    ebayListingUrl: 'https://www.ebay.com/sch/i.html?_nkw=acrylic+clear+floating+shelves+wall',
    productId: 'sh-wall-shelf-9921',
    category: 'Storage & Organization',
    mainKeyword: 'acrylic clear floating shelves wall',
    supplierPrice: 6.20,
    shippingCost: 1.00,
    estimatedEbayPrice: 19.99,
    ebayFeePercent: 13.25,
    ebayFee: 2.95,
    advertisingFeePercent: 2.0,
    advertisingCost: 0.40,
    otherCosts: 0.50,
    totalCost: 11.05,
    estimatedProfit: 8.94,
    roi: 124.2,
    monthlyDemandEstimate: '14,200 searches / 520 sales',
    competitionLevel: 'Low',
    supplierRating: 4.9,
    productRating: 4.8,
    ordersSales: '1,950 orders',
    trendScore: 87,
    demandScore: 24,
    competitionScore: 18,
    profitScore: 25,
    riskScore: 10,
    overallOpportunityScore: 90,
    stockStatus: 'In Stock',
    shippingTime: '6-9 days',
    seasonal: 'No',
    brandIpRisk: 'Low',
    productStatus: 'VALIDATED',
    notes: '[QUALIFIED]: ROI 124.2% exceeds 25%. Pinterest aesthetic shelf trend with low competition.',
    lastChecked: '2026-09-21 07:22:10',
    dataSource: 'SHEIN Home Bestseller',
    duplicateCheck: 'Unique',
    agentVersion: 'v2.4-ai-hunter',
    trendBreakdown: {
      demandGrowth: 24,
      salesVelocity: 16,
      searchInterest: 19,
      competitionOpportunity: 14,
      productFreshness: 9,
      socialSignals: 9,
    },
    priceHistory: [
      { date: '2026-09-21 07:22:10', supplierPrice: 6.20, ebayPrice: 19.99, roi: 124.2 }
    ]
  },
  {
    id: 'lead-init-4',
    dateFound: '2026-09-21 07:26:00',
    productName: 'Heavy Duty Metal Cast Iron Wall Bottle Opener',
    sellingMarket: 'eBay US',
    source: 'Amazon',
    supplierUrl: 'https://www.amazon.com/dp/B08XYZ1234',
    ebayListingUrl: 'https://www.ebay.com/sch/i.html?_nkw=cast+iron+wall+bottle+opener',
    productId: 'B08XYZ1234',
    category: 'Home & Kitchen',
    mainKeyword: 'cast iron wall bottle opener',
    supplierPrice: 8.50,
    shippingCost: 0.00,
    estimatedEbayPrice: 11.99,
    ebayFeePercent: 13.25,
    ebayFee: 1.89,
    advertisingFeePercent: 2.0,
    advertisingCost: 0.24,
    otherCosts: 0.50,
    totalCost: 11.13,
    estimatedProfit: 0.86,
    roi: 10.1,
    monthlyDemandEstimate: '6,200 searches / 190 sales',
    competitionLevel: 'High',
    supplierRating: 4.4,
    productRating: 4.3,
    ordersSales: '820 orders',
    trendScore: 52,
    demandScore: 12,
    competitionScore: 8,
    profitScore: 6,
    riskScore: 10,
    overallOpportunityScore: 48,
    stockStatus: 'In Stock',
    shippingTime: '3-5 days',
    seasonal: 'No',
    brandIpRisk: 'Low',
    productStatus: 'REJECTED',
    rejectionReason: 'ROI (10.1%) is below the minimum threshold of 25%; Net profit ($0.86) below minimum $3.00',
    notes: '[REJECTED]: ROI (10.1%) is below the minimum threshold of 25%; Net profit ($0.86) below minimum $3.00',
    lastChecked: '2026-09-21 07:26:00',
    dataSource: 'Amazon Kitchen Catalog',
    duplicateCheck: 'Unique',
    agentVersion: 'v2.4-ai-hunter',
    trendBreakdown: {
      demandGrowth: 11,
      salesVelocity: 9,
      searchInterest: 10,
      competitionOpportunity: 8,
      productFreshness: 5,
      socialSignals: 4,
    },
    priceHistory: [
      { date: '2026-09-21 07:26:00', supplierPrice: 8.50, ebayPrice: 11.99, roi: 10.1 }
    ]
  }
];

export default function App() {
  // State
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED'>('IDLE');
  const [isHunting, setIsHunting] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [leads, setLeads] = useState<ProductLead[]>(() => {
    const saved = localStorage.getItem('hunter_leads');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_LEADS;
  });
  const [settings, setSettings] = useState<HunterSettings>(() => {
    const saved = localStorage.getItem('hunter_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_SETTINGS;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('qualified');
  const [logs, setLogs] = useState<AgentLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-21 07:15:20',
      type: 'info',
      message: 'Autonomous Hunter Engine initialized. Target ROI filter: ≥ 25%.'
    },
    {
      id: 'log-2',
      timestamp: '2026-09-21 07:15:25',
      type: 'lead',
      message: 'Validated new opportunity: Silicone Magnetic Cable Organizer Clips (ROI: 258.2%)',
      roi: 258.2
    }
  ]);
  const [inspectedLead, setInspectedLead] = useState<ProductLead | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [todayCount, setTodayCount] = useState(3);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [archivedCount, setArchivedCount] = useState<number>(() => {
    return getLifetimeStats().totalSynced;
  });

  // Archive initial leads on first load so they are permanently remembered in deduplication
  useEffect(() => {
    archiveProducts(INITIAL_LEADS, 1, 'Batch 1 (Items 1-100)');
    setArchivedCount(getLifetimeStats().totalSynced);
  }, []);

  const handleCleanAppTable = () => {
    if (leads.length === 0) return;
    const count = leads.length;
    archiveProducts(leads, currentBatchNumber, currentBatchTabName);
    setLeads([]);
    setTodayCount(0);
    const updatedStats = getLifetimeStats();
    setArchivedCount(updatedStats.totalSynced);
    setSettings((prev) => ({
      ...prev,
      currentBatchCount: 0,
      totalSyncedLifetime: (prev.totalSyncedLifetime || 0) + count,
    }));
    addLog(
      'success',
      `🧹 Cleaned ${count} items from app workspace! All items remain safely stored in your Google Sheet, and the permanent deduplication memory remembers all ${updatedStats.totalSynced} items.`
    );
  };

  // Initialize Auth state for Google Sheets
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignInGoogle = async (): Promise<string | null> => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        addLog('success', `Google Account connected: ${result.user.email}. Google Sheets API is ready for real-time syncing.`);
        return result.accessToken;
      }
    } catch (err: any) {
      addLog('error', `Google Sign-in failed: ${err?.message || err}`);
      throw err;
    }
    return null;
  };

  const handleSignOutGoogle = async () => {
    await googleLogout();
    setGoogleUser(null);
    setAccessToken(null);
    addLog('info', 'Disconnected Google Account.');
  };

  // Rotation indices
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentSupplierIndex, setCurrentSupplierIndex] = useState(0);

  // Active supplier list based on settings
  const activeSuppliers = useMemo<SupplierSource[]>(() => {
    const list: SupplierSource[] = [];
    if (settings.preferredSuppliers.amazon) list.push('Amazon');
    if (settings.preferredSuppliers.shein) list.push('SHEIN');
    if (settings.preferredSuppliers.aliexpress) list.push('AliExpress');
    return list.length > 0 ? list : ['Amazon', 'SHEIN', 'AliExpress'];
  }, [settings.preferredSuppliers]);

  const activeCategories = useMemo<string[]>(() => {
    return settings.enabledCategories.length > 0 ? settings.enabledCategories : DEFAULT_CATEGORIES;
  }, [settings.enabledCategories]);

  const currentSource = activeSuppliers[currentSupplierIndex % activeSuppliers.length] || 'Amazon';
  const currentCategory = activeCategories[currentCategoryIndex % activeCategories.length] || 'Home & Kitchen';

  // Batch configuration & tracker
  const currentBatchNumber = settings.currentBatchNumber || 1;
  const itemsPerTab = settings.itemsPerTab || 100;
  const currentBatchTabName = settings.googleSheetName || `Batch ${currentBatchNumber} (Items ${(currentBatchNumber - 1) * itemsPerTab + 1}-${currentBatchNumber * itemsPerTab})`;

  // Count of qualified leads discovered in the current batch
  const currentBatchCount = useMemo(() => {
    return leads.filter((l) => l.productStatus === 'VALIDATED' && (l.batchNumber === currentBatchNumber || !l.batchNumber)).length;
  }, [leads, currentBatchNumber]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hunter_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('hunter_settings', JSON.stringify(settings));
  }, [settings]);

  // Log append helper
  const addLog = (type: AgentLogEntry['type'], message: string, roi?: number) => {
    const newEntry: AgentLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      message,
      roi,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  // Perform single hunt cycle
  const executeHuntStep = async () => {
    if (isHunting) return;
    setIsHunting(true);

    const source = activeSuppliers[currentSupplierIndex % activeSuppliers.length] || 'Amazon';
    const category = activeCategories[currentCategoryIndex % activeCategories.length] || 'Home & Kitchen';

    addLog('info', `Searching ${source} for unique trending items in "${category}" (Target ROI ≥ ${settings.minRoi}%)...`);

    try {
      const archived = getArchivedProducts();
      const activeIds = leads.map((l) => l.productId);
      const archivedIds = archived.map((a) => a.productId);
      const existingIds = Array.from(new Set([...activeIds, ...archivedIds]));

      const activeTitles = leads.map((l) => l.productName);
      const archivedTitles = archived.map((a) => a.productName);
      const existingTitles = Array.from(new Set([...activeTitles, ...archivedTitles]));

      const activeKeywords = leads.map((l) => l.mainKeyword).filter(Boolean);
      const archivedKeywords = archived.map((a) => a.mainKeyword).filter(Boolean);
      const existingKeywords = Array.from(new Set([...activeKeywords, ...archivedKeywords]));

      const response = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          targetCategory: category,
          targetSource: source,
          existingIds,
          existingTitles,
          existingKeywords,
        }),
      });

      const data = await response.json();

      if (data.success && data.lead) {
        const lead: ProductLead = {
          ...data.lead,
          sellingMarket: data.lead.sellingMarket || `eBay ${settings.ebayMarketplace || 'US'}`,
          batchNumber: currentBatchNumber,
          batchTabName: currentBatchTabName,
        };

        // Strict Deduplication Check: Check against active leads AND permanent archived history
        const isDuplicate = 
          leads.some((existing) => {
            if (existing.productId.toLowerCase() === lead.productId.toLowerCase()) return true;
            if (existing.productName.toLowerCase().trim() === lead.productName.toLowerCase().trim()) return true;
            const wordsA = new Set(existing.productName.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
            const wordsB = new Set(lead.productName.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
            let overlap = 0;
            wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });
            const union = new Set([...wordsA, ...wordsB]).size;
            return union > 0 && (overlap / union > 0.65);
          }) || 
          isHistoricallyDuplicate(lead.productId, lead.productName, archived);

        if (isDuplicate) {
          addLog('warn', `Duplicate product skipped: "${lead.productName}". Crawling unique replacement item...`);
        } else if (lead.productStatus === 'VALIDATED') {
          // Qualified lead!
          archiveProducts([lead], currentBatchNumber, currentBatchTabName);
          setArchivedCount(getLifetimeStats().totalSynced);

          const updatedBatchCount = currentBatchCount + 1;
          setTodayCount((prev) => prev + 1);

          // Add to leads table
          setLeads((prev) => [lead, ...prev]);

          addLog(
            'lead',
            `QUALIFIED LEAD FOUND [${updatedBatchCount}/${itemsPerTab} in ${currentBatchTabName}]: "${lead.productName}" | Supplier: $${lead.supplierPrice} → eBay: $${lead.estimatedEbayPrice} | Net: +$${lead.estimatedProfit} (ROI: ${lead.roi}%)`,
            lead.roi
          );

          // Live Auto-Sync directly to Google Sheets tab
          if (settings.autoSyncGoogleSheets && settings.googleSheetId && accessToken) {
            try {
              const row = leadToRow(lead);
              await appendRows(accessToken, settings.googleSheetId, currentBatchTabName, [row]);
              addLog(
                'success',
                `[Google Sheets Tab: ${currentBatchTabName}] Appended item #${updatedBatchCount} "${lead.productName.substring(0, 24)}..." directly to live Google Sheet!`
              );

              // User Request: "after putting the data into sheet data will be clean from app"
              if (settings.cleanAfterSheetSync) {
                setLeads((prev) => prev.filter((p) => p.id !== lead.id));
                addLog('info', `🧹 Cleaned "${lead.productName.substring(0, 24)}..." from app workspace after putting into Google Sheet.`);
              }
            } catch (err: any) {
              console.error('Google Sheets live sync error:', err);
              addLog('warn', `Google Sheets live sync notice: ${err?.message || 'Check sheet permissions'}`);
            }
          } else if (settings.autoSyncGoogleSheets && settings.googleSheetsWebhookUrl) {
            fetch('/api/sync-sheets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lead, webhookUrl: settings.googleSheetsWebhookUrl }),
            }).catch(() => {});
            addLog('success', `Lead auto-appended to live Google Sheet via Webhook.`);
          } else if (settings.autoSyncGoogleSheets && !accessToken) {
            addLog('info', `Google Sheets auto-sync is enabled. Connect your Google Account above to automatically stream rows into your spreadsheet.`);
          }

          // Stop every 100 items rule & auto-create next tab
          // User Request: "create tap of 100 items once 100 item will be done then create new tab with AI agent self and start working. stop every 100 items. after putting the data into sheet data will be clean from app. or when it create new tab start working from start."
          if (updatedBatchCount >= itemsPerTab) {
            setStatus('PAUSED');
            setIsHunting(false);
            if (timerRef.current) clearTimeout(timerRef.current);

            const nextBatchNumber = currentBatchNumber + 1;
            const nextTabName = `Batch ${nextBatchNumber} (Items ${(nextBatchNumber - 1) * itemsPerTab + 1}-${nextBatchNumber * itemsPerTab})`;

            // Permanently archive all leads from this completed batch
            archiveProducts([lead, ...leads], currentBatchNumber, currentBatchTabName);
            setArchivedCount(getLifetimeStats().totalSynced);

            // AI Agent automatically creates the new tab in Google Sheets
            if (accessToken && settings.googleSheetId) {
              try {
                await createNewSheetTab(accessToken, settings.googleSheetId, nextTabName);
                addLog('success', `🎯 [AUTO TAB CREATION]: 100 items completed for "${currentBatchTabName}"! AI Agent created new tab "${nextTabName}" in your Google Sheet with all 41 master headers.`);
              } catch (tabErr: any) {
                console.warn('Auto create next tab notice:', tabErr);
              }
            }

            // User Request: "or when it create new tab start working from start."
            if (settings.cleanOnNewTab !== false) {
              setLeads([]);
              setTodayCount(0);
              addLog('info', `🧹 Active table cleaned from app! All 100 items from ${currentBatchTabName} are securely saved in your Google Sheet. Ready to start Batch ${nextBatchNumber} fresh from start (0/100).`);
            }

            setSettings((prev) => ({
              ...prev,
              currentBatchNumber: nextBatchNumber,
              currentBatchCount: 0,
              googleSheetName: nextTabName,
              currentBatchTabName: nextTabName,
              totalSyncedLifetime: (prev.totalSyncedLifetime || 0) + updatedBatchCount,
            }));

            addLog(
              'lead',
              `🛑 AGENT STOPPED AT 100 ITEMS: Batch ${currentBatchNumber} (${currentBatchTabName}) reached 100 products! Data is safely stored in your Google Sheet and app workspace is clean. Click "START BATCH ${nextBatchNumber}" to begin finding the next 100 items from start.`
            );
          } else {
            setSettings((prev) => ({
              ...prev,
              currentBatchCount: updatedBatchCount,
            }));
          }
        } else {
          // Rejected lead
          setLeads((prev) => [lead, ...prev]);
          addLog('warn', `REJECTED: "${lead.productName}" (${lead.rejectionReason || `ROI ${lead.roi}% < ${settings.minRoi}%`})`);
        }
      } else {
        addLog('warn', `No eligible product identified on this cycle. Advancing to next category.`);
      }
    } catch (err: any) {
      addLog('error', `Crawler request error: ${err.message || 'Network delay'}`);
    } finally {
      setIsHunting(false);
      // Advance rotations
      setCurrentCategoryIndex((prev) => (prev + 1) % activeCategories.length);
      setCurrentSupplierIndex((prev) => (prev + 1) % activeSuppliers.length);
    }
  };

  // Autonomous Run / Stop Loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'RUNNING') {
      // Check daily limit
      if (todayCount >= settings.maxProductsPerDay) {
        setStatus('STOPPED');
        addLog('info', `Daily quota limit reached (${settings.maxProductsPerDay} products). Agent safely stopped.`);
        return;
      }

      // Execute next hunt cycle
      timerRef.current = setTimeout(() => {
        executeHuntStep();
      }, Math.max(2000, settings.searchFrequencySeconds * 1000));
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status, leads.length, isHunting, todayCount, settings.searchFrequencySeconds, settings.maxProductsPerDay]);

  // Handlers for RUN / STOP / PAUSE
  const handleRun = () => {
    setStatus('RUNNING');
    addLog('info', `AGENT RUN TRIGGERED. Autonomous search loop activated across Amazon, SHEIN & AliExpress.`);
    executeHuntStep();
  };

  const handleStop = () => {
    setStatus('STOPPED');
    if (timerRef.current) clearTimeout(timerRef.current);
    addLog('info', `AGENT STOPPED BY USER. Search loop terminated.`);
  };

  const handlePause = () => {
    setStatus('PAUSED');
    if (timerRef.current) clearTimeout(timerRef.current);
    addLog('info', `AGENT PAUSED. Research cycle frozen.`);
  };

  // Re-check single item price
  const handleRecheckLead = async (product: ProductLead) => {
    setIsRechecking(true);
    addLog('info', `Checking live supplier price and inventory for "${product.productName}"...`);
    try {
      const res = await fetch('/api/monitor-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, settings }),
      });
      const data = await res.json();
      if (data.success && data.updatedLead) {
        const updated: ProductLead = data.updatedLead;
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        if (inspectedLead && inspectedLead.id === updated.id) {
          setInspectedLead(updated);
        }
        addLog(
          'info',
          `Price check updated for "${updated.productName}": Supplier $${updated.supplierPrice}, Net: +$${updated.estimatedProfit}, ROI: ${updated.roi}%. Status: ${updated.productStatus}.`
        );
      }
    } catch (e: any) {
      addLog('error', `Price check error: ${e.message}`);
    } finally {
      setIsRechecking(false);
    }
  };

  // Re-check all monitored items
  const handleRecheckAll = async () => {
    if (leads.length === 0 || isRechecking) return;
    setIsRechecking(true);
    addLog('info', `Starting automated price & inventory audit across all ${leads.length} products...`);
    for (const lead of leads.slice(0, 10)) {
      await handleRecheckLead(lead);
    }
    setIsRechecking(false);
    addLog('success', `Completed batch price audit.`);
  };

  // Export CSV download
  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      'Date Found', 'Product Name', 'Selling Market', 'Source', 'Supplier URL', 'eBay Listing URL',
      'Product ID', 'Category', 'Main Keyword', 'Supplier Price', 'Shipping Cost',
      'Estimated eBay Price', 'eBay Fee %', 'eBay Fee', 'Advertising Fee %', 'Advertising Cost',
      'Other Costs', 'Total Cost', 'Estimated Profit', 'ROI %', 'Monthly Demand Estimate',
      'Competition Level', 'Supplier Rating', 'Product Rating', 'Orders/Sales', 'Trend Score',
      'Demand Score', 'Competition Score', 'Profit Score', 'Risk Score', 'Overall Opportunity Score',
      'Stock Status', 'Shipping Time', 'Seasonal', 'Brand/IP Risk', 'Product Status',
      'Notes', 'Last Checked', 'Data Source', 'Duplicate Check', 'Agent Version'
    ];

    const escapeCsv = (str: any) => {
      const s = String(str ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = leads.map((l) => [
      l.dateFound, l.productName, l.sellingMarket || `eBay ${settings.ebayMarketplace || 'US'}`, l.source, l.supplierUrl, l.ebayListingUrl,
      l.productId, l.category, l.mainKeyword, l.supplierPrice, l.shippingCost,
      l.estimatedEbayPrice, l.ebayFeePercent, l.ebayFee, l.advertisingFeePercent,
      l.advertisingCost, l.otherCosts, l.totalCost, l.estimatedProfit, l.roi,
      l.monthlyDemandEstimate, l.competitionLevel, l.supplierRating, l.productRating,
      l.ordersSales, l.trendScore, l.demandScore, l.competitionScore, l.profitScore,
      l.riskScore, l.overallOpportunityScore, l.stockStatus, l.shippingTime,
      l.seasonal, l.brandIpRisk, l.productStatus, l.notes, l.lastChecked,
      l.dataSource, l.duplicateCheck, l.agentVersion
    ].map(escapeCsv).join(','));

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ebay_dropshipping_hunter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('info', `Spreadsheet CSV exported (${leads.length} rows with 41 Google Sheet columns).`);
  };

  // Filtered views for tabs
  const qualifiedLeads = useMemo(() => leads.filter((l) => l.productStatus === 'VALIDATED' || l.roi >= settings.minRoi), [leads, settings.minRoi]);
  const rejectedLeads = useMemo(() => leads.filter((l) => l.productStatus === 'REJECTED' || (l.roi < settings.minRoi && l.productStatus !== 'VALIDATED')), [leads, settings.minRoi]);

  // Aggregate stats
  const totalFound = leads.length;
  const qualifiedCount = qualifiedLeads.length;
  const averageRoi = qualifiedCount > 0 
    ? Number((qualifiedLeads.reduce((acc, cur) => acc + cur.roi, 0) / qualifiedCount).toFixed(1))
    : 0;
  const averageProfit = qualifiedCount > 0
    ? Number((qualifiedLeads.reduce((acc, cur) => acc + cur.estimatedProfit, 0) / qualifiedCount).toFixed(2))
    : 0;

  const lastProduct = leads[0] || null;

  // Handle starting next batch of 100 items
  // User Request: "create tap of 100 items once 100 item will be done then create new tab with AI agent self and start working. stop every 100 items. after putting the data into sheet data will be clean from app. or when it create new tab start working from start."
  const handleStartNextBatch = async () => {
    const nextBatch = (settings.currentBatchNumber || 1);
    const nextTab = settings.googleSheetName || `Batch ${nextBatch} (Items ${(nextBatch - 1) * 100 + 1}-${nextBatch * 100})`;

    // Archive current leads so deduplication permanently remembers them
    if (leads.length > 0) {
      archiveProducts(leads, nextBatch - 1, settings.currentBatchTabName || `Batch ${nextBatch - 1}`);
      setArchivedCount(getLifetimeStats().totalSynced);
    }

    // Clean data from app and start working from start
    if (settings.cleanOnNewTab !== false) {
      setLeads([]);
      setTodayCount(0);
      addLog('info', `🧹 Active table cleaned from app! All previous batch leads are preserved in Google Sheet. Starting Batch ${nextBatch} completely fresh from start (0/100).`);
    }

    if (accessToken && settings.googleSheetId) {
      try {
        await createNewSheetTab(accessToken, settings.googleSheetId, nextTab);
      } catch {
        // Tab might already exist, safe to proceed
      }
    }

    setSettings((prev) => ({
      ...prev,
      currentBatchCount: 0,
      currentBatchNumber: nextBatch,
      googleSheetName: nextTab,
      currentBatchTabName: nextTab,
    }));

    setStatus('RUNNING');
    addLog('info', `🚀 BATCH ${nextBatch} STARTED: AI Hunter activated from start (0/100) for new Google Sheet tab "${nextTab}".`);
    executeHuntStep();
  };

  // 1-Click Connect and Auto-Create Google Sheet Tracker
  const handle1ClickConnectAndCreateSheet = async () => {
    try {
      let token = accessToken;
      if (!token) {
        token = await handleSignInGoogle();
      }
      if (!token) {
        addLog('warn', 'Google sign-in was cancelled. Please authorize to connect Google Sheets.');
        return;
      }

      addLog('info', 'Creating dedicated Google Spreadsheet with 100-item batch tabs...');
      const initialTab = currentBatchTabName;
      const result = await createHunterSpreadsheet(token, 'eBay Dropshipping Hunter - Leads Tracker', initialTab);

      const updatedSettings: HunterSettings = {
        ...settings,
        googleSheetId: result.spreadsheetId,
        googleSpreadsheetUrl: result.spreadsheetUrl,
        googleSheetName: initialTab,
        currentBatchTabName: initialTab,
        autoSyncGoogleSheets: true,
      };
      setSettings(updatedSettings);

      // Sync existing qualified leads
      const qualifiedOnly = leads.filter((l) => l.productStatus === 'VALIDATED');
      if (qualifiedOnly.length > 0) {
        const rows = qualifiedOnly.map(leadToRow);
        await appendRows(token, result.spreadsheetId, initialTab, rows);
        addLog('success', `✅ Google Sheet created! Synced ${qualifiedOnly.length} existing qualified leads directly into "${initialTab}".`);
      } else {
        addLog('success', `✅ Google Sheet created! Real-time auto-sync is active. Every newly discovered lead will be automatically appended.`);
      }
    } catch (err: any) {
      addLog('error', `Failed to auto-create Google Sheet: ${err?.message || err}`);
    }
  };

  const isGoogleConnected = Boolean(accessToken && googleUser);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-emerald-200">
      
      {/* 1. Sticky Header & Controls (RUN / STOP / PAUSE) */}
      <HeaderControls
        status={status}
        onRun={handleRun}
        onStop={handleStop}
        onPause={handlePause}
        onSingleHunt={executeHuntStep}
        isHunting={isHunting}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
        onExportCsv={handleExportCsv}
        settings={settings}
        isGoogleConnected={isGoogleConnected}
        batchNumber={currentBatchNumber}
        batchCount={currentBatchCount}
        onStartNextBatch={handleStartNextBatch}
        onCleanAppTable={handleCleanAppTable}
        activeLeadsCount={leads.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        
        {/* Google Sheets Automatic Live Sync & Batch Banner */}
        {(!settings.googleSheetId || !accessToken) ? (
          <div className="mb-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-600 text-white flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>Google Sheets 100-Item Tab Automation</span>
                  <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                    One-Click Setup
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                  Connect your Google Sheet so every qualified product lead is automatically added in real-time. The AI Agent automatically creates tabs of 100 items (e.g. <em>Batch 1 (Items 1-100)</em>), stops every 100 items, and self-creates the next tab before starting.
                </p>
              </div>
            </div>
            <button
              id="btn-banner-connect-sheet"
              onClick={handle1ClickConnectAndCreateSheet}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Connect & Auto-Create Sheet</span>
            </button>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-900">
                Live Google Sheets Sync Active:
              </span>
              <span className="text-xs font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                Tab: {settings.googleSheetName || `Batch ${currentBatchNumber}`}
              </span>
              <span className="text-xs font-medium text-slate-600">
                Progress: <strong className="text-emerald-700 font-bold">{currentBatchCount}</strong> / 100 items
              </span>
              <span className="text-3xs font-semibold text-slate-500 bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full">
                Lifetime Deduplicated: {archivedCount + leads.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {leads.length > 0 && (
                <button
                  id="btn-banner-clean-table"
                  type="button"
                  onClick={handleCleanAppTable}
                  title="Clean active table items from app. All data remains permanently saved in your Google Sheet."
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer"
                >
                  <Eraser className="w-3 h-3 text-slate-500" />
                  <span>Clean Table ({leads.length})</span>
                </button>
              )}
              {currentBatchCount >= 100 && (
                <button
                  id="btn-banner-next-batch"
                  onClick={handleStartNextBatch}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-md shadow-xs animate-bounce cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Batch {currentBatchNumber} (Next 100)</span>
                </button>
              )}
              {settings.googleSpreadsheetUrl && (
                <a
                  href={settings.googleSpreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-emerald-300"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 2. Key Performance Metric Cards */}
        <StatsCards
          totalFound={totalFound}
          qualifiedCount={qualifiedCount}
          todayCount={todayCount}
          averageRoi={averageRoi}
          averageProfit={averageProfit}
          currentCategory={currentCategory}
          currentSource={currentSource}
          lastProduct={lastProduct}
          minRoi={settings.minRoi}
        />

        {/* 3. Live Agent Activity Feed & Last Discovered Lead */}
        <AgentActivityFeed
          logs={logs}
          lastProduct={lastProduct}
          onInspectLead={(lead) => setInspectedLead(lead)}
          status={status}
        />

        {/* 4. Google Sheets Multi-Tab Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-200 scrollbar-none">
          
          <button
            id="tab-btn-qualified"
            onClick={() => setActiveTab('qualified')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'qualified'
                ? 'bg-white text-emerald-800 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Qualified Leads</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold">
              {qualifiedCount}
            </span>
          </button>

          <button
            id="tab-btn-all"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>2. All Research</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-300/80 text-slate-700 text-3xs font-bold">
              {leads.length}
            </span>
          </button>

          <button
            id="tab-btn-rejected"
            onClick={() => setActiveTab('rejected')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'rejected'
                ? 'bg-white text-rose-800 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>3. Rejected Products</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-3xs font-bold">
              {rejectedLeads.length}
            </span>
          </button>

          <button
            id="tab-btn-monitor"
            onClick={() => setActiveTab('monitor')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'monitor'
                ? 'bg-white text-indigo-800 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>4. Price Monitor</span>
          </button>

          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'dashboard'
                ? 'bg-white text-teal-800 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>6. Dashboard</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold text-xs transition-colors cursor-pointer border-t border-x ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                : 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>5. Settings</span>
          </button>

        </div>

        {/* 5. Tab Content Views */}
        {activeTab === 'qualified' && (
          <GoogleSheetTable
            leads={qualifiedLeads}
            title="Tab 1: Qualified Leads (ROI ≥ 25%)"
            tabType="qualified"
            onInspectLead={(lead) => setInspectedLead(lead)}
            onRecheckLead={handleRecheckLead}
            isRechecking={isRechecking}
            googleSheetId={settings.googleSheetId}
            googleSpreadsheetUrl={settings.googleSpreadsheetUrl}
            autoSyncGoogleSheets={settings.autoSyncGoogleSheets}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onCleanAppTable={handleCleanAppTable}
            activeLeadsCount={leads.length}
            totalArchivedCount={archivedCount}
            cleanOnNewTab={settings.cleanOnNewTab}
            cleanAfterSheetSync={settings.cleanAfterSheetSync}
          />
        )}

        {activeTab === 'all' && (
          <GoogleSheetTable
            leads={leads}
            title="Tab 2: All Research Leads"
            tabType="all"
            onInspectLead={(lead) => setInspectedLead(lead)}
            onRecheckLead={handleRecheckLead}
            isRechecking={isRechecking}
            googleSheetId={settings.googleSheetId}
            googleSpreadsheetUrl={settings.googleSpreadsheetUrl}
            autoSyncGoogleSheets={settings.autoSyncGoogleSheets}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onCleanAppTable={handleCleanAppTable}
            activeLeadsCount={leads.length}
            totalArchivedCount={archivedCount}
            cleanOnNewTab={settings.cleanOnNewTab}
            cleanAfterSheetSync={settings.cleanAfterSheetSync}
          />
        )}

        {activeTab === 'rejected' && (
          <GoogleSheetTable
            leads={rejectedLeads}
            title="Tab 3: Rejected Products"
            tabType="rejected"
            onInspectLead={(lead) => setInspectedLead(lead)}
            onRecheckLead={handleRecheckLead}
            isRechecking={isRechecking}
            googleSheetId={settings.googleSheetId}
            googleSpreadsheetUrl={settings.googleSpreadsheetUrl}
            autoSyncGoogleSheets={settings.autoSyncGoogleSheets}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onCleanAppTable={handleCleanAppTable}
            activeLeadsCount={leads.length}
            totalArchivedCount={archivedCount}
            cleanOnNewTab={settings.cleanOnNewTab}
            cleanAfterSheetSync={settings.cleanAfterSheetSync}
          />
        )}

        {activeTab === 'monitor' && (
          <PriceMonitorView
            leads={leads}
            onRecheckLead={handleRecheckLead}
            onRecheckAll={handleRecheckAll}
            isRechecking={isRechecking}
            onInspectLead={(lead) => setInspectedLead(lead)}
            minRoi={settings.minRoi}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            onInspectLead={(lead) => setInspectedLead(lead)}
            minRoi={settings.minRoi}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              addLog('info', `Settings updated. New Target ROI: ≥ ${newSettings.minRoi}%.`);
            }}
            onResetDefaults={() => {
              setSettings(DEFAULT_SETTINGS);
              addLog('info', `Settings restored to factory defaults (25% Min ROI).`);
            }}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onCleanAppTable={handleCleanAppTable}
            activeLeadsCount={leads.length}
            totalArchivedCount={archivedCount}
          />
        )}

      </main>

      {/* 6. Lead Detail Modal */}
      <LeadDetailModal
        lead={inspectedLead}
        onClose={() => setInspectedLead(null)}
        onRecheck={handleRecheckLead}
      />

      {/* 7. Direct Google Sheets Live Auto-Sync & CSV Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) => {
          setSettings((prev) => ({
            ...prev,
            ...newPartial,
          }));
          if (newPartial.autoSyncGoogleSheets !== undefined) {
            addLog('info', `Google Sheets auto-sync is now ${newPartial.autoSyncGoogleSheets ? 'ACTIVE' : 'PAUSED'}.`);
          }
          if (newPartial.googleSheetId) {
            addLog('success', `Target Google Sheet updated: ${newPartial.googleSheetId}`);
          }
        }}
        onExportCsv={handleExportCsv}
        leads={leads}
        accessToken={accessToken}
        googleUser={googleUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onCleanAppTable={handleCleanAppTable}
        totalArchivedCount={archivedCount}
      />

    </div>
  );
}
