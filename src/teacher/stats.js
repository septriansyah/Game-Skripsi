import { NODES } from '../game/data';
export const pct = (g) => Math.round(((g.done || []).length / NODES.length) * 100);
export const isLive = (g) => Date.now() - (g.updatedAt || 0) < 2 * 60 * 1000;
export const ago = (t) => { if (!t) return '–'; const s = Math.round((Date.now() - t) / 1000); if (s < 60) return 'baru saja'; if (s < 3600) return Math.round(s / 60) + ' mnt lalu'; if (s < 86400) return Math.round(s / 3600) + ' jam lalu'; return new Date(t).toLocaleDateString('id-ID'); };
export const ACT_KEYS = [['a1', 'Aktivitas 1'], ['a2', 'Aktivitas 2'], ['a3', 'Aktivitas 3'], ['a4', 'Aktivitas 4'], ['a5', 'Aktivitas 5'], ['a6', 'Aktivitas 6']];
export function autoMisi(g) { if (!(g.done || []).includes('fin')) return null; return Math.max(40, 100 - (g.stats?.wrong || 0) * 5); }
export function finalScore(g) {
  const gr = g.grading || {}; const vals = ACT_KEYS.map(([k]) => gr[k]).filter((v) => v !== undefined && v !== null && v !== '').map(Number);
  const m = autoMisi(g); if (m !== null) vals.push(m);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}
export function currentLabel(g) {
  if ((g.done || []).includes('f6')) return 'Selesai';
  const n = NODES.find((x) => x.id === g.current) || NODES.find((x) => !(g.done || []).includes(x.id));
  return n ? `Fase ${n.phase} · ${n.title}` : '–';
}
function esc(v) {
  let s = String(v ?? '').replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s; // cegah rumus Excel dari isian siswa
  return /[";]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const cell = (r) => (Array.isArray(r) ? r.filter((x) => x !== '' && x != null).join(' | ') : r);
export function toCSV(cls, groups) {
  const head = ['Kelompok', 'Anggota', 'Progres %', 'Langkah', 'XP', 'Nyawa', 'Salah', 'Galat', 'Nilai A1', 'Nilai A2', 'Nilai A3', 'Nilai A4', 'Nilai A5', 'Nilai A6', 'Nilai misi (otomatis)', 'Nilai akhir',
    'A1 masalah 1', 'A1 masalah 2', 'A1 masalah 3', 'A1 kesimpulan',
    'A2 langkah 1', 'A2 langkah 2', 'A2 langkah 3', 'A2 langkah 4',
    'A3 misi 1', 'A3 misi 2', 'A3 misi 3', 'A3 misi 4', 'A3 prediksi', 'A3 aktual', 'A3 penjelasan',
    'A4 kueri A (baris)', 'A4 kueri B (baris)', 'A4 jawaban A', 'A4 jawaban B',
    'A5 rangkaian kueri', 'A5 verifikasi', 'A5 kesimpulan', 'A6 a', 'A6 b', 'A6 c', 'Catatan guru'];
  const rows = groups.map((g) => {
    const l = g.lk || {}; const gr = g.grading || {};
    const m = l.a1?.m || []; const a2 = l.a2?.rows || []; const a3 = l.a3?.m || {};
    return [g.name, g.members, pct(g), currentLabel(g), g.xp, g.life, g.stats?.wrong, g.stats?.galat, gr.a1, gr.a2, gr.a3, gr.a4, gr.a5, gr.a6, autoMisi(g), finalScore(g),
      cell(m[0]), cell(m[1]), cell(m[2]), l.a1?.b,
      ...[0, 1, 2, 3].map((i) => (a2[i] ? [a2[i].act, a2[i].cmd, a2[i].why].filter(Boolean).join(' | ') : '')),
      ...[1, 2, 3, 4].map((n) => (a3[n] ? [a3[n].sql, a3[n].aff != null ? `(${a3[n].aff} baris)` : '', a3[n].what].filter(Boolean).join(' | ') : '')),
      l.a3?.pred, l.a3?.actual, l.a3?.explain,
      l.a4?.A?.aff, l.a4?.B?.aff, l.a4?.a, l.a4?.b,
      (l.a5?.seq || []).map((q, i) => `${i + 1}. ${q.sql}`).join(' ; '), l.a5?.verif, l.a5?.b, l.a6?.a, l.a6?.b, l.a6?.c, gr.note];
  });
  return '﻿sep=;\r\n' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\r\n');
}
