// Lapisan data: Firebase (kalau .env diisi) atau MODE DEMO (localStorage, sinkron antar-tab).
import { hasFirebase, auth, fs } from './firebase';
import * as fbAuth from 'firebase/auth';
import * as F from 'firebase/firestore';

export const MODE = hasFirebase ? 'firebase' : 'demo';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCode = () => Array.from({ length: 6 }, () => ALPHA[(Math.random() * ALPHA.length) | 0]).join('');
const uidGen = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const byCreated = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);

// Firestore menolak array di dalam array. Array bersarang dibungkus {__arr: [...]} saat simpan, dibuka lagi saat baca.
const enc = (v, inArr) => Array.isArray(v) ? (inArr ? { __arr: v.map((x) => enc(x, true)) } : v.map((x) => enc(x, true)))
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x, false)])) : v;
const dec = (v) => Array.isArray(v) ? v.map(dec)
  : v && typeof v === 'object' ? (Array.isArray(v.__arr) ? v.__arr.map(dec) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dec(x)]))) : v;

/* ---------------- DEMO backend ---------------- */
const KEY = 'kq2-demo-db';
const subs = new Set();
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { teachers: {}, classes: {}, groups: {}, events: {} }; }
  catch { return { teachers: {}, classes: {}, groups: {}, events: {} }; }
}
function store(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* penuh / diblokir */ } subs.forEach((f) => f()); }
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === 'kq2-demo-teacher') subs.forEach((f) => f()); });
function sub(fn) { fn(); subs.add(fn); return () => subs.delete(fn); }
const demoTeacher = () => { try { return JSON.parse(localStorage.getItem('kq2-demo-teacher')); } catch { return null; } };

/* ---------------- AUTH (guru) ---------------- */
export function onTeacher(cb) {
  if (hasFirebase) return fbAuth.onAuthStateChanged(auth, (u) => cb(u && !u.isAnonymous ? { uid: u.uid, name: u.displayName || u.email, email: u.email } : null));
  return sub(() => cb(demoTeacher()));
}
export async function teacherSignUp(name, email, pw) {
  if (hasFirebase) {
    if (auth.currentUser?.isAnonymous) await fbAuth.signOut(auth);
    const c = await fbAuth.createUserWithEmailAndPassword(auth, email, pw);
    await fbAuth.updateProfile(c.user, { displayName: name });
    await F.setDoc(F.doc(fs, 'teachers', c.user.uid), { name, email, createdAt: Date.now() });
    return;
  }
  const db = load();
  if (db.teachers[email]) throw new Error('Email sudah terdaftar.');
  db.teachers[email] = { uid: 't_' + uidGen(), name, email, pw };
  store(db); localStorage.setItem('kq2-demo-teacher', JSON.stringify({ uid: db.teachers[email].uid, name, email })); store(load());
}
export async function teacherSignIn(email, pw) {
  if (hasFirebase) { if (auth.currentUser?.isAnonymous) await fbAuth.signOut(auth); await fbAuth.signInWithEmailAndPassword(auth, email, pw); return; }
  const t = load().teachers[email];
  if (!t || t.pw !== pw) throw new Error('Email atau kata sandi salah.');
  localStorage.setItem('kq2-demo-teacher', JSON.stringify({ uid: t.uid, name: t.name, email }));
  store(load());
}
export async function teacherSignOut() {
  if (hasFirebase) return fbAuth.signOut(auth);
  localStorage.removeItem('kq2-demo-teacher'); store(load());
}

/* ---------------- KELAS ---------------- */
export async function createClass(teacher, name) {
  let code = genCode();
  const data = { code, name, teacherUid: teacher.uid, teacherName: teacher.name, createdAt: Date.now(), maxPhase: 1, showKey: false };
  if (hasFirebase) {
    while ((await F.getDoc(F.doc(fs, 'classes', code))).exists()) { code = genCode(); data.code = code; }
    await F.setDoc(F.doc(fs, 'classes', code), data);
    return code;
  }
  const db = load();
  while (db.classes[code]) { code = genCode(); data.code = code; }
  db.classes[code] = data; store(db); return code;
}
export function watchMyClasses(uid, cb) {
  if (hasFirebase) return F.onSnapshot(F.query(F.collection(fs, 'classes'), F.where('teacherUid', '==', uid)), (s) => cb(s.docs.map((d) => d.data()).sort(byCreated)));
  return sub(() => cb(Object.values(load().classes).filter((c) => c.teacherUid === uid).sort(byCreated)));
}
export function watchClass(code, cb) {
  if (hasFirebase) return F.onSnapshot(F.doc(fs, 'classes', code), (d) => cb(d.exists() ? d.data() : null), () => cb(null));
  return sub(() => cb(load().classes[code] || null));
}
export async function updateClass(code, patch) {
  if (hasFirebase) return F.updateDoc(F.doc(fs, 'classes', code), patch);
  const db = load(); db.classes[code] = { ...db.classes[code], ...patch }; store(db);
}

