import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { watchGroup, watchClass, patchGroup, logEvent } from '../lib/db';
import { freshGroup, NODES } from '../game/data';
import { clone } from '../game/engine';
import { sfx, useToast } from '../components/ui';
import { BADGES } from '../game/data';

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export function GameProvider({ code, gid, children }) {
  const [g, setG] = useState(null);
  const [cls, setCls] = useState(undefined);
  const gRef = useRef(null);
  const timer = useRef(null);
  const toast = useToast();

  useEffect(() => watchClass(code, setCls), [code]);
  useEffect(() => watchGroup(code, gid, (remote) => {
    if (!remote) { setG(null); gRef.current = null; return; }
    const cur = gRef.current;
    // muat pertama, atau guru mereset kelompok, atau hanya nilai guru berubah
    if (!cur || (remote.resetAt || 0) > (cur.resetAt || 0)) {
      const base = { ...freshGroup(), ...remote, lk: { ...freshGroup().lk, ...(remote.lk || {}) }, stats: { ...freshGroup().stats, ...(remote.stats || {}) } };
      gRef.current = base; setG(base);
    } else if (JSON.stringify(remote.grading) !== JSON.stringify(cur.grading)) {
      const next = { ...cur, grading: remote.grading }; gRef.current = next; setG(next);
    }
  }), [code, gid]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const cur = gRef.current; if (!cur) return;
    const { grading, id, ...rest } = cur; // eslint-disable-line no-unused-vars
    patchGroup(code, gid, { ...rest, updatedAt: Date.now() }).catch(() => toast('Gagal menyimpan. Periksa koneksi.', 'i-print'));
  }, [code, gid, toast]);

  const update = useCallback((fn, now) => {
    const next = clone(gRef.current); fn(next); gRef.current = next; setG(next);
    clearTimeout(timer.current); timer.current = setTimeout(flush, now ? 0 : 700);
  }, [flush]);
  useEffect(() => () => { clearTimeout(timer.current); }, []);
  useEffect(() => { const h = () => flush(); window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [flush]);

  const log = useCallback((ev) => { logEvent(code, gid, ev).catch(() => {}); }, [code, gid]);
  const sound = useCallback((t) => sfx(t, gRef.current?.sfx !== false), []);

  const api = useMemo(() => ({
    code, gid, g, cls, update, log, toast, sound, flush,
    maxPhase: cls?.maxPhase || 1,
    showKey: !!cls?.showKey,
    addXP(n) { update((d) => { d.xp += n; }); },
    award(id) {
      if (gRef.current.badges.includes(id)) return;
      update((d) => { d.badges.push(id); }, true);
      const b = BADGES.find((x) => x.id === id); setTimeout(() => toast('Lencana baru: ' + b.name, 'i-star'), 400);
    },
    loseLife() { update((d) => { d.life = Math.max(0, d.life - 1); d.stats.wrong++; }, true); },
    complete(id, xp = 0) {
      update((d) => { if (!d.done.includes(id)) { d.done.push(id); d.xp += xp; } const nx = NODES.find((n) => !d.done.includes(n.id)); d.current = nx ? nx.id : 'selesai'; }, true);
      log({ type: 'complete', node: id });
    },
  }), [code, gid, g, cls, update, log, toast, sound, flush]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
