import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { NODES, PHASES, BADGES } from '../game/data';
import { Lup } from '../components/Art';
import { useGame } from './GameContext';
import Brief from './Brief';
import { FormA1, FormA2, FormA5, FormA6 } from './Forms';
import Mission from './Mission';
import Lkpd from './Lkpd';
import Rest from './Rest';

function Hud({ onHome, onLeave }) {
  const { g, cls } = useGame();
  return (
    <header className="top">
      <button className="logo" type="button" onClick={onHome}><span className="l"><Lup mood="senang" /></span>Kasus<b>QL</b></button>
      <span className="chip" style={{ '--c': 'var(--night)' }}>{cls?.name || 'Kelas'} · {g.name}</span>
      <div className="hud">
        <span className="stat" title="XP"><svg><use href="#i-star" /></svg><span>{g.xp}</span></span>
        <span className="stat" title="Lencana"><span style={{ width: 20, height: 20, borderRadius: 6, background: '#0F9E9E', display: 'grid', placeItems: 'center' }}><svg style={{ width: 14, height: 14 }}><use href="#i-badge" /></svg></span><span>{g.badges.length}</span></span>
        <span className={'stat'} title="Sidik jari (nyawa)"><svg><use href="#i-print" /></svg><span>{g.life}</span></span>
      </div>
      <button className="btn ghost sm" type="button" onClick={onLeave}>Keluar</button>
    </header>
  );
}

function Board({ open }) {
  const { g, cls, maxPhase } = useGame();
  const boardRef = useRef(null); const [path, setPath] = useState('');
  const next = (NODES.find((n) => !g.done.includes(n.id)) || {}).id;
  useLayoutEffect(() => {
    const draw = () => {
      const b = boardRef.current; if (!b) return; const br = b.getBoundingClientRect();
      const pts = [...b.querySelectorAll('.pin')].map((p) => { const r = p.getBoundingClientRect(); return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2]; });
      let d = ''; for (let k = 0; k < pts.length - 1; k++) { const [a, c] = [pts[k], pts[k + 1]]; d += `M${a[0]},${a[1]} Q${(a[0] + c[0]) / 2},${(a[1] + c[1]) / 2 + 18} ${c[0]},${c[1]} `; }
      setPath(d);
    };
    draw(); addEventListener('resize', draw); const t = setTimeout(draw, 300);
    return () => { removeEventListener('resize', draw); clearTimeout(t); };
  }, [g.done.length, maxPhase]);
  return (
    <div className="map">
      <div className="board" ref={boardRef}>
        <svg className="strings" aria-hidden="true"><path d={path} stroke="var(--string)" strokeWidth="3" fill="none" /></svg>
        <div className="unit-head">
          <div className="grow">
            <span className="label">Kasus 2 · Manipulasi data (DML)</span>
            <h2>Harga Kacau di Gerai Kopdes</h2>
            <p>Semua harga di gerai elektronik mendadak jadi Rp9.000.000. Kerjakan 5 fase: membaca masalah, rencana, penyelidikan, solusi, dan refleksi.</p>
            <div className="row" style={{ marginTop: 10 }}><button className="btn lamp sm" type="button" onClick={() => open('lkpd')}>Buku kerja kelompok (LKPD)</button></div>
          </div>
          <div style={{ minWidth: 160, flex: 1, maxWidth: 240 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontWeight: 900, fontSize: 14 }}><span>Progres</span><span>{g.done.length}/9</span></div>
            <div className="prog" style={{ background: 'rgba(255,255,255,.18)', marginTop: 6 }}><i style={{ '--c': 'var(--lamp)', width: `${(g.done.length / 9) * 100}%` }} /></div>
            <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 800, color: '#DDE2FA' }}>Dibuka guru: Fase 1–{maxPhase}</div>
          </div>
        </div>
        <div className="path">
          {NODES.map((n) => {
            const done = g.done.includes(n.id), cur = n.id === next, gated = !done && n.phase > maxPhase, lock = (!done && !cur) || gated;
            const ic = done ? 'i-check' : gated ? 'i-lock' : n.boss ? 'i-skull' : cur ? 'i-glass' : 'i-lock';
            return (
              <div className="node" key={n.id}>
                <button className={'pin ' + (n.boss ? 'boss ' : '') + (cur && !gated ? 'cur' : lock ? 'lock' : '')} type="button"
                  aria-label={`Fase ${n.phase}: ${n.title}${done ? ' (selesai)' : gated ? ' (menunggu guru)' : lock ? ' (terkunci)' : ''}`}
                  onClick={() => open(n.id, { gated, lock })}><svg><use href={'#' + ic} /></svg></button>
                <span className="node-name">{n.title}<small>Fase {n.phase} · {gated ? 'menunggu guru' : n.sub}</small></span>
              </div>
            );
          })}
        </div>
      </div>
      <aside className="side-col">
        <div className="card">
          <h3>{g.name}</h3>
          <span className="muted" style={{ fontWeight: 700, fontSize: 14 }}>{g.members || 'Anggota belum diisi'}</span>
          <div className="bars" style={{ marginTop: 4 }}>
            {PHASES.map((p) => { const ns = NODES.filter((n) => n.phase === p.n); const d = ns.filter((n) => g.done.includes(n.id)).length;
              return <div className="bar-row" key={p.n} style={{ gridTemplateColumns: '110px 1fr 36px' }} title={`${d} dari ${ns.length} langkah selesai`}><span>Fase {p.n}</span><div className="track"><div className="fill" style={{ width: `${(d / ns.length) * 100}%`, '--c': p.n <= maxPhase ? 'var(--clue)' : 'var(--locked)' }} /></div><span className="v">{d}/{ns.length}</span></div>; })}
          </div>
        </div>
        {g.grading?.note && <div className="card" style={{ borderColor: 'var(--clue)' }}><h3>Catatan guru</h3><p style={{ whiteSpace: 'pre-wrap', fontWeight: 700 }}>{g.grading.note}</p></div>}
        <div className="card">
          <h3>Lencana</h3>
          <div className="badges">{BADGES.map((b) => <div key={b.id} className={'bdg' + (g.badges.includes(b.id) ? '' : ' off')} style={{ '--c': b.c, '--d': b.d }} title={b.desc}><div className="m"><svg><use href="#i-badge" /></svg></div>{b.name}</div>)}</div>
        </div>
        {cls?.showKey && <div className="demo-note">Guru mengizinkan tombol "Lihat jawaban" setelah 2 kali salah di satu misi.</div>}
      </aside>
    </div>
  );
}

