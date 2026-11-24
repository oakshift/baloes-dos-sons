import { NIVEIS, FORMAS, SONS } from "./dados.js";
import { baralhar, criarRonda, estrelas } from "./rondas.js";
import * as som from "./audio.js";

const app = document.getElementById("app");
const PADRAO = { formas: ["im", "iM", "mm", "mM"], errados: 6, velocidade: "lento", recomeco: "fonema", estrelas: {} };
let estado = { ...PADRAO };
try { estado = { ...PADRAO, ...JSON.parse(localStorage.getItem("baloes-dos-sons") || "{}") }; } catch (e) { /* começa do zero */ }
const gravarEstado = () => { try { localStorage.setItem("baloes-dos-sons", JSON.stringify(estado)); } catch (e) { /* modo privado */ } };

function el(tag, props = {}, filhos = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "texto") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
  }
  n.append(...[].concat(filhos).filter(Boolean));
  return n;
}
let sair = () => {};
function ecra(...nos) { sair(); sair = () => {}; app.replaceChildren(...nos); scrollTo(0, 0); }
const espera = ms => new Promise(r => setTimeout(r, ms));
const CORES = ["#ffb3ba", "#ffd59e", "#fff3a3", "#b9f0c0", "#a9defb", "#d7c3fa", "#ffc4ea"];

// ---------- início ----------
function inicio() {
  ecra(el("main", { class: "inicio" }, [
    el("header", {}, [
      el("h1", { texto: "Balões dos Sons" }),
      el("p", { texto: "Ouve o som e rebenta os balões com a letra certa." })
    ]),
    el("div", { class: "niveis" }, NIVEIS.map((n, i) => {
      const e = estado.estrelas[n.id] || 0;
      return el("button", { class: "nivel", style: `--cor:${CORES[i % CORES.length]}`, onclick: () => { som.contexto(); jogar(n); } }, [
        el("span", { class: "mostra", texto: n.mostra }),
        el("span", { class: "nome", texto: n.nome }),
        el("span", { class: "estrelas", "aria-label": `${e} de 3 estrelas`, texto: "★".repeat(e) + "☆".repeat(3 - e) })
      ]);
    })),
    el("button", { class: "discreto", onclick: adultos, texto: "Para adultos: definições e gravações" })
  ]));
}

