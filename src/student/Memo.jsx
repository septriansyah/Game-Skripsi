import React from 'react';
import { PRODUK0 } from '../game/data';

export default function Memo() {
  return (
    <article className="memo" aria-label="Memo insiden">
      <span className="label" style={{ color: '#B0303A' }}>Memo internal · penting</span>
      <h3>Insiden harga di Gerai Elektronik</h3>
      <div className="meta"><span>Nomor</span><span>014/KDS-SKM/IX/2026</span><span>Tanggal</span><span>Senin, 28 September 2026</span><span>Dari</span><span>Ratna Dewi, Ketua Kopdes</span><span>Kepada</span><span>Tim Data (kelompok kalian)</span></div>
      <p>Minggu malam, admin magang kita, Kang Dadan, diminta mengubah harga <b>Laptop Admin 14 inci (id 3)</b> menjadi Rp9.000.000 sesuai harga distributor baru. Ia menjalankan perintah berikut:</p>
      <p><code>UPDATE produk SET harga = 9000000;</code></p>
      <p>Akibatnya, <b>semua produk</b> di gerai tercatat Rp9.000.000 dan kasir sempat menolak 14 pembeli. Pak Joko sudah memulihkan tabel <b>produk</b> dari cadangan hari Sabtu, tetapi cadangan itu belum memuat perubahan minggu ini. Mohon tim data:</p>
      <ol>
        <li>Mencatat produk baru: <b>Pompa Air Listrik</b> (id 9, Elektronik, Rp750.000, stok 5).</li>
        <li>Mengubah harga <b>Laptop Admin 14 inci (id 3)</b> menjadi Rp9.000.000, <u>hanya produk itu</u>.</li>
        <li>Menghapus <b>Radio Transistor (id 5)</b> karena sudah tidak dijual.</li>
        <li>Mengirim daftar produk kategori <b>Elektronik</b> setelah diperbaiki sebagai bukti.</li>
      </ol>
      <p>Sebelum menyentuh database, susun rencana dulu. Jangan sampai insiden terulang.</p>
      <div className="sign">Ratna Dewi</div>
      <div className="shot">
        <div>Lampiran · tangkapan layar kasir saat insiden</div>
        <table><tbody>
          {PRODUK0.slice(0, 5).map((r) => <tr key={r[0]}><td>{r[1]}</td><td className="bad">Rp9.000.000</td></tr>)}
          <tr><td>… 3 produk lain</td><td className="bad">Rp9.000.000</td></tr>
        </tbody></table>
      </div>
    </article>
  );
}
