import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import ObjectRenderer from './ObjectRenderer';
import { SCIENCE_TEXTURES, useScienceTexture } from '../engine/scienceAssets';

function DeepField({ quality='high', traveling=false, progress=0 }) {
  const ref=useRef();
  const skyTexture=useScienceTexture(SCIENCE_TEXTURES.milkyWay);
  const count=quality==='low'?1500:quality==='medium'?3300:6200;
  const data=useMemo(()=>{const pos=new Float32Array(count*3),colors=new Float32Array(count*3);let seed=421337;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};for(let i=0;i<count;i++){const r=45+random()*95,th=random()*Math.PI*2,ph=Math.acos(2*random()-1),k=i*3;pos[k]=r*Math.sin(ph)*Math.cos(th);pos[k+1]=r*Math.cos(ph);pos[k+2]=r*Math.sin(ph)*Math.sin(th);const temp=random(),c=new THREE.Color(temp>.86?'#98bdff':temp<.12?'#ffd0a1':'#ffffff');colors.set([c.r,c.g,c.b],k)}return{pos,colors}},[count]);
  const galacticBand=useMemo(()=>{const n=quality==='low'?900:quality==='medium'?2400:5200,pos=new Float32Array(n*3),col=new Float32Array(n*3);let seed=99871;const random=()=>{seed=(seed*48271)%2147483647;return(seed-1)/2147483646};for(let i=0;i<n;i++){const longitude=random()*Math.PI*2,latitude=(random()+random()+random()+random()-2)*.085,r=142+random()*7,k=i*3;const x=Math.cos(latitude)*Math.cos(longitude)*r,y=Math.sin(latitude)*r,z=Math.cos(latitude)*Math.sin(longitude)*r;pos[k]=x;pos[k+1]=y*.72+z*.31;pos[k+2]=z*.91-y*.24;const dust=Math.abs(latitude)<.022?random()*.25:.45+random()*.5,c=new THREE.Color(random()>.8?'#a9c8ff':'#ffe6c5').multiplyScalar(dust);col.set([c.r,c.g,c.b],k);}return{pos,col};},[quality]);
  useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*(traveling?.035:.0008)});
  return <group ref={ref}>
    {skyTexture&&<mesh rotation={[0,-Math.PI/2,0]}>
      <sphereGeometry args={[155,64,40]}/>
      <meshBasicMaterial map={skyTexture} side={THREE.BackSide} transparent opacity={traveling?.12:.30} depthWrite={false}/>
    </mesh>}
    {!skyTexture&&<points><bufferGeometry><bufferAttribute attach="attributes-position" args={[galacticBand.pos,3]}/><bufferAttribute attach="attributes-color" args={[galacticBand.col,3]}/></bufferGeometry><pointsMaterial size={.105} vertexColors transparent opacity={traveling?.18:.48} blending={THREE.AdditiveBlending} depthWrite={false}/></points>}
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.pos,3]}/><bufferAttribute attach="attributes-color" args={[data.colors,3]}/></bufferGeometry><pointsMaterial size={traveling?.10:.055} sizeAttenuation vertexColors transparent opacity={traveling?.82:.72} depthWrite={false}/></points>
  </group>;
}

function TravelStreaks({ active, progress }){
  const data=useMemo(()=>{const count=260,pos=new Float32Array(count*6);for(let i=0;i<count;i++){const x=(Math.random()-.5)*28,y=(Math.random()-.5)*17,z=-Math.random()*50;pos.set([x,y,z,x,y,z-3-Math.random()*13],i*6)}return pos},[]);
  const ref=useRef();useFrame((_,d)=>{if(ref.current){ref.current.position.z+=d*24;if(ref.current.position.z>12)ref.current.position.z=-15}});
  if(!active||progress<.07||progress>.9)return null;
  return <lineSegments ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data,3]}/></bufferGeometry><lineBasicMaterial color="#b8edff" transparent opacity={.12+Math.sin(progress*Math.PI)*.25} blending={THREE.AdditiveBlending}/></lineSegments>;
}

function CameraRig({ viewMode, traveling, reducedMotion, surfaceAppropriate }){
  const {camera}=useThree();
  useFrame((_,d)=>{const targets={free:14,orbit:10,close:7.4,surface:surfaceAppropriate?3.28:5.4};const target=traveling?18:(targets[viewMode]||14);camera.position.z=THREE.MathUtils.damp(camera.position.z,target,reducedMotion?14:3.2,d);camera.lookAt(0,0,0)});
  return null;
}

function Lights(){return <><ambientLight intensity={.055}/><hemisphereLight args={['#9fc3e8','#050608',.11]}/><directionalLight castShadow position={[8,5,9]} intensity={5.2} color="#fff4e4" shadow-mapSize={[1024,1024]}/><directionalLight position={[-7,-4,-8]} intensity={.10} color="#416791"/></>}

function OpticalResponse({ quality }){
  if(quality==='low')return null;
  return <EffectComposer multisampling={quality==='high'?4:0}>
    <Bloom mipmapBlur intensity={.46} luminanceThreshold={1.05} luminanceSmoothing={.28}/>
    <Vignette eskil={false} offset={.18} darkness={.38}/>
  </EffectComposer>;
}

export default function UniverseCanvas({ object, traveling, progress, quality, viewMode, reducedMotion, onSelect }){
  const dpr=quality==='low'?1:quality==='medium'?[1,1.4]:[1,1.8];
  const surfaceAppropriate=['planet','moon','dwarf planet','asteroid','comet','exoplanet'].includes(object.category);
  return <div className="universe-canvas" role="img" aria-label={`Interactive scientific visualization of ${object.name}`}>
    <Canvas shadows dpr={dpr} gl={{antialias:quality!=='low',powerPreference:'high-performance',alpha:false}} camera={{position:[0,0,14],fov:45,near:.02,far:260}} onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=.96;gl.shadowMap.enabled=true;gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.setClearColor('#000104')}}>
      <Suspense fallback={null}>
        <Lights/>
        <DeepField quality={quality} traveling={traveling} progress={progress}/>
        <TravelStreaks active={traveling} progress={progress}/>
        <group onClick={(e)=>{e.stopPropagation();onSelect?.(object)}}><ObjectRenderer object={object} travelProgress={traveling?progress:1} detail={quality==='low'?.45:quality==='medium'?.72:1}/></group>
        <CameraRig viewMode={viewMode} traveling={traveling} reducedMotion={reducedMotion} surfaceAppropriate={surfaceAppropriate}/>
        <OrbitControls enabled={!traveling} enablePan={false} minDistance={surfaceAppropriate?2.92:4.1} maxDistance={28} autoRotate={!traveling&&viewMode==='orbit'} autoRotateSpeed={.18} dampingFactor={.05}/>
        <OpticalResponse quality={quality}/>
      </Suspense>
    </Canvas>
    <div className="sensor-grain"/>
  </div>;
}
