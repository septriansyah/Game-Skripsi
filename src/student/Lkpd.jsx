import React, { useState } from 'react';
import { Lup } from '../components/Art';
import { Confetti } from '../components/ui';
import LkpdView from '../components/LkpdView';
import { lkpdText } from '../game/lkpdText';
import { useGame } from './GameContext';

export default function Lkpd({ celebrate, onBack }) {
  const { g, toast } = useGame();
  const [copied, setCopied] = useState(false);
  const done = g.done.includes('f6');
  const copy = async () => { try { await navigator.clipboard.writeText(lkpdText(g)); setCopied(true); } catch { toast('Tidak bisa menyalin otomatis. Pakai tombol Unduh.', 'i-print'); } };
  const download = () => { const b = new Blob([lkpdText(g)], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'LKPD-Kasus2-' + (g.name || 'kelompok').replace(/[^\w-]+/g, '_') + '.txt'; document.body.appendChild(a); a.click(); a.remove(); };
  return (
    <div className="frame"><div className="lkpd">
      <Confetti run={celebrate} />
      <div className="lkpd-hero"><Lup mood={done ? 'menang' : 'netral'} /><div style={{ flex: 1, minWidth: 240 }}>
        <span className="label">{done ? 'Kasus 2 ditutup' : 'Buku kerja kelompok · tersimpan otomatis'}</span>
        <h2>{done ? 'Gerai Kopdes kembali normal!' : 'LKPD Kasus 2'}</h2>
        <p className="muted" style={{ fontWeight: 700 }}>{g.name}{g.members ? ' · ' + g.members : ''}</p></div>
        {done && <div className="pe"><div><b>{g.xp}</b><span>Poin</span></div><div><b>{g.badges.length}</b><span>Lencana</span></div></div>}
      </div>
      {g.grading?.note && <div className="fb"><Lup mood="senang" /><div><b>Catatan guru</b><div style={{ whiteSpace: 'pre-wrap' }}>{g.grading.note}</div></div></div>}
      <div className="row lkpd-actions">
        <button className="btn sm" type="button" onClick={copy}>{copied ? 'Tersalin!' : 'Salin semua jawaban'}</button>
        <button className="btn ghost sm" type="button" onClick={download}>Unduh (.txt)</button>
        <button className="btn ghost sm" type="button" onClick={() => window.print()}>Cetak</button>
        <span style={{ flex: 1 }} /><button className="btn ghost sm" type="button" onClick={onBack}>Kembali ke papan</button>
      </div>
      <LkpdView g={g} />
    </div></div>
  );
}
