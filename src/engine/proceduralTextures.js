import * as THREE from 'three';

function seedFrom(value='digital-space') {
  let seed=2166136261;
  for(let i=0;i<value.length;i++){seed^=value.charCodeAt(i);seed=Math.imul(seed,16777619);}
  return seed>>>0;
}

function randomFactory(value) {
  let state=seedFrom(value)||1;
  return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
}

function finish(canvas) {
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;
  texture.wrapT=THREE.ClampToEdgeWrapping;
  texture.anisotropy=8;
  return texture;
}

function canvas2d(width=1536,height=768) {
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  return{canvas,c:canvas.getContext('2d'),w:width,h:height};
}

function grain(c,w,h,rand,colors,count=7000,alpha=.1) {
  c.save();c.globalAlpha=alpha;
  for(let i=0;i<count;i++){
    const size=.4+rand()*3.5;
    c.fillStyle=colors[Math.floor(rand()*colors.length)];
    c.fillRect(rand()*w,rand()*h,size*(1+rand()*2.2),size);
  }
  c.restore();
}

function crater(c,x,y,r,shade='#191919',rim='#dedbd2',strength=.6) {
  c.save();c.translate(x,y);c.scale(1,.76);
  c.globalAlpha=strength*.24;c.fillStyle=shade;c.beginPath();c.arc(0,0,r*.84,0,Math.PI*2);c.fill();
  c.lineWidth=Math.max(.45,r*.065);c.globalAlpha=strength*.34;c.strokeStyle=rim;c.beginPath();c.arc(0,0,r,Math.PI*1.04,Math.PI*1.96);c.stroke();
  c.globalAlpha=strength*.42;c.strokeStyle=shade;c.beginPath();c.arc(0,0,r,0.03,Math.PI*.96);c.stroke();
  c.restore();
}

function drawRocky(c,w,h,rand,{base='#77736c',light='#aaa59b',dark='#373632',craters=160}) {
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,light);g.addColorStop(.35,base);g.addColorStop(.68,dark);g.addColorStop(1,base);c.fillStyle=g;c.fillRect(0,0,w,h);
  grain(c,w,h,rand,[light,dark,'#c7c1b6','#252523'],9000,.12);
  for(let i=0;i<craters;i++){const r=3+Math.pow(rand(),3)*58;crater(c,rand()*w,rand()*h,r,dark,light,.18+rand()*.48);}
}

function drawMoon(c,w,h,rand) {
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#aaa9a3');g.addColorStop(.18,'#85847f');g.addColorStop(.52,'#74736f');g.addColorStop(.82,'#85847f');g.addColorStop(1,'#a09f9a');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();c.globalAlpha=.34;c.fillStyle='#3f4140';
  [[.30,.34,.17,.10],[.42,.43,.13,.16],[.56,.37,.11,.11],[.66,.50,.16,.11],[.24,.58,.10,.08],[.48,.60,.18,.10]].forEach(([x,y,rx,ry],i)=>{c.beginPath();c.ellipse(x*w,y*h,rx*w,ry*h,(i%3-.5)*.18,0,Math.PI*2);c.fill();});c.restore();
  grain(c,w,h,rand,['#c1c0ba','#4d4d4b','#8f8e89'],9500,.075);
  for(let i=0;i<270;i++){const r=2+Math.pow(rand(),3.4)*48;crater(c,rand()*w,rand()*h,r,'#242525','#c5c3bc',.18+rand()*.44);}
  for(let i=0;i<5;i++){const x=rand()*w,y=rand()*h,r=26+rand()*38;c.save();c.translate(x,y);c.strokeStyle='rgba(220,218,210,.11)';c.lineWidth=1.2;for(let ray=0;ray<12;ray++){const a=ray*Math.PI/6+rand()*.12;c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a)*r*(2+rand()*2.8),Math.sin(a)*r*(2+rand()*2.8));c.stroke();}c.restore();crater(c,x,y,r,'#242525','#d2d0c8',.58);}
}

