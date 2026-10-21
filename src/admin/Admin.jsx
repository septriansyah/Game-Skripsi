import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { onAdmin, adminSignIn, adminSignOut, watchAllClasses, watchAllTeachers, watchAllGroups, ADMIN_EMAIL, MODE } from '../lib/db';
import { Lup } from '../components/Art';
import ClassView from '../teacher/ClassView';
import GroupDetail from '../teacher/GroupDetail';
import { pct, isLive, ago, currentLabel, finalScore } from '../teacher/stats';

// Halaman admin tidak ditautkan dari mana pun. Buka langsung lewat alamat .../#/admin
const MSG = { 'auth/invalid-credential': 'Email atau kata sandi salah.', 'auth/invalid-email': 'Format email tidak valid.', 'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.' };
const date = (t) => (t ? new Date(t).toLocaleDateString('id-ID') : '–');
const has = (q, ...xs) => !q || xs.some((x) => String(x ?? '').toLowerCase().includes(q));

function Login() {
  const [f, setF] = useState({ email: ADMIN_EMAIL, pw: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await adminSignIn(f.email.trim(), f.pw); } catch (x) { setErr(MSG[x.code] || x.message || 'Gagal masuk.'); } finally { setBusy(false); }
  };
  return (
    <div className="app"><div className="center-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="row" style={{ justifyContent: 'space-between' }}><Lup size={64} /><span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Terhubung Firebase' : 'Mode demo'}</span></div>
        <h2>Admin</h2>
        <label className="q"><b>Email</b><input className="inp" id="aemail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="username" /></label>
        <label className="q"><b>Kata sandi</b><input className="inp" id="apw" type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} autoComplete="current-password" autoFocus /></label>
        {err && <div className="err">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
        {MODE === 'demo' && <div className="demo-note">Mode demo: kata sandi admin <b>admin123</b>.</div>}
      </form>
    </div></div>
  );
}

