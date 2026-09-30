import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { onTeacher, teacherSignOut, watchMyClasses, createClass, MODE } from '../lib/db';
import { Lup } from '../components/Art';
import Login from './Login';
import ClassView from './ClassView';
import GroupDetail from './GroupDetail';

function Classes({ t }) {
  const [list, setList] = useState(null); const [name, setName] = useState(''); const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => watchMyClasses(t.uid, setList), [t.uid]);
  const make = async (e) => { e.preventDefault(); if (name.trim().length < 2) return; setBusy(true); try { const code = await createClass(t, name.trim()); setName(''); nav('/guru/' + code); } finally { setBusy(false); } };
  return (
    <>
      <div className="dash-head"><div><span className="label">Dashboard guru · Kasus 2 (DML)</span><h2>Kelas saya</h2></div></div>
      <form className="card" onSubmit={make} style={{ marginBottom: 18 }}>
        <b style={{ fontWeight: 900 }}>Buat kelas baru</b>
        <div className="row"><input className="inp" id="cname" style={{ flex: 1, minWidth: 200 }} placeholder="contoh: XI RPL 2 · Basis Data" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn" type="submit" disabled={busy}>Buat kelas</button></div>
        <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Setelah dibuat, bagikan kode kelas ke siswa. Mereka masuk lewat menu "Saya siswa".</span>
      </form>
      {list === null ? <Lup size={60} /> : list.length === 0 ? <p className="muted" style={{ fontWeight: 700 }}>Belum ada kelas.</p> : (
        <div className="class-list">{list.map((c) => (
          <button key={c.code} type="button" className="class-card" onClick={() => nav('/guru/' + c.code)}>
            <span className="label">Kasus 2 · Fase dibuka 1–{c.maxPhase || 1}</span><b>{c.name}</b><code>{c.code}</code>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>Dibuat {new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
          </button>))}</div>
      )}
    </>
  );
}

export default function Teacher() {
  const [t, setT] = useState(undefined);
  useEffect(() => onTeacher(setT), []);
  if (t === undefined) return <div className="center-page"><Lup size={90} /></div>;
  if (!t) return <Login />;
  return (
    <div className="app">
      <header className="top">
        <Link className="logo" to="/guru" style={{ textDecoration: 'none' }}><span className="l"><Lup mood="senang" /></span>Kasus<b>QL</b></Link>
        <span className="chip" style={{ '--c': 'var(--night)' }}>Dashboard guru</span>
        <span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Firebase' : 'Mode demo'}</span>
        <span style={{ fontWeight: 800 }}>{t.name}</span>
        <button className="btn ghost sm" type="button" onClick={teacherSignOut}>Keluar</button>
      </header>
      <Routes>
        <Route index element={<Classes t={t} />} />
        <Route path=":code" element={<ClassView t={t} />} />
        <Route path=":code/:gid" element={<GroupDetail />} />
      </Routes>
    </div>
  );
}
