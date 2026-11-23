import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import land110m from 'world-atlas/land-110m.json';
import { OBJECT_TEXTURES, SCIENCE_TEXTURES, useScienceTexture } from '../engine/scienceAssets';
import { makeCmbTexture, makeGalaxyTexture, makeNebulaTexture, makePlanetTexture } from '../engine/proceduralTextures';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const planetFragment = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uBands;
  uniform float uStorm;
  varying vec2 vUv;
  varying vec3 vNormal;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
  }
  float fbm(vec2 p){ float v=0.; float a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+17.2;a*=.5;} return v; }
  void main(){
    vec2 p=vUv*vec2(9.,5.);
    float n=fbm(p+vec2(uTime*.007,0.));
    float bands=.5+.5*sin((vUv.y+n*.10)*uBands*6.283);
    float rocky=fbm(p*1.8)+.35*fbm(p*5.2);
    float mask=mix(rocky,bands,smoothstep(.05,.65,uStorm));
    vec3 color=mix(uColorA,uColorB,smoothstep(.22,.82,mask));
    float limb=.30+.70*max(0.,dot(normalize(vNormal),normalize(vec3(.5,.35,1.))));
    gl_FragColor=vec4(color*limb,1.);
  }
`;

const starFragment = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uCore;
  uniform vec3 uEdge;
  varying vec2 vUv;
  varying vec3 vNormal;
  float hash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*45758.2);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  void main(){
    float gran=noise(vUv*95.+uTime*.04)*.36+noise(vUv*31.-uTime*.025)*.32;
    float limb=pow(max(0.,dot(normalize(vNormal),vec3(0,0,1))),.42);
    vec3 col=mix(uEdge,uCore,limb)+gran*uCore*.44;
    gl_FragColor=vec4(col,1.);
  }
`;

const atmosphereFragment = `
  precision highp float;
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main(){
    float f=pow(1.0-max(0.0,dot(normalize(vNormal),vec3(0.,0.,1.))),3.1);
    gl_FragColor=vec4(uColor,f*.7);
  }
`;

const cloudFragment = `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
  }
  float fbm(vec2 p){ float v=0.; float a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.05+11.7;a*=.5;} return v; }
  void main(){
    vec2 wind=vec2(uTime*.004,0.0);
    float broad=fbm(vUv*vec2(8.,4.)+wind);
    float fine=fbm(vUv*vec2(29.,13.)-wind*1.7);
    float cloud=smoothstep(.56,.79,broad*.74+fine*.34);
    float polar=smoothstep(.66,.96,abs(vUv.y-.5)*2.0);
    float alpha=clamp(cloud*.55+polar*.18,0.,.48);
    float softLight=.55+.45*max(0.,dot(normalize(vNormal),normalize(vec3(.45,.3,1.))));
    gl_FragColor=vec4(vec3(.92,.96,1.)*softLight,alpha);
  }
`;

const accretionFragment = `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(41.7,289.3)))*45758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  void main(){
    vec2 p=(vUv-.5)*2.;
    float r=length(p);
    float angle=atan(p.y,p.x);
    float flow=noise(vec2(angle*9.-uTime*.55,r*42.))+noise(vec2(angle*23.+uTime*.32,r*91.))*.42;
    float inner=smoothstep(.34,.385,r);
    float outer=1.-smoothstep(.86,1.,r);
    float filaments=.38+.62*smoothstep(.18,.86,flow);
    float heat=1.-smoothstep(.38,.96,r);
    vec3 cool=vec3(.72,.10,.025);
    vec3 warm=vec3(1.,.49,.10);
    vec3 hot=vec3(1.,.93,.68);
    vec3 color=mix(cool,warm,smoothstep(.05,.62,heat));
    color=mix(color,hot,smoothstep(.58,1.,heat));
    float beaming=clamp(.42+1.25*(p.x*.5+.5),.32,1.65);
    float alpha=inner*outer*filaments*(.33+.67*heat);
    gl_FragColor=vec4(color*beaming*(.9+heat*.8),alpha);
  }
`;

