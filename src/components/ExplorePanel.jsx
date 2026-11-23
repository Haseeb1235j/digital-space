import React, { useMemo, useState } from 'react';
import { Search, Shuffle, Telescope, X, Route, ChevronRight, Radar, Bookmark, History } from 'lucide-react';
import { celestialObjects, categories, tours, byId } from '../data/celestialObjects';

const discovery = [
  {id:'unknown',label:'Unknown',icon:'?'},
  {id:'important',label:'Important',icon:'!'},
  {id:'mysterious',label:'Mysterious',icon:'◇'},
  {id:'extreme',label:'Extreme',icon:'↑'},
];

export default function ExplorePanel({ open, onClose, selected, onSelect, onDiscover, onTravel, onStartTour, saved=[], history=[] }){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [tab,setTab]=useState('discover');
  const filtered=useMemo(()=>celestialObjects.filter((o)=>{
    const match=!query||`${o.name} ${o.subtitle} ${o.category} ${o.class}`.toLowerCase().includes(query.toLowerCase());
    return match&&(category==='all'||o.category===category);
  }),[query,category]);
  if(!open)return null;
  return <aside className="panel explore-panel glass" aria-label="Explore destinations">
    <div className="panel-head"><div><span className="eyebrow">NAVIGATION</span><h2>Explore</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close explore"><X size={18}/></button></div>
    <div className="segmented three"><button className={tab==='discover'?'active':''} onClick={()=>setTab('discover')}>Discover</button><button className={tab==='routes'?'active':''} onClick={()=>setTab('routes')}>Routes</button><button className={tab==='journal'?'active':''} onClick={()=>setTab('journal')}>Journal</button></div>
    {tab==='discover'?<>
      <label className="search-box"><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search objects, classes, regions…"/><kbd>/</kbd></label>
      <div className="discovery-grid">
        <button onClick={()=>onDiscover('random')}><Shuffle size={15}/><span>Take me<br/><b>anywhere</b></span></button>
        <button onClick={()=>onDiscover('nearby')}><Radar size={15}/><span>Scan<br/><b>nearby</b></span></button>
        {discovery.map((d)=><button key={d.id} onClick={()=>onDiscover(d.id)}><i>{d.icon}</i><span>Show me<br/><b>{d.label}</b></span></button>)}
      </div>
      <div className="section-row"><span>CATALOG</span><small>{filtered.length} / {celestialObjects.length} curated records</small></div>
      <div className="category-strip"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>All</button>{categories.map((c)=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <div className="object-list">
        {filtered.map((o)=><button className={`object-row ${selected.id===o.id?'selected':''}`} onClick={()=>onSelect(o)} key={o.id}>
          <span className="object-swatch" style={{'--swatch':o.color}}/><span><b>{o.name}</b><small>{o.category} · {o.distanceLabel}</small></span><ChevronRight size={15}/>
        </button>)}
      </div>
    </>:tab==='routes'?<div className="route-list">
      <p className="panel-copy">Follow data-grounded sequences. Travel time remains compressed and every stop keeps its own evidence label.</p>
      {tours.map((tour)=><button className="route-card" key={tour.id} onClick={()=>onStartTour(tour)}>
        <span className="route-icon"><Route size={18}/></span><span><em>{tour.icon}</em><b>{tour.name}</b><small>{tour.detail}</small><i>{tour.stops.map((id)=>byId(id).name).join(' → ')}</i></span><ChevronRight size={17}/>
      </button>)}
    </div>:<div className="journal-list">
      <h3><Bookmark size={14}/> SAVED DESTINATIONS</h3>
      {saved.length? saved.map((id)=>{const o=byId(id);return o&&<button className="object-row" key={`saved-${id}`} onClick={()=>onSelect(o)}><span className="object-swatch" style={{'--swatch':o.color}}/><span><b>{o.name}</b><small>{o.category} · {o.distanceLabel}</small></span><ChevronRight size={15}/></button>}):<p>Save destinations from the observation controls to build a personal journey.</p>}
      <h3><History size={14}/> RECENTLY VISITED</h3>
      {history.map((id)=>{const o=byId(id);return o&&<button className="object-row" key={`history-${id}`} onClick={()=>onSelect(o)}><span className="object-swatch" style={{'--swatch':o.color}}/><span><b>{o.name}</b><small>{o.subtitle}</small></span><ChevronRight size={15}/></button>})}
    </div>}
    {selected&&<div className="selection-dock">
      <span><small>SELECTED DESTINATION</small><b>{selected.name}</b><em>{selected.distanceLabel}</em></span>
      <button className="primary-btn" onClick={()=>onTravel(selected)}><Telescope size={16}/> Travel</button>
    </div>}
  </aside>;
}