function drawCeres(c,w,h,rand) {
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#777873');g.addColorStop(.5,'#4c4d4a');g.addColorStop(1,'#696a65');c.fillStyle=g;c.fillRect(0,0,w,h);grain(c,w,h,rand,['#969792','#30312f','#646560'],9000,.08);
  for(let i=0;i<185;i++){const r=2+Math.pow(rand(),3.2)*52;crater(c,rand()*w,rand()*h,r,'#292a28','#979893',.18+rand()*.40);}
  crater(c,w*.58,h*.45,36,'#2d2e2b','#94958f',.52);const glow=c.createRadialGradient(w*.58,h*.45,0,w*.58,h*.45,10);glow.addColorStop(0,'rgba(245,245,231,.92)');glow.addColorStop(.24,'rgba(221,221,207,.55)');glow.addColorStop(1,'rgba(210,210,200,0)');c.fillStyle=glow;c.fillRect(w*.58-12,h*.45-12,24,24);
}

function drawMars(c,w,h,rand) {
  drawRocky(c,w,h,rand,{base:'#a94f31',light:'#d88a5b',dark:'#552b24',craters:80});
  c.save();c.globalAlpha=.24;c.fillStyle='#2d2926';
  for(let i=0;i<34;i++){c.beginPath();c.ellipse(rand()*w,120+rand()*(h-240),35+rand()*150,9+rand()*38,rand()*.5,0,Math.PI*2);c.fill();}
  c.restore();
  c.strokeStyle='rgba(61,27,22,.78)';c.lineWidth=11;c.beginPath();c.moveTo(w*.18,h*.58);c.bezierCurveTo(w*.35,h*.49,w*.47,h*.67,w*.71,h*.53);c.stroke();
  c.strokeStyle='rgba(224,126,75,.42)';c.lineWidth=3;c.stroke();
  crater(c,w*.68,h*.31,76,'#713520','#d88858',.68);
  const north=c.createLinearGradient(0,0,0,h*.12);north.addColorStop(0,'rgba(245,235,220,.95)');north.addColorStop(1,'rgba(245,235,220,0)');c.fillStyle=north;c.fillRect(0,0,w,h*.14);
  const south=c.createLinearGradient(0,h*.86,0,h);south.addColorStop(0,'rgba(245,235,220,0)');south.addColorStop(1,'rgba(245,235,220,.9)');c.fillStyle=south;c.fillRect(0,h*.84,w,h*.16);
}

function drawEuropa(c,w,h,rand) {
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#b8ab91');g.addColorStop(.48,'#e1d2b3');g.addColorStop(1,'#9b907b');c.fillStyle=g;c.fillRect(0,0,w,h);
  grain(c,w,h,rand,['#6b5341','#f4e7c8','#8f765a'],6500,.11);
  for(let i=0;i<88;i++){
    const y=rand()*h,amp=20+rand()*110,startY=i<52?y:rand()*h,endY=i<52?y+(rand()-.5)*amp:rand()*h;
    c.strokeStyle=`rgba(${72+Math.floor(rand()*35)},${48+Math.floor(rand()*25)},${38+Math.floor(rand()*18)},${.22+rand()*.42})`;
    c.lineWidth=.7+rand()*4.4;c.beginPath();c.moveTo(-20,startY);c.bezierCurveTo(w*.25,startY-amp,w*.55,endY+amp,w+20,endY);c.stroke();
    if(rand()>.62){c.strokeStyle='rgba(244,230,196,.48)';c.lineWidth=.7;c.stroke();}
  }
  for(let i=0;i<11;i++){c.fillStyle='rgba(91,67,50,.16)';c.beginPath();c.ellipse(rand()*w,rand()*h,35+rand()*95,12+rand()*35,rand()*Math.PI,0,Math.PI*2);c.fill();}
}

