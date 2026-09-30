export const PCOLS = ['id', 'nama', 'kategori', 'harga', 'stok'];
export const PRODUK0 = [
  [1, 'Kipas Angin Berdiri', 'Elektronik', 285000, 12],
  [2, 'Rice Cooker 1,8 L', 'Elektronik', 399000, 8],
  [3, 'Laptop Admin 14 inci', 'Elektronik', 8500000, 2],
  [4, 'Cangkul Baja', 'Alat Tani', 95000, 20],
  [5, 'Radio Transistor', 'Elektronik', 150000, 3],
  [6, 'Sprayer Elektrik 16 L', 'Alat Tani', 650000, 6],
  [7, 'Lampu LED 12 W', 'Elektronik', 35000, 40],
  [8, 'Terpal 4x6 m', 'Alat Tani', 120000, 15],
];
export const rowsOf = (a) => a.map((r) => Object.fromEntries(PCOLS.map((c, i) => [c, r[i]])));
export const rp = (n) => (typeof n === 'number' && n >= 1000 ? 'Rp' + n.toLocaleString('id-ID') : n);

export const NODES = [
  { id: 'f1', type: 'form', phase: 1, title: 'Membaca masalah', sub: 'Aktivitas 1' },
  { id: 'f2', type: 'form', phase: 2, title: 'Rencana penyelesaian', sub: 'Aktivitas 2' },
  { id: 'm1', type: 'mis', phase: 3, title: 'Misi 1 · Lihat data', sub: 'SELECT' },
  { id: 'm2', type: 'mis', phase: 3, title: 'Misi 2 · Produk baru', sub: 'INSERT' },
  { id: 'm3', type: 'mis', phase: 3, title: 'Misi 3 · Harga laptop', sub: 'UPDATE' },
  { id: 'm4', type: 'mis', phase: 3, title: 'Misi 4 · Produk pensiun', sub: 'DELETE' },
  { id: 'a4', type: 'mis', phase: 3, title: 'Uji peran WHERE', sub: 'Aktivitas 4' },
  { id: 'fin', type: 'mis', phase: 4, title: 'Misi Akhir', sub: 'Solusi terpadu', boss: true },
  { id: 'f6', type: 'form', phase: 5, title: 'Evaluasi & refleksi', sub: 'Aktivitas 6' },
];
export const PHASES = [
  { n: 1, name: 'Orientasi masalah', act: 'Aktivitas 1' },
  { n: 2, name: 'Menyusun rencana', act: 'Aktivitas 2' },
  { n: 3, name: 'Penyelidikan', act: 'Aktivitas 3–4' },
  { n: 4, name: 'Menyajikan solusi', act: 'Aktivitas 5' },
  { n: 5, name: 'Evaluasi & refleksi', act: 'Aktivitas 6' },
];

export const BADGES = [
  { id: 'clean', name: 'Tanpa Jejak', c: '#2DB36B', d: '#1E8A50', desc: 'Misi benar di percobaan pertama' },
  { id: 'combo', name: 'Api Combo', c: '#FF8A1F', d: '#C9650E', desc: '3 misi benar berturut-turut' },
  { id: 'dml', name: 'Tangan Dingin DML', c: '#DB4F93', d: '#AD3571', desc: 'INSERT, UPDATE, DELETE tuntas' },
  { id: 'where', name: 'Penjaga WHERE', c: '#0F9E9E', d: '#0B7474', desc: 'Menyelesaikan uji peran WHERE' },
  { id: 'boss', name: 'Penutup Kasus', c: '#E0474C', d: '#B0303A', desc: 'Misi Akhir di database asli' },
  { id: 'lapor', name: 'Laporan Lengkap', c: '#26325A', d: '#161E3A', desc: 'LKPD terisi sampai refleksi' },
];