function Home() {
  const nav = useNavigate();
  const [classes, setClasses] = useState(null); const [teachers, setTeachers] = useState([]); const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState('kelas'); const [q, setQ] = useState('');
  useEffect(() => watchAllClasses(setClasses), []);
  useEffect(() => watchAllTeachers(setTeachers), []);
  useEffect(() => watchAllGroups(setGroups), []);

  const byClass = useMemo(() => groups.reduce((m, g) => ((m[g.classCode] = m[g.classCode] || []).push(g), m), {}), [groups]);
  const classByCode = useMemo(() => Object.fromEntries((classes || []).map((c) => [c.code, c])), [classes]);
  const classesOf = (uid) => (classes || []).filter((c) => c.teacherUid === uid);
  if (classes === null) return <Lup size={60} />;

  const s = q.trim().toLowerCase();
  const cRows = classes.filter((c) => has(s, c.code, c.name, c.teacherName));
  const tRows = teachers.filter((t) => has(s, t.name, t.email));
  const gRows = groups.filter((g) => has(s, g.name, g.members, g.classCode, classByCode[g.classCode]?.name)).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const open = (g) => nav(`/admin/${g.classCode}/${g.id}`);

  return (
    <>
      <div className="dash-head"><div><span className="label">Admin · seluruh data KasusQL Kasus 2</span><h2>Ringkasan</h2></div></div>
      <div className="kpis">
        <div className="kpi"><span>Guru</span><b>{teachers.length}</b><small>akun terdaftar</small></div>
        <div className="kpi"><span>Kelas</span><b>{classes.length}</b><small>kode kelas</small></div>
        <div className="kpi"><span>Kelompok siswa</span><b>{groups.length}</b><small>{groups.filter(isLive).length} aktif sekarang</small></div>
        <div className="kpi"><span>Selesai sampai refleksi</span><b>{groups.filter((g) => (g.done || []).includes('f6')).length}</b><small>kelompok</small></div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="tabs2" role="tablist" style={{ marginBottom: 0 }}>
          {[['kelas', `Kelas (${classes.length})`], ['guru', `Guru (${teachers.length})`], ['kelompok', `Kelompok (${groups.length})`]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        <input className="inp" style={{ flex: '1 1 220px', maxWidth: 340 }} placeholder="Cari kode, nama, email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari" />
      </div>

      <div className="card"><div className="lk-wrap">
        {tab === 'kelas' && (
          <table className="gtable"><thead><tr><th>Kode</th><th>Kelas</th><th>Guru</th><th>Fase dibuka</th><th style={{ textAlign: 'right' }}>Kelompok</th><th style={{ textAlign: 'right' }}>Rata-rata progres</th><th>Dibuat</th></tr></thead>
            <tbody>{cRows.length === 0 ? <tr><td colSpan={7} className="muted">Tidak ada kelas.</td></tr> : cRows.map((c) => {
              const gs = byClass[c.code] || []; const avg = gs.length ? Math.round(gs.reduce((a, g) => a + pct(g), 0) / gs.length) : 0;
              return (
                <tr key={c.code} className="click" tabIndex={0} onClick={() => nav('/admin/' + c.code)} onKeyDown={(e) => e.key === 'Enter' && nav('/admin/' + c.code)}>
                  <td><code style={{ fontWeight: 800 }}>{c.code}</code></td><td><b>{c.name}</b></td><td>{c.teacherName || '–'}</td>
                  <td>1–{c.maxPhase || 1}</td><td className="num">{gs.length}</td><td className="num">{avg}%</td><td>{date(c.createdAt)}</td>
                </tr>);
            })}</tbody></table>
        )}
        {tab === 'guru' && (
          <table className="gtable"><thead><tr><th>Nama</th><th>Email</th><th>Kelas</th><th style={{ textAlign: 'right' }}>Kelompok</th><th>Daftar</th></tr></thead>
            <tbody>{tRows.length === 0 ? <tr><td colSpan={5} className="muted">Tidak ada guru.</td></tr> : tRows.map((t) => {
              const cs = classesOf(t.uid);
              return (
                <tr key={t.uid}>
                  <td><b>{t.name || '–'}</b></td><td>{t.email}</td>
                  <td>{cs.length ? cs.map((c) => <Link key={c.code} to={'/admin/' + c.code} className="chip" style={{ '--c': 'var(--night)', marginRight: 4, textDecoration: 'none' }}>{c.code} · {c.name}</Link>) : <span className="muted">–</span>}</td>
                  <td className="num">{cs.reduce((a, c) => a + (byClass[c.code] || []).length, 0)}</td><td>{date(t.createdAt)}</td>
                </tr>);
            })}</tbody></table>
        )}
        {tab === 'kelompok' && (
          <table className="gtable"><thead><tr><th>Kelompok</th><th>Kelas</th><th>Langkah</th><th style={{ textAlign: 'right' }}>Progres</th><th style={{ textAlign: 'right' }}>XP</th><th style={{ textAlign: 'right' }}>Salah</th><th style={{ textAlign: 'right' }}>Nilai</th><th>Aktivitas</th></tr></thead>
            <tbody>{gRows.length === 0 ? <tr><td colSpan={8} className="muted">Tidak ada kelompok.</td></tr> : gRows.map((g) => (
              <tr key={g.classCode + g.id} className="click" tabIndex={0} onClick={() => open(g)} onKeyDown={(e) => e.key === 'Enter' && open(g)}>
                <td><b>{g.name}</b><div className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{g.members || '–'}</div></td>
                <td><code style={{ fontWeight: 800 }}>{g.classCode}</code><div className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{classByCode[g.classCode]?.name || '–'}</div></td>
                <td style={{ fontWeight: 700, fontSize: 13.5 }}>{currentLabel(g)}</td>
                <td className="num">{pct(g)}%</td><td className="num">{g.xp || 0}</td><td className="num">{g.stats?.wrong || 0}</td><td className="num">{finalScore(g) ?? '–'}</td>
                <td style={{ whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700 }}><span className={'dot' + (isLive(g) ? ' live' : '')} />{ago(g.updatedAt)}</td>
              </tr>))}</tbody></table>
        )}
      </div></div>
    </>
  );
}

export default function Admin() {
  const [a, setA] = useState(undefined);
  useEffect(() => onAdmin(setA), []);
  if (a === undefined) return <div className="center-page"><Lup size={90} /></div>;
  if (!a) return <Login />;
  return (
    <div className="app">
      <header className="top">
        <Link className="logo" to="/admin" style={{ textDecoration: 'none' }}><span className="l"><Lup mood="senang" /></span>Kasus<b>QL</b></Link>
        <span className="chip" style={{ '--c': 'var(--blood)' }}>Admin</span>
        <span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Firebase' : 'Mode demo'}</span>
        <span style={{ fontWeight: 800 }}>{a.email}</span>
        <button className="btn ghost sm" type="button" onClick={adminSignOut}>Keluar</button>
      </header>
      <Routes>
        <Route index element={<Home />} />
        <Route path=":code" element={<ClassView base="/admin" backLabel="Admin" />} />
        <Route path=":code/:gid" element={<GroupDetail base="/admin" />} />
      </Routes>
    </div>
  );
}
