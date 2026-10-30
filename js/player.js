(function(G) {
  G.createPlayer = () => ({
    x: 368,
    y: 304,
    r: 10,
    stamina: 100,
    hidden: null,
    running: false
  });
  G.updatePlayer = dt => {
    const p = G.player;
    if (p.hidden) return;
    let x = Number(G.keys.has('d') || G.keys.has('ArrowRight')) - Number(G.keys.has('a') || G.keys.has('ArrowLeft')),
      y = Number(G.keys.has('s') || G.keys.has('ArrowDown')) - Number(G.keys.has('w') || G.keys.has('ArrowUp'));
    let n = Math.hypot(x, y);
    if (p.stamina < 1) p.exhausted = true;
    if (p.stamina > 35) p.exhausted = false;
    p.running = n > 0 && G.keys.has('Shift') && !p.exhausted;
    p.stamina = Math.max(0, Math.min(100, p.stamina + dt * (p.running ? -30 : 19)));
    if (n) G.move(p, x / n * dt * (p.running ? 175 : 95), y / n * dt * (p.running ? 175 : 95));
    p.walking = n > 0;
  };
  G.drawPerson = (c, p, enemy = false) => {
    if (p.hidden) return;
    let bob = p.walking ? Math.sin(G.time * 13) * 2 : 0,
      x = Math.round(p.x),
      y = Math.round(p.y + bob);
    c.fillStyle = '#060811aa';
    c.fillRect(x - 10, y + 8, 22, 7);
    c.fillStyle = enemy ? '#7b3755' : '#4a72a0';
    c.fillRect(x - 9, y - 4, 18, 17);
    c.fillStyle = enemy ? '#ded7d2' : '#d6a08d';
    c.fillRect(x - 8, y - 17, 16, 14);
    c.fillStyle = enemy ? '#ad3852' : '#211d2c';
    c.fillRect(x - 9, y - 20, 18, 6);
    c.fillStyle = '#111322';
    c.fillRect(x - 5, y - 12, 3, 3);
    c.fillRect(x + 3, y - 12, 3, 3);
    if (enemy) {
      c.fillStyle = '#cd465c';
      c.fillRect(x - 2, y - 8, 5, 4);
      c.fillStyle = '#b1a4bf';
      c.fillRect(x - 11, y - 3, 22, 4);
    }
    c.fillStyle = '#20253d';
    c.fillRect(x - 8, y + 13, 6, 5);
    c.fillRect(x + 3, y + 13, 6, 5);
  };
})(Pesadelo);
