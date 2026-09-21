import { HunterSettings, ProductLead, RiskStatus, SupplierSource, TrendBreakdown } from '../types/hunter';

export const DEFAULT_CATEGORIES = [
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Pet Supplies',
  'Garden & Outdoor',
  'Tools & Home Improvement',
  'Automotive Accessories',
  'Electronics Accessories',
  'Office Products',
  'Fitness & Yoga',
  'Travel Accessories',
  'Fashion Accessories',
  'Storage & Organization',
  'Baby Accessories',
  'Seasonal & Holiday',
];

export const DEFAULT_SETTINGS: HunterSettings = {
  minRoi: 25,
  minProfit: 5.0,
  maxSupplierCost: 80.0,
  minSellingPrice: 14.0,
  maxSellingPrice: 250.0,
  ebayMarketplace: 'US',
  ebayFeePercent: 13.25, // eBay standard final value fee
  ebayFixedFee: 0.30,    // eBay per-order fixed fee
  promotedListingPercent: 2.5, // Standard recommended promoted listing rate
  otherCostsEstimate: 0.50,    // Packaging/dispute reserve
  searchFrequencySeconds: 4,
  maxProductsPerDay: 100,
  preferredSuppliers: {
    amazon: true,
    shein: true,
    aliexpress: true,
  },
  enabledCategories: [
    'Home & Kitchen',
    'Pet Supplies',
    'Beauty & Personal Care',
    'Storage & Organization',
    'Electronics Accessories',
    'Fitness & Yoga',
    'Garden & Outdoor',
  ],
  autoSyncGoogleSheets: true,
  googleSheetsWebhookUrl: '',
  googleSheetName: 'Batch 1 (Items 1-100)',
  googleSheetId: '',
  googleSpreadsheetUrl: '',
  itemsPerTab: 100,
  stopEvery100Items: true,
  currentBatchNumber: 1,
  currentBatchCount: 0,
  currentBatchTabName: 'Batch 1 (Items 1-100)',
  cleanOnNewTab: true,
  cleanAfterSheetSync: false,
  totalSyncedLifetime: 0,
};

/**
 * Calculates eBay Fee: (SellingPrice * FeePercent / 100) + FixedFee
 */
export function calculateEbayFee(sellingPrice: number, feePercent: number, fixedFee: number): number {
  return Number(((sellingPrice * (feePercent / 100)) + fixedFee).toFixed(2));
}

/**
 * Calculates Advertising / Promoted Listing Cost: SellingPrice * (AdFeePercent / 100)
 */
export function calculateAdvertisingCost(sellingPrice: number, adFeePercent: number): number {
  return Number((sellingPrice * (adFeePercent / 100)).toFixed(2));
}

/**
 * Calculates Total Cost: Supplier Cost + Shipping + eBay Fees + Advertising Fees + Other Costs
 */
export function calculateTotalCost(
  supplierPrice: number,
  shippingCost: number,
  ebayFee: number,
  advertisingCost: number,
  otherCosts: number
): number {
  return Number((supplierPrice + shippingCost + ebayFee + advertisingCost + otherCosts).toFixed(2));
}

/**
 * Calculates Estimated Net Profit: Selling Price - Total Cost
 */
export function calculateProfit(sellingPrice: number, totalCost: number): number {
  return Number((sellingPrice - totalCost).toFixed(2));
}

/**
 * Calculates ROI %: (Profit / Total Upfront Investment) * 100
 * Upfront investment in dropshipping is (Supplier Price + Shipping).
 */
export function calculateRoi(profit: number, supplierPrice: number, shippingCost: number): number {
  const upfrontInvestment = supplierPrice + shippingCost;
  if (upfrontInvestment <= 0) return 0;
  return Number(((profit / upfrontInvestment) * 100).toFixed(1));
}

/**
 * Calculate Trend Score: 0-100
 * Factors:
 * - Demand growth: 25 pts
 * - Sales/order velocity: 20 pts
 * - Search interest: 20 pts
 * - Competition opportunity: 15 pts
 * - Product freshness: 10 pts
 * - Social/trend signals: 10 pts
 */
