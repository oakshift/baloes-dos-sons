// Os fonemas do português europeu, por níveis.
//
// som      ficheiro em audio/ (e nome da gravação da professora)
// letras   grafias que são resposta certa
// evitar   grafias que também podem representar este som: nunca aparecem como
//          balão errado, senão o jogo castigava uma resposta defensável
//          (ex.: o "o" de "gato" soa /u/; o "s" de "casa" soa /z/).

const f = (som, ipa, letras, palavra, emoji, evitar = []) =>
  ({ som, ipa, letras: [].concat(letras), palavra, emoji, evitar: [].concat(letras, evitar) });

export const NIVEIS = [
  { id: "vogais", nome: "Vogais", mostra: "a e i", fonemas: [
    f("a", "a", "a", "asa", "🪽", ["ã"]),
    f("e_aberto", "ɛ", "e", "erva", "🌿"),
    f("i", "i", "i", "ilha", "🏝️", ["e"]),
    f("o_aberto", "ɔ", "o", "olhos", "👀"),
    f("u", "u", "u", "uva", "🍇", ["o"])
  ]},
  { id: "cons1", nome: "Primeiras consoantes", mostra: "p t l", fonemas: [
    f("p", "p", "p", "pato", "🦆"),
    f("t", "t", "t", "tartaruga", "🐢"),
    f("l", "l", "l", "lua", "🌙"),
    f("d", "d", "d", "dado", "🎲"),
    f("m", "m", "m", "mala", "🧳"),
    f("v", "v", "v", "vaca", "🐄")
  ]},
  { id: "cons2", nome: "Mais consoantes", mostra: "c n r", fonemas: [
    f("k", "k", "c", "casa", "🏠", ["q", "qu"]),
    f("n", "n", "n", "nuvem", "☁️"),
    f("r_forte", "ʁ", "r", "rato", "🐭", ["rr"]),
    f("g", "g", "g", "gato", "🐱"),
    f("b", "b", "b", "bola", "⚽")
  ]},
  { id: "cons3", nome: "Sons que sopram", mostra: "f s z", fonemas: [
    f("f", "f", "f", "flor", "🌸"),
    f("s", "s", "s", "sapo", "🐸", ["c", "ç", "ss", "x", "z"]),
    f("z", "z", "z", "zebra", "🦓", ["s", "x"]),
    f("j", "ʒ", "j", "janela", "🪟", ["g", "s", "z"]),
    f("x", "ʃ", "x", "xadrez", "♟️", ["ch", "s", "z"])
  ]},
  { id: "digrafos", nome: "Duas letras, um som", mostra: "ch nh lh", fonemas: [
    f("x", "ʃ", "ch", "chave", "🔑", ["x", "s", "z"]),
    f("nh", "ɲ", "nh", "ninho", "🪺"),
    f("lh", "ʎ", "lh", "coelho", "🐰"),
    f("r_forte", "ʁ", "rr", "carro", "🚗", ["r"]),
    f("r_fraco", "ɾ", "r", "pera", "🍐", ["rr"])
  ]},
  { id: "nasais", nome: "Sons do nariz", mostra: "ã ão", fonemas: [
    f("an", "ɐ̃", "ã", "lã", "🧶", ["an"]),
    f("ao", "ɐ̃w̃", "ão", "cão", "🐶"),
    f("en", "ẽ", "en", "dente", "🦷"),
    f("in", "ĩ", "in", "pinto", "🐤", ["en"]),
    f("on", "õ", "on", "ponte", "🌉"),
    f("un", "ũ", "un", "mundo", "🌍", ["on"])
  ]},
  { id: "varias", nome: "Um som, várias letras", mostra: "s ss ç", soMinuscula: true, fonemas: [
    f("s", "s", ["s", "ss", "ç", "c"], "sapo, pássaro, laço, cebola", "🐸", ["x", "z"]),
    f("j", "ʒ", ["j", "g"], "janela, girafa", "🦒", ["s", "z"]),
    f("x", "ʃ", ["x", "ch"], "xadrez, chave", "🔑", ["s", "z"]),
    f("z", "z", ["z", "s"], "zebra, casa", "🦓", ["x"]),
    f("k", "k", ["c", "qu"], "casa, queijo", "🧀", ["q"]),
    f("r_forte", "ʁ", ["r", "rr"], "rato, carro", "🐭")
  ]}
];

// Pares que se confundem à vista ou ao ouvido: aparecem primeiro como erro.
export const PARECIDAS = {
  a: ["o", "e"], e: ["a", "o"], i: ["u", "l"], o: ["a", "u"], u: ["i", "n"],
  p: ["b", "d"], b: ["d", "p"], d: ["b", "t"], t: ["d", "f"], l: ["i", "t"],
  m: ["n", "u"], n: ["m", "u"], v: ["f", "u"], f: ["v", "t"], c: ["g", "o"],
  g: ["c", "p"], r: ["l", "n"], s: ["f", "v"], z: ["f", "v"], j: ["i", "f"],
  x: ["f", "j"], ch: ["lh", "nh"], nh: ["lh", "ch"], lh: ["nh", "ch"],
  rr: ["nh", "lh"], "ã": ["ão", "a"], "ão": ["ã", "on"], en: ["e", "in"],
  in: ["i", "un"], on: ["o", "ão"], un: ["u", "in"], ss: ["f", "v"], "ç": ["f", "v"], qu: ["p", "g"]
};

const SIMPLES = "a e i o u p t l d m v c n r g b f s z j x".split(" ");

export function banco(nivel) {
  const i = NIVEIS.indexOf(nivel);
  if (i === 0) return SIMPLES.slice(0, 11); // vogais e primeiras consoantes
  if (i === 1) return SIMPLES.slice(0, 16);
  if (i <= 3) return SIMPLES;
  if (nivel.id === "digrafos") return ["ch", "nh", "lh", "rr", "l", "n", "c", "v", "t", "m"];
  if (nivel.id === "nasais") return ["ã", "ão", "en", "in", "on", "un", "a", "e", "i", "o", "u"];
  return SIMPLES.concat("ch", "nh", "lh");
}

export const FORMAS = [
  { id: "im", nome: "minúscula de imprensa", maiuscula: false, letra: "imprensa" },
  { id: "iM", nome: "maiúscula de imprensa", maiuscula: true, letra: "imprensa" },
  { id: "mm", nome: "minúscula manuscrita", maiuscula: false, letra: "manuscrito" },
  { id: "mM", nome: "maiúscula manuscrita", maiuscula: true, letra: "manuscrito" }
];

// Nenhuma palavra começa por rr, ss ou ç: não têm maiúscula manuscrita.
export function formasDe(grafia) {
  return FORMAS.filter(x => !(x.id === "mM" && ["rr", "ss", "ç", "ã", "ão", "nh", "lh"].includes(grafia)));
}

export function escrever(grafia, forma) {
  if (!forma.maiuscula) return grafia;
  if (forma.letra === "manuscrito") return grafia[0].toLocaleUpperCase("pt") + grafia.slice(1);
  return grafia.toLocaleUpperCase("pt");
}

// Todos os sons, sem repetir, para o estúdio de gravação.
export const SONS = [...new Map(NIVEIS.flatMap(n => n.fonemas).map(x => [x.som, x])).values()];
