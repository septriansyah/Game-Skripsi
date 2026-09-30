import React, { useState } from 'react';
import Memo from './Memo';
import { Lup } from '../components/Art';
import { Modal } from '../components/ui';
import { KEY_A1, BADGES, REFLECT_STEPS } from '../game/data';
import { useGame } from './GameContext';

const ok3 = (v) => String(v || '').trim().length >= 3;

function Shell({ chip, chipColor = '#DB4F93', title, head, text, face = 'netral', onExit, onBook, children }) {
  return (
    <div className="frame">
      <div className="frame-bar"><span className="ttl"><span className="chip" style={{ '--c': chipColor }}>{chip}</span>{title}</span><button className="btn ghost sm" type="button" onClick={onBook}>Buku kerja</button><button className="x-btn" type="button" onClick={onExit} aria-label="Kembali ke papan">×</button></div>
      <div className="act">
        <div className="act-main">
          <div className="act-head"><Lup mood={face} /><div><h3>{head}</h3><p>{text}</p></div></div>
          {children}
        </div>
        <aside className="act-side"><Memo /></aside>
      </div>
    </div>
  );
}
function TA({ value, onChange, miss, rows = 2, ...p }) {
  return <textarea className={'ta' + (miss ? ' miss' : '')} rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} {...p} />;
}
export function Done({ title, text, onBoard, onNext }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <Modal tone="good" onClose={onBoard}>
      <Lup mood="senang" className="lupi" /><h3>{title}</h3><p>{text}</p>
      <div className="btns"><button className="btn ghost" type="button" onClick={onBoard}>Ke papan</button><button className="btn" type="button" onClick={() => { setHidden(true); onNext(); }}>Lanjut</button></div>
    </Modal>
  );
}

export function FormA1({ nav }) {
  const { g, update, complete, sound, toast } = useGame();
  const a1 = g.lk.a1; const [tried, setTried] = useState(false); const [done, setDone] = useState(false);
  const set = (fn) => update((d) => fn(d));
  const allFilled = ok3(g.name) && a1.m.every((r) => ok3(r[0]) && ok3(r[1])) && ok3(a1.b);
  const save = () => { setTried(true); if (!allFilled) { toast('Masih ada isian yang kosong.', 'i-print'); sound('err'); return; } complete('f1', 15); sound('ok'); setDone(true); };
  return (
    <Shell {...nav} chip="Fase 1" title="Membaca masalah" head="Aktivitas 1 · Membaca masalah" text="Baca memo di samping, lalu catat masalah data yang harus diperbaiki dengan bahasa kelompokmu sendiri.">
      <div className="q"><b>a. Tuliskan tiga masalah data yang harus diperbaiki beserta data yang terpengaruh.</b>
        <div className="lk-wrap"><table className="lk"><tbody>
          <tr><th>No.</th><th>Masalah yang ditemukan</th><th>Tabel dan data yang terpengaruh</th></tr>
          {a1.m.map((r, i) => (
            <tr key={i}><td className="no">{i + 1}</td>
              {[0, 1].map((j) => <td key={j}><TA aria-label={`Masalah ${i + 1} kolom ${j + 1}`} value={r[j]} miss={tried && !ok3(r[j])} onChange={(v) => set((d) => { d.lk.a1.m[i][j] = v; })} /></td>)}
            </tr>
          ))}
        </tbody></table></div>
      </div>
      <div className="q"><b>b. Menurut dugaan kelompokmu, mengapa seluruh harga produk bisa ikut berubah ketika perintah dijalankan tanpa kondisi?</b>
        <TA rows={3} aria-label="Jawaban b" value={a1.b} miss={tried && !ok3(a1.b)} onChange={(v) => set((d) => { d.lk.a1.b = v; })} /></div>
      {a1.checked && <div className="key"><b>Temuan Si Lup</b>{KEY_A1.map((k, i) => <span key={i}>{i + 1}. {k}</span>)}<span>b. Tanpa WHERE, UPDATE tidak punya syarat pembatas, sehingga perintah berlaku untuk setiap baris di tabel.</span></div>}
      <div className="row">
        <button className="btn ghost" type="button" onClick={() => { setTried(true); if (!a1.m.every((r) => ok3(r[0]) && ok3(r[1]))) { toast('Tulis dulu temuan kelompokmu, baru dibandingkan.', 'i-glass'); return; } set((d) => { d.lk.a1.checked = true; }); sound('pop'); }}>Bandingkan dengan temuan Si Lup</button>
        <span style={{ flex: 1 }} /><button className="btn" type="button" onClick={save}>Simpan & lanjut</button>
      </div>
      {done && <Done title="Aktivitas 1 tersimpan" text="Masalah sudah terbaca. Berikutnya: susun rencana sebelum menyentuh data." onBoard={nav.onExit} onNext={() => nav.open('f2')} />}
    </Shell>
  );
}

