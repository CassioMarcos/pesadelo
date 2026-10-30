'use strict';
// One namespace, world coordinates, 32 px navigation grid. Camera shows one floor.
window.Pesadelo = {
  T: 32,
  W: 1024,
  H: 1152,
  keys: new Set(),
  state: 'loading',
  time: 0,
  assets: {}
};
(function(G) {
  const furniture = [{
    id: 'sofa',
    x: 400,
    y: 168,
    w: 304,
    h: 144,
    label: 'Sofá',
    text: 'Parece só uma lembrança...'
  }, {
    id: 'tv',
    x: 104,
    y: 192,
    w: 144,
    h: 192,
    label: 'Armário sob a TV',
    hide: true
  }, {
    id: 'coffee',
    x: 448,
    y: 328,
    w: 176,
    h: 80,
    label: 'Mesa de centro',
    text: 'Parece só uma lembrança...'
  }, {
    id: 'lamp',
    x: 280,
    y: 160,
    w: 112,
    h: 88,
    label: 'Mesa do abajur',
    text: 'A luz está fraca.'
  }, {
    id: 'shelf',
    x: 768,
    y: 64,
    w: 128,
    h: 192,
    label: 'Estante',
    text: 'Não há nada aqui.'
  }, {
    id: 'chair',
    x: 288,
    y: 416,
    w: 176,
    h: 96,
    label: 'Poltrona',
    text: 'Não há nada aqui.'
  }, {
    id: 'photo',
    x: 880,
    y: 352,
    w: 80,
    h: 128,
    label: 'Gaveta da sala',
    item: 'Fotografia da família',
    icon: '▣'
  }, {
    id: 'plant1',
    x: 64,
    y: 400,
    w: 64,
    h: 96,
    label: 'Planta',
    text: 'As folhas estão frias.'
  }, {
    id: 'plant2',
    x: 912,
    y: 256,
    w: 48,
    h: 64,
    label: 'Planta',
    text: 'Nada aqui.'
  }, {
    id: 'bed',
    x: 64,
    y: 640,
    w: 128,
    h: 192,
    label: 'Cama',
    text: 'Os lençóis estão gelados.'
  }, {
    id: 'wardrobe',
    x: 288,
    y: 608,
    w: 96,
    h: 96,
    label: 'Guarda-roupa',
    hide: true
  }, {
    id: 'bear',
    x: 64,
    y: 992,
    w: 96,
    h: 64,
    label: 'Gaveta do quarto',
    item: 'Ursinho de pelúcia',
    icon: '♧'
  }, {
    id: 'kitchenhide',
    x: 896,
    y: 992,
    w: 96,
    h: 96,
    label: 'Armário da cozinha',
    hide: true
  }, {
    id: 'fridge',
    x: 704,
    y: 608,
    w: 64,
    h: 128,
    label: 'Geladeira',
    text: 'A luz não acende.'
  }, {
    id: 'table',
    x: 800,
    y: 832,
    w: 96,
    h: 96,
    label: 'Mesa da cozinha',
    text: 'Há um prato para alguém.'
  }, {
    id: 'remote',
    x: 864,
    y: 608,
    w: 128,
    h: 64,
    label: 'Balcão',
    item: 'Controle remoto',
    icon: '▥'
  }];
  const walls = [{
    x: 0,
    y: 0,
    w: 1024,
    h: 32
  }, {
    x: 0,
    y: 0,
    w: 32,
    h: 1152
  }, {
    x: 992,
    y: 0,
    w: 32,
    h: 1152
  }, {
    x: 0,
    y: 1120,
    w: 1024,
    h: 32
  }, {
    x: 0,
    y: 544,
    w: 480,
    h: 64
  }, {
    x: 608,
    y: 544,
    w: 416,
    h: 64
  }, {
    x: 448,
    y: 608,
    w: 32,
    h: 224
  }, {
    x: 448,
    y: 928,
    w: 32,
    h: 192
  }, {
    x: 672,
    y: 608,
    w: 32,
    h: 224
  }, {
    x: 672,
    y: 928,
    w: 32,
    h: 192
  }];
  G.map = {
    furniture,
    walls,
    solids: [...walls, ...furniture]
  };
  G.blocked = (x, y, r = 10) => x - r < 0 || y - r < 0 || x + r > G.W || y + r > G.H || G.map.solids.some(o => x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h);
  G.move = (p, dx, dy) => {
    if (!G.blocked(p.x + dx, p.y, p.r)) p.x += dx;
    if (!G.blocked(p.x, p.y + dy, p.r)) p.y += dy;
  };
  G.room = (x, y) => y < 576 ? 'SALA' : x < 448 ? 'QUARTO' : x < 704 ? 'CORREDOR' : 'COZINHA';
  G.visible = (a, b) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    for (let i = 4; i < d; i += 4)
      if (G.blocked(a.x + (b.x - a.x) * i / d, a.y + (b.y - a.y) * i / d, 1)) return false;
    return true;
  };
  G.path = (a, b) => {
    const key = (x, y) => x + ',' + y,
      start = [Math.floor(a.x / 32), Math.floor(a.y / 32)],
      end = [Math.floor(b.x / 32), Math.floor(b.y / 32)],
      queue = [start],
      seen = new Map([
        [key(...start), null]
      ]);
    let found = null;
    for (let i = 0; i < queue.length; i++) {
      const cur = queue[i];
      if (cur[0] === end[0] && cur[1] === end[1]) {
        found = cur;
        break;
      }
      for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]) {
        const x = cur[0] + dx,
          y = cur[1] + dy,
          k = key(x, y);
        if (x < 0 || y < 0 || x >= 32 || y >= 36 || seen.has(k) || G.blocked(x * 32 + 16, y * 32 + 16, 10)) continue;
        seen.set(k, cur);
        queue.push([x, y]);
      }
    }
    const result = [];
    while (found && seen.get(key(...found))) {
      result.unshift({
        x: found[0] * 32 + 16,
        y: found[1] * 32 + 16
      });
      found = seen.get(key(...found));
    }
    return result;
  };
  G.drawMap = c => {
    c.fillStyle = '#141b2d';
    c.fillRect(0, 0, G.W, G.H);
    for (let y = 576; y < 1120; y += 16)
      for (let x = 32; x < 992; x += 64) {
        c.fillStyle = (x + y) % 48 ? '#282336' : '#2d283c';
        c.fillRect(x, y, 62, 14);
      }
    if (G.assets.sala) c.drawImage(G.assets.sala, 0, 0, 1024, 576);
    G.map.walls.forEach(o => {
      c.fillStyle = '#101522';
      c.fillRect(o.x, o.y, o.w, o.h);
      c.fillStyle = '#384158';
      c.fillRect(o.x, o.y, o.w, 5);
    });
    furniture.filter(o => o.y > 576).forEach(o => {
      c.fillStyle = '#080c17';
      c.fillRect(o.x + 5, o.y + 7, o.w, o.h);
      c.fillStyle = o.hide ? '#353047' : '#3b3043';
      c.fillRect(o.x, o.y, o.w, o.h);
      c.fillStyle = '#69516a';
      c.fillRect(o.x + 3, o.y + 3, o.w - 6, 4);
      c.strokeStyle = '#171727';
      c.strokeRect(o.x + 6, o.y + 10, o.w - 12, o.h - 16);
      c.fillStyle = '#a28c82';
      c.fillRect(o.x + o.w / 2, o.y + o.h / 2, 4, 3);
      if (o.id === 'bed') {
        c.fillStyle = '#77788f';
        c.fillRect(o.x + 8, o.y + 8, 112, 30);
        c.fillStyle = '#3e486c';
        c.fillRect(o.x + 8, o.y + 42, 112, 140);
      }
    });
    c.fillStyle = G.collected.length ? '#963d66' : '#635274';
    c.fillRect(640, 688, 20, 32);
    if (G.collected.length) {
      for (let i = 0; i < 12; i++) {
        c.fillStyle = i % 2 ? '#536d8555' : '#a2b8c333';
        c.fillRect(118, 210 + i * 6, 112, 2);
      }
      if (Math.sin(G.time * .7) > .96) {
        c.fillStyle = '#050610aa';
        c.fillRect(540 + Math.sin(G.time * 4) * 20, 760, 20, 90);
      }
    }
    if (G.tutorial?.active) {
      c.strokeStyle = 'rgba(219,192,125,' + (.5 + .3 * Math.sin(G.time * 3)) + ')';
      c.lineWidth = 3;
      if (G.tutorial.step === 'hide') c.strokeRect(100, 188, 152, 200);
      else if (G.tutorial.step === 'exit') c.strokeRect(484, 524, 120, 20);
    }
  };
})(Pesadelo);