const saturnRingFragment = `
  precision highp float;
  varying vec2 vUv;
  float hash(float n){return fract(sin(n)*43758.5453);}
  void main(){
    vec2 p=(vUv-.5)*2.;
    float r=length(p);
    float fine=.72+.28*sin(r*640.+hash(floor(r*170.))*5.);
    float broad=.58+.22*sin(r*76.)+.12*sin(r*173.);
    float cassini=1.-smoothstep(.0,.012,abs(r-.805));
    float encke=1.-smoothstep(.0,.004,abs(r-.935));
    float inner=smoothstep(.60,.67,r);
    float outer=1.-smoothstep(.965,1.,r);
    float density=clamp((broad*fine)*inner*outer,0.,1.)*(1.-cassini*.93)*(1.-encke*.72);
    vec3 ice=mix(vec3(.50,.43,.34),vec3(.91,.83,.67),smoothstep(.62,.92,r));
    float illumination=.55+.45*clamp(p.x*.5+.5,0.,1.);
    gl_FragColor=vec4(ice*illumination,density*.84);
  }
`;

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 1024;
  const c = canvas.getContext('2d');
  const ocean = c.createLinearGradient(0,0,0,1024);
  ocean.addColorStop(0,'#06172a'); ocean.addColorStop(.5,'#0a3550'); ocean.addColorStop(1,'#07182c');
  c.fillStyle=ocean; c.fillRect(0,0,2048,1024);
  const geography = feature(land110m, land110m.objects.land);
  c.beginPath();
  const drawRing=(ring)=>{ ring.forEach(([lon,lat],i)=>{ const x=(lon+180)/360*2048; const y=(90-lat)/180*1024; i?c.lineTo(x,y):c.moveTo(x,y); }); c.closePath(); };
  const walk=(coordinates)=>{
    if(typeof coordinates?.[0]?.[0]?.[0]==='number') coordinates.forEach(drawRing);
    else coordinates.forEach(walk);
  };
  geography.features ? geography.features.forEach((f)=>walk(f.geometry.coordinates)) : walk(geography.geometry.coordinates);
  const landGradient=c.createLinearGradient(0,180,0,850);
  landGradient.addColorStop(0,'#d7d2b6');landGradient.addColorStop(.18,'#58744e');landGradient.addColorStop(.52,'#657348');landGradient.addColorStop(.76,'#8b724d');landGradient.addColorStop(1,'#dedbd0');
  c.fillStyle=landGradient; c.fill();
  c.globalAlpha=.18; c.fillStyle='#b9d4cf';
  for(let i=0;i<3500;i++){ const x=Math.random()*2048,y=Math.random()*1024,r=Math.random()*2.3;c.fillRect(x,y,r,r); }
  c.globalAlpha=1;
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=8;
  return texture;
}

function Atmosphere({ color='#72bde6', scale=1.065 }) {
  return <mesh scale={scale}>
    <sphereGeometry args={[2.72,96,64]} />
    <shaderMaterial vertexShader={vertexShader} fragmentShader={atmosphereFragment} uniforms={{uColor:{value:new THREE.Color(color)}}} transparent blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false} />
  </mesh>;
}

function CloudLayer() {
  const material=useRef();
  const uniforms=useMemo(()=>({uTime:{value:0}}),[]);
  useFrame((_,delta)=>{if(material.current)material.current.uniforms.uTime.value+=delta;});
  return <mesh scale={1.008} rotation={[0,0,.08]}>
    <sphereGeometry args={[2.72,128,96]} />
    <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={cloudFragment} uniforms={uniforms} transparent depthWrite={false} />
  </mesh>;
}

function Earth({ detail=1 }) {
  const group=useRef();
  const fallbackTexture=useMemo(makeEarthTexture,[]);
  const scienceTexture=useScienceTexture(SCIENCE_TEXTURES.earth);
  const texture=scienceTexture||fallbackTexture;
  useFrame((_,d)=>{if(group.current)group.current.rotation.y+=d*.025;});
  return <group rotation={[0,0,THREE.MathUtils.degToRad(23.44)]}>
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2.72,detail>0.7?160:64,detail>0.7?112:48]} />
        <meshPhysicalMaterial map={texture} roughness={.68} metalness={0} clearcoat={.08} clearcoatRoughness={.72} />
      </mesh>
      <CloudLayer />
      <Atmosphere />
    </group>
  </group>;
}