export function FormA2({ nav }) {
  const { g, update, complete, sound, toast } = useGame();
  const rows = g.lk.a2.rows; const [tried, setTried] = useState(false); const [fb, setFb] = useState(null); const [done, setDone] = useState(false);
  const save = () => {
    setTried(true);
    if (!rows.every((r) => ok3(r.act) && r.cmd && ok3(r.why))) { toast('Masih ada isian yang kosong.', 'i-print'); sound('err'); return; }
    const cmds = rows.map((r) => r.cmd); const notes = []; let block = false;
    ['INSERT', 'UPDATE', 'DELETE', 'SELECT'].forEach((c) => { const n = cmds.filter((x) => x === c).length; if (n === 0) { notes.push(`Belum ada ${c}. Memo meminta keempat perintah.`); block = true; } if (n > 1) { notes.push(`${c} muncul ${n} kali. Di rencana ini tiap perintah cukup sekali.`); block = true; } });
    if (!block) {
      notes.push(cmds[3] === 'SELECT' ? 'SELECT di urutan terakhir: tepat, karena berfungsi sebagai verifikasi setelah data diperbaiki.' : `SELECT kamu taruh di urutan ${cmds.indexOf('SELECT') + 1}. Pastikan kelompokmu tetap mengecek hasil akhir.`);
      notes.push('Untuk UPDATE dan DELETE, rencanakan kondisi WHERE-nya (id berapa?) sebelum menjalankan.');
    }
    setFb({ block, notes });
    if (block) { sound('err'); return; }
    complete('f2', 15); sound('ok'); setTimeout(() => setDone(true), 500);
  };
  return (
    <Shell {...nav} chip="Fase 2" title="Menyusun rencana" head="Aktivitas 2 · Rencana penyelesaian" text="Susun urutan langkah penyelesaian sebelum kelompokmu menyentuh media. Isi kolom perintah dengan INSERT, UPDATE, DELETE, atau SELECT.">
      <div className="lk-wrap"><table className="lk"><tbody>
        <tr><th>Urutan</th><th>Yang akan dilakukan</th><th style={{ width: 130 }}>Perintah DML</th><th>Alasan urutannya</th></tr>
        {rows.map((r, i) => (
          <tr key={i}><td className="no">{i + 1}</td>
            <td><TA aria-label={`Langkah ${i + 1}`} value={r.act} miss={tried && !ok3(r.act)} onChange={(v) => update((d) => { d.lk.a2.rows[i].act = v; })} /></td>
            <td><select className={'sel' + (tried && !r.cmd ? ' miss' : '')} aria-label={`Perintah ${i + 1}`} value={r.cmd} onChange={(e) => update((d) => { d.lk.a2.rows[i].cmd = e.target.value; })}><option value="">pilih…</option>{['INSERT', 'UPDATE', 'DELETE', 'SELECT'].map((c) => <option key={c}>{c}</option>)}</select></td>
            <td><TA aria-label={`Alasan ${i + 1}`} value={r.why} miss={tried && !ok3(r.why)} onChange={(v) => update((d) => { d.lk.a2.rows[i].why = v; })} /></td>
          </tr>
        ))}
      </tbody></table></div>
      {fb && <div className="fb"><Lup mood={fb.block ? 'bingung' : 'senang'} /><div><b>{fb.block ? 'Rencananya belum lengkap' : 'Catatan Si Lup'}</b><ul>{fb.notes.map((n, i) => <li key={i}>{n}</li>)}</ul></div></div>}
      <div className="row"><span style={{ flex: 1 }} /><button className="btn" type="button" onClick={save}>Periksa & simpan</button></div>
      {done && <Done title="Rencana tersimpan" text="Sekarang buktikan rencanamu di salinan latihan: Misi 1 sampai 4." onBoard={nav.onExit} onNext={() => nav.open('m1')} />}
    </Shell>
  );
}

