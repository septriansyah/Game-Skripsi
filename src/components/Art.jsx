import React from 'react';

const MOUTH = {
  senang: '<path d="M44 68 Q54 80 64 68" stroke="#1D2540" stroke-width="4" fill="#fff" stroke-linecap="round"/>',
  bingung: '<path d="M46 72 Q54 66 62 72" stroke="#1D2540" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M34 42l14 4M74 42l-14 4" stroke="#1D2540" stroke-width="3.5" stroke-linecap="round"/>',
  kaget: '<ellipse cx="54" cy="72" rx="6" ry="7" fill="#1D2540"/><path d="M34 40l12-2M74 40l-12-2" stroke="#1D2540" stroke-width="3.5" stroke-linecap="round"/>',
  netral: '<path d="M46 70 Q54 75 62 70" stroke="#1D2540" stroke-width="4" fill="none" stroke-linecap="round"/>',
  lelah: '<path d="M46 72 H62" stroke="#1D2540" stroke-width="4" stroke-linecap="round"/>',
  menang: '<path d="M42 66 Q54 84 66 66 Z" fill="#1D2540"/><path d="M47 72 Q54 78 61 72" fill="#E0474C"/>',
};
export function lupMarkup(mood = 'netral') {
  const eyes = mood === 'menang'
    ? '<path d="M36 56 q6 -8 12 0M60 56 q6 -8 12 0" stroke="#1D2540" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : mood === 'lelah'
      ? '<path d="M35 56 h14M59 56 h14" stroke="#1D2540" stroke-width="4" stroke-linecap="round"/>'
      : '<ellipse cx="42" cy="56" rx="7" ry="9" fill="#1D2540"/><ellipse cx="66" cy="56" rx="7" ry="9" fill="#1D2540"/><circle cx="44" cy="53" r="2.5" fill="#fff"/><circle cx="68" cy="53" r="2.5" fill="#fff"/>';
  return '<line x1="80" y1="82" x2="108" y2="112" stroke="#6B4A2B" stroke-width="14" stroke-linecap="round"/><circle cx="54" cy="54" r="44" fill="#FFC23A"/><circle cx="54" cy="54" r="33" fill="#E8F4FF"/><path d="M30 40 Q40 24 58 26" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>'
    + eyes + (MOUTH[mood] || MOUTH.netral)
    + '<path d="M22 22 Q54 -4 88 20 L84 28 Q54 12 26 30 Z" fill="#7A5A3A"/><path d="M26 30 Q54 12 84 28 L82 33 Q54 20 28 36 Z" fill="#E0474C"/>';
}
export function Lup({ mood = 'netral', size, className, style }) {
  return <svg viewBox="0 0 120 120" width={size} height={size} className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: lupMarkup(mood) }} />;
}

export const PEOPLE = {
  lup: { name: 'Si Lup', role: 'Narator' },
  ratna: { name: 'Bu Ratna', role: 'Ketua Kopdes', a: { hijab: '#D23A3F', shirt: '#F4F1EA', skin: '#C98E62' } },
  dadan: { name: 'Kang Dadan', role: 'Admin magang', a: { hair: '#3A2A20', shirt: '#DB4F93', skin: '#C9925F', mood: 'sad' } },
  joko: { name: 'Pak Joko', role: 'Bendahara', a: { hair: '#8A8A8A', shirt: '#8A5A2B', mustache: true, skin: '#B97E55' } },
};
export function Avatar({ who, size = '100%' }) {
  if (who === 'lup') return <Lup mood="netral" size={size} />;
  const o = PEOPLE[who].a; const s = o.skin, sh = o.shirt;
  const mouth = { sad: 'M43 58 Q50 53 57 58', smile: 'M42 54 Q50 61 58 54' }[o.mood || 'smile'];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d="M12 100 C12 78 28 70 50 70 C72 70 88 78 88 100Z" fill={sh} />
      {!o.hijab && <rect x="44" y="60" width="12" height="12" fill={s} />}
      {o.hijab ? <path d="M22 60 Q18 18 50 16 Q82 18 78 60 Q80 80 70 86 L30 86 Q20 80 22 60Z" fill={o.hijab} /> : <ellipse cx="50" cy="34" rx="23" ry="18" fill={o.hair} />}
      <ellipse cx="50" cy={o.hijab ? 46 : 44} rx={o.hijab ? 17 : 19} ry={o.hijab ? 19 : 21} fill={s} />
      <circle cx="43" cy="44" r="2.8" fill="#1D2540" /><circle cx="57" cy="44" r="2.8" fill="#1D2540" />
      {o.mustache && <path d="M42 51 Q50 47 58 51 Q50 53 42 51Z" fill="#3A2A20" />}
      <path d={mouth} stroke="#5A2E1E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Icons() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<defs>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-glass" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" stroke="#3A2A00" stroke-width="3" fill="#fff"/><path d="M14.5 14.5L20 20" stroke="#3A2A00" stroke-width="3.5" stroke-linecap="round"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="3" fill="#8F8773"/><path d="M8 10V8a4 4 0 018 0v2" stroke="#8F8773" stroke-width="3" fill="none"/></symbol>
<symbol id="i-skull" viewBox="0 0 24 24"><path d="M12 3a8 8 0 00-5 14.2V20h10v-2.8A8 8 0 0012 3z" fill="#fff"/><circle cx="9" cy="11" r="2" fill="#E0474C"/><circle cx="15" cy="11" r="2" fill="#E0474C"/></symbol>
<symbol id="i-print" viewBox="0 0 24 24"><g stroke="#E0474C" stroke-width="2" fill="none" stroke-linecap="round"><path d="M12 4a7 7 0 00-7 7v2"/><path d="M12 7a4 4 0 00-4 4v4"/><path d="M12 10a1 1 0 00-1 1v6"/><path d="M12 4a7 7 0 017 7v4"/><path d="M12 7a4 4 0 014 4v6"/><path d="M14 11v8"/></g></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 16.9 6.1 20l1.2-6.5L2.5 8.9 9.1 8z" fill="#FFC23A" stroke="#D99A12" stroke-width="1.2"/></symbol>
<symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 01-10 0c0-3 1.5-4.5 2.5-6 .3 2 1.3 3 2.5 3-1-3 0-6 0-8z" fill="#FF8A1F"/><path d="M12 12c.5 2 2.5 2.5 2.5 5a2.5 2.5 0 01-5 0c0-1.5 1-2.5 2.5-5z" fill="#FFC23A"/></symbol>
<symbol id="i-badge" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#fff" opacity=".95"/><path d="M8 12l3 3 5-6" stroke="#1D2540" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-table" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M9 9v11" stroke="currentColor" stroke-width="2"/></symbol>
<symbol id="i-speaker" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>
<symbol id="i-teacher" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2" fill="#fff"/><path d="M7 20h10M12 16v4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M6 12l4-4 3 3 5-5" stroke="#26325A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs>` }} />
  );
}