function Planet({ object, detail=1 }) {
  const mesh=useRef();
  const scienceTexture=useScienceTexture(OBJECT_TEXTURES[object.id]);
  const lunarHeight=useScienceTexture(object.id==='moon'?SCIENCE_TEXTURES.moonHeight:null,false);
  const fallbackTexture=useMemo(()=>makePlanetTexture(object),[object.id]);
  const surfaceTexture=scienceTexture||fallbackTexture;
  const gas=['gas giant','atmosphere-rich icy satellite'].some((v)=>object.class.includes(v));
  const hot=object.id==='wasp39b';
  const ice=object.id==='europa';
  const atmosphere=['mars','titan','jupiter','saturn','wasp39b','trappist1e'].includes(object.id);
  const flattening=object.id==='saturn'?.90:object.id==='jupiter'?.935:object.id==='wasp39b'?.95:1;
  const tilt=object.id==='mars'?.439:object.id==='saturn'?.466:object.id==='jupiter'?.055:object.id==='pluto'?2.09:object.id==='titan'?.47:0;
  useFrame((_,d)=>{if(mesh.current)mesh.current.rotation.y+=d*(gas?.055:.025);});
  return <group scale={[1,flattening,1]} rotation={[0,0,tilt]}>
    <mesh ref={mesh} castShadow receiveShadow>
      <sphereGeometry args={[2.72,detail>.7?160:64,detail>.7?112:48]} />
      <meshPhysicalMaterial
        map={surfaceTexture}
        bumpMap={object.id==='moon' ? (lunarHeight||surfaceTexture) : (!scienceTexture&&!gas ? fallbackTexture : undefined)}
        bumpScale={object.id==='moon'?.075:gas?0:.028}
        roughness={gas?.62:.9}
        metalness={0}
        clearcoat={gas?.1:0}
      />
    </mesh>
    {atmosphere && <Atmosphere color={object.id==='titan'?'#e0a350':object.id==='mars'?'#b96546':object.accent} scale={object.id==='titan'?1.13:1.055} />}
    {ice && <group>{Array.from({length:18},(_,i)=><mesh key={i} rotation={[0,(i/18)*Math.PI*2,Math.sin(i)*1.5]}><torusGeometry args={[2.725,0.008,3,80,Math.PI*.85]}/><meshBasicMaterial color="#594f45" transparent opacity={.38}/></mesh>)}</group>}
    {object.id==='saturn' && <Rings />}
  </group>;
}

function Rings(){
  const ref=useRef(); useFrame((_,d)=>{if(ref.current)ref.current.rotation.z+=d*.003;});
  return <group ref={ref} rotation={[Math.PI*.47,.12,.15]}>
    <mesh receiveShadow>
      <ringGeometry args={[3.12,5.15,512]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={saturnRingFragment} transparent side={THREE.DoubleSide} depthWrite={false}/>
    </mesh>
    <mesh><ringGeometry args={[2.88,3.13,256]}/><meshBasicMaterial color="#a99775" transparent opacity={.12} side={THREE.DoubleSide} depthWrite={false}/></mesh>
  </group>;
}

function Star({ object, compact=false }){
  const group=useRef();const material=useRef();
  const uniforms=useMemo(()=>({uTime:{value:0},uCore:{value:new THREE.Color(object.accent)},uEdge:{value:new THREE.Color(object.color)}}),[object]);
  useFrame((_,d)=>{if(group.current)group.current.rotation.y+=d*.018;if(material.current)material.current.uniforms.uTime.value+=d;});
  const radius=compact?2.1:2.72;
  return <group ref={group}>
    <mesh><sphereGeometry args={[radius,96,64]}/><shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={starFragment} uniforms={uniforms}/></mesh>
    {[1.12,1.22,1.38].map((s,i)=><mesh scale={s} key={s}><sphereGeometry args={[compact?2.1:2.72,48,32]}/><meshBasicMaterial color={object.color} transparent opacity={[.08,.035,.015][i]} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false}/></mesh>)}
    {!compact&&['sun','betelgeuse'].includes(object.id)&&[[.55,.42,.28],[-.72,-.18,.22],[.12,-.62,.16]].map((p,i)=><mesh key={i} position={[p[0],p[1],radius-.018]} scale={[1.5,.62,1]}><circleGeometry args={[p[2],24]}/><meshBasicMaterial color={object.id==='sun'?'#6d321a':'#5b1d16'} transparent opacity={.44}/></mesh>)}
    {!compact&&[0,.9,1.8].map((angle,i)=><mesh key={angle} rotation={[angle*.33,angle,.2]}><torusGeometry args={[radius*1.03,.018+i*.006,8,96,Math.PI*(.34+i*.06)]}/><meshBasicMaterial color={object.accent} transparent opacity={.12-i*.02} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>)}
    <pointLight color={object.accent} intensity={45} distance={45}/>
  </group>;
}

