import React, { useState } from 'react';
import { BookOpen, ChevronDown, ExternalLink, Scale, X } from 'lucide-react';
import { celestialObjects, byId } from '../data/celestialObjects';

const rows=(o)=>[
  ['Class',o.class],['Coordinates',o.coordinates],['Parent',o.parent],['Distance',o.distanceLabel],
  [o.radiusKm?'Mean radius':'Dimensions',o.radiusKm?`${o.radiusKm.toLocaleString()} km`:o.dimensions],
  ['Mass',o.mass],['Temperature',o.temperature],['Age / epoch',o.age],['Composition',o.composition],['Orbit / motion',o.orbital],['Discovery',o.discovered],
];

export default function InfoPanel({open,onClose,object,onAskOrion}){
  const [expanded,setExpanded]=useState(true);
  const [compareId,setCompareId]=useState('');
  const compare=compareId?byId(compareId):null;
  if(!open)return null;
  return <aside className="panel info-panel glass" aria-label={`Scientific record for ${object.name}`}>
    <div className="panel-head"><div><span className="eyebrow">SCIENTIFIC RECORD</span><h2>{object.name}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close information"><X size={18}/></button></div>
    <div className="truth-band"><span className={`truth-dot ${object.evidence.includes('theor')?'theory':'observed'}`}/><span><small>EVIDENCE STATUS</small><b>{object.evidence}</b></span><em>{object.confidence} confidence</em></div>
    <div className="render-disclosure"><span>VISUALIZATION MODE</span><b>{object.wavelength}</b><p>{object.rendering}. Geometry, brightness, distance and time may be compressed for interactive display.</p></div>
    <button className="accordion-title" onClick={()=>setExpanded(!expanded)}><span>Measured & catalogued data</span><ChevronDown className={expanded?'rotate':''} size={17}/></button>
    {expanded&&<div className="data-grid">{rows(object).filter(([,v])=>v).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div>}
    <section className="facts"><h3>What we know</h3>{object.facts.map((f)=><p key={f}><i/> {f}</p>)}</section>
    <section className="questions"><h3>Still unresolved</h3>{object.questions.map((q)=><button key={q} onClick={()=>onAskOrion(q)}><span>?</span>{q}</button>)}</section>
    <section className="compare"><h3><Scale size={15}/> Compare records</h3><select value={compareId} onChange={(e)=>setCompareId(e.target.value)}><option value="">Choose another object…</option>{celestialObjects.filter((o)=>o.id!==object.id).map((o)=><option value={o.id} key={o.id}>{o.name}</option>)}</select>
      {compare&&<div><span><small>CURRENT</small><b>{object.name}</b><em>{object.class}</em><i>{object.distanceLabel}</i></span><strong>VS</strong><span><small>COMPARISON</small><b>{compare.name}</b><em>{compare.class}</em><i>{compare.distanceLabel}</i></span></div>}
    </section>
    {object.missions.length>0&&<section className="missions"><h3>Related missions</h3><div>{object.missions.map((m)=><span key={m}>{m}</span>)}</div></section>}
    <section className="sources"><h3><BookOpen size={15}/> Sources & attribution</h3>{object.sources.map((s)=><a href={s.url} target="_blank" rel="noreferrer" key={s.url}><span><b>{s.authority}</b><small>{s.label}</small></span><ExternalLink size={14}/></a>)}</section>
  </aside>;
}
