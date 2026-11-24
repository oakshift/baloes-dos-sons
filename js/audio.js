// Som: voz provisória em audio/, substituída pelas gravações da professora
// (IndexedDB). Tudo passa por AudioBuffer, para tocar logo no toque no iPad.
let ctx = null;
const memo = new Map();
const gravados = new Map();
let aTocar = null;

export function contexto() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

async function buffer(som) {
  if (memo.has(som)) return memo.get(som);
  const dados = gravados.has(som)
    ? await gravados.get(som).arrayBuffer()
    : await fetch(`audio/${som}.mp3`).then(r => { if (!r.ok) throw new Error(som); return r.arrayBuffer(); });
  const b = await contexto().decodeAudioData(dados);
  memo.set(som, b);
  return b;
}

export async function tocarSom(som) {
  const c = contexto();
  try {
    const b = await buffer(som);
    if (aTocar) { try { aTocar.stop(); } catch (e) { /* já acabou */ } }
    const n = c.createBufferSource();
    n.buffer = b; n.connect(c.destination); n.start();
    aTocar = n;
    return new Promise(r => { n.onended = r; });
  } catch (e) { console.warn("Som em falta:", som, e); }
}

function nota(freq, quando, dura, tipo, vol) {
  const c = contexto(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + quando;
  o.type = tipo; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dura);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dura);
}
export function estouro() {
  const c = contexto(), b = c.createBuffer(1, c.sampleRate * 0.12, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.12));
  const n = c.createBufferSource(), g = c.createGain(); g.gain.value = 0.35;
  n.buffer = b; n.connect(g).connect(c.destination); n.start();
}
export const festa = () => [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.35, "triangle", 0.18));
export const ups = () => { nota(260, 0, 0.18, "sine", 0.2); nota(200, 0.14, 0.28, "sine", 0.2); };

// ---------- gravações ----------
function db() {
  return new Promise((ok, mal) => {
    const p = indexedDB.open("baloes-dos-sons", 1);
    p.onupgradeneeded = () => p.result.createObjectStore("gravacoes");
    p.onsuccess = () => ok(p.result); p.onerror = () => mal(p.error);
  });
}
async function loja(modo, fn) {
  const d = await db();
  return new Promise((ok, mal) => {
    const tx = d.transaction("gravacoes", modo), p = fn(tx.objectStore("gravacoes"));
    tx.oncomplete = () => { d.close(); ok(p && p.result); };
    tx.onerror = () => { d.close(); mal(tx.error); };
  });
}
export async function carregarGravacoes() {
  try {
    const chaves = await loja("readonly", s => s.getAllKeys());
    const blobs = await loja("readonly", s => s.getAll());
    chaves.forEach((k, i) => gravados.set(k, blobs[i]));
  } catch (e) { console.warn("Sem gravações:", e); }
}
export const temGravacao = som => gravados.has(som);
export async function guardar(som, blob) {
  await loja("readwrite", s => s.put(blob, som));
  gravados.set(som, blob); memo.delete(som);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
export async function apagar(som) {
  await loja("readwrite", s => s.delete(som));
  gravados.delete(som); memo.delete(som);
}

let gravador = null, fluxo = null, pedacos = [];
export const podeGravar = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
export async function comecar() {
  contexto();
  fluxo = await navigator.mediaDevices.getUserMedia({ audio: true });
  const tipo = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(t => MediaRecorder.isTypeSupported(t));
  gravador = new MediaRecorder(fluxo, tipo ? { mimeType: tipo } : undefined);
  pedacos = [];
  gravador.ondataavailable = e => { if (e.data.size) pedacos.push(e.data); };
  gravador.start();
}
export function parar() {
  return new Promise((ok, mal) => {
    gravador.onstop = async () => {
      fluxo.getTracks().forEach(t => t.stop());
      try {
        const blob = new Blob(pedacos, { type: gravador.mimeType });
        ok(wav(await contexto().decodeAudioData(await blob.arrayBuffer())));
      } catch (e) { mal(e); }
    };
    gravador.stop();
  });
}

// Corta o silêncio, iguala o volume e devolve WAV, que todos os browsers leem.
export function wav(b) {
  const x = b.getChannelData(0), sr = b.sampleRate, jan = Math.round(sr * 0.01);
  const rms = [];
  for (let i = 0; i + jan < x.length; i += jan) {
    let s = 0; for (let j = i; j < i + jan; j++) s += x[j] * x[j];
    rms.push(Math.sqrt(s / jan));
  }
  const max = rms.reduce((a, v) => Math.max(a, v), 0);
  if (max < 0.004) throw new Error("silencio");
  let i0 = rms.findIndex(v => v > max * 0.08), i1 = rms.length - 1;
  while (i1 > i0 && rms[i1] < max * 0.08) i1--;
  const ini = Math.max(0, (i0 - 5) * jan), fim = Math.min(x.length, (i1 + 8) * jan);
  let pico = 0; for (let i = ini; i < fim; i++) pico = Math.max(pico, Math.abs(x[i]));
  const n = fim - ini, v = new DataView(new ArrayBuffer(44 + n * 2));
  const txt = (p, s) => [...s].forEach((c, i) => v.setUint8(p + i, c.charCodeAt(0)));
  txt(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); txt(8, "WAVEfmt "); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); txt(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x[ini + i] / pico * 0.8)) * 32767, true);
  return new Blob([v], { type: "audio/wav" });
}

const base64 = b => new Promise(r => { const l = new FileReader(); l.onload = () => r(l.result.split(",")[1]); l.readAsDataURL(b); });
export async function exportar() {
  const sons = {};
  for (const [k, b] of gravados) sons[k] = await base64(b);
  return new Blob([JSON.stringify({ app: "baloes-dos-sons", sons })], { type: "application/json" });
}
export async function importar(ficheiro, validos) {
  const d = JSON.parse(await ficheiro.text());
  if (d.app !== "baloes-dos-sons" || !d.sons) throw new Error("ficheiro");
  let n = 0;
  for (const [k, s] of Object.entries(d.sons)) {
    if (!validos.includes(k)) continue;
    await guardar(k, new Blob([Uint8Array.from(atob(s), c => c.charCodeAt(0))], { type: "audio/wav" })); n++;
  }
  return n;
}
