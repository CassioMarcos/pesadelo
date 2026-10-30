(function(G){
 const patrol=[{x:560,y:720},{x:560,y:1008},{x:816,y:1008},{x:944,y:752},{x:240,y:880},{x:752,y:464}];
 G.createEnemy=()=>({x:560,y:1008,r:10,mode:'PATROL',angle:-Math.PI/2,path:[],repath:0,target:patrol[0],search:0,grace:8,known:null,suspect:null,tutorialMode:false,active:true});
 G.sees=()=>{const e=G.enemy,p=G.player,d=Math.hypot(p.x-e.x,p.y-e.y),angle=Math.atan2(p.y-e.y,p.x-e.x),diff=Math.atan2(Math.sin(angle-e.angle),Math.cos(angle-e.angle));return e.active&&!p.hidden&&d<(p.running?310:250)&&(Math.abs(diff)<1.1||d<60)&&G.visible(e,p);};
 G.updateEnemy=dt=>{const e=G.enemy,p=G.player;if(!e.active)return;e.grace-=dt;if(e.grace>0)return;
 if(!e.scripted){
 if(G.sees()){e.mode='CHASE';e.known={x:p.x,y:p.y};e.target=e.known;e.search=7;e.suspect=null;}else if(e.mode==='CHASE'){e.mode='SEARCH';e.target=e.known;e.search=7;}
 if(e.suspect){e.target=e.suspect.entry;if(Math.hypot(e.x-e.target.x,e.y-e.target.y)<26){if(e.tutorialMode)G.tutorialRetry();else G.lose();return;}}
 if(e.mode==='SEARCH'){e.search-=dt;if(e.search<=0){e.mode='PATROL';e.suspect=null;e.target=patrol[Math.floor(Math.random()*patrol.length)];}}
 if(e.mode==='PATROL'&&Math.hypot(e.x-e.target.x,e.y-e.target.y)<20)e.target=patrol[Math.floor(Math.random()*patrol.length)];
 }
 e.repath-=dt;if(e.repath<=0){e.path=G.path(e,e.target);e.repath=e.mode==='CHASE'?.35:1;}
 const next=e.path[0];e.walking=!!next;if(next){const dx=next.x-e.x,dy=next.y-e.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*(e.mode==='CHASE'?125:68));e.angle=Math.atan2(dy,dx);if(d>0)G.move(e,dx/d*step,dy/d*step);if(d<4)e.path.shift();}
 if(!p.hidden&&Math.hypot(e.x-p.x,e.y-p.y)<23&&G.visible(e,p)){if(e.tutorialMode)G.tutorialRetry();else G.lose();}
 };
})(Pesadelo);