function drawGasGiant(c,w,h,rand,type) {
  const jupiter=type==='jupiter';
  const hot=type==='wasp39b';
  const palette=jupiter?['#c9b59d','#7f5e4e','#e8dfcb','#a8704f','#d7c1a0','#806558']:hot?['#5f2c25','#b65b3c','#e49a62','#743729','#d07849']:['#e3d19a','#bcae83','#f2e6b9','#c8b786','#ead9a1'];
  for(let y=0;y<h;y++){
    const latitude=Math.abs(y/h-.5)*2;
    const wave=Math.sin(y*(jupiter?.087:.045))+Math.sin(y*.013)*.5;
    const index=Math.abs(Math.floor((y/(jupiter?26:48))+wave))%palette.length;
    c.fillStyle=palette[index];c.fillRect(0,y,w,1);
    if(rand()>.55){c.globalAlpha=.08+latitude*.08;c.fillStyle=palette[(index+2)%palette.length];c.fillRect(0,y,w,1);c.globalAlpha=1;}
  }
  c.save();c.globalAlpha=jupiter?.33:.16;
  for(let i=0;i<(jupiter?260:110);i++){
    c.strokeStyle=palette[Math.floor(rand()*palette.length)];c.lineWidth=.4+rand()*3;c.beginPath();const y=rand()*h;c.moveTo(-20,y);c.bezierCurveTo(w*.28,y+(rand()-.5)*22,w*.66,y+(rand()-.5)*22,w+20,y+(rand()-.5)*12);c.stroke();
  }
  c.restore();
  if(jupiter){
    c.save();c.translate(w*.73,h*.68);c.scale(1,.48);const spot=c.createRadialGradient(-25,-8,5,0,0,108);spot.addColorStop(0,'#e1a175');spot.addColorStop(.42,'#b85b3d');spot.addColorStop(.72,'#d48761');spot.addColorStop(1,'rgba(100,45,34,0)');c.fillStyle=spot;c.beginPath();c.arc(0,0,110,0,Math.PI*2);c.fill();c.strokeStyle='rgba(246,204,170,.45)';c.lineWidth=8;c.beginPath();c.arc(0,0,70,0,Math.PI*2);c.stroke();c.restore();
  }
}

function drawTitan(c,w,h,rand) {
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#9d6b2c');g.addColorStop(.22,'#e2a548');g.addColorStop(.5,'#c78332');g.addColorStop(.78,'#e0a34c');g.addColorStop(1,'#8d6029');c.fillStyle=g;c.fillRect(0,0,w,h);
  grain(c,w,h,rand,['#f3c46c','#71471e','#c88738'],5000,.08);
  c.fillStyle='rgba(255,208,114,.16)';for(let y=0;y<h;y+=18+rand()*18)c.fillRect(0,y,w,3+rand()*8);
}

function drawPluto(c,w,h,rand) {
  drawRocky(c,w,h,rand,{base:'#ad9984',light:'#ddc9af',dark:'#5a4b43',craters:65});
  c.save();c.fillStyle='rgba(235,219,192,.82)';c.translate(w*.67,h*.49);c.beginPath();c.moveTo(0,95);c.bezierCurveTo(-125,35,-115,-95,-25,-68);c.bezierCurveTo(35,-115,112,-48,92,24);c.bezierCurveTo(75,82,28,116,0,95);c.fill();c.restore();
  c.fillStyle='rgba(70,55,51,.25)';for(let i=0;i<16;i++){c.beginPath();c.ellipse(rand()*w,rand()*h,35+rand()*130,8+rand()*30,rand()*Math.PI,0,Math.PI*2);c.fill();}
}

function drawUnknownExoplanet(c,w,h,rand,id) {
  if(id==='wasp39b'){drawGasGiant(c,w,h,rand,'wasp39b');return;}
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#85817d');g.addColorStop(.24,'#5e5a57');g.addColorStop(.5,'#79736e');g.addColorStop(.76,'#4b4948');g.addColorStop(1,'#817c77');c.fillStyle=g;c.fillRect(0,0,w,h);
  grain(c,w,h,rand,['#a39b93','#302f2f','#73706d'],7000,.08);
  c.strokeStyle='rgba(190,201,201,.11)';for(let i=0;i<35;i++){c.lineWidth=2+rand()*8;c.beginPath();const y=rand()*h;c.moveTo(0,y);c.bezierCurveTo(w*.3,y-20,w*.7,y+20,w,y);c.stroke();}
}

