import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherSignIn, teacherSignUp, MODE } from '../lib/db';
import { Lup } from '../components/Art';

const MSG = { 'auth/invalid-credential': 'Email atau kata sandi salah.', 'auth/email-already-in-use': 'Email sudah terdaftar.', 'auth/weak-password': 'Kata sandi minimal 6 karakter.', 'auth/invalid-email': 'Format email tidak valid.' };
export default function Login() {
  const [tab, setTab] = useState('in');
  const [f, setF] = useState({ name: '', email: '', pw: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (tab === 'up') { if (f.name.trim().length < 3) throw new Error('Isi nama lengkap.'); if (f.pw.length < 6) throw new Error('Kata sandi minimal 6 karakter.'); await teacherSignUp(f.name.trim(), f.email.trim(), f.pw); }
      else await teacherSignIn(f.email.trim(), f.pw);
    } catch (x) { setErr(MSG[x.code] || x.message || 'Gagal masuk.'); } finally { setBusy(false); }
  };
  return (
    <div className="app"><div className="center-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="row" style={{ justifyContent: 'space-between' }}><Lup size={64} /><span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Terhubung Firebase' : 'Mode demo'}</span></div>
        <h2>Dashboard Guru</h2>
        <div className="tabs2" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'in'} onClick={() => setTab('in')}>Masuk</button>
          <button type="button" role="tab" aria-selected={tab === 'up'} onClick={() => setTab('up')}>Daftar akun guru</button>
        </div>
        {tab === 'up' && <label className="q"><b>Nama lengkap</b><input className="inp" id="tname" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>}
        <label className="q"><b>Email</b><input className="inp" id="temail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></label>
        <label className="q"><b>Kata sandi</b><input className="inp" id="tpw" type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} autoComplete={tab === 'up' ? 'new-password' : 'current-password'} /></label>
        {err && <div className="err">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}>{busy ? 'Memproses…' : tab === 'up' ? 'Buat akun' : 'Masuk'}</button>
        {MODE === 'demo' && <div className="demo-note">Mode demo: akun & data hanya tersimpan di browser ini. Isi file .env dengan konfigurasi Firebase untuk dipakai satu kelas.</div>}
        <Link to="/" className="muted" style={{ fontWeight: 800, fontSize: 14 }}>← Kembali</Link>
      </form>
    </div></div>
  );
}
