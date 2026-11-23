import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, LocateFixed, X } from 'lucide-react';
import { orionReply, recommendation } from '../engine/orion';

export default function OrionPanel({open,onClose,object,prefill,onRecommendation}){
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState([{role:'orion',text:'I’m ORION. My answers are grounded in the current scientific record and I will label uncertainty, observation and simulation.'}]);
  const scroll=useRef();
  useEffect(()=>{if(prefill&&open){setInput(prefill)}},[prefill,open]);
  useEffect(()=>{scroll.current?.scrollTo({top:scroll.current.scrollHeight,behavior:'smooth'})},[messages]);
  if(!open)return null;
  const send=()=>{if(!input.trim())return;const text=input.trim();setMessages((m)=>[...m,{role:'user',text},{role:'orion',text:orionReply(text,object)}]);setInput('')};
  return <aside className="orion-panel glass" aria-label="ORION scientific guide">
    <div className="orion-head"><span className="orion-mark"><Bot size={18}/></span><span><b>ORION</b><small>SCIENTIFIC GUIDE · LOCAL DATA MODE</small></span><i>ONLINE</i><button className="icon-btn" onClick={onClose} aria-label="Close ORION"><X size={17}/></button></div>
    <div className="orion-context"><LocateFixed size={14}/><span>Context: <b>{object.name}</b></span><em>{object.evidence}</em></div>
    <div className="orion-messages" ref={scroll}>{messages.slice(-7).map((m,i)=><div className={m.role} key={i}><span>{m.role==='orion'?'ORION':'YOU'}</span><p>{m.text}</p></div>)}</div>
    <div className="orion-suggestions"><button onClick={()=>setInput('Why is this important?')}>Why important?</button><button onClick={()=>setInput('What is uncertain here?')}>What is uncertain?</button><button onClick={()=>onRecommendation(recommendation('mysterious',object))}>Related mystery</button></div>
    <label className="orion-input"><input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')send()}} placeholder={`Ask about ${object.name}…`}/><button onClick={send} aria-label="Send to ORION"><ArrowUp size={18}/></button></label>
    <p className="orion-note">ORION distinguishes catalog data from visualization. It does not invent missing observations.</p>
  </aside>;
}
