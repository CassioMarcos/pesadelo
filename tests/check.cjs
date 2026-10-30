// Dependency-free logic regression checks. This is not a browser/visual test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={fillRect(){},clearRect(){},save(){},restore(){},translate(){},scale(){},drawImage(){},strokeRect(){},createRadialGradient(){return {addColorStop(){}}}};
function element(){return {hidden:false,style:{},dataset:{},classList:{toggle(){}},append(){},replaceChildren(){},focus(){},querySelector(){return element()},getContext(){return context}};}
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
const storage=new Map(),box={console,Set,Map,Math,Promise,Error,performance:{now:()=>0},requestAnimationFrame(){},document:{getElementById:get,querySelector:()=>element(),querySelectorAll:()=>[],createElement:element,addEventListener(){}},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)},addEventListener(){},Image:class{set src(v){assert(fs.existsSync(v),'missing asset '+v);this.width=1024;this.height=576;this._src=v;this.onload?.();}get src(){return this._src;}}};box.window=box;vm.createContext(box);
for(const name of ['map','player','enemy','interactions','tutorial','ui','game'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),box,{filename:name+'.js'});
const G=box.Pesadelo;
function run(seconds){for(let i=0;i<seconds*60;i++)G.update(1/60)}
function approach(o){let best;for(let y=16;y<G.H;y+=32)for(let x=16;x<G.W;x+=32){if(G.blocked(x,y))continue;const d=Math.hypot(x-Math.max(o.x,Math.min(x,o.x+o.w)),y-Math.max(o.y,Math.min(y,o.y+o.h)));if(d<40&&G.path(G.createPlayer(),{x,y}).length){const old=G.player;G.player={...old,x,y};if(G.nearest()===o)best={x,y};G.player=old;if(best)return best;}}throw Error('unreachable '+o.id)}
(async()=>{await G.preload();G.menu();assert.equal(G.state,'menu');G.startIntro();assert.equal(G.scene,2);for(let i=0;i<11;i++)G.nextScene();assert.equal(G.state,'introFade');run(1.3);assert.equal(G.tutorial.step,'dialogue');G.advanceTutorial();G.advanceTutorial();G.advanceTutorial();assert.equal(G.tutorial.step,'walk');G.keys.add('a');run(.9);G.keys.clear();G.keys.add('s');G.keys.add('Shift');run(.7);G.keys.clear();assert.equal(G.tutorial.step,'exit');Object.assign(G.player,{x:560,y:512});run(.1);assert.equal(G.tutorial.step,'hide');
G.tutorialRetry();assert.equal(G.state,'playing');assert.equal(G.enemy.tutorialMode,true);Object.assign(G.player,approach(G.map.furniture.find(o=>o.id==='tv')));G.enemy.angle=Math.PI/2;G.interact();assert(G.player.hidden);assert.equal(G.tutorial.step,'wait');run(30);assert.equal(G.tutorial.step,'leave');G.interact();run(.1);assert.equal(G.tutorial.active,false);assert.equal(G.enemy.tutorialMode,false);
console.log('PASS menu → intro → tutorial → hide → exit → gameplay');
G.startGame(false);assert(!G.blocked(G.player.x,G.player.y));assert(!G.blocked(G.enemy.x,G.enemy.y));
for(const o of G.map.furniture)approach(o);
console.log('PASS all furniture and 3 collectibles reachable from spawn');
G.enemy.active=false;const start={x:G.player.x,y:G.player.y};G.keys.add('d');G.updatePlayer(.1);const straight=Math.hypot(G.player.x-start.x,G.player.y-start.y);Object.assign(G.player,start);G.keys.add('w');G.updatePlayer(.1);assert(Math.abs(Math.hypot(G.player.x-start.x,G.player.y-start.y)-straight)<.001);G.keys.clear();
G.player.x=48;G.player.y=500;G.move(G.player,-40,0);assert.equal(G.player.x,48);
console.log('PASS normalized diagonal and wall collision');
for(const o of G.map.furniture.filter(o=>o.item)){Object.assign(G.player,approach(o));G.interact();const count=G.collected.length;G.interact();assert.equal(G.collected.length,count);}assert.equal(G.state,'waking');run(11);assert.equal(G.state,'won');
console.log('PASS exactly 3 unique items → awakening → victory');
G.startGame(false);G.enemy.grace=0;Object.assign(G.enemy,{x:G.player.x,y:G.player.y});G.updateEnemy(.01);assert.equal(G.state,'caught');run(1.3);assert.equal(G.state,'lost');G.startGame(false);assert.equal(G.collected.length,0);assert.equal(G.player.hidden,null);assert.equal(G.enemy.suspect,null);assert.equal(G.enemy.mode,'PATROL');
console.log('PASS capture → defeat → full restart');
const hide=G.map.furniture.find(o=>o.id==='wardrobe');Object.assign(G.player,approach(hide));G.enemy.active=false;G.interact();assert(G.player.hidden);G.enemy.active=true;G.enemy.grace=0;Object.assign(G.enemy,{x:G.player.x,y:G.player.y});G.updateEnemy(.01);assert.equal(G.state,'playing');assert.equal(G.sees(),false);G.interact();G.enemy.angle=0;G.interact();assert(G.enemy.suspect);G.updateEnemy(.01);assert.equal(G.state,'caught');
console.log('PASS unseen hiding safe; witnessed hiding investigated');
G.startGame(false);G.enemy.grace=0;G.player.hidden='wardrobe';for(let i=0;i<60*180;i++){G.updateEnemy(1/60);assert(!G.blocked(G.enemy.x,G.enemy.y),'enemy crossed furniture/wall');}assert(G.enemy.y<1008);
console.log('PASS 180 s of patrol without crossing solids');
G.startGame(false);const before={x:G.player.x,y:G.player.y,ex:G.enemy.x,ey:G.enemy.y,time:G.time};G.pause();run(10);assert.equal(G.time,before.time);assert.equal(G.enemy.x,before.ex);G.pause();assert.equal(G.state,'playing');G.render();
console.log('PASS pause freezes simulation; render executes with canvas stub');
})().catch(e=>{console.error(e);process.exitCode=1});