export function FormA5({ nav }) {
  const { g, update, complete, sound, toast } = useGame();
  const a5 = g.lk.a5; const [tried, setTried] = useState(false); const [done, setDone] = useState(false);
  const save = () => {
    setTried(true);
    if (!a5.seq.every((_, i) => ok3(a5.why[i])) || !ok3(a5.b)) { toast('Masih ada isian yang kosong.', 'i-print'); sound('err'); return; }
    complete('fin', 0); sound('ok'); setDone(true);
  };
  return (
    <Shell {...nav} chip="Fase 4" chipColor="var(--blood)" title="Menyusun & menyajikan solusi" head="Aktivitas 5 · Solusi terpadu" text="Rangkaian kuerimu berhasil di database asli. Lengkapi alasan urutannya untuk bahan presentasi." face="menang">
      <div className="lk-wrap"><table className="lk"><tbody>
        <tr><th>Urutan</th><th>Kueri yang disusun</th><th>Alasan penempatan urutannya</th></tr>
        {a5.seq.map((q, i) => <tr key={i}><td className="no">{i + 1}</td><td><code>{q.sql}</code></td><td><TA aria-label={`Alasan urutan ${i + 1}`} value={a5.why[i]} miss={tried && !ok3(a5.why[i])} onChange={(v) => update((d) => { d.lk.a5.why[i] = v; })} /></td></tr>)}
      </tbody></table></div>
      <div className="q"><b>a. Hasil kueri verifikasi terakhir (daftar produk kategori Elektronik):</b><textarea className="ta" readOnly rows={6} value={a5.verif} /></div>
      <div className="q"><b>b. Dua alasan yang akan kelompokmu sampaikan saat presentasi, mengapa urutan ini sudah tepat:</b><TA rows={3} value={a5.b} miss={tried && !ok3(a5.b)} onChange={(v) => update((d) => { d.lk.a5.b = v; })} /></div>
      <div className="q"><b>Poin diperoleh & lencana</b>
        <div className="pe"><div><b>{g.xp}</b><span>Poin (XP)</span></div><div><b>{g.badges.length}</b><span>Lencana</span></div>
          {g.badges.map((id) => { const b = BADGES.find((x) => x.id === id); return b && <div key={id} style={{ background: b.c, color: '#fff' }}><b style={{ fontSize: 16 }}>{b.name}</b><span style={{ color: '#fff', opacity: 0.85 }}>lencana</span></div>; })}
        </div></div>
      <div className="row"><span style={{ flex: 1 }} /><button className="btn" type="button" onClick={save}>Simpan & lanjut ke refleksi</button></div>
      {done && <Done title="Solusi siap dipresentasikan" text="Tinggal satu langkah: evaluasi dan refleksi kelompok." onBoard={nav.onExit} onNext={() => nav.open('f6')} />}
    </Shell>
  );
}

export function FormA6({ nav }) {
  const { g, update, complete, award, sound, toast } = useGame();
  const a6 = g.lk.a6; const [tried, setTried] = useState(false);
  const addStep = (s) => update((d) => { const t = d.lk.a6.b || ''; const n = (t.match(/^\d+\./gm) || []).length + 1; d.lk.a6.b = t + (t && !t.endsWith('\n') ? '\n' : '') + n + '. ' + s + ': '; });
  const save = () => {
    setTried(true);
    if (!ok3(a6.a) || !ok3(a6.b) || !ok3(a6.c)) { toast('Masih ada isian yang kosong.', 'i-print'); sound('err'); return; }
    complete('f6', 20); award('lapor'); nav.open('lkpd', { celebrate: true });
  };
  return (
    <Shell {...nav} chip="Fase 5" title="Evaluasi & refleksi" head="Aktivitas 6 · Evaluasi dan refleksi" text="Simak presentasi kelompok lain, lalu refleksikan cara kerja kelompokmu.">
      <div className="q"><b>a. Setelah menyimak kelompok lain, adakah bagian solusi kelompokmu yang perlu diperbaiki? Jika tidak ada, jelaskan mengapa solusimu sudah tepat.</b><TA rows={3} value={a6.a} miss={tried && !ok3(a6.a)} onChange={(v) => update((d) => { d.lk.a6.a = v; })} /></div>
      <div className="q"><b>b. Tuliskan langkah berpikir kelompokmu dalam menyusun satu kueri, dari membaca masalah sampai memverifikasi hasil.</b><span>Ketuk langkah di bawah untuk menambahkannya, lalu lengkapi dengan kata-katamu sendiri.</span>
        <div className="chips-add">{REFLECT_STEPS.map((s) => <button key={s} type="button" onClick={() => addStep(s)}>+ {s}</button>)}</div>
        <TA rows={6} value={a6.b} miss={tried && !ok3(a6.b)} onChange={(v) => update((d) => { d.lk.a6.b = v; })} /></div>
      <div className="q"><b>c. Bagian mana yang paling sulit hari ini, dan bagaimana kelompokmu mengatasinya?</b><TA rows={3} value={a6.c} miss={tried && !ok3(a6.c)} onChange={(v) => update((d) => { d.lk.a6.c = v; })} /></div>
      <div className="row"><span style={{ flex: 1 }} /><button className="btn" type="button" onClick={save}>Selesaikan Kasus 2</button></div>
    </Shell>
  );
}