// ---------- jogo ----------
function jogar(nivel) {
  const fonemas = baralhar(nivel.fonemas);
  let pos = 0, erros = 0, vivo = true, quadro = 0, bloqueado = false, baloes = [], ronda = null, porRebentar = 0;

  const pontos = el("div", { class: "pontos", "aria-hidden": "true" });
  const ceu = el("div", { class: "ceu" });
  const casas = el("div", { class: "casas" });
  const aviso = el("div", { class: "aviso", role: "status" });
  const ouvir = el("button", { class: "ouvir", "aria-label": "Ouvir o som outra vez", onclick: () => tocar() }, [el("span", { "aria-hidden": "true", texto: "🔊" })]);
  ecra(el("main", { class: "jogo" }, [
    el("div", { class: "barra" }, [el("button", { class: "voltar", "aria-label": "Voltar ao início", onclick: inicio, texto: "←" }), pontos]),
    ceu, aviso,
    el("div", { class: "fundo" }, [ouvir, casas])
  ]));
  sair = () => { vivo = false; cancelAnimationFrame(quadro); removeEventListener("resize", colocar); };
  addEventListener("resize", colocar);

  function tocar() {
    ouvir.classList.remove("toca"); void ouvir.offsetWidth; ouvir.classList.add("toca");
    return som.tocarSom(fonemas[pos].som);
  }

  function novaRonda() {
    bloqueado = false; aviso.className = "aviso"; aviso.textContent = "";
    ronda = criarRonda(nivel, fonemas[pos], estado);
    porRebentar = ronda.certos.length;
    pontos.replaceChildren(...fonemas.map((_, i) => el("i", { class: i < pos ? "feito" : i === pos ? "agora" : "" })));
    casas.replaceChildren(...ronda.certos.map(c => el("span", { class: `casa ${c.forma.letra}` })));
    ceu.replaceChildren();
    baloes = ronda.baloes.map((b, i) => {
      const no = el("button", { class: `balao ${b.forma.letra}${b.texto.length > 1 ? " duas" : ""}`, style: `--cor:${CORES[Math.floor(Math.random() * CORES.length)]}`,
        "aria-label": `${b.texto}, ${b.forma.nome}` }, [el("span", { class: "corpo" }, [el("b", { texto: b.texto })])]);
      const item = { ...b, no, i, y: 0, x: 0 };
      no.addEventListener("pointerdown", e => { e.preventDefault(); rebentar(item); });
      no.addEventListener("click", e => { if (e.detail === 0) rebentar(item); }); // teclado
      ceu.append(no);
      return item;
    });
    colocar();
    tocar();
  }

  // Cada coluna é um carrossel vertical: os balões nunca se sobrepõem.
  let alturaCiclo = 0, bh = 0;
  function colocar() {
    const W = ceu.clientWidth, H = ceu.clientHeight, n = baloes.length;
    if (!n || !H) return;
    const parado = estado.velocidade === "parado";
    let lado = 150, cols, linhas;
    for (; lado > 44; lado -= 2) {
      bh = lado * 1.28; cols = Math.max(1, Math.min(Math.ceil(n / 2), Math.floor(W / (lado * 1.08)))); linhas = Math.ceil(n / cols);
      if (linhas * bh <= (parado ? H : H * 1.02 + bh)) break;
    }
    ceu.style.setProperty("--lado", lado + "px");
    alturaCiclo = Math.max(H + bh, linhas * bh);
    const larg = W / cols;
    for (const b of baloes) {
      const c = b.i % cols, l = Math.floor(b.i / cols);
      b.x = c * larg + (larg - lado) / 2;
      b.y = parado ? l * (H / linhas) + (H / linhas - bh) / 2
                   : (l * alturaCiclo / linhas + (c * 0.37 % 1) * (alturaCiclo / linhas)) % alturaCiclo;
      b.v = 1 + (c % 3) * 0.18;
    }
    desenhar();
  }
  function desenhar() {
    const parado = estado.velocidade === "parado";
    for (const b of baloes) {
      const y = parado ? b.y : b.y - bh;
      b.no.style.transform = `translate(${b.x}px, ${y}px)`;
      b.no.style.visibility = "visible";
    }
  }
  let antes = performance.now();
  function anima(t) {
    if (!vivo) return;
    const dt = Math.min(50, t - antes) / 1000; antes = t;
    const v = { parado: 0, lento: 32, normal: 60 }[estado.velocidade];
    if (v && !bloqueado) {
      for (const b of baloes) b.y = (b.y - v * b.v * dt + alturaCiclo) % alturaCiclo;
      desenhar();
    }
    quadro = requestAnimationFrame(anima);
  }

  async function rebentar(b) {
    if (bloqueado || b.morto) return;
    if (!b.certo) return errar(b);
    b.morto = true; som.estouro(); b.no.classList.add("rebenta"); b.no.disabled = true;
    const casa = casas.children[ronda.certos.findIndex(c => c.texto === b.texto && c.forma === b.forma && !c.posto)];
    const c = ronda.certos.find(x => x.texto === b.texto && x.forma === b.forma && !x.posto);
    c.posto = true; casa.textContent = b.texto; casa.classList.add("cheia");
    if (--porRebentar) return;
    bloqueado = true;
    const atual = fonemas[pos];
    for (const x of baloes) if (!x.morto) x.no.classList.add("foge");
    await espera(350); if (!vivo) return;
    som.festa();
    aviso.className = "aviso bem";
    aviso.replaceChildren(el("span", { class: "emoji", texto: atual.emoji }), el("span", { texto: atual.palavra }));
    await espera(900); if (!vivo) return;
    tocar(); await espera(1500); if (!vivo) return;
    if (++pos < fonemas.length) novaRonda(); else fim();
  }

  async function errar(b) {
    bloqueado = true; erros++;
    som.ups(); b.no.classList.add("abana");
    aviso.className = "aviso outra"; aviso.textContent = "Ouve outra vez!";
    await espera(1300); if (!vivo) return;
    if (estado.recomeco === "nivel") pos = 0;
    novaRonda();
  }

  function fim() {
    const e = estrelas(erros);
    estado.estrelas = { ...estado.estrelas, [nivel.id]: Math.max(e, estado.estrelas[nivel.id] || 0) };
    gravarEstado(); som.festa();
    const i = NIVEIS.indexOf(nivel);
    ecra(el("main", { class: "fim" }, [
      el("h1", { texto: "Conseguiste!" }),
      el("div", { class: "grandes", "aria-label": `${e} de 3 estrelas`, texto: "★".repeat(e) + "☆".repeat(3 - e) }),
      el("p", { texto: erros === 0 ? "Sem nenhum engano." : "Rebentaste todos os sons deste nível." }),
      NIVEIS[i + 1] && el("button", { class: "principal", onclick: () => jogar(NIVEIS[i + 1]), texto: "Próximo nível" }),
      el("button", { class: "segundo", onclick: () => jogar(nivel), texto: "Jogar outra vez" }),
      el("button", { class: "segundo", onclick: inicio, texto: "Início" })
    ]));
  }

  novaRonda();
  quadro = requestAnimationFrame(anima);
}

