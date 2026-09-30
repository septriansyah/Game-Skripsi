import React from 'react';
import { BADGES } from '../game/data';

const A = ({ v }) => <div className={'ans' + (v && String(v).trim() ? '' : ' empty')}>{v && String(v).trim() ? v : 'belum diisi'}</div>;
// Tampilan LKPD read-only, dipakai siswa (rekap) & guru (detail kelompok)
export default function LkpdView({ g }) {
  const l = g.lk;
  return (
    <>
      <section><h3>Fase 1 · Aktivitas 1 · Membaca masalah</h3>
        <div className="lk-wrap"><table className="lk"><tbody><tr><th>No.</th><th>Masalah yang ditemukan</th><th>Tabel dan data yang terpengaruh</th></tr>
          {l.a1.m.map((r, i) => <tr key={i}><td className="no">{i + 1}</td><td><A v={r[0]} /></td><td><A v={r[1]} /></td></tr>)}</tbody></table></div>
        <b>b. Mengapa seluruh harga ikut berubah?</b><A v={l.a1.b} /></section>
      <section><h3>Fase 2 · Aktivitas 2 · Rencana penyelesaian</h3>
        <div className="lk-wrap"><table className="lk"><tbody><tr><th>Urutan</th><th>Yang akan dilakukan</th><th>Perintah</th><th>Alasan</th></tr>
          {l.a2.rows.map((r, i) => <tr key={i}><td className="no">{i + 1}</td><td><A v={r.act} /></td><td><A v={r.cmd} /></td><td><A v={r.why} /></td></tr>)}</tbody></table></div></section>
      <section><h3>Fase 3 · Aktivitas 3 · Catatan Misi 1–4</h3>
        <div className="lk-wrap"><table className="lk"><tbody><tr><th>Misi</th><th>Kueri di panel SQL</th><th>Baris terpengaruh</th><th>Apa yang berubah / muncul</th></tr>
          {[['1', 'SELECT'], ['2', 'INSERT'], ['3', 'UPDATE'], ['4', 'DELETE']].map(([n, k]) => { const m = l.a3.m[n] || {}; return (
            <tr key={n}><td className="no">{n}<br /><small className="muted" style={{ font: '800 11px var(--f-body)' }}>{k}</small></td><td>{m.sql ? <code>{m.sql}</code> : <A v="" />}</td><td>{m.aff !== undefined ? <span className="aff">{m.aff}</span> : '–'}</td><td><A v={m.what} /></td></tr>); })}
        </tbody></table></div>
        <b>Sebelum Misi 3, kelompok kami memprediksi {l.a3.pred || '…'} baris akan berubah. Hasil aktualnya {l.a3.actual || '…'} baris.</b><A v={l.a3.explain} /></section>
      <section><h3>Aktivitas 4 · Menguji peran klausa WHERE</h3>
        <div className="lk-wrap"><table className="lk"><tbody><tr><th>Kueri</th><th>Jumlah baris terpengaruh</th><th>Data yang berubah</th></tr>
          {['A', 'B'].map((k) => <tr key={k}><td className="no">{k}</td><td>{l.a4[k] ? <span className="aff">{l.a4[k].aff}</span> : '–'}</td><td><A v={l.a4[k]?.what} /></td></tr>)}</tbody></table></div>
        <b>a. Peran WHERE pada UPDATE dan DELETE</b><A v={l.a4.a} /><b>b. Kaitan dengan insiden di memo</b><A v={l.a4.b} /></section>
      <section><h3>Fase 4 · Aktivitas 5 · Solusi terpadu</h3>
        <div className="lk-wrap"><table className="lk"><tbody><tr><th>Urutan</th><th>Kueri yang disusun</th><th>Alasan penempatan</th></tr>
          {l.a5.seq.length ? l.a5.seq.map((q, i) => <tr key={i}><td className="no">{i + 1}</td><td><code>{q.sql}</code></td><td><A v={l.a5.why[i]} /></td></tr>) : <tr><td colSpan={3} className="muted">Misi Akhir belum diselesaikan.</td></tr>}</tbody></table></div>
        <b>a. Hasil kueri verifikasi terakhir</b><A v={l.a5.verif} /><b>b. Dua alasan untuk presentasi</b><A v={l.a5.b} />
        <div className="pe"><div><b>{g.xp}</b><span>Poin diperoleh</span></div><div><b style={{ fontSize: 16 }}>{g.badges.map((id) => (BADGES.find((b) => b.id === id) || {}).name).filter(Boolean).join(', ') || '-'}</b><span>Lencana</span></div></div></section>
      <section><h3>Fase 5 · Aktivitas 6 · Evaluasi dan refleksi</h3>
        <b>a. Bagian solusi yang perlu diperbaiki</b><A v={l.a6.a} /><b>b. Langkah berpikir menyusun kueri</b><A v={l.a6.b} /><b>c. Bagian tersulit dan cara mengatasinya</b><A v={l.a6.c} /></section>
    </>
  );
}