function SmallBody({ object }){
  const ref=useRef(); useFrame((_,d)=>{if(ref.current){ref.current.rotation.x+=d*.07;ref.current.rotation.y+=d*.11;}});
  const comet=object.category==='comet';
  const scale=object.id==='oumuamua'?[2.25,.55,.48]:object.id==='bennu'?[1.05,1.22,1.05]:[1.38,.82,.72];
  const geometry=useMemo(()=>{
    const result=new THREE.IcosahedronGeometry(2.2,6);
    const positions=result.attributes.position;
    for(let i=0;i<positions.count;i++){
      const p=new THREE.Vector3().fromBufferAttribute(positions,i);
      const variation=1+.10*Math.sin(p.x*3.7+p.z*1.4)+.065*Math.sin(p.y*7.1-p.x*2.3)+.035*Math.sin((p.x+p.y+p.z)*13.);
      p.normalize().multiplyScalar(2.2*variation);
      positions.setXYZ(i,p.x,p.y,p.z);
    }
    positions.needsUpdate=true;
    result.computeVertexNormals();
    return result;
  },[]);
  return <group>
    <mesh ref={ref} geometry={geometry} scale={scale} castShadow receiveShadow>
      <meshStandardMaterial color={object.color} roughness={.98} metalness={.01}/>
    </mesh>
    {object.id==='bennu'&&Array.from({length:32},(_,i)=>{
      const a=i*2.399, y=-1.75+(i/31)*3.5,rad=Math.sqrt(Math.max(0,1-(y/2.05)**2))*2.15;
      return <mesh key={i} position={[Math.cos(a)*rad,y,Math.sin(a)*rad]} scale={.07+(i%5)*.018}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%3?'#3c3a37':'#59544e'} roughness={1}/></mesh>;
    })}
    {comet && <>
      <mesh><sphereGeometry args={[3.0,48,32]}/><meshBasicMaterial color="#c8f6ef" transparent opacity={.07} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
      <mesh position={[7,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[2.2,15,64,1,true]}/><meshBasicMaterial color="#9fe6f1" transparent opacity={.09} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
      <mesh position={[9,-1.1,0]} rotation={[0,0,-Math.PI/2-.08]}><coneGeometry args={[3.1,19,64,1,true]}/><meshBasicMaterial color="#e9d7b2" transparent opacity={.045} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
      <pointLight color="#bff7ff" intensity={8} distance={14}/>
    </>}
  </group>;
}

function Pulsar({ object }){
  const beams=useRef(); useFrame((_,d)=>{if(beams.current)beams.current.rotation.z+=d*(object.category==='magnetar'?1.6:3.2);});
  return <group>
    <Star object={{...object,color:'#65baff',accent:'#ffffff'}} compact />
    <group ref={beams} rotation={[.2,0,.4]}>
      {[-1,1].map((s)=><mesh key={s} position={[0,s*4.8,0]} rotation={[s>0?0:Math.PI,0,0]}><coneGeometry args={[.46,9.2,48,1,true]}/><meshBasicMaterial color="#7edcff" transparent opacity={.16} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}/></mesh>)}
    </group>
    {object.category==='magnetar' && [3.2,3.7,4.2].map((r,i)=><mesh key={r} rotation={[Math.PI/2,i*.72,0]}><torusGeometry args={[r,.018,8,160]}/><meshBasicMaterial color="#8fdfff" transparent opacity={.25} blending={THREE.AdditiveBlending}/></mesh>)}
  </group>;
}

