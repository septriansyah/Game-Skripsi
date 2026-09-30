import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Lup } from './Art';

/* ---------- efek suara (WebAudio, tanpa file) ---------- */
let AC;
export function sfx(type, on = true) {
  if (!on) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    const seq = { ok: [[523, 0], [659, 0.09], [784, 0.18]], bad: [[220, 0], [180, 0.12]], pop: [[660, 0]], win: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]], err: [[160, 0], [140, 0.1]] }[type] || [];
    seq.forEach(([f, d]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type === 'bad' || type === 'err' ? 'square' : 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.12, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
      o.connect(g).connect(AC.destination); o.start(t + d); o.stop(t + d + 0.2);
    });
  } catch { /* audio tidak tersedia */ }
}

/* ---------- toast ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, icon = 'i-check') => {
    const id = Math.random();
    setItems((x) => [...x, { id, msg, icon }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3100);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {items.slice(-1).map((t) => (
        <div className="toast" role="status" key={t.id}><svg><use href={'#' + t.icon} /></svg><span>{t.msg}</span></div>
      ))}
    </ToastCtx.Provider>
  );
}

/* ---------- modal ---------- */
export function Modal({ tone = 'good', children, onClose, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const f = ref.current?.querySelector('button, input, textarea, select'); f?.focus();
    const k = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="overlay">
      <div ref={ref} className={'modal ' + tone} role="dialog" aria-modal="true" style={wide ? { maxWidth: 640, textAlign: 'left' } : undefined}>{children}</div>
    </div>
  );
}
export function Galat({ err, lines, onClose }) {
  return (
    <Modal tone="err" onClose={onClose}>
      <Lup mood={err.face} className="lupi" />
      <span className="label" style={{ color: 'var(--blood)' }}>Galat · sidik jari aman</span>
      <h3>{err.title}</h3>
      <p>{err.message}</p>
      <pre>{lines.length ? lines.map((l, k) => (k === err.line ? <mark key={k}>{l + '\n'}</mark> : <span key={k}>{l + '\n'}</span>)) : '(kosong)'}</pre>
      <div className="btns"><button className="btn blood" type="button" onClick={onClose}>Perbaiki</button></div>
    </Modal>
  );
}

/* ---------- dialog gaya Windows ---------- */
export function WDialog({ title, icon = 'i-glass', small, onClose, children, footer, shake }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const drag = (e) => {
    if (e.target.closest('button') || window.matchMedia('(max-width:760px)').matches) return;
    const r = ref.current.getBoundingClientRect(); const ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev) => setPos({ x: Math.max(0, Math.min(innerWidth - r.width, ev.clientX - ox)), y: Math.max(0, Math.min(innerHeight - 40, ev.clientY - oy)) });
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  return (
    <div className="wdlg-ov">
      <div ref={ref} className={'wdlg' + (small ? ' sm' : '')} role="dialog" aria-modal="true"
        style={{ ...(pos ? { position: 'fixed', left: pos.x, top: pos.y, margin: 0 } : {}), ...(shake ? { animation: 'popshake .55s var(--ease-pop)' } : {}) }}>
        <div className="tb" onPointerDown={drag}>
          <svg className="ico"><use href={'#' + icon} /></svg><span className="t">{title}</span>
          <button type="button" tabIndex={-1} aria-label="Kecilkan">–</button><button type="button" tabIndex={-1} aria-label="Perbesar">□</button>
          <button type="button" className="x" aria-label="Tutup" onClick={onClose}>×</button>
        </div>
        <div className="bd">{children}</div>
        {footer && <div className="ft">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- jendela tabel yang bisa digeser (di dalam meja) ---------- */
export function FloatWin({ title, x, y, w, z, onFocus, onClose, children, foot, flashKey }) {
  const ref = useRef(null);
  const [p, setP] = useState({ x, y });
  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [flash, setFlash] = useState(false);
  useEffect(() => { setP({ x, y }); }, [x, y]);
  useEffect(() => { if (flashKey) { setFlash(true); const t = setTimeout(() => setFlash(false), 600); return () => clearTimeout(t); } }, [flashKey]);
  const drag = (e) => {
    if (e.target.closest('button') || window.matchMedia('(max-width:760px)').matches) return;
    const desk = ref.current.parentElement.getBoundingClientRect(); const r = ref.current.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev) => setP({ x: Math.max(0, Math.min(desk.width - r.width, ev.clientX - desk.left - ox)), y: Math.max(0, Math.min(desk.height - 40, ev.clientY - desk.top - oy)) });
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  return (
    <div ref={ref} className={'win' + (min ? ' min' : '') + (max ? ' max' : '') + (flash ? ' flash' : '')} style={{ left: p.x, top: p.y, width: w, zIndex: z }} onPointerDown={onFocus}>
      <div className="win-bar" onPointerDown={drag}>
        <span className="t">{title}</span>
        <div className="winbtns">
          <button type="button" aria-label="Kecilkan" onClick={() => setMin((m) => !m)}>–</button>
          <button type="button" aria-label="Perbesar" onClick={() => setMax((m) => !m)}>□</button>
          <button type="button" className="x" aria-label="Tutup" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="win-body">{children}</div>
      <div className="win-foot">{foot}</div>
    </div>
  );
}

export function Confetti({ run }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!run || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = ref.current; const ctx = c.getContext('2d'); const dpr = devicePixelRatio || 1;
    const W = (c.width = c.offsetWidth * dpr), H = (c.height = Math.min(c.offsetHeight, 700) * dpr);
    const cols = ['#2DB36B', '#FFC23A', '#E0474C', '#3B6FE0', '#8B5CF6', '#DB4F93'];
    const ps = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.15, vx: (Math.random() - 0.5) * 14 * dpr, vy: (-Math.random() * 10 - 3) * dpr, r: (Math.random() * 6 + 4) * dpr, c: cols[(Math.random() * 6) | 0], a: Math.random() * 6, s: (Math.random() - 0.5) * 0.3 }));
    let f = 0, raf;
    const tick = () => { ctx.clearRect(0, 0, W, H); ps.forEach((p) => { p.vy += 0.35 * dpr; p.x += p.vx; p.y += p.vy; p.a += p.s; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r / 3, p.r * 2, p.r * 0.66); ctx.restore(); }); if (++f < 200) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H); };
    tick(); return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}