export function calculateTrendScore(breakdown: TrendBreakdown): number {
  const score = 
    breakdown.demandGrowth + 
    breakdown.salesVelocity + 
    breakdown.searchInterest + 
    breakdown.competitionOpportunity + 
    breakdown.productFreshness + 
    breakdown.socialSignals;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate Opportunity Score: 0-100
 * Factors:
 * - Profit potential: 25 pts (based on ROI and absolute profit)
 * - Demand: 25 pts
 * - Competition: 20 pts
 * - Trend: 20 pts
 * - Risk: 10 pts
 */
export function calculateOpportunityScore(
  roi: number,
  profit: number,
  demandScore: number,
  competitionScore: number,
  trendScore: number,
  riskStatus: RiskStatus
): {
  overallScore: number;
  profitScore: number;
  riskScore: number;
} {
  // Profit Score (0-25)
  let profitScore = 0;
  if (roi >= 60 && profit >= 15) profitScore = 25;
  else if (roi >= 45 && profit >= 10) profitScore = 22;
  else if (roi >= 35 && profit >= 7) profitScore = 19;
  else if (roi >= 25 && profit >= 5) profitScore = 16;
  else if (roi >= 20) profitScore = 12;
  else if (roi > 0) profitScore = 7;

  // Risk Score (0-10)
  let riskScore = 10;
  if (riskStatus === 'Low') riskScore = 10;
  else if (riskStatus === 'Medium') riskScore = 6;
  else if (riskStatus === 'High') riskScore = 2;
  else riskScore = 0;

  // Demand Score (0-25)
  const normDemand = Math.min(25, Math.max(0, demandScore));

  // Competition Score (0-20)
  const normComp = Math.min(20, Math.max(0, competitionScore));

  // Trend Score component (20% of 100)
  const normTrend = Math.min(20, Math.round((trendScore / 100) * 20));

  const overall = Math.min(100, Math.round(profitScore + normDemand + normComp + normTrend + riskScore));

  return {
    overallScore: overall,
    profitScore,
    riskScore,
  };
}

/**
 * Evaluate if lead passes qualification rules
 */
export function evaluateLeadQualification(
  lead: Partial<ProductLead>,
  settings: HunterSettings
): {
  status: 'VALIDATED' | 'REJECTED' | 'WATCH';
  reasons: string[];
} {
  const reasons: string[] = [];
  const roi = lead.roi ?? 0;
  const profit = lead.estimatedProfit ?? 0;
  const supplierPrice = lead.supplierPrice ?? 0;
  const sellingPrice = lead.estimatedEbayPrice ?? 0;
  const risk = lead.brandIpRisk ?? 'Low';
  const stock = lead.stockStatus ?? 'In Stock';
  const trendScore = lead.trendScore ?? 0;

  // Financial checks
  if (roi < settings.minRoi) {
    reasons.push(`ROI (${roi}%) is below minimum target of ${settings.minRoi}%`);
  }
  if (profit < settings.minProfit) {
    reasons.push(`Estimated profit ($${profit}) is below minimum $${settings.minProfit.toFixed(2)}`);
  }
  if (supplierPrice > settings.maxSupplierCost) {
    reasons.push(`Supplier cost ($${supplierPrice}) exceeds maximum allowed $${settings.maxSupplierCost}`);
  }
  if (sellingPrice < settings.minSellingPrice) {
    reasons.push(`Selling price ($${sellingPrice}) is below minimum $${settings.minSellingPrice}`);
  }
  if (sellingPrice > settings.maxSellingPrice) {
    reasons.push(`Selling price ($${sellingPrice}) exceeds maximum $${settings.maxSellingPrice}`);
  }

  // Risk checks
  if (risk === 'Reject') {
    reasons.push('High IP/Brand or policy violation risk (trademarked/restricted item)');
  } else if (risk === 'High') {
    reasons.push('Elevated brand infringement/policy scrutiny');
  }

  // Stock check
  if (stock === 'Out of Stock') {
    reasons.push('Supplier item is out of stock');
  }

  // Demand / Trend check
  if (trendScore < 30) {
    reasons.push(`Trend score (${trendScore}/100) shows stagnant or dying demand`);
  }

  if (reasons.length === 0) {
    return { status: 'VALIDATED', reasons: ['Passed all financial, trend, demand, and risk checks'] };
  } else if (roi >= settings.minRoi && risk !== 'Reject' && reasons.length <= 2) {
    return { status: 'WATCH', reasons };
  } else {
    return { status: 'REJECTED', reasons };
  }
}

/**
 * Generate real eBay search URL
 */
export function buildEbaySearchUrl(keyword: string, marketplace: string = 'US'): string {
  const domain = marketplace === 'UK' ? 'ebay.co.uk' : marketplace === 'DE' ? 'ebay.de' : marketplace === 'AU' ? 'ebay.com.au' : 'ebay.com';
  return `https://www.${domain}/sch/i.html?_nkw=${encodeURIComponent(keyword)}&LH_BIN=1&_sop=12`;
}

/**
 * Generate realistic supplier search / product URL
 */
export function buildSupplierUrl(source: SupplierSource, productId: string, keyword: string): string {
  if (source === 'Amazon') {
    return `https://www.amazon.com/dp/${productId}`;
  } else if (source === 'AliExpress') {
    return `https://www.aliexpress.com/item/${productId}.html`;
  } else {
    return `https://us.shein.com/goods-p-${productId}.html`;
  }
}
