# Balões dos Sons

Jogo para crianças que estão a aprender a ler: ouve-se um fonema do português de Portugal e rebentam-se os balões com as letras que o representam.

**Jogar:** https://oakshift.github.io/baloes-dos-sons/

## Como se joga

1. O jogo diz um som. O botão amarelo repete-o as vezes que forem precisas.
2. A criança rebenta todos os balões certos: minúscula e maiúscula, de imprensa e manuscritas.
3. Se acertar todos, vê uma palavra com esse som e passa ao fonema seguinte.
4. Se errar, ouve o som outra vez e recomeça.

Não há tempo limite. Cada nível dá até três estrelas.

## Níveis

Vogais; primeiras consoantes; mais consoantes; sons que sopram; duas letras, um som (ch, nh, lh, rr); sons do nariz (ã, ão, en…); um som, várias letras (s, ss, ç, c).

Um balão errado nunca tem uma letra que também possa representar o som. No /u/ não aparece o "o", por causa de "gato"; no /z/ não aparece o "s", por causa de "casa".

## Para adultos

No fundo do ecrã inicial escolhe-se:

- que formas de letra aparecem;
- se um erro recomeça o fonema ou o nível;
- a velocidade e o número de balões errados.

É também aí que se **gravam os sons**. Os que vêm com o jogo são provisórios, gerados por computador (Piper, voz pt-PT, e ruído filtrado nas fricativas). Nas oclusivas e em alguns outros sons ouve-se uma vogal de apoio. O melhor modelo é a voz de quem ensina. As gravações ficam só no aparelho; **Exportar** e **Importar** servem para as levar para outro.

## Privacidade

Sem contas, sem servidor, sem recolha de dados.

## Desenvolvimento

Sem dependências nem compilação. `python3 -m http.server 8000` e abrir `http://localhost:8000`; testes em `/_teste.html` (cerca de 2 minutos, com o som do browser autorizado). Os fonemas estão em `js/dados.js`. Ao publicar, subir a `VERSAO` em `sw.js`.

Tipos de letra, com licença SIL OFL: Atkinson Hyperlegible, Playwrite PT (caligrafia escolar portuguesa) e Baloo 2.
