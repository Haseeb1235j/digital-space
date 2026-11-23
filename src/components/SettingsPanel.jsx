import React from 'react';
import { Gauge, RotateCcw, SlidersHorizontal, Volume2, X } from 'lucide-react';

export default function SettingsPanel({open,onClose,settings,setSettings,onReset}){
  if(!open)return null;
  const set=(key,value)=>setSettings((s)=>({...s,[key]:value}));
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.currentTarget===e.target)onClose()}}><section className="settings-modal glass">
    <div className="panel-head"><div><span className="eyebrow">SYSTEM</span><h2>Experience settings</h2></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <div className="setting-row"><span><Gauge/><b>Rendering quality</b><small>Geometry, particle density and pixel ratio</small></span><div className="quality-choice">{['low','medium','high'].map((q)=><button className={settings.quality===q?'active':''} onClick={()=>set('quality',q)} key={q}>{q}</button>)}</div></div>
    <div className="setting-row"><span><SlidersHorizontal/><b>Motion</b><small>Reduce camera travel and auto-rotation</small></span><button className={`toggle ${settings.reducedMotion?'on':''}`} onClick={()=>set('reducedMotion',!settings.reducedMotion)} aria-pressed={settings.reducedMotion}><i/></button></div>
    <div className="setting-row"><span><Volume2/><b>Sound</b><small>Interface and ambient sound layer</small></span><button className={`toggle ${settings.sound?'on':''}`} onClick={()=>set('sound',!settings.sound)} aria-pressed={settings.sound}><i/></button></div>
    <div className="setting-row"><span><span className="contrast-icon">Aa</span><b>High contrast labels</b><small>Increase information and control contrast</small></span><button className={`toggle ${settings.contrast?'on':''}`} onClick={()=>set('contrast',!settings.contrast)} aria-pressed={settings.contrast}><i/></button></div>
    <button className="reset-btn" onClick={onReset}><RotateCcw size={15}/> Restore defaults and return to Earth</button>
  </section></div>;
}