export function makePlanetTexture(object) {
  const {canvas,c,w,h}=canvas2d();const rand=randomFactory(`surface:${object.id}`);
  if(object.id==='mars')drawMars(c,w,h,rand);
  else if(object.id==='europa')drawEuropa(c,w,h,rand);
  else if(object.id==='jupiter')drawGasGiant(c,w,h,rand,'jupiter');
  else if(object.id==='saturn')drawGasGiant(c,w,h,rand,'saturn');
  else if(object.id==='titan')drawTitan(c,w,h,rand);
  else if(object.id==='pluto')drawPluto(c,w,h,rand);
  else if(object.category==='exoplanet')drawUnknownExoplanet(c,w,h,rand,object.id);
  else if(object.id==='moon')drawMoon(c,w,h,rand);
  else if(object.id==='ceres')drawCeres(c,w,h,rand);
  else drawRocky(c,w,h,rand,{base:object.color,light:object.accent,dark:'#292724',craters:155});
  return finish(canvas);
}

export function makeNebulaTexture(object) {
  const {canvas,c,w,h}=canvas2d(1280,720);const rand=randomFactory(`nebula:${object.id}`);
  const crab=object.id==='crab';
  c.fillStyle='#01040a';c.fillRect(0,0,w,h);c.globalCompositeOperation='screen';
  const cloudCount=crab?140:210;
  for(let i=0;i<cloudCount;i++){
    const angle=rand()*Math.PI*2,extent=crab?Math.pow(rand(),.55):Math.pow(rand(),.8);
    const x=w*.5+Math.cos(angle)*extent*w*(crab?.24:.37)+(rand()-.5)*55;
    const y=h*.5+Math.sin(angle)*extent*h*(crab?.25:.34)+(rand()-.5)*45;
    const rx=25+rand()*(crab?135:205),ry=18+rand()*(crab?78:125);
    const color=crab?(rand()>.53?'83,178,203':rand()>.46?'225,104,58':'244,181,104'):(rand()>.66?'113,72,164':rand()>.44?'39,128,167':'183,69,125');
    const g=c.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
    g.addColorStop(0,`rgba(${color},${.035+rand()*.105})`);g.addColorStop(.52,`rgba(${color},${.018+rand()*.045})`);g.addColorStop(1,`rgba(${color},0)`);
    c.save();c.translate(x,y);c.rotate(rand()*Math.PI);c.scale(rx/Math.max(rx,ry),ry/Math.max(rx,ry));c.fillStyle=g;c.fillRect(-Math.max(rx,ry),-Math.max(rx,ry),Math.max(rx,ry)*2,Math.max(rx,ry)*2);c.restore();
  }
  if(crab){
    c.save();c.translate(w*.5,h*.5);c.scale(1,.62);
    for(let i=0;i<170;i++){
      const a=rand()*Math.PI*2,r0=35+rand()*175,r1=r0+45+rand()*125,bend=(rand()-.5)*.7;
      c.strokeStyle=rand()>.42?'rgba(244,133,67,.24)':'rgba(83,202,226,.19)';c.lineWidth=.45+rand()*2.5;c.beginPath();
      c.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);c.bezierCurveTo(Math.cos(a+bend)*r0*1.25,Math.sin(a+bend)*r0*1.25,Math.cos(a-bend*.45)*r1*.8,Math.sin(a-bend*.45)*r1*.8,Math.cos(a+bend*.18)*r1,Math.sin(a+bend*.18)*r1);c.stroke();
    }
    c.restore();
    const core=c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,105);core.addColorStop(0,'rgba(195,226,255,.25)');core.addColorStop(.2,'rgba(71,147,203,.13)');core.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=core;c.fillRect(w*.5-110,h*.5-110,220,220);
  }else{
    const core=c.createRadialGradient(w*.51,h*.48,0,w*.51,h*.48,185);core.addColorStop(0,'rgba(246,238,218,.65)');core.addColorStop(.14,'rgba(158,208,235,.30)');core.addColorStop(.45,'rgba(146,69,157,.15)');core.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=core;c.fillRect(w*.51-190,h*.48-190,380,380);
    c.globalCompositeOperation='source-over';
    for(let i=0;i<8;i++){
      c.strokeStyle=`rgba(2,3,7,${.19+rand()*.18})`;c.lineWidth=8+rand()*25;c.lineCap='round';c.beginPath();const sy=h*(.82-rand()*.18);c.moveTo(w*(.06+rand()*.08),sy);c.bezierCurveTo(w*.28,sy-h*(.05+rand()*.16),w*.42,h*(.58-rand()*.14),w*(.62+rand()*.2),h*(.17+rand()*.17));c.stroke();
    }
  }
  c.globalCompositeOperation='screen';for(let i=0;i<680;i++){const a=rand()*.72+.18;c.fillStyle=`rgba(220,236,255,${a})`;const s=rand()> .985?2.8:.35+rand()*1.15;c.fillRect(rand()*w,rand()*h,s,s);}
  return finish(canvas);
}

