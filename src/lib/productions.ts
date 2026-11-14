import seed from '../data/productions.json';

export type Production = {
  slug: string;
  title: string;
  client: string;
  type: 'Broadcast' | 'CD' | 'Video' | 'Livestream';
  date: string | null;
  year: string | null;
  ensemble: string | null;
  conductor: string | null;
  soloists: string | null;
  roles: string[];
  shortText: string;
  listenUrl: string | null;
  infoUrl: string | null;
  coverUrl: string | null;
  public: boolean;
  projectNo: string | null;
  source: string;
};

export function getAllProductions(): Production[] {
  return (seed as Production[])
    .filter((p) => p.public)
    .sort((a, b) => {
      const ad = a.date || `${a.year || '0000'}-01-01`;
      const bd = b.date || `${b.year || '0000'}-01-01`;
      return bd.localeCompare(ad);
    });
}

export function getProduction(slug: string): Production | undefined {
  return getAllProductions().find((p) => p.slug === slug);
}

/** Newest six, at most two Broadcast. */
export function getHomepageProductions(limit = 6, maxBroadcast = 2): Production[] {
  const all = getAllProductions();
  const picked: Production[] = [];
  let broadcast = 0;
  for (const p of all) {
    if (picked.length >= limit) break;
    if (p.type === 'Broadcast') {
      if (broadcast >= maxBroadcast) continue;
      broadcast += 1;
    }
    picked.push(p);
  }
  return picked;
}

export function uniqueValues(key: 'type' | 'year'): string[] {
  const values = new Set(
    getAllProductions()
      .map((p) => p[key])
      .filter((v): v is string => Boolean(v)),
  );
  return [...values].sort((a, b) => b.localeCompare(a));
}
