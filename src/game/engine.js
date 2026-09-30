import { PCOLS, DEF, rowsOf, PRODUK0, MIS } from './data';

export class SqlErr extends Error {
  constructor(title, msg, line, face) { super(msg); this.title = title; this.line = line; this.face = face || 'bingung'; this.slot = null; }
}
export const clone = (o) => JSON.parse(JSON.stringify(o));
const lit = (x) => (x.startsWith("'") ? x.slice(1, -1) : Number(x));
function cmp(a, op, b) {
  return op === '=' ? a === b : op === '!=' ? a !== b : op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b;
}
export function line(b) {
  const v = b.v, V = (x) => x || '___';
  if (b.k === 'SELECT') { const cs = ['c1', 'c2', 'c3'].map((n) => v[n]).filter(Boolean); return 'SELECT ' + (cs.length ? cs.join(', ') : '___'); }
  if (b.k === 'FROM') return 'FROM ' + V(v.t);
  if (b.k === 'WHERE') return `WHERE ${V(v.c)} ${V(v.op)} ${V(v.v)}`;
  if (b.k === 'AND') return `  AND ${V(v.c)} ${V(v.op)} ${V(v.v)}`;
  if (b.k === 'INSERT') return `INSERT INTO ${V(v.t)} (id, nama, kategori, harga, stok)\nVALUES (${[1, 2, 3, 4, 5].map((i) => V(v['v' + i])).join(', ')})`;
  if (b.k === 'UPDATE') return `UPDATE ${V(v.t)}\nSET ${V(v.c)} = ${V(v.v)}`;
  if (b.k === 'DELETE') return 'DELETE FROM ' + V(v.t);
  return '';
}
export const sqlOf = (st) => st.map(line).join('\n') + (st.length ? ';' : '');
export const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s*;\s*$/, '').trim();

export function check(st) {
  const idx = (k) => st.findIndex((b) => b.k === k);
  if (!st.length) throw new SqlErr('Area kerja kosong', 'Tambahkan blok perintah dulu: SELECT, INSERT, UPDATE, atau DELETE.', -1);
  const heads = st.filter((b) => DEF[b.k].head);
  if (!heads.length) throw new SqlErr('Perintah utamanya mana?', 'Setiap kueri harus dimulai dengan SELECT, INSERT, UPDATE, atau DELETE.', -1);
  if (heads.length > 1) throw new SqlErr('Dua perintah dalam satu kueri', `Ada ${heads.map((h) => h.k).join(' dan ')} sekaligus. Satu kueri hanya boleh punya satu perintah utama, jadi pisahkan jadi dua kueri.`, st.indexOf(heads[1]), 'kaget');
  if (!DEF[st[0].k].head) throw new SqlErr('Urutan berkas kacau!', `Perintah utama (${heads[0].k}) harus berada paling atas.`, 0, 'kaget');
  for (let i = 0; i < st.length; i++) {
    const b = st[i];
    for (const s of DEF[b.k].slots) {
      if (typeof s === 'string' || s[2]) continue;
      if (!b.v[s[0]]) { const e = new SqlErr('Ada slot yang kosong', `Blok ${b.k} belum lengkap. Isi dulu slot yang bergaris putus-putus.`, i); e.slot = [i, s[0]]; throw e; }
    }
  }
  const seen = {};
  st.forEach((b, i) => { if (seen[b.k]) throw new SqlErr('Blok dobel', `Blok ${b.k} muncul dua kali.`, i); seen[b.k] = 1; });
  const kind = st[0].k;
  if (kind === 'SELECT' && idx('FROM') !== 1) throw new SqlErr('Tabelnya belum dipilih', 'SELECT butuh blok FROM tepat di bawahnya untuk menyebut tabelnya.', idx('FROM'));
  if (kind !== 'SELECT' && idx('FROM') >= 0) throw new SqlErr('FROM tidak diperlukan', `${kind} sudah menyebut nama tabelnya sendiri, jadi blok FROM tidak dipakai di sini.`, idx('FROM'));
  if (kind === 'INSERT' && (idx('WHERE') >= 0 || idx('AND') >= 0)) throw new SqlErr('INSERT tidak memakai WHERE', 'INSERT menambah baris baru, bukan memilih baris yang sudah ada. Hapus blok WHERE/AND.', Math.max(idx('WHERE'), idx('AND')));
  if (idx('AND') >= 0 && idx('WHERE') < 0) throw new SqlErr('AND tanpa WHERE', 'Blok AND menambah syarat ke WHERE, jadi tambahkan WHERE dulu.', idx('AND'));
  if (idx('AND') >= 0 && idx('AND') < idx('WHERE')) throw new SqlErr('Urutan berkas kacau!', 'AND harus berada di bawah WHERE.', idx('AND'), 'kaget');
  return kind;
}

export function exec(st, rows) {
  const kind = check(st);
  const g = (k) => st.find((b) => b.k === k);
  const conds = ['WHERE', 'AND'].map(g).filter(Boolean).map((b) => b.v);
  const match = (r) => conds.every((w) => { const R = lit(w.v); const L = r[w.c]; return cmp(typeof R === 'number' ? Number(L) : String(L), w.op, R); });
  const out = clone(rows); const marks = {}; let aff = 0, sel = null;
  if (kind === 'SELECT') {
    const s = g('SELECT').v; let cols = [];
    ['c1', 'c2', 'c3'].forEach((n) => { const v = s[n]; if (!v) return; if (v === '*') cols.push(...PCOLS); else cols.push(v); });
    cols = [...new Set(cols)];
    const rs = out.filter(match); sel = { cols, rows: rs.map((r) => cols.map((c) => r[c])), ids: rs.map((r) => r.id) }; aff = rs.length;
  }
  if (kind === 'INSERT') {
    const v = g('INSERT').v; const r = {}; PCOLS.forEach((c, i) => (r[c] = lit(v['v' + (i + 1)])));
    const dup = out.find((x) => x.id === r.id);
    if (dup) throw new SqlErr('id sudah dipakai', `Sudah ada produk dengan id ${r.id} (${dup.nama}). Kolom id adalah PRIMARY KEY, jadi nilainya tidak boleh kembar.`, 0, 'kaget');
    out.push(r); marks[r.id] = 'ins'; aff = 1;
  }
  if (kind === 'UPDATE') { const v = g('UPDATE').v; out.forEach((r) => { if (match(r)) { r[v.c] = lit(v.v); marks[r.id] = 'upd'; aff++; } }); }
  let dels = [];
  if (kind === 'DELETE') { dels = out.filter(match); dels.forEach((r) => (marks[r.id] = 'del')); aff = dels.length; }
  const next = kind === 'DELETE' ? out.filter((r) => !match(r)) : out;
  return { kind, aff, rows: next, marks, sel, shown: kind === 'DELETE' ? [...next, ...dels].sort((a, b) => a.id - b.id) : next,
    noWhere: (kind === 'UPDATE' || kind === 'DELETE') && !conds.length, sql: sqlOf(st) };
}
export const sameState = (a, b) => JSON.stringify([...a].sort((x, y) => x.id - y.id)) === JSON.stringify([...b].sort((x, y) => x.id - y.id));

export function practiceBefore(id) {
  let r = rowsOf(PRODUK0);
  for (const k of ['m2', 'm3', 'm4']) { if (k === id || id === 'm1') break; r = exec(MIS[k].answer, r).rows; }
  return r;
}
export function expectedFinal() {
  let r = rowsOf(PRODUK0);
  ['m2', 'm3', 'm4'].forEach((k) => (r = exec(MIS[k].answer, r).rows));
  return r;
}