function AccretionDisk(){
  const material=useRef();
  const uniforms=useMemo(()=>({uTime:{value:0}}),[]);
  useFrame((_,d)=>{if(material.current)material.current.uniforms.uTime.value+=d;});
  return <mesh rotation={[Math.PI/2,0,0]}>
    <ringGeometry args={[1.55,4.5,256,1]}/>
    <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={accretionFragment} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}/>
  </mesh>;
}

function BlackHole({ object, quasar=false }){
  return <group rotation={[.25,0,.08]}>
    <mesh><sphereGeometry args={[1.45,96,64]}/><meshBasicMaterial color="#000000"/></mesh>
    <mesh><torusGeometry args={[1.55,.055,32,256]}/><meshBasicMaterial color="#fff5cf" toneMapped={false}/></mesh>
    <AccretionDisk/>
    <mesh scale={[1,1.13,1]}><torusGeometry args={[1.7,.12,32,256]}/><meshBasicMaterial color="#f2bd72" transparent opacity={.16} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>
    {(quasar||object.id==='m87star') && [-1,1].map((s)=><mesh key={s} position={[0,s*5.2,0]} rotation={[s>0?0:Math.PI,0,0]}><coneGeometry args={[.36,10,48,1,true]}/><meshBasicMaterial color="#c7eaff" transparent opacity={.17} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}/></mesh>)}
    <pointLight color="#ff9a55" intensity={25} distance={22}/>
  </group>;
}

function seeded(seed){ let x=seed; return()=>{x=Math.sin(x*999.91)*43758.5453;return x-Math.floor(x)}; }

function Nebula({ object }){
  const points=useMemo(()=>{const rand=seeded(object.id.length*7.3),n=4200,pos=new Float32Array(n*3),col=new Float32Array(n*3),a=new THREE.Color(object.color),b=new THREE.Color(object.accent);for(let i=0;i<n;i++){const r=Math.pow(rand(),.58)*5.5,th=rand()*Math.PI*2,ph=Math.acos(2*rand()-1),k=i*3;pos[k]=Math.sin(ph)*Math.cos(th)*r*(1.2+.45*Math.sin(th*3));pos[k+1]=Math.cos(ph)*r*.62;pos[k+2]=Math.sin(ph)*Math.sin(th)*r*.75;const c=a.clone().lerp(b,rand());col.set([c.r,c.g,c.b],k)}return{pos,col,n}},[object]);
  const projectedTexture=useMemo(()=>makeNebulaTexture(object),[object.id]);
  const ref=useRef();useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*.003});
  return <group ref={ref}>
    <TelescopeImageBackdrop
      path={object.id==='orion-nebula'?SCIENCE_TEXTURES.orion:object.id==='crab'?SCIENCE_TEXTURES.crab:null}
      fallback={projectedTexture}
      scale={object.id==='crab'?[8.6,8.18,1]:[8.6,8.6,1]}
      position={[0,0,object.id==='crab'?-3.2:-3.6]}
      opacity={.9}
    />
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[points.pos,3]}/><bufferAttribute attach="attributes-color" args={[points.col,3]}/></bufferGeometry><pointsMaterial size={.085} vertexColors transparent opacity={.34} depthWrite={false} blending={THREE.AdditiveBlending}/></points>
    {[1.7,2.8,4.1].map((r,i)=><mesh key={r} scale={[1.5,.75,1]}><sphereGeometry args={[r,32,24]}/><meshBasicMaterial color={i%2?object.color:object.accent} transparent opacity={[.025,.018,.01][i]} blending={THREE.AdditiveBlending} side={THREE.BackSide} depthWrite={false}/></mesh>)}
  </group>;
}

function TelescopeImageBackdrop({ path, fallback, scale, position, opacity=.82 }) {
  const scienceTexture=useScienceTexture(path);
  const texture=scienceTexture||fallback;
  if(!texture)return null;
  return <mesh scale={scale} position={position} renderOrder={-1}>
    <planeGeometry args={[1,1]}/>
    <meshBasicMaterial map={texture} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/>
  </mesh>;
}

