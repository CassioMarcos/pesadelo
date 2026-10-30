# PESADELO

Protótipo de survival horror 2D em HTML5, CSS e JavaScript puro, com Canvas 2D. Sem frameworks, npm, servidor ou bibliotecas externas. Abra `index.html` no navegador. Para GitHub Pages, publique a raiz da branch desejada nas configurações do repositório; todos os caminhos são relativos. Este PR não altera as configurações do Pages.

## Controles

- WASD ou setas: andar. Diagonais têm velocidade normalizada.
- Shift enquanto anda: correr; gasta fôlego e aumenta o alcance de detecção.
- E: investigar, esconder-se ou sair. No tutorial também avança o texto.
- Esc: pausar/continuar. Perder o foco pausa automaticamente.
- Menu: setas e Enter, ou clique nas opções da imagem.
- Abertura: clique, Espaço ou Enter; botão Pular. Avanço automático em aproximadamente três segundos.

Use computador com teclado. O layout se adapta à janela, mas controles de toque não foram implementados.

## Organização

- `index.html`: estrutura e ordem dos scripts tradicionais.
- `style.css`: contêiner 16:9, menu sobre a imagem, HUD e telas.
- `js/map.js`: estado compartilhado `window.Pesadelo`, móveis, colisões, BFS, visibilidade e desenho do cenário.
- `js/player.js`: movimento, fôlego e sprites da criança e do palhaço.
- `js/enemy.js`: um inimigo, estados PATROL/CHASE/SEARCH, visão e captura.
- `js/interactions.js`: investigação, coleta única e esconderijos.
- `js/tutorial.js`: máquina de estados, áudio Web Audio e tutorial sem captura.
- `js/ui.js`: menu, créditos, HUD, mensagens e reinício.
- `js/game.js`: pré-carregamento, entradas, atualização e renderização com requestAnimationFrame/delta time.
- `assets/abertura/cena_01.png` a `cena_12.png`: imagens originais extraídas do ZIP fornecido.
- `assets/cenarios/sala.png`: **arte provisória original, desenhada com formas simples**. Não é a imagem da sala exibida na mensagem.
- `tests/check.cjs`: verificações de lógica sem dependências; Node é opcional e só necessário para executar estes testes.

## Implementado

Menu com áreas invisíveis proporcionais sobre cena 01, foco por teclado, Como jogar e Créditos. Edite `Pesadelo.team` em `ui.js` para substituir os cinco nomes. Pré-carregamento das treze imagens, erro de carregamento recuperável, cenas 02–12 com fade e corte na borda esquerda das cenas 02–08. A passagem da cena 08 para 09 é mais lenta.

Casa com sala no piso superior do mapa e corredor, quarto e cozinha no inferior. A câmera muda ao passar pela abertura central inferior da sala. Canvas lógico 1024×576, navegação em grade de 32 px, pixel smoothing desativado. Os outros cômodos são desenhados diretamente no Canvas.

Exatamente três itens fixos: fotografia na gaveta direita da sala, ursinho na gaveta inferior do quarto, controle no balcão superior da cozinha. O ursinho e o controle decorativos da sala não são coletáveis. Armário sob a TV, guarda-roupa e armário da cozinha são esconderijos. O palhaço vê por distância, direção e linha de visão; móveis e paredes bloqueiam. Ele investiga um esconderijo se viu a criança entrar. Rotas usam BFS com recálculo periódico e pontos de patrulha sorteados.

Tutorial na primeira partida: texto, andar, correr, ruído, saída, aparição, esconder-se, aguardar a busca e sair. Usa o mesmo inimigo e uma flag `tutorialMode`; aproximação perigosa reposiciona a criança sem derrota. Pode ser pulado a qualquer momento. A saída do esconderijo fica bloqueada durante a busca guiada. A conclusão é salva em localStorage quando disponível; em navegadores que bloqueiam armazenamento local, o jogo continua funcionando. Para rever o tutorial, apague a chave `pesadelo-tutorial` no armazenamento do navegador.

HUD com três indicadores, fôlego, cômodo e mensagens. Distorções após coletar objetos: escurecimento, quadro alterado, interferência na TV e sombra no corredor. Terceiro objeto para a partida, escurece e reutiliza cenas 09–12 para acordar. Captura usa aproximação simples do palhaço, sem violência gráfica ou flashes. Reiniciar restaura itens, inimigo, jogador, perseguição, esconderijo e relógios de sequência; derrota reinicia sem tutorial/abertura. Jogar novamente após vitória retorna ao menu.

## Limitações e próximos passos

1. **Substituir a sala provisória pela imagem anexada.** A imagem estava visível no chat, mas não disponível como arquivo para download; o ZIP contém somente as doze cenas da abertura. O arquivo `sala.png` entregue é um placeholder, não uma reprodução da arte. Substitua-o pela imagem original e ajuste os retângulos no início de `map.js` após inspeção visual. As posições atuais seguem aproximadamente a composição da referência. TODO: usar versão sem ursinho e controle decorativos.
2. A criança começa em uma posição caminhável ao lado do sofá após as cenas; não há animação própria de levantar no gameplay. A passagem entre os dois setores da casa é uma troca de câmera, sem rolagem suave.
3. A busca do tutorial tem destinos dirigidos para ensinar o esconderijo; continua usando a mesma movimentação, BFS, colisão e sprite do inimigo. A busca livre segue a última posição conhecida antes de retornar à patrulha. Sem portas, inventário utilizável ou outros inimigos.
4. A meta de partida de 5–10 minutos ainda precisa de playtest e balanceamento. É possível terminar antes conhecendo os objetos. Não há salvamento da partida nem áudio ambiente contínuo.
5. Faltam revisão visual no navegador, checagem auditiva do ruído e validação em navegadores/dispositivos reais. O Canvas, desenho dos sprites e alinhamento dos hotspots ainda precisam dessa revisão.

## Validação realizada

Execute na raiz, se tiver Node instalado:

```sh
node tests/check.cjs
```

Testes executados com os scripts reais em contexto JavaScript e DOM/Canvas simulados:

- Menu → cenas → fade → tutorial → esconder-se → saída → jogo livre.
- Alcance por BFS de todos os móveis, incluindo os três objetos, partindo do início.
- Movimento diagonal normalizado e colisão com parede.
- Coleta única dos três objetos → sequência final → vitória.
- Captura → derrota → reinício com estados limpos.
- Esconderijo não visto é seguro; esconderijo visto é investigado e resulta em captura.
- 180 segundos simulados de patrulha, sem atravessar sólidos.
- Pausa congela o relógio e a simulação; rotina de renderização executa com Canvas simulado.
- Presença dos assets de pré-carregamento e sintaxe dos sete scripts.

Isso **não** equivale a executar a partida num navegador. A ferramenta de automação de navegador não estava disponível nesta sessão; não foram verificados visualmente o fluxo, os fades, o alinhamento, o console real, o áudio, a abertura por `file://` ou o site no GitHub Pages.
