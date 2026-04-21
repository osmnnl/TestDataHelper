/**
 * Form snapshot storage — aktif sekmedeki form alanlarını origin bazlı
 * chrome.storage.local altında saklar. Senkronizasyon yapılmaz (snapshot'lar
 * genelde büyük; sync kotasını zorlayabilir).
 */

export interface SnapshotField {
  selector: string;
  value: string;
}

export interface Snapshot {
  id: string;
  name: string;
  origin: string; // örn. "https://example.com"
  pathname: string; // örn. "/form"
  createdAt: number;
  fields: SnapshotField[];
}

const KEY = "formSnapshots";

async function getAll(): Promise<Snapshot[]> {
  try {
    const r = await chrome.storage.local.get(KEY);
    return (r[KEY] as Snapshot[] | undefined) ?? [];
  } catch {
    return [];
  }
}

async function setAll(list: Snapshot[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [KEY]: list });
  } catch {
    /* dev ortamı */
  }
}

export async function listSnapshots(): Promise<Snapshot[]> {
  return await getAll();
}

export async function listSnapshotsForOrigin(
  origin: string,
  pathname?: string,
): Promise<Snapshot[]> {
  const all = await getAll();
  return all.filter(
    (s) => s.origin === origin && (!pathname || s.pathname === pathname),
  );
}

export async function saveSnapshot(snap: Omit<Snapshot, "id">): Promise<Snapshot> {
  const full: Snapshot = {
    ...snap,
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };
  const all = await getAll();
  all.unshift(full);
  await setAll(all.slice(0, 100)); // en fazla 100 snapshot
  return full;
}

export async function deleteSnapshot(id: string): Promise<void> {
  const all = await getAll();
  await setAll(all.filter((s) => s.id !== id));
}

export async function getSnapshot(id: string): Promise<Snapshot | undefined> {
  const all = await getAll();
  return all.find((s) => s.id === id);
}