export function makeGalaxyTexture(object) {
  const {canvas,c,w,h}=canvas2d(1280,720);const rand=randomFactory(`galaxy:${object.id}`);c.clearRect(0,0,w,h);c.globalCompositeOperation='screen';
  const arms=object.id==='milky-way'?4:2;
  const flatten=object.id==='andromeda'?.27:.38;
  for(let i=0;i<52000;i++){
    const arm=i%arms,r=Math.pow(rand(),.58)*530,scatter=.16+.62*(r/530),angle=r*(object.id==='andromeda'?.0105:.0125)+arm*Math.PI*2/arms+(rand()-.5)*scatter,x=w*.5+Math.cos(angle)*r,y=h*.5+Math.sin(angle)*r*flatten+(rand()-.5)*(3+r*.012);
    const young=rand()>.88;c.fillStyle=young?`rgba(120,176,255,${.19+rand()*.53})`:`rgba(255,226,184,${.09+rand()*.44})`;const s=rand()>.994?2.3:.38+rand()*1.05;c.fillRect(x,y,s,s);
  }
  const core=c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,215);core.addColorStop(0,'rgba(255,248,220,.96)');core.addColorStop(.18,'rgba(255,205,135,.55)');core.addColorStop(.55,'rgba(194,134,84,.18)');core.addColorStop(1,'rgba(80,55,40,0)');c.save();c.translate(w*.5,h*.5);c.scale(1,object.id==='andromeda'?.5:.66);c.fillStyle=core;c.fillRect(-220,-220,440,440);c.restore();
  c.globalCompositeOperation='source-over';
  for(let arm=0;arm<arms;arm++){c.strokeStyle='rgba(5,5,8,.42)';c.lineWidth=7+(object.id==='andromeda'?5:2);c.beginPath();for(let j=22;j<205;j++){const r=j*2.5,angle=r*(object.id==='andromeda'?.0105:.0125)+arm*Math.PI*2/arms,x=w*.5+Math.cos(angle)*r,y=h*.5+Math.sin(angle)*r*flatten;j===22?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
  c.globalCompositeOperation='screen';
  for(let i=0;i<1900;i++){const a=rand()*Math.PI*2,r=Math.pow(rand(),.7)*545,x=w*.5+Math.cos(a)*r,y=h*.5+Math.sin(a)*r*flatten;c.fillStyle=`rgba(205,221,255,${.08+rand()*.28})`;const s=.25+rand()*.75;c.fillRect(x,y,s,s);}
  return finish(canvas);
}

export function makeCmbTexture() {
  const {canvas,c,w,h}=canvas2d(1280,640);const rand=randomFactory('planck-cmb-fallback');c.fillStyle='#8a614f';c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
  const colors=['45,75,125','68,105,159','196,82,58','224,135,78','235,203,146','38,58,105'];
  for(const [count,min,max,alpha] of [[250,35,150,.34],[950,8,42,.24],[4200,1.5,12,.16]]){
    for(let i=0;i<count;i++){
      const x=rand()*w,y=rand()*h,r=min+Math.pow(rand(),1.8)*(max-min),col=colors[Math.floor(rand()*colors.length)],g=c.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,`rgba(${col},${alpha*(.45+rand()*.55)})`);g.addColorStop(.45,`rgba(${col},${alpha*.42})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
    }
  }
  c.globalCompositeOperation='overlay';grain(c,w,h,rand,['#f1d7a2','#244675','#b94c3b','#5f82b5'],15000,.075);
  return finish(canvas);
}
