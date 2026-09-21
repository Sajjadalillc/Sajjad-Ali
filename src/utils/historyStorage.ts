import { ArchivedProductRecord, ProductLead } from '../types/hunter';

const STORAGE_KEY = 'hunter_archived_history';
const STATS_KEY = 'hunter_lifetime_stats';

/**
 * Retrieves all historically discovered and synced products to ensure permanent deduplication,
 * even when active leads are cleared from the app table.
 */
export function getArchivedProducts(): ArchivedProductRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load archived products:', e);
    return [];
  }
}

/**
 * Archives product leads so they are permanently remembered by the deduplication engine.
 */
export function archiveProducts(leads: ProductLead[], batchNumber: number = 1, tabName: string = ''): number {
  if (!leads || leads.length === 0) return 0;
  try {
    const existing = getArchivedProducts();
    const existingIds = new Set(existing.map((p) => p.productId.toLowerCase()));

    const newRecords: ArchivedProductRecord[] = [];
    for (const lead of leads) {
      if (!existingIds.has(lead.productId.toLowerCase())) {
        existingIds.add(lead.productId.toLowerCase());
        newRecords.push({
          productId: lead.productId,
          productName: lead.productName,
          mainKeyword: lead.mainKeyword,
          source: lead.source,
          sellingMarket: lead.sellingMarket || 'eBay US',
          batchNumber: lead.batchNumber || batchNumber,
          tabName: lead.batchTabName || tabName,
          syncedAt: new Date().toISOString(),
        });
      }
    }

    const merged = [...newRecords, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    // Update lifetime stats
    const stats = getLifetimeStats();
    const updatedStats = {
      totalSynced: stats.totalSynced + newRecords.length,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updatedStats));

    return newRecords.length;
  } catch (e) {
    console.error('Failed to archive products:', e);
    return 0;
  }
}

/**
 * Get lifetime count of products saved to Google Sheets
 */
export function getLifetimeStats(): { totalSynced: number; lastUpdated?: string } {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      const archived = getArchivedProducts();
      return { totalSynced: archived.length };
    }
    return JSON.parse(raw);
  } catch {
    return { totalSynced: 0 };
  }
}

/**
 * Checks whether a candidate lead matches any historically archived product
 */
export function isHistoricallyDuplicate(
  productId: string,
  productName: string,
  archived: ArchivedProductRecord[]
): boolean {
  if (!archived || archived.length === 0) return false;

  const idLower = productId.toLowerCase().trim();
  const nameLower = productName.toLowerCase().trim();

  // 1. Direct ID / ASIN match
  if (archived.some((item) => item.productId.toLowerCase().trim() === idLower)) {
    return true;
  }

  // 2. Direct Name match
  if (archived.some((item) => item.productName.toLowerCase().trim() === nameLower)) {
    return true;
  }

  // 3. Significant word token overlap (> 65%)
  const wordsCandidate = new Set(nameLower.split(/\s+/).filter((w) => w.length > 3));
  if (wordsCandidate.size === 0) return false;

  for (const item of archived) {
    const wordsItem = new Set(item.productName.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    if (wordsItem.size === 0) continue;

    let overlap = 0;
    wordsCandidate.forEach((w) => {
      if (wordsItem.has(w)) overlap++;
    });

    const union = new Set([...wordsCandidate, ...wordsItem]).size;
    if (union > 0 && overlap / union > 0.65) {
      return true;
    }
  }

  return false;
}
