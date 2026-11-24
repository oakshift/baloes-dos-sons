// Regras do jogo, sem ecrã: fáceis de testar.
import { FORMAS, PARECIDAS, banco, escrever, formasDe } from "./dados.js";

export function baralhar(v, rnd = Math.random) {
  const a = v.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function criarRonda(nivel, fonema, { formas = FORMAS.map(x => x.id), errados = 6 } = {}) {
  const ativas = FORMAS.filter(x => formas.includes(x.id));
  const balao = (grafia, forma, certo) => ({ grafia, forma, certo, texto: escrever(grafia, forma) });
  const certos = [];
  for (const g of fonema.letras) {
    const fs = nivel.soMinuscula ? [FORMAS[0]] : formasDe(g).filter(x => ativas.includes(x));
    for (const x of fs.length ? fs : [FORMAS[0]]) certos.push(balao(g, x, true));
  }
  const pode = banco(nivel).filter(g => !fonema.evitar.includes(g));
  const primeiro = [...new Set(fonema.letras.flatMap(g => PARECIDAS[g] || []))].filter(g => pode.includes(g));
  const resto = baralhar(pode.filter(g => !primeiro.includes(g)));
  const fila = primeiro.slice(0, Math.ceil(errados / 2)).concat(resto);
  const maus = [];
  for (let i = 0; i < errados; i++) {
    const g = fila[i % fila.length];
    const fs = nivel.soMinuscula ? [FORMAS[0]] : formasDe(g).filter(x => ativas.includes(x));
    const x = fs.length ? fs[Math.floor(Math.random() * fs.length)] : FORMAS[0];
    maus.push(balao(g, x, false));
  }
  return { certos, baloes: baralhar(certos.concat(maus)) };
}

export const estrelas = erros => (erros === 0 ? 3 : erros <= 3 ? 2 : 1);
