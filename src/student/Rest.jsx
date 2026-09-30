import React, { useState } from 'react';
import { Lup } from '../components/Art';
import { QUIZ } from '../game/data';
import { useGame } from './GameContext';

export default function Rest({ onBack }) {
  const { g, update, sound } = useGame();
  const [q, setQ] = useState(null);
  const [res, setRes] = useState(null);
  const answer = (i) => {
    if (i === q.a) { setRes({ i, ok: true }); sound('ok'); update((d) => { d.life = Math.min(4, d.life + 1); }, true); setTimeout(() => { setQ(null); setRes(null); }, 800); }
    else { setRes({ i, ok: false }); sound('bad'); }
  };
  return (
    <div className="frame"><div className="rest">
      <Lup mood={g.life > 0 ? 'senang' : 'lelah'} className="lupbig" />
      <h2>{g.life > 0 ? 'Sidik jari terisi!' : 'Sidik jari habis'}</h2>
      <div className="prints">{[0, 1, 2, 3].map((i) => <svg key={i} className={i < g.life ? '' : 'gone'}><use href="#i-print" /></svg>)}</div>
      <p className="muted" style={{ fontWeight: 700, maxWidth: '52ch' }}>{g.life > 0 ? 'Kamu bisa lanjut menyelidiki.' : 'Jawab satu soal SQL dengan benar untuk mendapat 1 sidik jari. Ulangi sampai sidik jarimu cukup.'}</p>
      {g.life < 4 && !q && <button className="btn" type="button" onClick={() => setQ(QUIZ[(Math.random() * QUIZ.length) | 0])}>Latihan singkat (+1 sidik jari)</button>}
      {q && (
        <div className="quiz">
          <b style={{ fontWeight: 900 }}>{q.q}</b>
          {q.o.map((o, i) => <button key={i} type="button" className={'opt' + (res?.i === i ? (res.ok ? ' right' : ' wrong') : '')} onClick={() => answer(i)}><kbd>{'ABC'[i]}</kbd>{o}</button>)}
        </div>
      )}
      <button className="btn ghost" type="button" onClick={onBack}>Kembali ke papan</button>
    </div></div>
  );
}
