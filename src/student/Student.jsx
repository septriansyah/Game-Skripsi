import React, { useEffect, useState } from 'react';
import { studentJoin, studentResume, clearSession, MODE } from '../lib/db';
import { freshGroup } from '../game/data';
import { Lup } from '../components/Art';
import { GameProvider } from './GameContext';
import Game from './Game';
import { Link } from 'react-router-dom';

export default function Student() {
  const [sess, setSess] = useState(undefined);
  const [f, setF] = useState({ code: '', name: '', members: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { studentResume().then(setSess).catch(() => setSess(null)); }, []);
  if (sess === undefined) return <div className="center-page"><Lup size={90} /></div>;
  if (sess) return <GameProvider code={sess.code} gid={sess.gid}><Game onLeave={() => { clearSession(); setSess(null); }} /></GameProvider>;
  const join = async (e) => {
    e.preventDefault(); setErr('');
    if (f.code.trim().length < 4 || f.name.trim().length < 3) { setErr('Isi kode kelas dan nama kelompok.'); return; }
    setBusy(true);
    try { setSess(await studentJoin(f.code, f.name.trim(), f.members.trim(), freshGroup())); }
    catch (x) { setErr(x.message || 'Gagal bergabung.'); } finally { setBusy(false); }
  };
  return (
    <div className="app"><div className="center-page">
      <form className="auth-card" onSubmit={join}>
        <div className="row" style={{ justifyContent: 'space-between' }}><Lup size={64} /><span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Terhubung Firebase' : 'Mode demo'}</span></div>
        <h2>Masuk ke Kasus 2</h2>
        <p className="muted" style={{ fontWeight: 700 }}>Minta kode kelas dari guru. Satu perangkat dipakai satu kelompok.</p>
        <label className="q"><b>Kode kelas</b><input className="inp" id="code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="contoh: K7M2QX" autoComplete="off" style={{ fontFamily: 'var(--f-code)', letterSpacing: '.12em', fontSize: 20 }} /></label>
        <label className="q"><b>Nama kelompok</b><input className="inp" id="gname" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="contoh: Kelompok 3" /></label>
        <label className="q"><b>Anggota</b><input className="inp" id="gmem" value={f.members} onChange={(e) => setF({ ...f, members: e.target.value })} placeholder="pisahkan dengan koma" /></label>
        {err && <div className="err">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}>{busy ? 'Menghubungkan…' : 'Mulai penyelidikan'}</button>
        <Link to="/" className="muted" style={{ fontWeight: 800, fontSize: 14 }}>← Kembali</Link>
      </form>
    </div></div>
  );
}