export const OPT = {
  table: ['produk'], col: PCOLS, colstar: ['*', ...PCOLS], op: ['=', '!=', '>', '<', '>=', '<='],
  val: ['1', '2', '3', '4', '5', '6', '7', '8', '9', "'Elektronik'", "'Alat Tani'", "'Radio Transistor'", "'Laptop Admin 14 inci'", '9000000'],
  setcol: ['harga', 'stok', 'nama', 'kategori'], setval: ['9000000', '8500000', '750000', '0', "'Elektronik'"],
  i1: ['9', '10', '5'], i2: ["'Pompa Air Listrik'", "'Setrika Listrik'", "'Radio Transistor'"], i3: ["'Elektronik'", "'Alat Tani'"],
  i4: ['750000', '9000000', '150000'], i5: ['5', '3', '10'],
};
export const DEF = {
  SELECT: { cat: 'c-ambil', head: 1, slots: [['c1', 'colstar'], ['c2', 'col', 1], ['c3', 'col', 1]] },
  INSERT: { cat: 'c-ubah', head: 1, kw: 'INSERT INTO', slots: [['t', 'table'], '(id, nama, kategori, harga, stok) VALUES (', ['v1', 'i1'], ',', ['v2', 'i2'], ',', ['v3', 'i3'], ',', ['v4', 'i4'], ',', ['v5', 'i5'], ')'] },
  UPDATE: { cat: 'c-ubah', head: 1, slots: [['t', 'table'], 'SET', ['c', 'setcol'], '=', ['v', 'setval']] },
  DELETE: { cat: 'danger', head: 1, kw: 'DELETE FROM', slots: [['t', 'table']] },
  FROM: { cat: 'c-sumber', slots: [['t', 'table']] },
  WHERE: { cat: 'c-saring', slots: [['c', 'col'], ['op', 'op'], ['v', 'val']] },
  AND: { cat: 'c-logika', slots: [['c', 'col'], ['op', 'op'], ['v', 'val']] },
};
export const TOOLBOX = [
  ['Ambil data', 'c-ambil', ['SELECT', 'FROM']],
  ['Ubah data (DML)', 'c-ubah', ['INSERT', 'UPDATE', 'DELETE']],
  ['Saring', 'c-saring', ['WHERE', 'AND']],
];

export const QA = [{ k: 'UPDATE', v: { t: 'produk', c: 'harga', v: '9000000' } }, { k: 'WHERE', v: { c: 'id', op: '=', v: '3' } }];
export const QB = [{ k: 'UPDATE', v: { t: 'produk', c: 'harga', v: '9000000' } }];

export const MIS = {
  m1: { kind: 'SELECT', title: 'Misi 1 · Lihat data sebelum diperbaiki', text: "Tampilkan semua kolom produk yang kategorinya 'Elektronik' dari salinan latihan. Ini kondisi sebelum diperbaiki.",
    tools: ['SELECT', 'FROM', 'WHERE', 'AND'], answer: [{ k: 'SELECT', v: { c1: '*' } }, { k: 'FROM', v: { t: 'produk' } }, { k: 'WHERE', v: { c: 'kategori', op: '=', v: "'Elektronik'" } }],
    hints: ["Pakai SELECT * FROM produk, lalu saring dengan WHERE kategori = 'Elektronik'."], more: "SELECT *\nFROM produk\nWHERE kategori = 'Elektronik';",
    reveal: 'Ada 5 produk Elektronik. Radio Transistor (id 5) masih ada, Laptop masih Rp8.500.000, dan Pompa Air belum tercatat. Tiga masalah dari memo terbukti.' },
  m2: { kind: 'INSERT', title: 'Misi 2 · Catat produk baru', text: 'Tambahkan produk baru sesuai memo: id 9, Pompa Air Listrik, kategori Elektronik, harga 750000, stok 5.',
    answer: [{ k: 'INSERT', v: { t: 'produk', v1: '9', v2: "'Pompa Air Listrik'", v3: "'Elektronik'", v4: '750000', v5: '5' } }],
    hints: ['Pakai satu blok INSERT, lalu isi kelima nilainya sesuai urutan kolom: id, nama, kategori, harga, stok.'], more: "INSERT INTO produk (id, nama, kategori, harga, stok)\nVALUES (9, 'Pompa Air Listrik', 'Elektronik', 750000, 5);",
    reveal: 'Satu baris baru masuk ke tabel produk (baris hijau). INSERT tidak memakai WHERE karena perintah ini menambah baris baru, bukan memilih baris yang sudah ada.' },
  m3: { kind: 'UPDATE', predict: true, title: 'Misi 3 · Perbaiki harga laptop', text: 'Ubah harga Laptop Admin 14 inci (id 3) menjadi 9000000. Hanya produk itu yang boleh berubah!',
    answer: [{ k: 'UPDATE', v: { t: 'produk', c: 'harga', v: '9000000' } }, { k: 'WHERE', v: { c: 'id', op: '=', v: '3' } }],
    hints: ['Tambahkan blok WHERE di bawah UPDATE supaya hanya satu produk yang berubah.', 'Kondisinya: WHERE id = 3.'], more: 'UPDATE produk\nSET harga = 9000000\nWHERE id = 3;',
    reveal: 'Hanya 1 baris yang berubah karena WHERE id = 3 membatasi UPDATE pada satu produk. Inilah kueri yang seharusnya dijalankan Kang Dadan.' },
  m4: { kind: 'DELETE', title: 'Misi 4 · Hapus produk pensiun', text: 'Hapus Radio Transistor (id 5) yang sudah tidak dijual.',
    answer: [{ k: 'DELETE', v: { t: 'produk' } }, { k: 'WHERE', v: { c: 'id', op: '=', v: '5' } }],
    hints: ['DELETE FROM produk harus diikuti WHERE. Kalau tidak, seluruh tabel akan kosong.', 'Kondisinya: WHERE id = 5.'], more: 'DELETE FROM produk\nWHERE id = 5;',
    reveal: 'Satu baris terhapus (baris merah). Tanpa WHERE, DELETE akan mengosongkan seluruh tabel produk.' },
  a4: { kind: 'TEST', title: 'Aktivitas 4 · Menguji peran klausa WHERE', text: 'Ikuti lembar soal di bawah. Mode uji coba selalu aktif di sini, jadi data tidak berubah permanen.' },
  fin: { kind: 'FINAL', title: 'Misi Akhir · Solusi terpadu', text: 'Kali ini kamu bekerja di database asli Kopdes. Susun rangkaian kueri yang menyelesaikan seluruh permintaan memo, lalu akhiri dengan SELECT untuk memverifikasi daftar produk Elektronik.',
    hints: ['Urutan yang aman: INSERT, UPDATE … WHERE id = 3, DELETE … WHERE id = 5, lalu SELECT verifikasi.'],
    more: "1. INSERT INTO produk VALUES (9, 'Pompa Air Listrik', 'Elektronik', 750000, 5);\n2. UPDATE produk SET harga = 9000000 WHERE id = 3;\n3. DELETE FROM produk WHERE id = 5;\n4. SELECT * FROM produk WHERE kategori = 'Elektronik';" },
};

