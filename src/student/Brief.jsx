import React, { useEffect, useRef, useState } from 'react';
import Memo from './Memo';
import { Avatar, PEOPLE } from '../components/Art';
import { MEMO_LINES } from '../game/data';
import { useGame } from './GameContext';

function speak(t, on) {
  if (!on) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; const v = speechSynthesis.getVoices().find((x) => /^id/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch { /* */ }
}

export default function Brief({ onDone, onExit }) {
  const { g, update } = useGame();
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState('');
  const typing = useRef(null);
  const voice = !!g.voice;
  const [who, text] = MEMO_LINES[step];

  useEffect(() => {
    clearInterval(typing.current);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(text); return; }
    let i = 0; setShown('');
    typing.current = setInterval(() => { i += 2; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(typing.current); }, 22);
    speak(text, voice);
    return () => clearInterval(typing.current);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { try { speechSynthesis.cancel(); } catch { /* */ } }, []);

  const last = step === MEMO_LINES.length - 1;
  const next = () => {
    if (shown.length < text.length) { clearInterval(typing.current); setShown(text); return; }
    if (!last) setStep(step + 1); else onDone();
  };
  return (
    <div className="frame">
      <div className="frame-bar"><span className="ttl"><span className="chip" style={{ '--c': '#DB4F93' }}>Kasus 2 · Fase 1</span>Harga Kacau di Gerai Kopdes</span><button className="x-btn" type="button" onClick={onExit} aria-label="Kembali ke papan">×</button></div>
      <div className="brief">
        <div className="memo-wrap"><Memo /></div>
        <div className="side">
          <div className="narr">
            <div className="speaker"><div className="ava"><Avatar who={who} /></div><div><b>{PEOPLE[who].name}</b><small>{PEOPLE[who].role}</small></div></div>
            <p className="say" aria-live="polite">{shown}{shown.length < text.length && <span className="caret" />}</p>
            <div className="dots">{MEMO_LINES.map((_, i) => <i key={i} className={i < step ? 'done' : i === step ? 'on' : ''} />)}</div>
            <div className="narr-ctrl">
              <button className="voice" type="button" aria-pressed={voice} onClick={() => { update((d) => { d.voice = !voice; }); if (!voice) speak(text, true); else try { speechSynthesis.cancel(); } catch { /* */ } }}><svg><use href="#i-speaker" /></svg>Suara narasi</button>
              <button className="voice" type="button" onClick={onDone}>Lewati</button>
            </div>
          </div>
          <button className="btn block" type="button" onClick={next}>{last ? 'Mulai Aktivitas 1' : 'Lanjut'}</button>
        </div>
      </div>
    </div>
  );
}