/* ---------------- KELOMPOK ---------------- */
export function watchGroups(code, cb) {
  if (hasFirebase) return F.onSnapshot(F.collection(fs, 'classes', code, 'groups'), (s) => cb(s.docs.map((d) => ({ id: d.id, ...dec(d.data()) }))));
  return sub(() => cb(Object.entries(load().groups[code] || {}).map(([id, g]) => ({ id, ...g }))));
}
export function watchGroup(code, gid, cb) {
  if (hasFirebase) return F.onSnapshot(F.doc(fs, 'classes', code, 'groups', gid), (d) => cb(d.exists() ? { id: d.id, ...dec(d.data()) } : null));
  return sub(() => { const g = (load().groups[code] || {})[gid]; cb(g ? { id: gid, ...g } : null); });
}
export async function patchGroup(code, gid, patch) {
  if (hasFirebase) return F.setDoc(F.doc(fs, 'classes', code, 'groups', gid), enc(patch), { merge: true });
  const db = load(); db.groups[code] = db.groups[code] || {}; db.groups[code][gid] = { ...(db.groups[code][gid] || {}), ...patch }; store(db);
}
export async function deleteGroup(code, gid) {
  if (hasFirebase) return F.deleteDoc(F.doc(fs, 'classes', code, 'groups', gid));
  const db = load(); if (db.groups[code]) delete db.groups[code][gid]; if (db.events[code]) delete db.events[code][gid]; store(db);
}
export function watchEvents(code, gid, cb) {
  if (hasFirebase) return F.onSnapshot(F.query(F.collection(fs, 'classes', code, 'groups', gid, 'events'), F.orderBy('at', 'desc'), F.limit(150)), (s) => cb(s.docs.map((d) => d.data())));
  return sub(() => cb(((load().events[code] || {})[gid] || []).slice().reverse().slice(0, 150)));
}
export async function logEvent(code, gid, ev) {
  const e = { ...ev, at: Date.now() };
  if (hasFirebase) return F.addDoc(F.collection(fs, 'classes', code, 'groups', gid, 'events'), e);
  const db = load(); db.events[code] = db.events[code] || {}; (db.events[code][gid] = db.events[code][gid] || []).push(e); store(db);
}

/* ---------------- SISWA ---------------- */
const SESSION = 'kq2-session';
export const getSession = () => { try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } };
export const clearSession = () => { try { localStorage.removeItem(SESSION); } catch { /* */ } };

export async function studentJoin(code, name, members, initial) {
  code = code.trim().toUpperCase();
  let gid;
  if (hasFirebase) {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) { if (auth.currentUser) await fbAuth.signOut(auth); await fbAuth.signInAnonymously(auth); }
    const cls = await F.getDoc(F.doc(fs, 'classes', code));
    if (!cls.exists()) throw new Error('Kode kelas tidak ditemukan. Tanyakan ke guru.');
    gid = auth.currentUser.uid;
    const ref = F.doc(fs, 'classes', code, 'groups', gid);
    const ex = await F.getDoc(ref);
    if (!ex.exists()) await F.setDoc(ref, enc({ ...initial, uid: gid, name, members, classCode: code, createdAt: Date.now(), updatedAt: Date.now() }));
    else await F.setDoc(ref, { name, members, updatedAt: Date.now() }, { merge: true });
  } else {
    const db = load();
    if (!db.classes[code]) throw new Error('Kode kelas tidak ditemukan. Tanyakan ke guru.');
    gid = 'g_' + uidGen();
    db.groups[code] = db.groups[code] || {};
    db.groups[code][gid] = { ...initial, uid: gid, name, members, classCode: code, createdAt: Date.now(), updatedAt: Date.now() };
    store(db);
  }
  localStorage.setItem(SESSION, JSON.stringify({ code, gid }));
  return { code, gid };
}
export async function studentResume() {
  const s = getSession(); if (!s) return null;
  if (hasFirebase) {
    await new Promise((r) => { const u = fbAuth.onAuthStateChanged(auth, () => { u(); r(); }); });
    if (!auth.currentUser || auth.currentUser.uid !== s.gid) { clearSession(); return null; }
  }
  return s;
}
