(function(G) {
  const $ = id => document.getElementById(id),
    panel = $('panel');
  // Replace these five placeholders for the hackathon credits.
  G.team = ['Estudante 1', 'Estudante 2', 'Estudante 3', 'Estudante 4', 'Estudante 5'];
  G.showPanel = (title, text, buttons) => {
    panel.hidden = false;
    panel.replaceChildren();
    const tag = document.createElement('small');
    tag.textContent = 'NÃO FAÇA BARULHO';
    panel.append(tag);
    const h = document.createElement('h1');
    h.textContent = title;
    panel.append(h);
    const p = document.createElement('p');
    p.textContent = text;
    panel.append(p);
    for (const [name, action] of buttons) {
      const b = document.createElement('button');
      b.textContent = name;
      b.onclick = action;
      panel.append(b);
    }
    panel.querySelector('button')?.focus();
  };
  G.menu = () => {
    G.state = 'menu';
    G.keys.clear();
    G.message = '';
    G.tutorial.active = false;
    $('intro').hidden = true;
    panel.hidden = true;
    $('menu').hidden = false;
    G.focusMenu(0);
  };
  G.focusMenu = i => {
    G.menuIndex = (i + 3) % 3;
    document.querySelector('[data-menu="' + G.menuIndex + '"]').focus();
  };
  G.menuAction = i => {
    if (i === 0) {
      G.startIntro();
      return;
    }
    G.state = 'info';
    $('menu').hidden = true;
    G.showPanel(i === 1 ? 'COMO JOGAR' : 'CRÉDITOS', i === 1 ? 'WASD ou setas: mover. Shift: correr. E: investigar e esconder-se. Esc: pausar. Encontre três objetos nos móveis. Se ele vir você entrando no armário, o esconderijo deixa de ser seguro. Use teclado e mouse.' : 'Equipe: ' + G.team.join(' · '), [
      ['VOLTAR', G.menu]
    ]);
  };
  document.querySelectorAll('[data-menu]').forEach(b => b.onclick = () => G.menuAction(Number(b.dataset.menu)));
  G.startIntro = () => {
    G.state = 'intro';
    $('menu').hidden = true;
    panel.hidden = true;
    $('intro').hidden = false;
    G.scene = 2;
    G.sceneTime = 0;
    G.showScene();
  };
  G.showScene = () => {
    const img = $('scene');
    img.src = G.assets['cena_' + G.scene].src;
    img.classList.toggle('trim', G.scene >= 2 && G.scene <= 8);
    $('scene-count').textContent = String(G.scene).padStart(2, '0') + ' / 12';
  };
  G.nextScene = () => {
    if (G.state !== 'intro') return;
    if (++G.scene > 12) {
      G.state = 'introFade';
      G.phase = 0;
    } else {
      G.sceneTime = 0;
      G.showScene();
    }
  };
  G.startGame = (tutorial = false) => {
    G.player = G.createPlayer();
    G.enemy = G.createEnemy();
    G.collected = [];
    G.phase = 0;
    G.shake = 0;
    G.keys.clear();
    G.state = 'playing';
    G.tutorial = G.newTutorial(tutorial);
    if (tutorial) {
      G.enemy.active = false;
      G.enemy.tutorialMode = true;
    }
    G.notify('Encontre 3 objetos 0/3. Investigue os móveis com E.');
    panel.hidden = true;
    $('menu').hidden = true;
    $('intro').hidden = true;
    $('scene').style.opacity = 1;
  };
  G.startFirstGame = () => {
    let seen = false;
    try {
      seen = localStorage.getItem('pesadelo-tutorial') === 'done';
    } catch {}
    G.startGame(!seen);
  };
  G.pause = () => {
    if (G.state === 'playing') {
      G.state = 'paused';
      G.keys.clear();
      G.showPanel('PAUSA', 'Respire. A casa pode esperar.', [
        ['CONTINUAR', () => {
          G.state = 'playing';
          panel.hidden = true;
        }],
        ['MENU', G.menu]
      ]);
    } else if (G.state === 'paused') {
      G.state = 'playing';
      panel.hidden = true;
    }
  };
  G.lose = () => {
    if (G.state !== 'playing') return;
    G.state = 'caught';
    G.phase = 0;
    G.keys.clear();
    G.message = '';
  };
  G.updateUI = () => {
    const playing = G.state === 'playing',
      t = G.tutorial;
    $('hud').hidden = !playing || (t.active && !['leave'].includes(t.step));
    $('items').textContent = 'OBJETOS: ' + G.collected.length + '/3  ' + G.map.furniture.filter(o => o.item).map(o => G.collected.includes(o.id) ? o.icon : '◇').join(' ');
    $('room').textContent = G.room(G.player.x, G.player.y);
    $('stamina').value = G.player.stamina;
    $('message').textContent = playing && G.time < G.messageUntil ? G.message : '';
    const o = G.nearest();
    $('prompt').textContent = playing ? (G.player.hidden ? (t.active && t.step === 'wait' ? 'Você está escondido · Espere' : '[E] Sair · Você está escondido') : o ? '[E] ' + (o.hide ? 'Esconder-se' : 'Investigar') + ' · ' + o.label : '') : '';
    $('skip-tutorial').hidden = !(playing && t.active);
    $('tutorial').hidden = !(playing && t.active);
    $('tutorial').textContent = G.tutorialText();
    if (G.state === 'intro') $('scene').style.opacity = Math.min(1, G.sceneTime / (G.scene === 9 ? 1.3 : .45));
    if (G.state === 'introFade') $('scene').style.opacity = Math.max(0, 1 - G.phase / 1.2);
  };
  $('next').onclick = G.nextScene;
  $('skip').onclick = () => {
    G.state = 'introFade';
    G.phase = 0;
  };
  $('scene').onclick = G.nextScene;
  $('skip-tutorial').onclick = G.finishTutorial;
  $('tutorial').onclick = G.advanceTutorial;
})(Pesadelo);