// ---------- adultos ----------
function adultos() {
  const grupo = (titulo, chave, opcoes) => el("fieldset", {}, [el("legend", { texto: titulo }), ...opcoes.map(([v, t]) =>
    el("label", {}, [el("input", { type: "radio", name: chave, checked: estado[chave] === v, onchange: () => { estado[chave] = v; gravarEstado(); } }), t]))]);
  const formas = el("fieldset", {}, [el("legend", { texto: "Letras nos balões" }), ...FORMAS.map(x =>
    el("label", {}, [el("input", { type: "checkbox", checked: estado.formas.includes(x.id), onchange: e => {
      const s = new Set(estado.formas); e.target.checked ? s.add(x.id) : s.delete(x.id);
      if (!s.size) { e.target.checked = true; return; }
      estado.formas = [...s]; gravarEstado();
    } }), el("span", { class: `amostra ${x.letra}`, texto: x.maiuscula ? "A" : "a" }), x.nome]))]);

  const msg = el("p", { class: "msg", role: "status" });
  let gravando = null;
  const lista = el("div", { class: "lista" });
  function linhas() {
    lista.replaceChildren(...SONS.map(s => {
      const tem = som.temGravacao(s.som);
      const rec = el("button", { class: "segundo", texto: gravando === s.som ? "■ Parar" : "● Gravar", onclick: () => gravar(s.som) });
      return el("div", { class: "linha" + (tem ? " tem" : "") }, [
        el("span", { class: "ipa", texto: `/${s.ipa}/` }),
        el("span", { class: "ex", texto: `${s.letras[0]} de ${s.palavra.split(",")[0]}` }),
        el("span", { class: "quem", texto: tem ? "a tua voz" : "voz provisória" }),
        el("button", { class: "segundo", texto: "▶ Ouvir", onclick: () => som.tocarSom(s.som) }),
        rec,
        tem && el("button", { class: "segundo", texto: "Apagar", onclick: async () => { await som.apagar(s.som); linhas(); } })
      ]);
    }));
  }
  async function gravar(id) {
    try {
      if (gravando === id) {
        gravando = null;
        await som.guardar(id, await som.parar());
        msg.textContent = "Gravado."; linhas(); som.tocarSom(id);
      } else if (!gravando) {
        if (!som.podeGravar()) throw new Error("sem");
        await som.comecar(); gravando = id; msg.textContent = "A gravar: diz só o som e carrega em Parar."; linhas();
      }
    } catch (e) {
      gravando = null; linhas();
      msg.textContent = e.message === "silencio" ? "Não se ouviu nada. Tenta mais perto do microfone." : "Não foi possível gravar. Autoriza o microfone no browser.";
    }
  }
  const ficheiro = el("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: async e => {
    try { const n = await som.importar(e.target.files[0], SONS.map(s => s.som)); msg.textContent = `Sons importados: ${n}.`; linhas(); }
    catch (x) { msg.textContent = "Este ficheiro não é de gravações do jogo."; }
    e.target.value = "";
  } });
  linhas();
  ecra(el("main", { class: "adultos" }, [
    el("div", { class: "barra" }, [el("button", { class: "voltar", "aria-label": "Voltar ao início", onclick: inicio, texto: "←" }), el("h1", { texto: "Para adultos" })]),
    el("div", { class: "cartoes" }, [
      formas,
      grupo("Quando erra, recomeça", "recomeco", [["fonema", "o mesmo fonema"], ["nivel", "o nível desde o início"]]),
      grupo("Movimento dos balões", "velocidade", [["parado", "parados"], ["lento", "lento"], ["normal", "mais rápido"]]),
      grupo("Balões errados", "errados", [[3, "3"], [6, "6"], [9, "9"]])
    ]),
    el("h2", { texto: "Gravar os sons" }),
    el("p", { texto: "Os sons que vêm com o jogo são gerados por computador e servem só para começar. Grava cada um com a tua voz: o som puro, curto, sem dizer o nome da letra. Fica guardado neste aparelho." }),
    el("p", { texto: "Nas consoantes p, b, t, d, c, g evita juntar uma vogal forte no fim." }),
    el("div", { class: "acoes" }, [
      el("button", { class: "segundo", texto: "Exportar gravações", onclick: async () => {
        const a = el("a", { href: URL.createObjectURL(await som.exportar()), download: "sons-gravados.json" }); a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      } }),
      el("button", { class: "segundo", texto: "Importar gravações", onclick: () => ficheiro.click() }), ficheiro,
      el("button", { class: "segundo", texto: "Apagar estrelas", onclick: () => { estado.estrelas = {}; gravarEstado(); msg.textContent = "Estrelas apagadas."; } })
    ]),
    msg, lista
  ]));
  sair = () => { if (gravando) { gravando = null; som.parar().catch(() => {}); } };
}

if (matchMedia("(prefers-reduced-motion: reduce)").matches && !localStorage.getItem("baloes-dos-sons")) estado.velocidade = "parado";
inicio();
som.carregarGravacoes();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js");