export default function Game({ onLeave }) {
  const { g, cls, toast, sound, flush, update } = useGame();
  const [screen, setScreen] = useState({ s: 'board' });
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);
  if (cls === null) return <div className="center-page"><div className="auth-card"><h2>Kelas tidak ditemukan</h2><p>Kelas ini sudah dihapus guru.</p><button className="btn" type="button" onClick={onLeave}>Kembali</button></div></div>;
  if (!g || cls === undefined) return <div className="center-page"><Lup size={90} /></div>;

  const open = (id, info = {}) => {
    if (id === 'lkpd') { setScreen({ s: 'lkpd', celebrate: !!info.celebrate }); return; }
    if (id === 'rest') { setScreen({ s: 'rest' }); return; }
    const node = NODES.find((n) => n.id === id);
    if (node && node.phase > (cls.maxPhase || 1) && !g.done.includes(id)) { toast(`Fase ${node.phase} belum dibuka guru. Tunggu aba-aba ya.`, 'i-lock'); sound('err'); return; }
    if (info.lock && !info.gated) { toast('Selesaikan langkah sebelumnya dulu.', 'i-lock'); sound('err'); return; }
    if (id === 'f1') { setScreen({ s: g.seenMemo ? 'f1' : 'brief' }); return; }
    if (id === 'f2' || id === 'f6' || id === 'f5') { setScreen({ s: id }); return; }
    if (id === 'fin' && g.finSolved) { setScreen({ s: 'f5' }); return; }
    if (g.life <= 0) { setScreen({ s: 'rest' }); return; }
    setScreen({ s: 'mis', id, k: Date.now() });
  };
  const nav = { onExit: () => { flush(); setScreen({ s: 'board' }); }, onBook: () => setScreen({ s: 'lkpd' }), open };
  let body;
  switch (screen.s) {
    case 'brief': body = <Brief onExit={nav.onExit} onDone={() => { update((d) => { d.seenMemo = true; }, true); setScreen({ s: 'f1' }); }} />; break;
    case 'f1': body = <FormA1 nav={nav} />; break;
    case 'f2': body = <FormA2 nav={nav} />; break;
    case 'f5': body = <FormA5 nav={nav} />; break;
    case 'f6': body = <FormA6 nav={nav} />; break;
    case 'mis': body = <Mission key={screen.k} id={screen.id} nav={nav} />; break;
    case 'lkpd': body = <Lkpd celebrate={screen.celebrate} onBack={nav.onExit} />; break;
    case 'rest': body = <Rest onBack={nav.onExit} />; break;
    default: body = <Board open={open} />;
  }
  return <div className="app"><Hud onHome={nav.onExit} onLeave={onLeave} />{body}</div>;
}