function Galaxy({ object, cluster=false }){
  const data=useMemo(()=>{const rand=seeded(object.id.length*14.17),n=cluster?3200:6500,pos=new Float32Array(n*3),col=new Float32Array(n*3),a=new THREE.Color(object.color),b=new THREE.Color(object.accent);for(let i=0;i<n;i++){const k=i*3;if(cluster){const R=Math.pow(rand(),.4)*6,th=rand()*Math.PI*2,ph=Math.acos(2*rand()-1);pos[k]=Math.sin(ph)*Math.cos(th)*R;pos[k+1]=Math.cos(ph)*R;pos[k+2]=Math.sin(ph)*Math.sin(th)*R;}else{const arm=i%4,rad=Math.pow(rand(),.55)*5.8,ang=rad*1.55+arm*Math.PI/2+(rand()-.5)*.55;pos[k]=Math.cos(ang)*rad;pos[k+1]=(rand()-.5)*(.52-.36*rad/5.8);pos[k+2]=Math.sin(ang)*rad;}const c=a.clone().lerp(b,Math.pow(rand(),.45));col.set([c.r,c.g,c.b],k)}return{pos,col}},[object,cluster]);
  const projection=useMemo(()=>cluster?null:makeGalaxyTexture(object),[object.id,cluster]);
  const clusterGalaxies=useMemo(()=>{
    if(!cluster)return[];const rand=seeded(918.4),rows=[];
    for(let i=0;i<115;i++){const R=Math.pow(rand(),.52)*5.8,th=rand()*Math.PI*2,ph=Math.acos(2*rand()-1);rows.push({position:[Math.sin(ph)*Math.cos(th)*R,Math.cos(ph)*R,Math.sin(ph)*Math.sin(th)*R],rotation:[rand()*Math.PI,rand()*Math.PI,rand()*Math.PI],scale:.055+rand()*.16,color:rand()>.72?'#9fc5ff':'#ffe7be'});}return rows;
  },[cluster]);
  const ref=useRef();useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*.002});
  return <group ref={ref} rotation={[cluster?0:.28,0,.08]}>
    {!cluster&&<TelescopeImageBackdrop path={object.id==='andromeda'?SCIENCE_TEXTURES.andromeda:null} fallback={projection} scale={object.id==='andromeda'?[11,3.54,1]:[11,6.2,1]} position={[0,0,-2.8]} opacity={object.id==='andromeda'?.92:.68}/>} 
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.pos,3]}/><bufferAttribute attach="attributes-color" args={[data.col,3]}/></bufferGeometry><pointsMaterial size={cluster?.055:.035} vertexColors transparent opacity={object.id==='andromeda'?.38:.82} depthWrite={false} blending={THREE.AdditiveBlending}/></points>
    {clusterGalaxies.map((g,i)=><mesh key={i} position={g.position} rotation={g.rotation} scale={[g.scale*2.8,g.scale*.28,g.scale]}><sphereGeometry args={[1,20,10]}/><meshBasicMaterial color={g.color} transparent opacity={.74} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>)}
    {cluster&&<mesh scale={[1.2,.35,1.2]}><sphereGeometry args={[1.2,36,20]}/><meshBasicMaterial color="#fff2cf" transparent opacity={.28} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
    {!cluster&&object.id!=='andromeda'&&<mesh scale={[1.3,.2,1.3]}><sphereGeometry args={[1.2,32,20]}/><meshBasicMaterial color="#fff1cc" transparent opacity={.25} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}
  </group>;
}

function CmbSphere(){
  const texture=useMemo(makeCmbTexture,[]);
  const ref=useRef();useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*.004;});
  return <group ref={ref}>
    <mesh><sphereGeometry args={[5.8,96,64]}/><meshBasicMaterial map={texture}/></mesh>
    <mesh scale={1.04}><sphereGeometry args={[5.8,64,48]}/><meshBasicMaterial color="#e6a177" transparent opacity={.08} side={THREE.BackSide} blending={THREE.AdditiveBlending}/></mesh>
  </group>;
}

