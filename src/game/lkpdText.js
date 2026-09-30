import { BADGES } from './data';
const a = (x) => (x && String(x).trim() ? String(x).trim() : '-');
export function lkpdText(g) {
  const l = g.lk, L = [];
  L.push('LKPD KASUS 2 · HARGA KACAU DI GERAI KOPDES (KasusQL)', 'Kelompok: ' + a(g.name), 'Anggota: ' + a(g.members), '');
  L.push('FASE 1 · AKTIVITAS 1 · MEMBACA MASALAH', 'a. Tiga masalah data:');
  l.a1.m.forEach((r, i) => L.push(`  ${i + 1}. ${a(r[0])} | Data terpengaruh: ${a(r[1])}`));
  L.push('b. ' + a(l.a1.b), '', 'FASE 2 · AKTIVITAS 2 · RENCANA PENYELESAIAN');
  l.a2.rows.forEach((r, i) => L.push(`  ${i + 1}. ${a(r.act)} | ${a(r.cmd)} | Alasan: ${a(r.why)}`));
  L.push('', 'FASE 3 · AKTIVITAS 3 · CATATAN MISI 1-4');
  ['1', '2', '3', '4'].forEach((n) => { const m = l.a3.m[n] || {}; L.push(`  Misi ${n}: ${a(m.sql && m.sql.replace(/\n\s*/g, ' '))} | ${m.aff !== undefined ? m.aff + ' baris' : '-'} | ${a(m.what)}`); });
  L.push(`  Prediksi Misi 3: ${a(l.a3.pred)} baris. Aktual: ${a(l.a3.actual)} baris.`, '  Penjelasan: ' + a(l.a3.explain), '');
  L.push('AKTIVITAS 4 · MENGUJI PERAN WHERE',
    '  Kueri A: UPDATE produk SET harga = 9000000 WHERE id = 3; | ' + (l.a4.A ? l.a4.A.aff + ' baris | ' + a(l.a4.A.what) : '-'),
    '  Kueri B: UPDATE produk SET harga = 9000000; | ' + (l.a4.B ? l.a4.B.aff + ' baris | ' + a(l.a4.B.what) : '-'),
    'a. ' + a(l.a4.a), 'b. ' + a(l.a4.b), '', 'FASE 4 · AKTIVITAS 5 · SOLUSI TERPADU');
  l.a5.seq.forEach((q, i) => L.push(`  ${i + 1}. ${q.sql.replace(/\n\s*/g, ' ')} | Alasan: ${a(l.a5.why[i])}`));
  L.push('a. Hasil verifikasi:', a(l.a5.verif), 'b. ' + a(l.a5.b),
    `Poin diperoleh: ${g.xp} XP · Lencana: ${g.badges.map((id) => (BADGES.find((b) => b.id === id) || {}).name).filter(Boolean).join(', ') || '-'}`, '');
  L.push('FASE 5 · AKTIVITAS 6 · EVALUASI DAN REFLEKSI', 'a. ' + a(l.a6.a), 'b. ' + a(l.a6.b), 'c. ' + a(l.a6.c));
  return L.join('\n');
}
