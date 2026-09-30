import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DEF, OPT, TOOLBOX, MIS, QA, QB, PCOLS, PRODUK0, rowsOf, rp, CAUSES } from '../game/data';
import { exec, check, line, sqlOf, norm, sameState, practiceBefore, expectedFinal, clone, SqlErr } from '../game/engine';
import { Lup, Avatar } from '../components/Art';
import { Galat, Modal, WDialog, FloatWin } from '../components/ui';
import { Done } from './Forms';
import { useGame } from './GameContext';

const ok3 = (v) => String(v || '').trim().length >= 3;
const hl = (s) => s.split(/(\bSELECT\b|\bFROM\b|\bWHERE\b|\bAND\b|\bINSERT INTO\b|\bVALUES\b|\bUPDATE\b|\bSET\b|\bDELETE FROM\b|'[^']*'|___)/g)
  .map((p, i) => (/^(SELECT|FROM|WHERE|AND|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)$/.test(p) ? <span key={i} className="k">{p}</span> : p.startsWith("'") ? <span key={i} className="s">{p}</span> : p === '___' ? <span key={i} className="e">{p}</span> : p));

function ProdukTable({ rows, marks = {} }) {
  return (
    <table className="tbl"><thead><tr>{PCOLS.map((c) => <th key={c} className={c === 'id' ? 'key' : ''}>{c}{c === 'id' ? ' 🔑' : ''}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id} className={marks[r.id] || ''}>{PCOLS.map((c) => <td key={c} className={typeof r[c] === 'number' ? 'num' : ''}>{c === 'harga' ? rp(r[c]) : r[c]}</td>)}</tr>)}</tbody>
    </table>
  );
}
function SelTable({ sel }) {
  return (
    <table className="tbl"><thead><tr>{sel.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{sel.rows.length ? sel.rows.map((r, i) => <tr key={i} className="hit">{r.map((v, j) => <td key={j} className={typeof v === 'number' ? 'num' : ''}>{sel.cols[j] === 'harga' ? rp(v) : v}</td>)}</tr>) : <tr><td colSpan={sel.cols.length} className="muted">0 baris</td></tr>}</tbody>
    </table>
  );
}

const A4_STARTERS_A = ['WHERE berfungsi untuk …', 'Tanpa WHERE, perintah UPDATE atau DELETE akan …', 'Dengan WHERE id = 3, hanya …'];
const A4_STARTERS_B = ['Kang Dadan seharusnya menambahkan WHERE id = 3 karena …', 'Sebelum menjalankan UPDATE, sebaiknya dicek dulu dengan SELECT …', 'Mencoba dulu di mode uji coba agar …'];
const A4_WHAT = { A: ['Hanya harga Laptop Admin (id 3) yang berubah', 'Semua harga produk berubah'], B: ['Hanya harga Laptop Admin (id 3) yang berubah', 'Harga semua produk menjadi Rp9.000.000'] };
const A4_MC = [['tambah', 'Menambah kolom baru ke tabel'], ['batas', 'Membatasi baris mana yang terkena perubahan'], ['urut', 'Mengurutkan hasil dari terbesar ke terkecil']];

export default function Mission({ id, nav }) {
  const G = useGame();
  const { g, update, log, sound, toast, showKey } = G;
  const m = MIS[id];
  const isFin = id === 'fin', isA4 = id === 'a4';
  const snap = useRef(isFin || isA4 ? rowsOf(PRODUK0) : practiceBefore(id));
  const [stack, setStack] = useState([]);
  const [lastAdd, setLastAdd] = useState(-1);
  const [sandbox, setSandbox] = useState(isA4);
  const [wrong, setWrong] = useState(0);
  const [hintIdx, setHintIdx] = useState(0);
  const [hint, setHint] = useState(null);
  const [galat, setGalat] = useState(null);
  const [warn, setWarn] = useState(null);
  const [predict, setPredict] = useState(false);
  const [predVal, setPredVal] = useState('');
  const [solved, setSolved] = useState(null);
  const [badSlot, setBadSlot] = useState(null);
  const [seq, setSeq] = useState([]);
  const [finLog, setFinLog] = useState(null);
  const [cause, setCause] = useState(null);
  const [doneModal, setDoneModal] = useState(null);
  const [wins, setWins] = useState({});
  const [xpGain, setXpGain] = useState(0);
  const z = useRef(20);
  const invRef = useRef(null), trayRef = useRef(null);
  const start = useRef(Date.now());

  useEffect(() => { update((d) => { d.current = id; }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const trayPos = (idx) => {
    const d = invRef.current?.getBoundingClientRect(), t = trayRef.current?.getBoundingClientRect();
    if (!d || !t) return { x: 300, y: 120, w: 420 };
    return { x: t.left - d.left + 8 + idx * 22, y: t.top - d.top + 40 + idx * 34, w: Math.max(260, t.width - 16 - idx * 22) };
  };
  const openWin = useCallback((key, data, idx = 0, dy = 0) => {
    setWins((w) => {
      const p = w[key] ? { x: w[key].x, y: w[key].y, w: w[key].w } : (() => { const q = trayPos(idx); return { ...q, y: q.y + dy }; })();
      return { ...w, [key]: { ...data, ...p, z: ++z.current, flashKey: Date.now() } };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const showProduk = (rows, marks, title, aff) => openWin('produk', { title, kind: 'produk', rows, marks, foot: [`${rows.filter((r) => marks[r.id] !== 'del').length} baris`, aff !== undefined ? `${aff} baris terpengaruh` : '🔑 id = PRIMARY KEY'] });
  const showSel = (sel, title = 'hasil_query') => openWin('hasil', { title, kind: 'sel', sel, foot: [`${sel.rows.length} baris`, 'SELECT tidak mengubah data'] }, 1, 220);

  useEffect(() => {
    const t = setTimeout(() => showProduk(snap.current, {}, isFin ? 'produk · database asli' : isA4 ? 'produk · salinan cadangan (uji coba)' : 'produk · salinan latihan'), 200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- statistik & umpan balik ---- */
  const countErr = (key, galatErr) => update((d) => { d.stats.errors[key] = (d.stats.errors[key] || 0) + 1; if (galatErr) d.stats.galat++; });
  const doGalat = (e, st) => {
    sound('err'); setGalat({ e, lines: st.map(line) }); if (e.slot) setBadSlot(e.slot.join('-'));
    countErr('Galat: ' + e.title, true); log({ type: 'galat', mission: id, title: e.title, sql: st.length ? sqlOf(st) : '' });
  };
  const doWrong = (msg, key) => {
    const w = wrong + 1; setWrong(w); sound('bad');
    const life = Math.max(0, g.life - 1);
    update((d) => { d.life = life; d.stats.wrong++; d.stats.runs++; d.combo = 0; d.stats.errors[key] = (d.stats.errors[key] || 0) + 1; }, true);
    const tips = m.hints || ['Baca lagi permintaan memo.'];
    setHint({ msg, tip: tips[Math.min(hintIdx, tips.length - 1)], life, canKey: showKey && w >= 2 && !!m.more, showAns: false });
    setHintIdx((h) => h + 1);
    log({ type: 'wrong', mission: id, reason: key, msg });
  };
  const gainXP = (base) => {
    const first = wrong === 0; const combo = first ? (g.combo || 0) + 1 : 0; const mult = combo >= 3 ? 1.5 : 1;
    const tot = g.done.includes(id) ? 0 : Math.round((base + (first ? 5 : 0)) * mult);
    update((d) => { d.xp += tot; d.combo = combo; d.stats.ok++; d.stats.runs++; d.stats.time += Math.round((Date.now() - start.current) / 1000); }, true);
    if (first && !g.done.includes(id)) G.award('clean');
    if (combo >= 3) G.award('combo');
    setXpGain(tot); return tot;
  };

  /* ---- menjalankan ---- */
  const run = (over) => {
    const st = Array.isArray(over) ? over : stack;
    if (solved) return;
    setHint(null);
    if (g.life <= 0) { nav.open('rest'); return; }
    if (isFin) { runSeq(); return; }
    let res;
    try { res = exec(st, snap.current); } catch (e) { if (e instanceof SqlErr) { doGalat(e, st); return; } throw e; }
    if (m.predict && !sandbox && res.kind === 'UPDATE' && !g.lk.a3.pred) { setPredict(true); return; }
    if (res.noWhere && !sandbox && !isA4) { setWarn({ res, go: () => apply(res) }); return; }
    apply(res);
  };
  const apply = (res) => {
    log({ type: 'run', mission: id, sql: res.sql, aff: res.aff, kind: res.kind, sandbox });
    if (res.kind === 'SELECT') {
      showSel(res.sel);
      if (id === 'm1') {
        const exp = exec(m.answer, snap.current);
        const same = [...res.sel.ids].sort().join() === [...exp.sel.ids].sort().join();
        if (same && (res.sel.cols.includes('nama') || res.sel.cols.includes('id'))) { win(res); return; }
        const n = res.sel.rows.length, e = exp.sel.rows.length;
        doWrong(n > e ? `Hasilmu ${n} baris, terlalu banyak. Saring hanya kategori Elektronik.` : n < e ? `Hasilmu cuma ${n} baris. Cek nilai WHERE-nya.` : 'Tampilkan kolom id atau nama supaya produknya terlihat.', n > e ? 'Terlalu banyak baris' : n < e ? 'Baris kurang / WHERE keliru' : 'Kolom kurang');
        return;
      }
      toast('SELECT tidak mengubah data. Bagus untuk mengecek sebelum dan sesudah!', 'i-glass'); sound('pop'); return;
    }
    if (sandbox) {
      showProduk(res.shown, res.marks, 'produk · UJI COBA (akan di-ROLLBACK)', res.aff);
      if (isA4) { recordA4(res); return; }
      toast(`Uji coba: ${res.aff} baris terpengaruh. Data dikembalikan. Matikan mode uji coba untuk menyelesaikan misi.`, 'i-glass'); sound('pop'); return;
    }
    const exp = exec(m.answer, snap.current);
    showProduk(res.shown, res.marks, 'produk · salinan latihan', res.aff);
    if (res.kind !== m.kind) { doWrong(`Misi ini meminta perintah ${m.kind}, bukan ${res.kind}. Data latihan dipulihkan dari cadangan.`, 'Perintah DML tidak sesuai'); return; }
    if (sameState(res.rows, exp.rows) && res.aff === exp.aff) { win(res); return; }
    if (res.aff > exp.aff) doWrong(`Kueri kamu mengubah ${res.aff} baris, padahal memo hanya meminta ${exp.aff}. Si Lup memulihkan data latihan dari cadangan.`, res.noWhere ? 'UPDATE/DELETE tanpa WHERE' : 'Terlalu banyak baris');
    else if (res.aff === 0) doWrong('Tidak ada baris yang terpengaruh. Cek nilai di WHERE.', 'Baris kurang / WHERE keliru');
    else doWrong('Barisnya sudah tepat, tapi nilainya belum sesuai memo. Si Lup memulihkan data latihan.', 'Nilai belum sesuai memo');
  };
  const win = (res) => {
    sound('ok'); const tot = gainXP(20);
    update((d) => { const n = id.slice(1); const rec = d.lk.a3.m[n] || { what: '' }; rec.sql = res.sql; rec.aff = res.aff; d.lk.a3.m[n] = rec; if (id === 'm3') d.lk.a3.actual = String(res.aff); }, true);
    G.complete(id, 0); if (id === 'm4') G.award('dml');
    setSolved({ res, tot });
  };

  /* ---- Aktivitas 4 ---- */
  const a4 = g.lk.a4;
  const recordA4 = (res) => {
    const s = norm(res.sql); const key = s === norm(sqlOf(QA)) ? 'A' : s === norm(sqlOf(QB)) ? 'B' : null;
    if (!key) { toast(`Uji coba: ${res.aff} baris terpengaruh. Untuk tabel Aktivitas 4, jalankan Kueri A dan B persis seperti di lembar soal.`, 'i-glass'); return; }
    update((d) => { d.lk.a4[key] = { aff: res.aff, what: d.lk.a4[key]?.what || '' }; }, true);
    sound('ok'); toast(`Kueri ${key}: ${res.aff} baris terpengaruh. Data dikembalikan (ROLLBACK).`);
  };
  const [a4Tried, setA4Tried] = useState(false);
  const a4Ready = a4.A && a4.B;
  const saveA4 = () => {
    setA4Tried(true);
    if (!a4Ready || !ok3(a4.A.what) || !ok3(a4.B.what) || a4.mc !== 'batas' || !ok3(a4.a) || !ok3(a4.b)) { toast('Lengkapi semua langkah di lembar soal dulu.', 'i-print'); sound('err'); return; }
    const tot = gainXP(20); G.complete('a4', 0); G.award('where'); sound('ok');
    setDoneModal({ title: 'Peran WHERE terbukti' + (tot ? ` · +${tot} XP` : ''), text: 'Kueri A mengubah 1 baris, Kueri B mengubah semuanya. Saatnya Misi Akhir di database asli.', next: 'fin' });
  };
  const appendTo = (field, s) => update((d) => { const t = d.lk.a4[field] || ''; d.lk.a4[field] = t + (t && !t.endsWith(' ') ? ' ' : '') + s; });

  /* ---- Misi Akhir ---- */
  const addSeq = () => {
    try { check(stack); } catch (e) { if (e instanceof SqlErr) { doGalat(e, stack); return; } throw e; }
    setSeq((s) => [...s, { stack: clone(stack), sql: sqlOf(stack) }]); setStack([]); sound('pop');
  };
  const runSeq = () => {
    if (!seq.length) { toast('Rangkaian masih kosong. Masukkan kueri dulu.', 'i-glass'); return; }
    let rows = rowsOf(PRODUK0); const lg = []; let lastSel = null, risky = false;
    try { seq.forEach((q, i) => { const r = exec(q.stack, rows); if (r.noWhere) risky = true; lg.push({ sql: q.sql, kind: r.kind, aff: r.aff }); rows = r.rows; if (r.kind === 'SELECT') lastSel = { i, sel: r.sel }; }); }
    catch (e) { if (e instanceof SqlErr) { doGalat(e, []); return; } throw e; }
    const go = () => finishSeq(rows, lg, lastSel);
    if (risky) { setWarn({ res: { kind: 'UPDATE/DELETE', aff: 'semua' }, go }); return; }
    go();
  };
  const finishSeq = (rows, lg, lastSel) => {
    log({ type: 'run', mission: 'fin', sql: lg.map((l) => l.sql).join('\n'), aff: lg.map((l) => l.aff).join('/'), kind: 'RANGKAIAN' });
    const exp = expectedFinal(); const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    showProduk([...rows].sort((a, b) => a.id - b.id), {}, 'produk · database asli (hasil rangkaian)');
    setFinLog(lg);
    let why = null, key = null;
    if (!byId[9]) { why = 'Pompa Air Listrik belum masuk ke tabel produk.'; key = 'Akhir: INSERT belum ada'; }
    else if (!byId[3] || byId[3].harga !== 9000000) { why = 'Harga Laptop Admin (id 3) belum menjadi 9000000.'; key = 'Akhir: UPDATE belum tepat'; }
    else if (byId[5]) { why = 'Radio Transistor (id 5) masih tercatat.'; key = 'Akhir: DELETE belum ada'; }
    else if (!sameState(rows, exp)) { why = 'Ada produk lain yang ikut berubah atau terhapus. Cek WHERE pada UPDATE dan DELETE.'; key = 'Akhir: produk lain ikut berubah'; }
    else if (!lastSel || lastSel.i !== lg.length - 1) { why = 'Rangkaian harus ditutup dengan SELECT sebagai verifikasi.'; key = 'Akhir: tanpa SELECT verifikasi'; }
    else {
      const want = exp.filter((r) => r.kategori === 'Elektronik').map((r) => r.id).sort().join();
      if (want !== [...lastSel.sel.ids].sort().join() || !(lastSel.sel.cols.includes('nama') || lastSel.sel.cols.includes('id'))) { why = "SELECT verifikasi harus menampilkan produk kategori 'Elektronik' (minimal kolom nama)."; key = 'Akhir: SELECT verifikasi keliru'; }
    }
    if (why) { doWrong(why + ' Database asli dikembalikan seperti semula (ROLLBACK).', key); return; }
    showSel(lastSel.sel, 'hasil verifikasi');
    const verif = lastSel.sel.rows.map((r) => r.map((v, i) => (lastSel.sel.cols[i] === 'harga' ? rp(v) : v)).join(' | ')).join('\n');
    const tot = gainXP(60); sound('win');
    update((d) => { d.finSolved = true; d.lk.a5.seq = seq.map((q) => ({ sql: q.sql })); d.lk.a5.verif = verif; d.lk.a5.why = seq.map((_, i) => d.lk.a5.why[i] || ''); }, true);
    G.award('boss');
    setSolved({ res: null, tot, fin: true });
  };

  /* ---- workspace ---- */
  const addBlock = (k) => { if (solved) return; setStack((s) => [...s, { k, v: { t: 'produk' } }]); setLastAdd(stack.length); setHint(null); sound('pop'); };
  const setVal = (i, n, v) => { setStack((s) => { const c = clone(s); c[i].v[n] = v; return c; }); setBadSlot(null); setHint(null); };
  const move = (i, d) => { const j = i + d; if (solved || j < 0 || j >= stack.length) return; setStack((s) => { const c = clone(s); [c[i], c[j]] = [c[j], c[i]]; return c; }); };
  const del = (i) => { if (solved) return; setStack((s) => s.filter((_, k) => k !== i)); setHint(null); };
  const tools = m.tools || ['SELECT', 'FROM', 'INSERT', 'UPDATE', 'DELETE', 'WHERE', 'AND'];
  const sql = stack.length ? sqlOf(stack) : '';

  return (
    <div className="frame">
      <div className="frame-bar">
        <span className="ttl"><span className="chip" style={{ '--c': isFin ? 'var(--blood)' : '#DB4F93' }}>{isFin ? 'Fase 4' : 'Fase 3'}</span>{m.title}</span>
        {(g.combo || 0) >= 2 && <span className="combo">COMBO {g.combo}{g.combo >= 3 ? ' · XP ×1.5' : ''}</span>}
        <button className="btn ghost sm" type="button" onClick={nav.onBook}>Buku kerja</button>
        <button className="x-btn" type="button" onClick={nav.onExit} aria-label="Kembali ke papan">×</button>
      </div>
      <div className={'inv' + (sandbox ? ' sb' : '')} ref={invRef} style={{ minHeight: 720 }}>
        <aside className="toolbox" aria-label="Kotak blok">
          <span className="label">Kotak blok · ketuk untuk menambah</span>
          {TOOLBOX.map(([n, cc, list]) => { const L = list.filter((k) => tools.includes(k)); return L.length ? (
            <div className={'tb-cat ' + cc} key={n}><span className="label"><i />{n}</span>
              {L.map((k) => { const d = DEF[k]; return <button key={k} type="button" className={'blk ' + d.cat} onClick={() => addBlock(k)}><span className="kw">{d.kw || k}</span>{d.slots.filter((s) => typeof s !== 'string').slice(0, 3).map((_, i) => <span key={i} className="pill">…</span>)}</button>; })}
            </div>) : null; })}
          <p className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{id === 'm1' ? 'Blok DML terbuka mulai Misi 2.' : 'Blok merah bergaris = perintah yang bisa menghapus data. Hati-hati.'}</p>
        </aside>

        <div className="bench">
          <div className="mission"><Lup mood={solved ? 'senang' : 'netral'} className="lupi" /><div><b>{m.title}</b><p>{m.text}</p></div></div>

          {isA4 && (
            <div className="sheet">
              <div className="sheet-head"><b>Lembar soal · Aktivitas 4</b><span className="chip" style={{ '--c': 'var(--lamp)', '--t': '#3A2A00' }}>Mode uji coba aktif</span></div>
              <div className="sheet-body">
                {[['A', QA, 'UPDATE produk SET harga = 9000000 WHERE id = 3;'], ['B', QB, 'UPDATE produk SET harga = 9000000;']].map(([k, q, txt], i) => {
                  const rec = a4[k]; const now = !rec && (k === 'A' || a4.A);
                  return (
                    <div key={k} className={'stepx' + (rec ? ' ok' : now ? ' now' : '')}>
                      <span className="n">{rec ? '✓' : i + 1}</span>
                      <div><p>Jalankan <b>Kueri {k}</b> di mode uji coba, lalu amati jendela produk di Meja berkas.</p><code className="q">{txt}</code>
                        <div className="row"><button className={'btn sm' + (rec ? ' ghost' : '')} type="button" onClick={() => { setStack(clone(q)); setHint(null); run(clone(q)); }}>{rec ? `Ulangi Kueri ${k}` : `Jalankan Kueri ${k}`}</button>{rec && <span className="aff">{rec.aff} baris terpengaruh</span>}</div></div>
                    </div>
                  );
                })}
                <div className={'stepx' + (a4Ready ? ' now' : '')}>
                  <span className="n">3</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p>Isi tabel hasil pengamatan. Jumlah baris terisi otomatis.</p>
                    <div className="lk-wrap"><table className="lk"><tbody>
                      <tr><th>Kueri</th><th>Baris</th><th>Data yang berubah</th></tr>
                      {['A', 'B'].map((k) => (
                        <tr key={k}><td className="no">{k}</td><td>{a4[k] ? <span className="aff">{a4[k].aff}</span> : '–'}</td>
                          <td><div className="starter" style={{ marginBottom: 6 }}>{A4_WHAT[k].map((s) => <button key={s} type="button" disabled={!a4[k]} onClick={() => update((d) => { d.lk.a4[k].what = s; })}>{s}</button>)}</div>
                            <textarea className={'ta' + (a4Tried && !(a4[k] && ok3(a4[k].what)) ? ' miss' : '')} rows={2} disabled={!a4[k]} placeholder={a4[k] ? 'pilih kalimat di atas atau tulis sendiri' : `jalankan Kueri ${k} dulu`} value={a4[k]?.what || ''} onChange={(e) => update((d) => { d.lk.a4[k].what = e.target.value; })} /></td></tr>
                      ))}
                    </tbody></table></div>
                  </div>
                </div>
                <div className={'stepx' + (a4Ready ? ' now' : '')}>
                  <span className="n">4</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p>a. Berdasarkan kedua bukti tersebut, apa peran klausa WHERE pada perintah UPDATE dan DELETE?</p>
                    <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Pilih dulu jawaban yang paling tepat:</span>
                    <div className="mc">{A4_MC.map(([k, t]) => <button key={k} type="button" className={'opt' + (a4.mc === k ? (k === 'batas' ? ' right' : ' wrong') : '')} onClick={() => { update((d) => { d.lk.a4.mc = k; }); sound(k === 'batas' ? 'ok' : 'bad'); }}>{t}</button>)}</div>
                    {a4.mc && a4.mc !== 'batas' && <span style={{ color: 'var(--blood)', fontWeight: 800, fontSize: 13.5 }}>Belum tepat. Lihat lagi: Kueri A mengubah berapa baris, Kueri B berapa?</span>}
                    <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Lalu jelaskan dengan kalimatmu. Ketuk kalimat pembuka kalau bingung:</span>
                    <div className="starter">{A4_STARTERS_A.map((s) => <button key={s} type="button" onClick={() => appendTo('a', s)}>{s}</button>)}</div>
                    <textarea className={'ta' + (a4Tried && !ok3(a4.a) ? ' miss' : '')} rows={3} value={a4.a} onChange={(e) => update((d) => { d.lk.a4.a = e.target.value; })} />
                    <p>b. Kaitkan kesimpulanmu dengan insiden pada memo. Apa yang seharusnya dilakukan anggota tim tersebut?</p>
                    <div className="starter">{A4_STARTERS_B.map((s) => <button key={s} type="button" onClick={() => appendTo('b', s)}>{s}</button>)}</div>
                    <textarea className={'ta' + (a4Tried && !ok3(a4.b) ? ' miss' : '')} rows={3} value={a4.b} onChange={(e) => update((d) => { d.lk.a4.b = e.target.value; })} />
                    <div className="row"><span style={{ flex: 1 }} /><button className="btn" type="button" disabled={!a4Ready} onClick={saveA4}>Simpan Aktivitas 4</button></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isA4 && (
            <div className="row">
              <div className={'sandbox' + (sandbox ? ' on' : '')} style={{ opacity: isFin ? 0.5 : 1 }}>
                <button className="switch" type="button" role="switch" aria-checked={sandbox} aria-label="Mode uji coba" disabled={isFin} onClick={() => { setSandbox(!sandbox); sound('pop'); }} />
                <div>Mode uji coba<small>{isFin ? ' · tidak tersedia di database asli' : ' · data tidak berubah permanen (ROLLBACK)'}</small></div>
              </div>
            </div>
          )}

          <div className="bench-grid">
            <div className="bench-main">
              <div className="ws" aria-label="Area kerja kueri">
                {!stack.length && <div className="ws-empty"><Lup size={56} />Area kerja masih kosong.<br />{isA4 ? 'Tekan Jalankan Kueri A atau B di lembar soal, atau susun kuerimu sendiri.' : 'Ketuk blok di kotak blok.'}</div>}
                {stack.map((b, i) => { const d = DEF[b.k]; return (
                  <div className={'ws-row' + (i === lastAdd ? ' enter' : '')} key={i + b.k}>
                    <div className="ctl"><button type="button" aria-label="Naikkan" onClick={() => move(i, -1)}>▲</button><button type="button" aria-label="Turunkan" onClick={() => move(i, 1)}>▼</button></div>
                    <div className={'blk ' + d.cat}><span className="kw">{d.kw || b.k}</span>
                      {d.slots.map((s, j) => { if (typeof s === 'string') return <span key={j} className="kw">{s}</span>; const [n, type, opt] = s; const val = b.v[n] || '';
                        return <select key={j} className={'slot' + (val ? '' : ' empty') + (badSlot === `${i}-${n}` ? ' bad' : '')} aria-label={`slot ${n}`} disabled={!!solved} value={val} onChange={(e) => setVal(i, n, e.target.value)}><option value="">{opt ? '+ kolom' : 'pilih…'}</option>{OPT[type].map((o) => <option key={o}>{o}</option>)}</select>; })}
                    </div>
                    <div className="ctl"><button type="button" className="del" aria-label="Hapus blok" onClick={() => del(i)}>×</button></div>
                  </div>); })}
              </div>
              {sandbox && <div className="sb-note" style={{ display: 'block' }}>UJI COBA · hasil kueri ditampilkan, lalu data dikembalikan seperti semula.</div>}
              <div className="preview" aria-label="Kueri yang terbentuk">{sql ? hl(sql) : <span style={{ opacity: 0.6 }}>-- kueri kamu muncul di sini</span>}</div>

              {isFin && (
                <div className="seq"><h4>Rangkaian kueri <span className="aff">{seq.length} kueri</span></h4>
                  {!seq.length && <div className="seq-empty">Susun satu kueri di area kerja, lalu ketuk "Masukkan ke rangkaian". Ulangi sampai semua permintaan memo tercakup.</div>}
                  {seq.map((q, i) => (
                    <div className="seq-item" key={i}><span className="n">{i + 1}</span><code>{q.sql}</code>
                      <div className="ctl"><button type="button" aria-label="Naikkan" onClick={() => i > 0 && setSeq((s) => { const c = [...s]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; })}>▲</button><button type="button" aria-label="Turunkan" onClick={() => i < seq.length - 1 && setSeq((s) => { const c = [...s]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; return c; })}>▼</button><button type="button" className="del" aria-label="Hapus" onClick={() => setSeq((s) => s.filter((_, k) => k !== i))}>×</button></div>
                    </div>))}
                </div>
              )}

              <div className="run-row">
                {wrong > 0 && <span className="muted" style={{ fontSize: 13, fontWeight: 800 }}>Percobaan salah: {wrong}</span>}
                <span className="grow" />
                <button className="btn ghost sm" type="button" onClick={() => { if (!solved) { setStack([]); setHint(null); } }}>Kosongkan</button>
                {isFin && <button className="btn night sm" type="button" onClick={addSeq}>Masukkan ke rangkaian</button>}
                <button className="btn" type="button" onClick={run}>{isFin ? 'Jalankan rangkaian' : 'Jalankan kueri'}</button>
                {hint && (
                  <div className="hint" role="status">
                    <div className="hint-top"><Lup mood="bingung" /><div><b>Belum tepat</b><p>{hint.msg}</p></div></div>
                    <div className="more" style={{ fontFamily: 'var(--f-body)', fontWeight: 700, fontSize: 13.5, whiteSpace: 'normal' }}>💡 {hint.tip}</div>
                    {hint.showAns && <div className="more">{m.more}</div>}
                    <span className="cost"><svg><use href="#i-print" /></svg>−1 sidik jari · sisa {hint.life}</span>
                    <div className="row">
                      {hint.life === 0 ? <button className="btn blood sm" type="button" onClick={() => nav.open('rest')}>Istirahat dulu</button> : <>
                        {hint.canKey && !hint.showAns && <button className="btn lamp sm" type="button" onClick={() => { setHint({ ...hint, showAns: true }); update((d) => { d.stats.hints++; }); log({ type: 'hint', mission: id }); }}>Lihat jawaban</button>}
                        <button className="btn ghost sm" type="button" onClick={() => setHint(null)}>Oke</button></>}
                    </div>
                  </div>
                )}
              </div>

              {finLog && (
                <div className="card" style={{ gap: 8 }}><b>Log eksekusi rangkaian{solved ? '' : ' (dibatalkan · ROLLBACK)'}</b>
                  <div className="log">{finLog.map((l, i) => <div key={i}><span>{i + 1}. {l.kind}</span><span>{l.aff} baris {l.kind === 'SELECT' ? 'tampil' : 'terpengaruh'}</span></div>)}</div></div>
              )}

              {solved && !solved.fin && <Solved id={id} m={m} res={solved.res} tot={xpGain} onNext={(next) => setDoneModal(next)} />}
              {solved?.fin && (
                <div className="result">
                  <div className="speaker"><div className="ava"><Avatar who="ratna" /></div><div><b>Database asli pulih!{xpGain ? ` +${xpGain} XP` : ''}</b><small>Bu Ratna</small></div></div>
                  <p>Semua permintaan memo selesai, dan tidak ada produk lain yang ikut berubah. Satu pertanyaan terakhir sebelum berkas ditutup: apa penyebab insidennya?</p>
                  <div className="row"><button className="btn blood" type="button" onClick={() => setCause({ step: 'pick', pick: null })}>Tentukan penyebab insiden</button><span className="stamp green" style={{ fontSize: 15 }}>TERVERIFIKASI</span></div>
                </div>
              )}
            </div>
            <div className="tray" ref={trayRef}><span className="label">Meja berkas</span><span>Tabel produk dan hasil kueri muncul di sini. Baris hijau = ditambah, kuning = diubah, merah = dihapus.</span></div>
          </div>
        </div>

        {Object.entries(wins).map(([k, w]) => (
          <FloatWin key={k} title={w.title} x={w.x} y={w.y} w={w.w} z={w.z} flashKey={w.flashKey}
            onFocus={() => setWins((s) => ({ ...s, [k]: { ...s[k], z: ++z.current } }))}
            onClose={() => setWins((s) => { const c = { ...s }; delete c[k]; return c; })}
            foot={<><span>{w.foot[0]}</span><span>{w.foot[1]}</span></>}>
            {w.kind === 'produk' ? <ProdukTable rows={w.rows} marks={w.marks} /> : <SelTable sel={w.sel} />}
          </FloatWin>
        ))}
      </div>

      {galat && <Galat err={galat.e} lines={galat.lines} onClose={() => setGalat(null)} />}
      {predict && (
        <Modal tone="info" onClose={() => setPredict(false)}>
          <Lup mood="bingung" className="lupi" /><span className="label">Aktivitas 3 · prediksi</span><h3>Berapa baris yang akan berubah?</h3>
          <p>Sebelum menjalankan Misi 3, tulis prediksi kelompokmu. Lihat kondisi di blok WHERE.</p>
          <input className="inp" type="number" min="0" max="20" placeholder="contoh: 1" style={{ maxWidth: 160, textAlign: 'center', fontSize: 20 }} value={predVal} onChange={(e) => setPredVal(e.target.value)} />
          <div className="btns"><button className="btn" type="button" onClick={() => { if (predVal.trim() === '') return; update((d) => { d.lk.a3.pred = predVal.trim(); }, true); setPredict(false); setTimeout(() => document.getElementById('run-again')?.click(), 50); }}>Simpan prediksi & jalankan</button></div>
        </Modal>
      )}
      <button id="run-again" type="button" hidden onClick={run} />
      {warn && (
        <WDialog small title="Peringatan · Kopdes Database" icon="i-print" onClose={() => setWarn(null)}
          footer={<><button className="wbtn" type="button" onClick={() => setWarn(null)}>Batal</button>{!isFin && <button className="wbtn" type="button" onClick={() => { setWarn(null); setSandbox(true); toast('Mode uji coba aktif. Jalankan lagi dengan aman.', 'i-glass'); }}>Coba di mode uji coba</button>}<button className="wbtn red" type="button" onClick={() => { const go = warn.go; setWarn(null); log({ type: 'warn', mission: id }); go(); }}>Tetap jalankan</button></>}>
          <div className="wmsg"><svg className="big" viewBox="0 0 40 40"><path d="M20 3 L38 35 H2 Z" fill="#F7B500" /><rect x="18.3" y="13" width="3.4" height="12" rx="1.5" fill="#1D2540" /><circle cx="20" cy="29.5" r="2" fill="#1D2540" /></svg>
            <div><h4>{warn.res.kind} tanpa WHERE akan mengubah {warn.res.aff} baris</h4><p>Kueri ini tidak punya kondisi, jadi <b>semua baris</b> di tabel produk akan {warn.res.kind === 'DELETE' ? 'terhapus' : 'diubah'}. Persis seperti insiden di memo.</p></div></div>
        </WDialog>
      )}
      {cause && <CauseDialog state={cause} setState={setCause} onDone={() => nav.open('f5')} />}
      {doneModal && <Done title={doneModal.title} text={doneModal.text} onBoard={nav.onExit} onNext={() => nav.open(doneModal.next)} />}
    </div>
  );
}

function Solved({ id, m, res, tot, onNext }) {
  const { g, update } = useGame();
  const n = id.slice(1); const rec = g.lk.a3.m[n] || {};
  const [tried, setTried] = useState(false);
  const save = () => {
    setTried(true);
    if (!ok3(rec.what) || (id === 'm3' && !ok3(g.lk.a3.explain))) return;
    const order = ['m1', 'm2', 'm3', 'm4', 'a4']; const next = order[order.indexOf(id) + 1];
    onNext({ title: m.title.split('·')[0].trim() + ' selesai!', text: 'Catatan otomatis masuk ke Buku kerja: kueri, jumlah baris terpengaruh, dan catatanmu.', next });
  };
  return (
    <div className="result">
      <div className="speaker"><div className="ava"><Lup mood="senang" /></div><div><b>Misi berhasil!{tot ? ` +${tot} XP` : ''}</b><small><span className="aff">{res.aff} baris {res.kind === 'SELECT' ? 'tampil' : 'terpengaruh'}</span></small></div></div>
      <p>{m.reveal}</p>
      <label className="q"><b>Catatan Aktivitas 3: apa yang berubah / muncul?</b>
        <textarea className={'ta' + (tried && !ok3(rec.what) ? ' miss' : '')} rows={2} placeholder="tulis dengan kata-kata kelompokmu" value={rec.what || ''} onChange={(e) => update((d) => { d.lk.a3.m[n] = { ...(d.lk.a3.m[n] || {}), what: e.target.value }; })} /></label>
      {id === 'm3' && <>
        <p style={{ fontSize: 14 }}>Prediksi kelompokmu: <b>{g.lk.a3.pred || '-'}</b> baris · hasil aktual: <b>{res.aff}</b> baris.</p>
        <label className="q"><b>Apakah prediksi kelompokmu sesuai? Jelaskan berdasarkan kondisi pada blok WHERE.</b>
          <textarea className={'ta' + (tried && !ok3(g.lk.a3.explain) ? ' miss' : '')} rows={2} value={g.lk.a3.explain} onChange={(e) => update((d) => { d.lk.a3.explain = e.target.value; })} /></label>
      </>}
      <div className="row"><button className="btn" type="button" onClick={save}>Simpan catatan & lanjut</button></div>
    </div>
  );
}

function CauseDialog({ state, setState, onDone }) {
  const { update, sound, log, g } = useGame();
  if (state.step === 'wrong') {
    const why = CAUSES.find((c) => c[0] === state.pick)[2];
    return (
      <WDialog small shake title="LaporanInsiden.exe" icon="i-print" onClose={() => setState({ step: 'pick', pick: null })} footer={<button className="wbtn pri" type="button" onClick={() => setState({ step: 'pick', pick: null })}>Pilih ulang</button>}>
        <div className="wmsg"><svg className="big" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#C42B1C" /><path d="M13 13l14 14M27 13L13 27" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" /></svg><div><h4>Laporan ditolak</h4><p>{why}</p></div></div>
        <span className="cost" style={{ font: '800 13px var(--f-body)', color: 'var(--blood)' }}>−1 sidik jari · sisa {g.life}</span>
      </WDialog>
    );
  }
  if (state.step === 'ok') {
    return (
      <WDialog title="LaporanInsiden.exe · Kasus ditutup" icon="i-check" onClose={onDone} footer={<button className="wbtn pri" type="button" onClick={onDone}>Lanjut ke Aktivitas 5</button>}>
        <div className="wmsg"><Lup mood="menang" className="big" /><div><h4>Penyebab: UPDATE tanpa WHERE</h4><p>Bukan sabotase, tapi kelalaian. Tanpa kondisi, UPDATE berlaku untuk semua 8 baris.</p></div></div>
        <div className="evmini"><b>SOP baru Tim Data Kopdes</b><br />1. Tulis SELECT dengan WHERE yang sama untuk mengecek baris yang akan terpengaruh.<br />2. Coba dulu di mode uji coba.<br />3. Jalankan UPDATE/DELETE selalu dengan WHERE.<br />4. Verifikasi hasil dengan SELECT, dan buat cadangan harian.</div>
      </WDialog>
    );
  }
  return (
    <WDialog title="LaporanInsiden.exe · Gerai Kopdes" onClose={() => setState(null)}
      footer={<><button className="wbtn" type="button" onClick={() => setState(null)}>Batal</button><button className="wbtn pri" type="button" disabled={!state.pick} onClick={() => {
        log({ type: 'cause', pick: state.pick, ok: state.pick === 'where' });
        if (state.pick === 'where') { sound('win'); setState({ step: 'ok' }); }
        else { sound('err'); update((d) => { d.life = Math.max(0, d.life - 1); d.stats.wrong++; d.stats.errors['Penyebab insiden keliru'] = (d.stats.errors['Penyebab insiden keliru'] || 0) + 1; }, true); setState({ step: 'wrong', pick: state.pick }); }
      }}>Kirim laporan</button></>}>
      <div className="wmsg"><Lup className="big" /><div><h4>Apa penyebab harga kacau?</h4><p>Pilih berdasarkan bukti dari Aktivitas 4. Salah pilih memotong 1 sidik jari.</p></div></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup">
        {CAUSES.map(([k, t]) => <button key={k} type="button" className="sus" role="radio" aria-checked={state.pick === k} style={{ gridTemplateColumns: '1fr' }} onClick={() => setState({ ...state, pick: k })}><div><b>{t}</b></div></button>)}
      </div>
    </WDialog>
  );
}