function CosmicStructure({ object, universe=false }){
  const lines=useMemo(()=>{
    const rand=seeded(object.id.length*31.2),points=[];
    if(object.id==='sloan-wall'){
      for(let f=0;f<95;f++){let p=new THREE.Vector3(-6,(rand()-.5)*5,(rand()-.5)*1.2);for(let j=0;j<15;j++){const next=p.clone().add(new THREE.Vector3(.75+rand()*.25,(rand()-.5)*.65,(rand()-.5)*.35));points.push(p,next);p=next;}}
    }else{
      for(let f=0;f<110;f++){let p=new THREE.Vector3((rand()-.5)*12,(rand()-.5)*8,(rand()-.5)*9);const attractor=new THREE.Vector3((rand()-.5)*2,(rand()-.5)*1.5,(rand()-.5)*2);for(let j=0;j<11;j++){const next=p.clone().lerp(attractor,.10+rand()*.07).add(new THREE.Vector3((rand()-.5)*.22,(rand()-.5)*.22,(rand()-.5)*.22));points.push(p,next);p=next;}}
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  },[object.id]);
  const voidShell=useMemo(()=>{
    if(object.category!=='cosmic void')return null;const rand=seeded(771.3),n=3800,pos=new Float32Array(n*3),col=new Float32Array(n*3),a=new THREE.Color('#57739a'),b=new THREE.Color('#f0d2a7');for(let i=0;i<n;i++){const r=4.0+Math.pow(rand(),.7)*2.8,th=rand()*Math.PI*2,ph=Math.acos(2*rand()-1),k=i*3;pos[k]=Math.sin(ph)*Math.cos(th)*r;pos[k+1]=Math.cos(ph)*r;pos[k+2]=Math.sin(ph)*Math.sin(th)*r;const color=a.clone().lerp(b,rand());col.set([color.r,color.g,color.b],k);}return{pos,col};
  },[object.category]);
  const ref=useRef();useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*.006});
  return <group ref={ref}>
    {object.category==='cosmic void'&&<><mesh><sphereGeometry args={[3.9,64,48]}/><meshBasicMaterial color="#02040a" transparent opacity={.82}/></mesh><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[voidShell.pos,3]}/><bufferAttribute attach="attributes-color" args={[voidShell.col,3]}/></bufferGeometry><pointsMaterial size={.05} vertexColors transparent opacity={.82} blending={THREE.AdditiveBlending} depthWrite={false}/></points></>}
    {!universe&&object.category!=='cosmic void'&&<><lineSegments geometry={lines}><lineBasicMaterial color={object.accent} transparent opacity={object.id==='laniakea'?.34:.24} blending={THREE.AdditiveBlending}/></lineSegments><points geometry={lines}><pointsMaterial color={object.color} size={.035} transparent opacity={.55} blending={THREE.AdditiveBlending} depthWrite={false}/></points></>}
    {universe&&<CmbSphere/>}
  </group>;
}

function StarSystem({ object }){
  return <group><Star object={object} compact/>{[2.8,3.25,3.7,4.1,4.45,4.85,5.25].map((r,i)=><group key={r} rotation={[Math.PI/2,i*.3,0]}><mesh><torusGeometry args={[r,.008,3,160]}/><meshBasicMaterial color="#8bb4c7" transparent opacity={.22}/></mesh><mesh position={[r,0,0]}><sphereGeometry args={[.055+i*.006,16,12]}/><meshBasicMaterial color={i===3?'#aab9a4':'#766c67'}/></mesh></group>)}</group>;
}

export default function ObjectRenderer({ object, travelProgress=1, detail=1 }) {
  const scale=travelProgress<.72?.001:THREE.MathUtils.smoothstep(travelProgress,.70,1);
  const category=object.category;
  let visual;
  if(object.id==='earth') visual=<Earth detail={detail}/>;
  else if(['planet','moon','dwarf planet','exoplanet'].includes(category)) visual=<Planet object={object} detail={detail}/>;
  else if(['asteroid','comet'].includes(category)) visual=<SmallBody object={object}/>;
  else if(category==='star') visual=<Star object={object}/>;
  else if(category==='star system') visual=<StarSystem object={object}/>;
  else if(['pulsar','magnetar'].includes(category)) visual=<Pulsar object={object}/>;
  else if(category==='black hole') visual=<BlackHole object={object}/>;
  else if(category==='quasar') visual=<BlackHole object={object} quasar/>;
  else if(['nebula','supernova remnant'].includes(category)) visual=<Nebula object={object}/>;
  else if(category==='galaxy') visual=<Galaxy object={object}/>;
  else if(category==='galaxy cluster') visual=<Galaxy object={object} cluster/>;
  else visual=<CosmicStructure object={object} universe={category==='observable universe'}/>;
  return <group scale={scale} rotation={[0,0,0]}>{visual}</group>;
}
