import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { watchClass, watchGroups, updateClass } from '../lib/db';
import { NODES, PHASES } from '../game/data';
import { Lup } from '../components/Art';
import { Modal } from '../components/ui';
import { pct, isLive, ago, currentLabel, finalScore, toCSV } from './stats';

function Bars({ rows, color = '#3B6FE0', max, suffix = '' }) {
  const m = max || Math.max(1, ...rows.map((r) => r.v));
  return <div className="bars">{rows.map((r) => (
    <div className="bar-row" key={r.label} title={`${r.label}: ${r.v}${suffix}`}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
      <div className="track"><div className="fill" style={{ width: `${(r.v / m) * 100}%`, '--c': r.c || color }} /></div>
      <span className="v">{r.v}{suffix}</span>
    </div>))}</div>;
}

export default function ClassView() {
  const { code } = useParams(); const nav = useNavigate();
  const [cls, setCls] = useState(undefined); const [groups, setGroups] = useState([]);
  const [proj, setProj] = useState(false); const [, tick] = useState(0);
  useEffect(() => watchClass(code, setCls), [code]);
  useEffect(() => watchGroups(code, setGroups), [code]);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(i); }, []);

  const s = useMemo(() => {
    const n = groups.length;
    const avg = n ? Math.round(groups.reduce((a, g) => a + pct(g), 0) / n) : 0;
    const fin = groups.filter((g) => (g.done || []).includes('f6')).length;
    const wrong = groups.reduce((a, g) => a + (g.stats?.wrong || 0), 0);
    const galat = groups.reduce((a, g) => a + (g.stats?.galat || 0), 0);
    const steps = NODES.map((nd) => ({ label: nd.title, v: groups.filter((g) => (g.done || []).includes(nd.id)).length }));
    const err = {}; groups.forEach((g) => Object.entries(g.stats?.errors || {}).forEach(([k, v]) => { err[k] = (err[k] || 0) + v; }));
    const errs = Object.entries(err).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, v]) => ({ label, v }));
    const predDone = groups.filter((g) => g.lk?.a3?.actual);
    const predOk = predDone.filter((g) => String(g.lk.a3.pred).trim() === String(g.lk.a3.actual)).length;
    const help = groups.filter((g) => g.life === 0 || (g.stats?.wrong || 0) >= 6);
    return { n, avg, fin, wrong, galat, steps, errs, predDone: predDone.length, predOk, help };
  }, [groups]);

  if (cls === undefined) return <Lup size={60} />;
  if (cls === null) return <p>Kelas tidak ditemukan. <Link to="/guru">Kembali</Link></p>;
  const exportCSV = () => { const b = new Blob([toCSV(cls, groups)], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Nilai-Kasus2-${cls.name.replace(/[^\w-]+/g, '_')}.csv`; document.body.appendChild(a); a.click(); a.remove(); };
  const sorted = [...groups].sort((a, b) => pct(b) - pct(a) || (a.name || '').localeCompare(b.name || ''));

  return (
    <>
      <div className="dash-head">
        <div><Link to="/guru" className="muted" style={{ fontWeight: 800, fontSize: 14 }}>← Kelas saya</Link><span className="label" style={{ display: 'block', marginTop: 6 }}>Kasus 2 · Harga Kacau di Gerai Kopdes</span><h2>{cls.name}</h2></div>
        <div className="row"><div className="code-big" aria-label="Kode kelas">{cls.code}</div><button className="btn ghost sm" type="button" onClick={() => setProj(true)}>Tampilkan di proyektor</button><button className="btn sm" type="button" onClick={exportCSV} disabled={!groups.length}>Unduh nilai (CSV)</button></div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><b style={{ fontWeight: 900 }}>Kendali fase (sintaks PBL)</b><span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Siswa hanya bisa mengerjakan sampai fase yang dibuka.</span></div>
        <div className="pace">{PHASES.map((p) => (
          <button key={p.n} type="button" className={(p.n <= (cls.maxPhase || 1) ? 'on' : '') + (p.n === (cls.maxPhase || 1) ? ' cur' : '')} aria-pressed={p.n <= (cls.maxPhase || 1)} onClick={() => updateClass(code, { maxPhase: p.n })}>
            <b>Fase {p.n}</b><small>{p.name} · {p.act}</small></button>))}</div>
        <label className="row" style={{ gap: 10, fontWeight: 800, fontSize: 14 }}>
          <button className="switch" type="button" role="switch" aria-checked={!!cls.showKey} aria-label="Izinkan lihat jawaban" onClick={() => updateClass(code, { showKey: !cls.showKey })} />
          Izinkan tombol "Lihat jawaban" setelah 2 kali salah di satu misi
        </label>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Kelompok</span><b>{s.n}</b><small>{groups.filter(isLive).length} aktif sekarang</small></div>
        <div className="kpi"><span>Rata-rata progres</span><b>{s.avg}%</b><small>dari 9 langkah</small></div>
        <div className="kpi"><span>Selesai sampai refleksi</span><b>{s.fin}</b><small>kelompok</small></div>
        <div className="kpi"><span>Hasil salah · galat</span><b>{s.wrong} · {s.galat}</b><small>total kelas</small></div>
      </div>

      <div className="dash-grid">
        <div className="card"><b style={{ fontWeight: 900 }}>Kelompok yang menyelesaikan tiap langkah</b><Bars rows={s.steps} max={Math.max(1, s.n)} color="#2DB36B" /></div>
        <div className="card"><b style={{ fontWeight: 900 }}>Kesalahan paling sering</b>
          {s.errs.length ? <Bars rows={s.errs} color="#E0474C" suffix="×" /> : <span className="muted" style={{ fontWeight: 700 }}>Belum ada kesalahan tercatat.</span>}
          <div className="row" style={{ gap: 16, marginTop: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Prediksi Misi 3 tepat: {s.predOk}/{s.predDone}</span>
            {s.help.length > 0 && <span className="chip" style={{ '--c': 'var(--blood)' }}>Perlu bantuan: {s.help.map((g) => g.name).join(', ')}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}><b style={{ fontWeight: 900 }}>Kelompok ({groups.length})</b><span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Data diperbarui langsung. Klik baris untuk melihat LKPD dan memberi nilai.</span></div>
        {groups.length === 0 ? <p className="muted" style={{ fontWeight: 700 }}>Belum ada kelompok. Minta siswa membuka menu "Saya siswa" lalu memasukkan kode <b>{cls.code}</b>.</p> : (
          <div className="lk-wrap"><table className="gtable"><thead><tr><th>Kelompok</th><th>Langkah</th><th>Progres</th><th style={{ textAlign: 'right' }}>XP</th><th style={{ textAlign: 'right' }}>Sidik jari</th><th style={{ textAlign: 'right' }}>Salah</th><th style={{ textAlign: 'right' }}>Nilai</th><th>Aktivitas</th></tr></thead>
            <tbody>{sorted.map((g) => (
              <tr key={g.id} className="click" onClick={() => nav(`/guru/${code}/${g.id}`)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && nav(`/guru/${code}/${g.id}`)}>
                <td><b>{g.name}</b><div className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{g.members || '–'}</div></td>
                <td style={{ fontWeight: 700, fontSize: 13.5 }}>{currentLabel(g)}</td>
                <td><div className="steps9" title={`${(g.done || []).length}/9 langkah`}>{NODES.map((n) => <i key={n.id} className={(g.done || []).includes(n.id) ? 'd' : g.current === n.id ? 'c' : ''} />)}</div></td>
                <td className="num">{g.xp || 0}</td>
                <td className="num" style={{ color: g.life === 0 ? 'var(--blood)' : undefined }}>{g.life ?? 4}</td>
                <td className="num">{g.stats?.wrong || 0}</td>
                <td className="num">{finalScore(g) ?? '–'}</td>
                <td style={{ whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700 }}><span className={'dot' + (isLive(g) ? ' live' : '')} />{ago(g.updatedAt)}</td>
              </tr>))}</tbody></table></div>
        )}
      </div>

      {proj && (
        <Modal tone="info" onClose={() => setProj(false)}>
          <span className="label">Masuk ke Kasus 2 · menu "Saya siswa"</span>
          <div style={{ font: '800 clamp(56px,12vw,110px)/1 var(--f-code)', letterSpacing: '.12em' }}>{cls.code}</div>
          <p>{cls.name} · Fase dibuka 1–{cls.maxPhase || 1}</p>
          <div className="btns"><button className="btn" type="button" onClick={() => setProj(false)}>Tutup</button></div>
        </Modal>
      )}
    </>
  );
}
