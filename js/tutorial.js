(function(G){
 const lines=['Algo está errado nesta casa.','Para acordar de vez, você precisa encontrar 3 objetos que fazem parte da sua vida de verdade.','Vasculhe os cômodos. Mas não faça barulho...'];
 G.newTutorial=active=>({active,step:active?'dialogue':'done',line:0,elapsed:0,moved:0,ran:0,last:{x:G.player.x,y:G.player.y}});
 G.advanceTutorial=()=>{const t=G.tutorial;if(!t.active||t.step!=='dialogue')return;if(++t.line>=lines.length){t.step='walk';G.notify('Encontre 3 objetos 0/3');}};
 G.tutorialText=()=>{const t=G.tutorial;if(!t.active)return '';return t.step==='dialogue'?lines[t.line]+'  [E / Enter]':({walk:'WASD ou setas para andar',run:'Segure SHIFT enquanto anda para correr',exit:'O que foi isso? Vá até a saída da sala.',hide:'Ele está aqui! Esconda-se no armário sob a TV com E!',wait:'Fique em silêncio. Espere ele sair de vista.',leave:'[E] Sair do esconderijo'})[t.step]||'';};
 G.sound=()=>{try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;G.audio=G.audio||new A();G.audio.resume();const o=G.audio.createOscillator(),v=G.audio.createGain();o.type='triangle';o.frequency.setValueAtTime(85,G.audio.currentTime);o.frequency.exponentialRampToValueAtTime(32,G.audio.currentTime+.6);v.gain.setValueAtTime(.08,G.audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,G.audio.currentTime+.7);o.connect(v);v.connect(G.audio.destination);o.start();o.stop(G.audio.currentTime+.7);o.onended=()=>{o.disconnect();v.disconnect();};}catch{ /* Audio is optional. */ }};
 G.finishTutorial=()=>{G.tutorial.active=false;G.tutorial.step='done';G.player.hidden=null;G.enemy=G.createEnemy();G.notify('Você escapou. Mas ele ainda está procurando você.');try{localStorage.setItem('pesadelo-tutorial','done');}catch{}};
 G.tutorialRetry=()=>{G.player.hidden=null;G.player.x=272;G.player.y=400;G.enemy.x=560;G.enemy.y=560;G.enemy.path=[];G.enemy.suspect=null;G.enemy.mode='PATROL';G.enemy.target={x:752,y:464};G.enemy.grace=4;G.enemy.repath=0;G.tutorial.step='hide';G.tutorial.elapsed=0;G.notify('Tente de novo: corra e esconda-se com E');};
 G.tutorialHidden=()=>{const t=G.tutorial;t.step='wait';t.elapsed=0;G.enemy.mode='SEARCH';G.enemy.scripted=true;G.enemy.grace=0;G.enemy.target={x:272,y:400};G.enemy.repath=0;};
 G.updateTutorial=dt=>{const t=G.tutorial,p=G.player,e=G.enemy;if(!t.active)return;t.elapsed+=dt;
 const moved=Math.hypot(p.x-t.last.x,p.y-t.last.y);t.last={x:p.x,y:p.y};t.moved+=moved;if(p.running)t.ran+=moved;
 if(t.step==='walk'&&t.moved>55)t.step='run';
 if(t.step==='run'&&t.ran>45){t.step='exit';G.sound();G.shake=.65;}
 if(t.step==='exit'&&p.y>480&&p.x>465&&p.x<625){t.step='hide';t.elapsed=0;e.active=true;e.x=560;e.y=624;e.target={x:752,y:464};e.grace=2;e.tutorialMode=true;}
 if(t.step==='wait'){
 if(t.elapsed>5){e.target={x:560,y:752};e.repath=Math.min(e.repath,.2);}
 if(e.y>650&&t.elapsed>6){t.step='leave';e.active=false;}
 }
 if(t.step==='leave'&&!p.hidden)G.finishTutorial();
 };
})(Pesadelo);
