export type SupplierSource = 'Amazon' | 'SHEIN' | 'AliExpress';

export type RiskStatus = 'Low' | 'Medium' | 'High' | 'Reject';

export type ProductStatus = 
  | 'NEW' 
  | 'VALIDATED' 
  | 'WATCH' 
  | 'REJECTED' 
  | 'DUPLICATE' 
  | 'PRICE CHANGED' 
  | 'OUT OF STOCK';

export interface TrendBreakdown {
  demandGrowth: number; // 0-25
  salesVelocity: number; // 0-20
  searchInterest: number; // 0-20
  competitionOpportunity: number; // 0-15
  productFreshness: number; // 0-10
  socialSignals: number; // 0-10
}

export interface ProductLead {
  // Master Google Sheet Columns
  dateFound: string;               // 1. Date Found
  productName: string;             // 2. Product Name
  sellingMarket: string;           // 3. Selling Market (e.g. eBay US, eBay UK, eBay DE, eBay AU, eBay CA)
  source: SupplierSource;          // 4. Source
  supplierUrl: string;             // 5. Supplier URL
  ebayListingUrl: string;          // 6. eBay Listing/Search URL
  productId: string;               // 7. Product ID / ASIN
  category: string;                // 8. Category
  mainKeyword: string;             // 9. Main Keyword
  supplierPrice: number;           // 10. Supplier Price
  shippingCost: number;            // 11. Shipping Cost
  estimatedEbayPrice: number;      // 12. Estimated eBay Selling Price
  ebayFeePercent: number;          // 13. eBay Fee %
  ebayFee: number;                 // 14. eBay Fee
  advertisingFeePercent: number;   // 15. Advertising Fee %
  advertisingCost: number;         // 16. Advertising Cost
  otherCosts: number;              // 17. Other Costs
  totalCost: number;               // 18. Total Cost
  estimatedProfit: number;         // 19. Estimated Profit
  roi: number;                     // 20. ROI %
  monthlyDemandEstimate: string;   // 21. Monthly Demand Estimate
  competitionLevel: 'Low' | 'Medium' | 'High'; // 22. Competition Level
  supplierRating: number;          // 23. Supplier Rating
  productRating: number;           // 24. Product Rating
  ordersSales: string;             // 25. Orders/Sales
  trendScore: number;              // 26. Trend Score (0-100)
  demandScore: number;             // 27. Demand Score (0-25)
  competitionScore: number;        // 28. Competition Score (0-20)
  profitScore: number;             // 29. Profit Score (0-25)
  riskScore: number;               // 30. Risk Score (0-10)
  overallOpportunityScore: number; // 31. Overall Opportunity Score (0-100)
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'; // 32. Stock Status
  shippingTime: string;            // 33. Shipping Time
  seasonal: string;                // 34. Seasonal
  brandIpRisk: RiskStatus;         // 35. Brand/IP Risk
  productStatus: ProductStatus;    // 36. Product Status
  notes: string;                   // 37. Notes
  lastChecked: string;             // 38. Last Checked
  dataSource: string;              // 39. Data Source
  duplicateCheck: 'Unique' | 'Duplicate Found'; // 40. Duplicate Check
  agentVersion: string;            // 41. Agent Version

  // Internal UI extras
  id: string;
  imageUrl?: string;
  trendBreakdown?: TrendBreakdown;
  rejectionReason?: string;
  priceHistory?: { date: string; supplierPrice: number; ebayPrice: number; roi: number }[];
  batchNumber?: number;
  batchTabName?: string;
}

export interface HunterSettings {
  minRoi: number;                  // default: 25%
  minProfit: number;               // default: $5.00
  maxSupplierCost: number;         // default: $80.00
  minSellingPrice: number;         // default: $14.00
  maxSellingPrice: number;         // default: $250.00
  ebayMarketplace: string;         // 'US' | 'UK' | 'DE' | 'AU' | 'CA'
  ebayFeePercent: number;          // default: 13.25%
  ebayFixedFee: number;            // default: $0.30
  promotedListingPercent: number;  // default: 2.5%
  otherCostsEstimate: number;      // default: $0.50
  searchFrequencySeconds: number;  // default: 4s
  maxProductsPerDay: number;       // default: 100
  preferredSuppliers: {
    amazon: boolean;
    shein: boolean;
    aliexpress: boolean;
  };
  enabledCategories: string[];
  autoSyncGoogleSheets: boolean;
  googleSheetsWebhookUrl: string;
  googleSheetName: string;
  googleSheetId: string;
  googleSpreadsheetUrl?: string;
  itemsPerTab?: number;            // default: 100 items per tab
  stopEvery100Items?: boolean;     // default: true - pause when batch reaches 100 items
  currentBatchNumber?: number;     // default: 1
  currentBatchCount?: number;      // current count in this batch (0-100)
  currentBatchTabName?: string;    // e.g. 'Batch 1 (Items 1-100)'
  cleanOnNewTab?: boolean;         // default: true - clean data from app when new tab is created to start working from start
  cleanAfterSheetSync?: boolean;   // default: false - clean leads from app immediately after putting into sheet
  totalSyncedLifetime?: number;    // total lifetime leads synced to Google Sheets
}

export interface ArchivedProductRecord {
  productId: string;
  productName: string;
  mainKeyword?: string;
  source: string;
  sellingMarket: string;
  batchNumber: number;
  tabName: string;
  syncedAt: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'lead';
  source?: SupplierSource;
  category?: string;
  message: string;
  productName?: string;
  roi?: number;
}

export type ActiveTab = 'qualified' | 'all' | 'rejected' | 'monitor' | 'settings' | 'dashboard';
