(function(G) {
  const canvas = document.getElementById('game'),
    c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  G.player = G.createPlayer();
  G.enemy = G.createEnemy();
  G.collected = [];
  G.message = '';
  G.messageUntil = 0;
  G.phase = 0;
  G.shake = 0;
  G.tutorial = G.newTutorial(false);
  // All gameplay timing belongs to this loop. No setInterval / pending restart timers.
  G.update = dt => {
    if (G.state === 'paused') return;
    G.time += dt;
    if (G.state === 'intro') {
      G.sceneTime += dt;
      if (G.sceneTime >= (G.scene === 8 ? 4.5 : 3)) G.nextScene();
    } else if (G.state === 'introFade') {
      G.phase += dt;
      if (G.phase >= 1.2) G.startFirstGame();
    } else if (G.state === 'playing') {
      if (!(G.tutorial.active && G.tutorial.step === 'dialogue')) G.updatePlayer(dt);
      G.updateTutorial(dt);
      G.updateEnemy(dt);
      G.shake = Math.max(0, G.shake - dt);
    } else if (G.state === 'caught') {
      G.phase += dt;
      if (G.phase > 1.2) {
        G.state = 'lost';
        G.showPanel('VOCÊ FOI ENCONTRADO', 'O corredor ficou em silêncio.', [
          ['TENTAR NOVAMENTE', () => G.startGame(false)],
          ['MENU', G.menu]
        ]);
      }
    } else if (G.state === 'waking') {
      G.phase += dt;
      if (G.phase > 10) {
        G.state = 'won';
        G.showPanel('Era apenas um pesadelo...?', 'Você acordou no sofá. Os três objetos estavam com você.', [
          ['JOGAR NOVAMENTE', G.menu]
        ]);
      }
    }
  };
  G.render = () => {
    c.clearRect(0, 0, 1024, 576);
    c.save();
    const camera = G.player.y >= 576 ? 576 : 0;
    c.translate(G.shake ? Math.sin(G.time * 65) * 2 : 0, -camera);
    G.drawMap(c);
    G.drawPerson(c, G.player);
    if (G.enemy.active) G.drawPerson(c, G.enemy, true);
    c.restore();
    c.fillStyle = 'rgba(4,7,20,' + (.1 + G.collected.length * .055) + ')';
    c.fillRect(0, 0, 1024, 576);
    const light = c.createRadialGradient(G.player.x, G.player.y - camera, 45, G.player.x, G.player.y - camera, 650);
    light.addColorStop(0, '#00000000');
    light.addColorStop(1, '#03051099');
    c.fillStyle = light;
    c.fillRect(0, 0, 1024, 576);
    if (G.state === 'caught') {
      c.fillStyle = '#11101ce6';
      c.fillRect(0, 0, 1024, 576);
      c.save();
      c.translate(512, 300);
      c.scale(5 + Math.min(G.phase, 1), 5 + Math.min(G.phase, 1));
      G.drawPerson(c, {
        x: 0,
        y: 0
      }, true);
      c.restore();
    }
    if (G.state === 'waking') {
      if (G.phase > 2) {
        const img = G.assets['cena_' + Math.min(12, 9 + Math.floor((G.phase - 2) / 2))];
        G.cover(c, img);
      }
      c.fillStyle = 'rgba(0,0,0,' + (G.phase < 2 ? G.phase / 2 : Math.max(0, 1 - (G.phase - 2))) + ')';
      c.fillRect(0, 0, 1024, 576);
    }
    G.updateUI();
  };
  G.cover = (ctx, img) => {
    const s = Math.max(1024 / img.width, 576 / img.height),
      w = img.width * s,
      h = img.height * s;
    ctx.drawImage(img, (1024 - w) / 2, (576 - h) / 2, w, h);
  };
  document.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) e.preventDefault();
    if (!e.repeat) {
      if (G.state === 'menu') {
        if (['ArrowDown', 'ArrowRight'].includes(key)) G.focusMenu(G.menuIndex + 1);
        if (['ArrowUp', 'ArrowLeft'].includes(key)) G.focusMenu(G.menuIndex - 1);
        if (key === 'Enter') {
          e.preventDefault();
          G.menuAction(G.menuIndex);
        }
        return;
      }
      if (key === 'Escape') G.pause();
      if (key === 'e') {
        e.preventDefault();
        G.interact();
      }
      if (G.state === 'playing' && G.tutorial.active && key === 'Enter') {
        e.preventDefault();
        G.advanceTutorial();
      }
      if (G.state === 'intro' && (key === ' ' || key === 'Enter')) {
        e.preventDefault();
        G.nextScene();
      }
    }
    if (G.state === 'playing') G.keys.add(key);
  });
  document.addEventListener('keyup', e => G.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  window.addEventListener('blur', () => {
    G.keys.clear();
    if (G.state === 'playing') G.pause();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      G.keys.clear();
      if (G.state === 'playing') G.pause();
    }
  });
  G.preload = () => Promise.all([...Array.from({
    length: 12
  }, (_, i) => ['cena_' + (i + 1), 'assets/abertura/cena_' + String(i + 1).padStart(2, '0') + '.png']), ['sala', 'assets/cenarios/sala.png']].map(([key, src]) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      G.assets[key] = img;
      resolve();
    };
    img.onerror = () => reject(new Error(src));
    img.src = src;
  })));
  let previous = performance.now();

  function frame(now) {
    const dt = Math.min((now - previous) / 1000, .05);
    previous = now;
    G.update(dt);
    G.render();
    requestAnimationFrame(frame);
  }
  G.preload().then(() => {
    G.menu();
    requestAnimationFrame(frame);
  }).catch(error => G.showPanel('Falha ao carregar', 'Arquivo indisponível: ' + error.message, [
    ['TENTAR NOVAMENTE', () => location.reload()]
  ]));
})(Pesadelo);
