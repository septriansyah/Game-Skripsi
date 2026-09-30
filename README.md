# KasusQL · Kasus 2 — Harga Kacau di Gerai Kopdes

Game belajar DML (INSERT, UPDATE, DELETE, SELECT) berbasis blok untuk siswa, plus **Dashboard Guru**.
Alurnya mengikuti LKPD 5 fase (sintaks PBL). Dibangun dengan **React (Vite)** dan **Firebase (Auth + Firestore)**.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Tanpa file `.env`, aplikasi berjalan dalam **mode demo**. Data disimpan di localStorage dan tersinkron antar-tab,
jadi dashboard guru bisa dibuka di satu tab dan game siswa di tab lain untuk dicoba.

## Menghubungkan ke Firebase

1. Buat proyek di https://console.firebase.google.com
2. **Authentication → Sign-in method**: aktifkan **Email/Password** (untuk guru) dan **Anonymous** (untuk kelompok siswa).
3. **Firestore Database**: buat database (mode production).
4. **Project settings → Your apps → Web app**: salin konfigurasinya ke `.env` (lihat `.env.example`).
5. Pasang aturan keamanan & hosting:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add            # pilih proyekmu
   firebase deploy --only firestore:rules
   npm run build && firebase deploy --only hosting
   ```

> Guru dan siswa sebaiknya memakai browser/profil yang berbeda. Login guru (email) dan login siswa (anonim) memakai sesi Firebase Auth yang sama di satu browser.

## Alur kelas

1. Guru mendaftar, lalu **Buat kelas** dan mendapat kode 6 huruf. Tombol **Tampilkan di proyektor** memperbesar kode.
2. Siswa membuka **Saya siswa**, lalu memasukkan kode kelas, nama kelompok, dan anggota (1 perangkat = 1 kelompok).
3. Guru membuka fase lewat **Kendali fase**. Siswa tidak bisa melewati fase yang belum dibuka.
4. Progres, jawaban LKPD, kesalahan, dan log kueri masuk ke dashboard secara langsung.
5. Guru memberi nilai per aktivitas dan catatan (catatan tampil di papan siswa), lalu **Unduh nilai (CSV)**.

| Fase | Layar siswa | LKPD |
|---|---|---|
| 1 Orientasi masalah | Memo insiden + narasi, tabel 3 masalah | Aktivitas 1 |
| 2 Menyusun rencana | Tabel rencana 4 langkah + umpan balik | Aktivitas 2 |
| 3 Penyelidikan | Misi 1–4 (SELECT, INSERT, UPDATE + prediksi, DELETE) | Aktivitas 3 |
| 3 Penyelidikan | Lembar soal uji WHERE (Kueri A/B sekali klik, pilihan ganda, kalimat pembuka) | Aktivitas 4 |
| 4 Menyajikan solusi | Misi Akhir: rangkaian kueri di database asli, dialog penyebab insiden | Aktivitas 5 |
| 5 Evaluasi & refleksi | Tiga pertanyaan refleksi + chip langkah berpikir | Aktivitas 6 |

## Struktur data Firestore

```
teachers/{uid}                    { name, email, createdAt }
classes/{code}                    { code, name, teacherUid, teacherName, maxPhase, showKey, createdAt }
classes/{code}/groups/{uid}       { uid, name, members, done[], xp, life, badges[], combo, current,
                                    seenMemo, finSolved, lk{a1..a6}, stats{runs, ok, wrong, galat, hints, errors{}},
                                    grading{a1..a6, note}, updatedAt, resetAt }
classes/{code}/groups/{uid}/events/{id}   { type: run|wrong|galat|hint|warn|cause|complete, mission, sql, aff, at }
```

Aturan di `firestore.rules`:

- Siswa (akun anonim) hanya bisa membaca dan menulis dokumen kelompoknya sendiri, dan tidak bisa mengubah `grading`.
- Guru (akun email) hanya bisa mengelola kelas miliknya.

## Nilai

- **Aktivitas 1–6:** diisi guru (0–100).
- **Misi (otomatis):** `100 − 5 × jumlah hasil salah`, minimal 40, setelah Misi Akhir selesai.
- **Nilai akhir:** rata-rata dari nilai yang sudah ada.

## Struktur kode

```
src/lib/db.js            lapisan data (Firebase / demo)
src/game/data.js         data tabel, misi, kunci, lencana
src/game/engine.js       validasi & eksekusi kueri blok (SELECT/INSERT/UPDATE/DELETE)
src/student/*            layar siswa (papan, memo, form LKPD, misi, buku kerja)
src/teacher/*            dashboard guru (kelas, kendali fase, analitik, penilaian, log)
```