export const MEMO_LINES = [
  ['lup', 'Kasus baru, detektif! Kali ini bukan pencurian. Senin pagi, semua harga di Gerai Elektronik Kopdes mendadak jadi Rp9.000.000.'],
  ['ratna', 'Pembeli kipas angin sampai marah-marah. Ini memo resminya. Tolong baca baik-baik sebelum menyentuh database.'],
  ['dadan', 'Maaf, Bu... Saya cuma mau mengubah harga laptop. Kok semua harga ikut berubah?'],
  ['lup', 'Tugas kelompokmu: baca memo, temukan masalah datanya, susun rencana, lalu buktikan dengan kueri. Mulai dari Aktivitas 1.'],
];

export const CAUSES = [
  ['sabotase', 'Kang Dadan sengaja menyabotase harga', 'Tidak ada bukti niat jahat. Kang Dadan justru melapor dan minta maaf.'],
  ['virus', 'Komputer kasir terkena virus', 'Log database mencatat perintah UPDATE yang diketik manual, bukan program asing.'],
  ['where', 'Perintah UPDATE dijalankan tanpa klausa WHERE', ''],
  ['server', 'Server Kopdes rusak', 'Server berjalan normal. Hanya satu perintah yang mengubah semua harga.'],
];

export const QUIZ = [
  { q: 'Blok mana yang dipakai untuk menyaring baris?', o: ['SELECT', 'WHERE', 'INSERT'], a: 1 },
  { q: 'UPDATE produk SET harga = 0; tanpa WHERE akan mengubah…', o: ['Satu baris', 'Semua baris', 'Tidak ada baris'], a: 1 },
  { q: 'Perintah untuk menambah baris baru adalah…', o: ['INSERT', 'UPDATE', 'DELETE'], a: 0 },
  { q: 'Mengapa id cocok dipakai di WHERE untuk mengubah satu produk?', o: ['Karena id unik (PRIMARY KEY)', 'Karena id berupa angka', 'Karena id kolom pertama'], a: 0 },
];

export const REFLECT_STEPS = ['Membaca masalah di memo', 'Menentukan tabel dan kolom', 'Memilih perintah DML', 'Menentukan kondisi WHERE', 'Memprediksi jumlah baris', 'Mengecek dengan SELECT dulu', 'Mencoba di mode uji coba', 'Menjalankan kueri', 'Memverifikasi hasil dengan SELECT'];

export function freshGroup() {
  return {
    done: [], xp: 0, life: 4, badges: [], combo: 0, seenMemo: false, finSolved: false, current: 'f1',
    stats: { runs: 0, ok: 0, wrong: 0, galat: 0, hints: 0, errors: {}, time: 0 },
    lk: {
      a1: { m: [['', ''], ['', ''], ['', '']], b: '', checked: false },
      a2: { rows: [0, 1, 2, 3].map(() => ({ act: '', cmd: '', why: '' })) },
      a3: { m: {}, pred: '', actual: '', explain: '' },
      a4: { A: null, B: null, mc: '', a: '', b: '' },
      a5: { seq: [], verif: '', why: [], b: '' },
      a6: { a: '', b: '', c: '' },
    },
  };
}

export const KEY_A1 = [
  'Pompa Air Listrik belum tercatat → tabel produk, baris id 9 belum ada (perlu INSERT).',
  'Harga Laptop Admin masih Rp8.500.000 → tabel produk, id 3, kolom harga (perlu UPDATE dengan WHERE).',
  'Radio Transistor masih tercatat padahal sudah tidak dijual → tabel produk, id 5 (perlu DELETE dengan WHERE).',
];
