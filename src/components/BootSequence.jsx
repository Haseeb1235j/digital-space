import React, { useEffect } from 'react';

export default function BootSequence({done,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1750);return()=>clearTimeout(t)},[onDone]);
  if(done)return null;
  return <div className="boot">
    <div className="boot-orbit"><i/><i/><span>DS</span></div>
    <b>DIGITAL SPACE</b><p>Calibrating scientific coordinate engine</p>
    <div className="boot-progress"><i/></div><small>CATALOGS · SCALE · RENDERERS · ORION</small>
  </div>;
}
