import { get, set, del, keys } from 'idb-keyval';

const detailKey = (id: string) => `listing:${id}`;
const searchKey = (q: string) => `search:${q}`;
const draftPrefix = `draft:listing:`;

// Listing detail cache
export async function cacheListing(id: string, data: any) { 
  await set(detailKey(id), { data, ts: Date.now() }); 
}

export async function getCachedListing(id: string) { 
  const cached = await get(detailKey(id));
  return cached?.data ?? null; 
}

// Search results cache
export async function cacheSearch(q: string, data: any) { 
  await set(searchKey(q), { data, ts: Date.now() }); 
}

export async function getCachedSearch(q: string) { 
  const cached = await get(searchKey(q));
  return cached?.data ?? null; 
}

// Draft management for offline create
export async function saveDraft(id: string, payload: any) { 
  await set(`${draftPrefix}${id}`, payload); 
}

export async function readDrafts() {
  const allKeys = await keys();
  const draftKeys = allKeys.filter(k => String(k).startsWith(draftPrefix)) as string[];
  const items = await Promise.all(
    draftKeys.map(async k => ({ 
      key: k, 
      payload: await get(k) 
    }))
  );
  return items;
}

export async function removeDraft(key: string) { 
  await del(key); 
}

// Utility to check if we're offline
export function isOffline(): boolean {
  return !navigator.onLine;
}