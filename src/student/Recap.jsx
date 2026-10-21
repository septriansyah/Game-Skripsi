import React from 'react';
import { MIS } from '../game/data';
import { useGame } from './GameContext';

// Rekap semua yang sudah dikerjakan di Fase 3, ditampilkan di Fase 4 sebagai bahan menyusun solusi & kesimpulan.
const ROWS = [
  ['2', 'Misi 2 · INSERT', 'Urutan 1: tambahkan Pompa Air Listrik (id 9)'],
  ['3', 'Misi 3 · UPDATE', 'Urutan 2: perbaiki harga Laptop (WHERE id = 3)'],
  ['4', 'Misi 4 · DELETE', 'Urutan 3: hapus Radio Transistor (WHERE id = 5)'],
  ['1', 'Misi 1 · SELECT', 'Urutan 4 (terakhir): verifikasi produk Elektronik'],
];
const t = (v) => (v && String(v).trim() ? String(v).trim() : '–');
const flat = (s) => (s ? s.replace(/\n\s*/g, ' ') : '');

export default function Recap3({ onUse, open = true }) {
  const { g } = useGame();
  const a3 = g.lk.a3, a4 = g.lk.a4;
  return (
    <details className="card" open={open} style={{ gap: 10 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Rekap Fase 3 · bukti yang sudah kelompokmu kumpulkan</summary>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
        Misi Akhir menggabungkan kueri dari Misi 2, 3, dan 4 di database asli, lalu ditutup dengan SELECT dari Misi 1 untuk memverifikasi hasilnya.
        {onUse && ' Ketuk "Pakai" untuk memuat kuerinya ke area kerja, lalu masukkan ke rangkaian sesuai urutan.'}
      </p>
      <div className="lk-wrap"><table className="lk"><tbody>
        <tr><th>Misi</th><th>Kueri yang sudah berhasil</th><th>Hasil</th><th>Catatan kelompokmu</th><th>Peran di Misi Akhir</th>{onUse && <th />}</tr>
        {ROWS.map(([n, name, role]) => {
          const rec = a3.m[n] || {};
          return (
            <tr key={n}>
              <td className="no" style={{ whiteSpace: 'nowrap' }}>{name}</td>
              <td><code style={{ whiteSpace: 'pre-wrap' }}>{flat(rec.sql) || flat(MIS['m' + n].more)}</code></td>
              <td style={{ whiteSpace: 'nowrap' }}>{rec.aff !== undefined ? <span className="aff">{rec.aff} baris</span> : '–'}</td>
              <td>{t(rec.what)}</td>
              <td style={{ fontWeight: 800 }}>{role}</td>
              {onUse && <td><button className="btn ghost sm" type="button" onClick={() => onUse(MIS['m' + n].answer)}>Pakai</button></td>}
            </tr>
          );
        })}
      </tbody></table></div>
      <div className="lk-wrap"><table className="lk"><tbody>
        <tr><th colSpan={2}>Prediksi Misi 3 & uji peran WHERE (Aktivitas 4)</th></tr>
        <tr><td className="no">Prediksi Misi 3</td><td>Prediksi <b>{t(a3.pred)}</b> baris · aktual <b>{t(a3.actual)}</b> baris. {t(a3.explain)}</td></tr>
        <tr><td className="no">Kueri A (dengan WHERE)</td><td><code>UPDATE produk SET harga = 9000000 WHERE id = 3;</code> → <span className="aff">{a4.A ? a4.A.aff : '–'} baris</span> {a4.A?.what ? '· ' + a4.A.what : ''}</td></tr>
        <tr><td className="no">Kueri B (tanpa WHERE)</td><td><code>UPDATE produk SET harga = 9000000;</code> → <span className="aff">{a4.B ? a4.B.aff : '–'} baris</span> {a4.B?.what ? '· ' + a4.B.what : ''}</td></tr>
        <tr><td className="no">Peran WHERE</td><td>{t(a4.a)}</td></tr>
        <tr><td className="no">Kaitan dengan insiden</td><td>{t(a4.b)}</td></tr>
      </tbody></table></div>
    </details>
  );
}
