import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { watchGroup, watchEvents, patchGroup, deleteGroup } from '../lib/db';
import { freshGroup, NODES, BADGES } from '../game/data';
import LkpdView from '../components/LkpdView';
import { Lup } from '../components/Art';
import { ACT_KEYS, autoMisi, finalScore, pct, currentLabel, ago } from './stats';

const KIND = { run: ['Jalankan', 'ok'], wrong: ['Salah', 'bad'], galat: ['Galat', 'gal'], complete: ['Selesai', 'ok'], hint: ['Lihat jawaban', 'gal'], warn: ['Abaikan peringatan', 'bad'], cause: ['Laporan', 'ok'] };

export default function GroupDetail() {
  const { code, gid } = useParams(); const nav = useNavigate();
  const [g, setG] = useState(undefined); const [ev, setEv] = useState([]); const [tab, setTab] = useState('lkpd');
  const [gr, setGr] = useState(null); const [saved, setSaved] = useState(false); const [sure, setSure] = useState('');
  useEffect(() => watchGroup(code, gid, (x) => { setG(x); setGr((cur) => cur || { ...(x?.grading || {}) }); }), [code, gid]);
  useEffect(() => watchEvents(code, gid, setEv), [code, gid]);
  if (g === undefined) return <Lup size={60} />;
  if (!g) return <p>Kelompok tidak ditemukan. <Link to={'/guru/' + code}>Kembali</Link></p>;
  const full = { ...freshGroup(), ...g, lk: { ...freshGroup().lk, ...(g.lk || {}) } };
  const save = async () => { await patchGroup(code, gid, { grading: gr }); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const reset = async () => { if (sure !== 'reset') { setSure('reset'); return; } await patchGroup(code, gid, { ...freshGroup(), grading: {}, resetAt: Date.now(), updatedAt: Date.now() }); setSure(''); setGr({}); };
  const remove = async () => { if (sure !== 'del') { setSure('del'); return; } await deleteGroup(code, gid); nav('/guru/' + code); };
  const fs = finalScore({ ...full, grading: gr });

  return (
    <>
      <div className="dash-head">
        <div><Link to={'/guru/' + code} className="muted" style={{ fontWeight: 800, fontSize: 14 }}>← Kembali ke kelas</Link>
          <span className="label" style={{ display: 'block', marginTop: 6 }}>{currentLabel(full)} · aktif {ago(g.updatedAt)}</span><h2>{g.name}</h2>
          <span className="muted" style={{ fontWeight: 700 }}>{g.members || '–'}</span></div>
        <div className="pe"><div><b>{pct(full)}%</b><span>Progres</span></div><div><b>{full.xp}</b><span>XP</span></div><div><b>{full.stats?.wrong || 0}</b><span>Salah</span></div><div><b>{fs ?? '–'}</b><span>Nilai akhir</span></div></div>
      </div>
      <div className="row" style={{ marginBottom: 14, gap: 6 }}>
        {NODES.map((n) => <span key={n.id} className="chip" style={{ '--c': full.done.includes(n.id) ? 'var(--clue)' : 'var(--locked)', '--t': full.done.includes(n.id) ? '#fff' : 'var(--ink-soft)' }}>{n.title}</span>)}
      </div>
      <div className="tabs2" role="tablist">
        {[['lkpd', 'Jawaban LKPD'], ['nilai', 'Penilaian'], ['log', `Log aktivitas (${ev.length})`]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === 'lkpd' && <div className="frame"><div className="lkpd"><LkpdView g={full} /></div></div>}

      {tab === 'nilai' && gr && (
        <div className="dash-grid">
          <div className="card">
            <b style={{ fontWeight: 900 }}>Nilai per aktivitas (0–100)</b>
            {ACT_KEYS.map(([k, l]) => (
              <label className="grade" key={k}><span style={{ fontWeight: 800 }}>{l}</span>
                <input className="inp" type="number" min="0" max="100" value={gr[k] ?? ''} onChange={(e) => setGr({ ...gr, [k]: e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value))) })} /></label>))}
            <div className="grade"><span style={{ fontWeight: 800 }}>Misi 1–4 & Misi Akhir <small className="muted">(otomatis: 100 − 5 × salah)</small></span><input className="inp" readOnly value={autoMisi(full) ?? 'belum selesai'} /></div>
            <label className="q"><b>Catatan untuk kelompok</b><span>Catatan ini tampil di papan dan buku kerja siswa.</span><textarea className="ta" rows={4} value={gr.note || ''} onChange={(e) => setGr({ ...gr, note: e.target.value })} /></label>
            <div className="row"><button className="btn" type="button" onClick={save}>{saved ? 'Tersimpan ✓' : 'Simpan nilai'}</button><span style={{ fontWeight: 900 }}>Nilai akhir: {fs ?? '–'}</span></div>
          </div>
          <div className="card">
            <b style={{ fontWeight: 900 }}>Ringkasan</b>
            <div className="bars">
              {Object.entries(full.stats?.errors || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div className="bar-row" key={k} title={`${k}: ${v}×`}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span><div className="track"><div className="fill" style={{ width: `${(v / Math.max(...Object.values(full.stats.errors))) * 100}%`, '--c': '#E0474C' }} /></div><span className="v">{v}×</span></div>)}
              {!Object.keys(full.stats?.errors || {}).length && <span className="muted" style={{ fontWeight: 700 }}>Tidak ada kesalahan tercatat.</span>}
            </div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Prediksi Misi 3: {full.lk.a3.pred || '–'} · aktual {full.lk.a3.actual || '–'}</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Lencana: {full.badges.map((id) => BADGES.find((b) => b.id === id)?.name).filter(Boolean).join(', ') || '–'}</span>
            <hr style={{ border: 0, borderTop: '2px dashed var(--line)', width: '100%' }} />
            <b style={{ fontWeight: 900 }}>Kelola kelompok</b>
            <div className="row">
              <button className="btn ghost sm" type="button" onClick={reset}>{sure === 'reset' ? 'Yakin reset? Ketuk lagi' : 'Reset progres kelompok'}</button>
              <button className={'btn sm ' + (sure === 'del' ? 'blood' : 'ghost')} type="button" onClick={remove}>{sure === 'del' ? 'Yakin hapus? Ketuk lagi' : 'Hapus kelompok'}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="card"><div className="timeline">
          {ev.length === 0 && <span className="muted" style={{ fontWeight: 700 }}>Belum ada aktivitas.</span>}
          {ev.map((e, i) => { const [lbl, cls] = KIND[e.type] || [e.type, '']; return (
            <div className="tl" key={i}><span className="t">{new Date(e.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span><span className={'k ' + cls}>{lbl}</span>
              <div><b>{NODES.find((n) => n.id === (e.mission || e.node))?.title || e.mission || e.node || ''}</b>{e.title ? ` · ${e.title}` : ''}{e.reason ? ` · ${e.reason}` : ''}{e.aff !== undefined ? ` · ${e.aff} baris` : ''}{e.sandbox ? ' · uji coba' : ''}{e.type === 'cause' ? ` · pilih "${e.pick}" ${e.ok ? '✓' : '✗'}` : ''}{e.sql && <code>{e.sql}</code>}</div></div>); })}
        </div></div>
      )}
    </>
  );
}
