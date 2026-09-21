import { ProductLead } from '../types/hunter';

export const SHEET_HEADERS = [
  'Date Found',
  'Product Name',
  'Selling Market',
  'Source',
  'Supplier URL',
  'eBay Listing URL',
  'Product ID / ASIN',
  'Category',
  'Main Keyword',
  'Supplier Price',
  'Shipping Cost',
  'Estimated eBay Price',
  'eBay Fee %',
  'eBay Fee',
  'Advertising Fee %',
  'Advertising Cost',
  'Other Costs',
  'Total Cost',
  'Estimated Profit',
  'ROI %',
  'Monthly Demand Estimate',
  'Competition Level',
  'Supplier Rating',
  'Product Rating',
  'Orders/Sales',
  'Trend Score (0-100)',
  'Demand Score (0-25)',
  'Competition Score (0-20)',
  'Profit Score (0-25)',
  'Risk Score (0-10)',
  'Overall Opportunity Score (0-100)',
  'Stock Status',
  'Shipping Time',
  'Seasonal',
  'Brand/IP Risk',
  'Product Status',
  'Notes',
  'Last Checked',
  'Data Source',
  'Duplicate Check',
  'Agent Version'
];

export function leadToRow(lead: ProductLead): (string | number)[] {
  return [
    lead.dateFound || new Date().toISOString().replace('T', ' ').substring(0, 19),
    lead.productName,
    lead.sellingMarket || 'eBay US',
    lead.source,
    lead.supplierUrl,
    lead.ebayListingUrl,
    lead.productId,
    lead.category,
    lead.mainKeyword,
    Number(lead.supplierPrice.toFixed(2)),
    Number(lead.shippingCost.toFixed(2)),
    Number(lead.estimatedEbayPrice.toFixed(2)),
    Number(lead.ebayFeePercent.toFixed(1)),
    Number(lead.ebayFee.toFixed(2)),
    Number(lead.advertisingFeePercent.toFixed(1)),
    Number(lead.advertisingCost.toFixed(2)),
    Number(lead.otherCosts.toFixed(2)),
    Number(lead.totalCost.toFixed(2)),
    Number(lead.estimatedProfit.toFixed(2)),
    Number(lead.roi.toFixed(1)),
    lead.monthlyDemandEstimate,
    lead.competitionLevel,
    Number(lead.supplierRating.toFixed(1)),
    Number(lead.productRating.toFixed(1)),
    lead.ordersSales,
    lead.trendScore,
    lead.demandScore,
    lead.competitionScore,
    lead.profitScore,
    lead.riskScore,
    lead.overallOpportunityScore,
    lead.stockStatus,
    lead.shippingTime,
    lead.seasonal,
    lead.brandIpRisk,
    lead.productStatus,
    lead.notes,
    lead.lastChecked || new Date().toISOString().replace('T', ' ').substring(0, 19),
    lead.dataSource,
    lead.duplicateCheck,
    lead.agentVersion
  ];
}

export function extractSpreadsheetId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Creates a brand new Google Sheet with frozen headers and styling
 */
export async function createHunterSpreadsheet(
  accessToken: string,
  title: string = `eBay Dropshipping Hunter - Leads Tracker`,
  initialTabTitle: string = 'Batch 1 (Items 1-100)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: initialTabTitle,
            gridProperties: {
              frozenRowCount: 1,
              columnCount: 45
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Now append headers to the first batch tab
  await appendRows(accessToken, spreadsheetId, initialTabTitle, [SHEET_HEADERS]);

  return { spreadsheetId, spreadsheetUrl, sheetName: initialTabTitle };
}

/**
 * Creates a brand new tab inside an existing Google Spreadsheet with frozen headers
 */
export async function createNewSheetTab(
  accessToken: string,
  spreadsheetId: string,
  tabTitle: string
): Promise<boolean> {
  const cleanId = extractSpreadsheetId(spreadsheetId);

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: tabTitle,
              gridProperties: {
                frozenRowCount: 1,
                columnCount: 45
              }
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    const errMsg = String(err?.error?.message || '');
    // If sheet already exists, we do not treat it as a fatal error
    if (errMsg.toLowerCase().includes('already exists')) {
      return true;
    }
    throw new Error(errMsg || `Failed to create new tab "${tabTitle}" in Google Sheet`);
  }

  // Append master 45 headers to row 1 of the new tab
  await appendRows(accessToken, cleanId, tabTitle, [SHEET_HEADERS]);
  return true;
}

/**
 * Appends rows to a Google Spreadsheet. Automatically attempts to create the tab if not found.
 */
export async function appendRows(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string = 'Batch 1 (Items 1-100)',
  rows: (string | number)[][],
  isRetry: boolean = false
): Promise<{ updatedRows: number }> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const encodedRange = encodeURIComponent(`${sheetTitle}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: rows
    })
  });

  if (!response.ok) {
    const err = await response.json();
    const errMsg = String(err?.error?.message || '');

    // If tab doesn't exist and not already retrying, automatically create the tab and re-append
    if (!isRetry && (errMsg.includes('Unable to parse range') || response.status === 400)) {
      try {
        await createNewSheetTab(accessToken, cleanId, sheetTitle);
        // Now retry append with isRetry = true
        return await appendRows(accessToken, cleanId, sheetTitle, rows, true);
      } catch (creationErr) {
        console.warn('Auto tab creation on append error:', creationErr);
      }

      // Try appending to default A1 as final fallback
      const fallbackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: rows })
      });
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        return { updatedRows: fbData.updates?.updatedRows || rows.length };
      }
    }

    throw new Error(errMsg || 'Failed to append rows to Google Sheet');
  }

  const data = await response.json();
  return { updatedRows: data.updates?.updatedRows || rows.length };
}

/**
 * Gets all sheet tab titles in the spreadsheet
 */
export async function getAllSheetTitles(accessToken: string, spreadsheetId: string): Promise<string[]> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties.title`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      return ['Batch 1 (Items 1-100)'];
    }

    const data = await response.json();
    if (data.sheets && Array.isArray(data.sheets)) {
      return data.sheets.map((s: any) => s.properties?.title).filter(Boolean);
    }
    return ['Batch 1 (Items 1-100)'];
  } catch {
    return ['Batch 1 (Items 1-100)'];
  }
}

/**
 * Gets the title of the first sheet in the spreadsheet
 */
export async function getFirstSheetTitle(accessToken: string, spreadsheetId: string): Promise<string> {
  const titles = await getAllSheetTitles(accessToken, spreadsheetId);
  return titles[0] || 'Batch 1 (Items 1-100)';
}
