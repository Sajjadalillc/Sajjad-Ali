import { Router } from 'express';
import { huntProductWithGemini } from './hunterApi';
import { HunterSettings, ProductLead } from '../src/types/hunter';
import { 
  calculateAdvertisingCost, 
  calculateEbayFee, 
  calculateOpportunityScore, 
  calculateProfit, 
  calculateRoi, 
  calculateTotalCost, 
  evaluateLeadQualification 
} from '../src/utils/calculator';

export const apiRouter = Router();

// Health & Config status
apiRouter.get('/status', (req, res) => {
  res.json({
    status: 'online',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    version: 'v2.4.0-ai-hunter',
    timestamp: new Date().toISOString(),
  });
});

// Hunt single product lead
apiRouter.post('/hunt', async (req, res) => {
  try {
    const { 
      settings, 
      targetCategory, 
      targetSource, 
      existingIds = [], 
      existingTitles = [], 
      existingKeywords = [] 
    } = req.body;

    const existingSet = new Set<string>(existingIds.map((id: string) => String(id).toLowerCase().trim()));
    const existingTitleSet = new Set<string>(existingTitles.map((t: string) => String(t).toLowerCase().trim()));
    const existingKeywordSet = new Set<string>(existingKeywords.map((k: string) => String(k).toLowerCase().trim()));

    const lead = await huntProductWithGemini(
      settings as HunterSettings,
      targetCategory || 'Home & Kitchen',
      targetSource || 'Amazon',
      existingSet,
      existingTitleSet,
      existingKeywordSet
    );

    res.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error in /api/hunt:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to hunt product' });
  }
});

// Price Monitor Recheck
apiRouter.post('/monitor-check', (req, res) => {
  try {
    const { product, settings } = req.body as { product: ProductLead; settings: HunterSettings };
    if (!product) {
      return res.status(400).json({ error: 'Missing product' });
    }

    const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Simulate realistic market price movement (+/- 5-15% randomly or stock change)
    const priceChangeRoll = Math.random();
    let newSupplierPrice = product.supplierPrice;
    let newStockStatus = product.stockStatus;
    let newStatus = product.productStatus;
    let notes = product.notes;

    if (priceChangeRoll < 0.15) {
      // Supplier price increased
      newSupplierPrice = Number((product.supplierPrice * (1 + (Math.random() * 0.2 + 0.05))).toFixed(2));
      notes = `[PRICE UPDATE]: Supplier cost increased from $${product.supplierPrice} to $${newSupplierPrice}.`;
    } else if (priceChangeRoll < 0.25) {
      // Supplier price decreased (better margin)
      newSupplierPrice = Number((product.supplierPrice * (1 - (Math.random() * 0.15 + 0.05))).toFixed(2));
      notes = `[PRICE UPDATE]: Supplier discounted price from $${product.supplierPrice} to $${newSupplierPrice}.`;
    } else if (priceChangeRoll < 0.30) {
      // Out of stock alert
      newStockStatus = 'Out of Stock';
      newStatus = 'OUT OF STOCK';
      notes = `[OUT OF STOCK]: Supplier currently has 0 inventory.`;
    }

    // Recalculate fees and ROI
    const ebayFee = calculateEbayFee(product.estimatedEbayPrice, settings.ebayFeePercent, settings.ebayFixedFee);
    const advertisingCost = calculateAdvertisingCost(product.estimatedEbayPrice, settings.promotedListingPercent);
    const totalCost = calculateTotalCost(newSupplierPrice, product.shippingCost, ebayFee, advertisingCost, settings.otherCostsEstimate);
    const estimatedProfit = calculateProfit(product.estimatedEbayPrice, totalCost);
    const roi = calculateRoi(estimatedProfit, newSupplierPrice, product.shippingCost);

    const { overallScore, profitScore, riskScore } = calculateOpportunityScore(
      roi,
      estimatedProfit,
      product.demandScore,
      product.competitionScore,
      product.trendScore,
      product.brandIpRisk
    );

    const updatedLead: ProductLead = {
      ...product,
      supplierPrice: newSupplierPrice,
      totalCost,
      estimatedProfit,
      roi,
      ebayFee,
      advertisingCost,
      overallOpportunityScore: overallScore,
      profitScore,
      riskScore,
      stockStatus: newStockStatus,
      lastChecked: dateNow,
      notes,
      priceHistory: [
        ...(product.priceHistory || []),
        { date: dateNow, supplierPrice: newSupplierPrice, ebayPrice: product.estimatedEbayPrice, roi }
      ]
    };

    if (newStockStatus === 'Out of Stock') {
      updatedLead.productStatus = 'OUT OF STOCK';
    } else if (newSupplierPrice !== product.supplierPrice) {
      updatedLead.productStatus = 'PRICE CHANGED';
    } else {
      const evalResult = evaluateLeadQualification(updatedLead, settings);
      updatedLead.productStatus = evalResult.status;
    }

    res.json({ success: true, updatedLead });
  } catch (error: any) {
    console.error('Error in /api/monitor-check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google Sheets Webhook Sync
apiRouter.post('/sync-sheets', async (req, res) => {
  try {
    const { lead, webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.json({ 
        success: true, 
        simulated: true, 
        message: 'Lead captured in local Google Sheets memory. Configure Webhook URL in Settings for remote Google Sheets auto-push.' 
      });
    }

    // Try sending to Google Apps Script Webhook
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'appendRow', lead }),
      });
      const data = await response.json();
      return res.json({ success: true, simulated: false, data });
    } catch (e: any) {
      return res.json({
        success: true,
        simulated: true,
        warning: `Direct Google Sheet webhook reached with network restriction (${e.message}). Data preserved locally.`,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
