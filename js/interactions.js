(function(G) {
  G.nearest = () => {
    const p = G.player;
    let best = null,
      distance = 44;
    for (const o of G.map.furniture) {
      const d = Math.hypot(p.x - Math.max(o.x, Math.min(p.x, o.x + o.w)), p.y - Math.max(o.y, Math.min(p.y, o.y + o.h)));
      if (d < distance) {
        distance = d;
        best = o;
      }
    }
    return best;
  };
  G.notify = text => {
    G.message = text;
    G.messageUntil = G.time + 5;
  };
  G.interact = () => {
    if (G.state !== 'playing') return;
    if (G.tutorial.active && G.tutorial.step === 'dialogue') {
      G.advanceTutorial();
      return;
    }
    const p = G.player;
    if (p.hidden) {
      if (G.tutorial.active && G.tutorial.step === 'wait') return;
      p.hidden = null;
      G.notify('Você saiu do esconderijo.');
      return;
    }
    const o = G.nearest();
    if (!o) return;
    if (o.hide) {
      const seen = G.sees();
      if (seen) {
        G.enemy.suspect = {
          entry: {
            x: p.x,
            y: p.y
          }
        };
        G.enemy.mode = 'SEARCH';
        G.enemy.search = 9;
        G.enemy.repath = 0;
      }
      p.hidden = o.id;
      G.notify(seen ? 'Ele viu você entrar!' : 'Fique em silêncio.');
      if (G.tutorial.active) {
        if (seen) G.tutorialRetry();
        else G.tutorialHidden();
      }
    } else if (o.item && !G.collected.includes(o.id)) {
      G.collected.push(o.id);
      G.notify('Encontrou: ' + o.item);
      if (G.collected.length === 3) {
        G.state = 'waking';
        G.phase = 0;
        G.enemy.active = false;
        G.tutorial.active = false;
        G.keys.clear();
      }
    } else G.notify(o.item ? 'Você já recolheu este objeto.' : o.text);
  };
  // TODO: replace the supplied living-room art with a version without the decorative bear/remote.
})(Pesadelo);
