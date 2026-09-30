import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Icons, Lup } from './components/Art';
import { ToastProvider } from './components/ui';
import { MODE } from './lib/db';
import Student from './student/Student';
import Teacher from './teacher/Teacher';

function Landing() {
  return (
    <div className="app">
      <header className="top"><span className="logo"><span className="l"><Lup mood="senang" /></span>Kasus<b>QL</b></span><span className={'mode-pill' + (MODE === 'firebase' ? ' fb' : '')}>{MODE === 'firebase' ? 'Terhubung Firebase' : 'Mode demo'}</span></header>
      <div className="landing">
        <div>
          <span className="label">Kasus 2 · Manipulasi data (DML)</span>
          <h1>Harga kacau di <em>Gerai Kopdes</em>.</h1>
          <p className="lede">Satu perintah UPDATE tanpa WHERE membuat semua harga jadi Rp9.000.000. Kelompok siswa menyelidiki dan memperbaikinya dengan INSERT, UPDATE, DELETE, dan SELECT, mengikuti lima fase LKPD. Guru memantau semuanya secara langsung.</p>
          {MODE === 'demo' && <div className="demo-note" style={{ marginTop: 16 }}>Mode demo aktif: data tersimpan di browser ini dan tersinkron antar-tab. Buka dashboard guru di satu tab dan game siswa di tab lain untuk mencoba.</div>}
        </div>
        <div className="role-cards">
          <Link className="role" to="/main"><span className="ic" style={{ '--c': 'var(--lamp)' }}><Lup size={48} /></span><span><b>Saya siswa</b><span>Masuk dengan kode kelas dan nama kelompok.</span></span></Link>
          <Link className="role" to="/guru"><span className="ic" style={{ '--c': 'var(--night)' }}><svg width="40" height="40"><use href="#i-teacher" /></svg></span><span><b>Saya guru</b><span>Buat kelas, atur fase, pantau progres, beri nilai.</span></span></Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Icons />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/main" element={<Student />} />
          <Route path="/guru/*" element={<Teacher />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
