// Lokální žebříček uložený v prohlížeči. Online verze může později nahradit jen tenhle soubor.

export interface Run {
  character: string;
  time: number; // přežité vteřiny
  level: number;
  kills: number;
  date: string; // ISO
  won?: boolean; // porazil finální koalici
}

const KEY = 'gods.scores';
const KEEP = 10;

export function loadScores(): Run[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Uloží pokus a vrátí jeho pořadí (od 1) a aktuální žebříček. Pořadí je 0, když se do žebříčku nevešel.
export function addScore(run: Run): { rank: number; list: Run[] } {
  const list = [...loadScores(), run].sort((a, b) => b.time - a.time).slice(0, KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Plné nebo zakázané úložiště: žebříček se jen neuloží.
  }
  return { rank: list.indexOf(run) + 1, list };
}
