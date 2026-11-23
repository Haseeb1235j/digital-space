import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Bot, Crosshair, Database, Home, Info, Menu, Mountain, Orbit, Play, Route, ScanLine, Settings, Telescope, X } from 'lucide-react';
import UniverseCanvas from './components/UniverseCanvas';
import ExplorePanel from './components/ExplorePanel';
import InfoPanel from './components/InfoPanel';
import OrionPanel from './components/OrionPanel';
import SettingsPanel from './components/SettingsPanel';
import BootSequence from './components/BootSequence';
import { byId, celestialObjects, scaleLevels } from './data/celestialObjects';
import { recommendation } from './engine/orion';
import { displaySpeed, remainingDistance, scaleForDistance, travelDuration, travelPhase } from './engine/scaleEngine';

const initialSettings={quality:'high',reducedMotion:false,sound:false,contrast:false};
const getStored=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};

export default function App(){
  const [booted,setBooted]=useState(false);
  const [current,setCurrent]=useState(byId('earth'));
  const [selected,setSelected]=useState(byId('earth'));
  const [target,setTarget]=useState(byId('earth'));
  const [traveling,setTraveling]=useState(false);
  const [progress,setProgress]=useState(1);
  const [panel,setPanel]=useState('explore');
  const [orionOpen,setOrionOpen]=useState(false);
  const [orionPrefill,setOrionPrefill]=useState('');
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [settings,setSettings]=useState(()=>getStored('ds-settings',initialSettings));
  const [viewMode,setViewMode]=useState('free');
  const [scale,setScale]=useState(scaleForDistance(0).id);
  const [saved,setSaved]=useState(()=>getStored('ds-saved',[]));
  const [history,setHistory]=useState(()=>getStored('ds-history',['earth']));
  const [activeTour,setActiveTour]=useState(null);
  const startTime=useRef(0); const duration=useRef(6000); const raf=useRef();
  const displayObject=traveling?target:current;

  useEffect(()=>localStorage.setItem('ds-settings',JSON.stringify(settings)),[settings]);
  useEffect(()=>localStorage.setItem('ds-saved',JSON.stringify(saved)),[saved]);
  useEffect(()=>localStorage.setItem('ds-history',JSON.stringify(history)),[history]);

  const finishTravel=useCallback(()=>{
    setTraveling(false);setProgress(1);setCurrent(target);setSelected(target);setScale(scaleForDistance(target.distanceLy).id);setViewMode('orbit');
    setHistory((h)=>[target.id,...h.filter((id)=>id!==target.id)].slice(0,16));
  },[target]);

  useEffect(()=>{
    if(!traveling)return;
    const tick=(time)=>{const p=Math.min(1,(time-startTime.current)/duration.current);setProgress(p);if(p<1)raf.current=requestAnimationFrame(tick);else finishTravel()};
    raf.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf.current);
  },[traveling,finishTravel]);

  const startTravel=useCallback((destination)=>{
    if(!destination||traveling)return;
    if(destination.id===current.id){setViewMode('orbit');setPanel(null);return;}
    setTarget(destination);setSelected(destination);setPanel(null);setOrionOpen(false);setProgress(0);setViewMode('free');
    duration.current=travelDuration(Math.max(Math.abs(destination.distanceLy-current.distanceLy),destination.distanceLy*.08),settings.reducedMotion);
    startTime.current=performance.now();setTraveling(true);
  },[current,settings.reducedMotion,traveling]);

  const discover=(mode)=>{const object=recommendation(mode,current);setSelected(object);setPanel('explore')};
  const beginTour=(tour)=>{setActiveTour({...tour,index:0});const first=byId(tour.stops[0]);setSelected(first);startTravel(first)};
  const nextTour=()=>{if(!activeTour)return;const nextIndex=activeTour.index+1;if(nextIndex>=activeTour.stops.length){setActiveTour(null);return;}const next=byId(activeTour.stops[nextIndex]);setActiveTour({...activeTour,index:nextIndex});startTravel(next)};
  const toggleSaved=()=>setSaved((s)=>s.includes(displayObject.id)?s.filter((id)=>id!==displayObject.id):[displayObject.id,...s]);
  const returnHome=()=>startTravel(byId('earth'));
  const askOrion=(q)=>{setOrionPrefill(q);setOrionOpen(true)};
  const scaleObject=(level)=>{setScale(level.id);const candidates=celestialObjects.filter((o)=>scaleForDistance(o.distanceLy).id===level.id);if(candidates.length){const choice=candidates.find((o)=>o.id!==current.id)||candidates[0];setSelected(choice);setPanel('explore')}};
  const reset=()=>{setSettings(initialSettings);setSettingsOpen(false);setCurrent(byId('earth'));setTarget(byId('earth'));setSelected(byId('earth'));setTraveling(false);setProgress(1);setScale('surface')};
  const currentScale=scaleLevels.find((s)=>s.id===scale);
  const surfaceCapable=['planet','moon','dwarf planet','asteroid','comet','exoplanet'].includes(displayObject.category);
  const qualityLabel=settings.quality==='high'?'PBR · HIGH':settings.quality==='medium'?'BALANCED':'MOBILE';

  return <main className={`app ${settings.contrast?'high-contrast':''}`}>
    <UniverseCanvas object={displayObject} traveling={traveling} progress={progress} quality={settings.quality} viewMode={viewMode} reducedMotion={settings.reducedMotion} onSelect={()=>setPanel('info')}/>
    <BootSequence done={booted} onDone={()=>setBooted(true)}/>
    <header className="topbar">
      <button className="brand" onClick={()=>setPanel('explore')} aria-label="Open Digital Space explorer"><span className="brand-orbit"><i/>DS</span><span><b>DIGITAL SPACE</b><small>SCIENTIFIC UNIVERSE EXPLORER</small></span></button>
      <div className="top-status"><span><i className="live-dot"/> SCIENTIFIC DATA MODE</span><span className="desktop-only">{qualityLabel}</span><span className="desktop-only">ORIGIN · EARTH FRAME</span></div>
      <nav>
        <button onClick={()=>setPanel(panel==='explore'?null:'explore')} className={panel==='explore'?'active':''}><Telescope/><span>Explore</span></button>
        <button onClick={()=>setPanel(panel==='info'?null:'info')} className={panel==='info'?'active':''}><Info/><span>Science</span></button>
        <button onClick={()=>setOrionOpen(!orionOpen)} className={orionOpen?'active':''}><Bot/><span>ORION</span></button>
        <button onClick={()=>setSettingsOpen(true)}><Settings/><span className="desktop-only">Settings</span></button>
      </nav>
    </header>

    {!traveling&&<>
      <div className="scene-readout">
        <span>{displayObject.evidence.toUpperCase()}</span><i/>
        <b>{displayObject.wavelength.toUpperCase()}</b><i/>
        <em>{displayObject.rendering.toUpperCase()}</em>
      </div>
      <section className="object-title">
        <span>{displayObject.category.toUpperCase()} · {scaleForDistance(displayObject.distanceLy).label.toUpperCase()} SCALE</span>
        <h1>{displayObject.name}</h1><p>{displayObject.subtitle}</p>
        <div><b>{displayObject.distanceLabel}</b><i/><em>{displayObject.confidence} confidence</em></div>
      </section>
      <div className="view-controls glass">
        {[['free',Crosshair,'Free'],['orbit',Orbit,'Orbit'],['close',ScanLine,'Close'],...(surfaceCapable?[["surface",Mountain,"Surface"]]:[])].map(([id,Icon,label])=><button key={id} className={viewMode===id?'active':''} onClick={()=>setViewMode(id)}><Icon/>{label}</button>)}
      </div>
      <div className="quick-actions glass">
        <button onClick={toggleSaved} className={saved.includes(displayObject.id)?'active':''}><Bookmark/> <span>{saved.includes(displayObject.id)?'Saved':'Save'}</span></button>
        <button onClick={()=>setPanel('info')}><Database/> <span>Data</span></button>
        <button onClick={returnHome} disabled={displayObject.id==='earth'}><Home/> <span>Origin</span></button>
      </div>
    </>}

    {traveling&&<section className="travel-hud">
      <div className="target-lock"><Crosshair/><span>TARGET LOCKED</span></div>
      <span className="eyebrow">TRAVELLING TO</span><h1>{target.name}</h1><p>{travelPhase(progress)}</p>
      <div className="travel-track"><i style={{width:`${progress*100}%`}}/><span style={{left:`${progress*100}%`}}/></div>
      <div className="travel-stats"><span><small>SIMULATED SPEED</small><b>{displaySpeed(progress,target.distanceLy)}</b></span><span><small>REMAINING</small><b>{remainingDistance(target,progress)}</b></span><span><small>REAL DISTANCE</small><b>{target.distanceLabel}</b></span></div>
      <em>Travel time and visual scale are compressed. Catalog distance is unchanged.</em>
    </section>}

    <ExplorePanel open={panel==='explore'&&!traveling} onClose={()=>setPanel(null)} selected={selected} onSelect={setSelected} onDiscover={discover} onTravel={startTravel} onStartTour={beginTour} saved={saved} history={history}/>
    <InfoPanel open={panel==='info'&&!traveling} onClose={()=>setPanel(null)} object={displayObject} onAskOrion={askOrion}/>
    <OrionPanel open={orionOpen&&!traveling} onClose={()=>setOrionOpen(false)} object={displayObject} prefill={orionPrefill} onRecommendation={(o)=>{setSelected(o);setPanel('explore')}}/>
    <SettingsPanel open={settingsOpen} onClose={()=>setSettingsOpen(false)} settings={settings} setSettings={setSettings} onReset={reset}/>

    {!traveling&&<footer className="scale-bar glass">
      <span className="scale-caption"><small>DISPLAY SCALE</small><b>{currentScale?.label}</b></span>
      <div>{scaleLevels.map((level,i)=><button key={level.id} onClick={()=>scaleObject(level)} className={scale===level.id?'active':''} title={`${level.label} scale`}><i/><span>{level.label}</span>{i<scaleLevels.length-1&&<em/>}</button>)}</div>
      <span className="scale-note">LOGARITHMIC NAVIGATION<br/><b>REAL VALUES PRESERVED</b></span>
    </footer>}

    {activeTour&&!traveling&&<div className="tour-progress glass"><Route/><span><small>GUIDED ROUTE</small><b>{activeTour.name}</b><em>Stop {activeTour.index+1} of {activeTour.stops.length}</em></span><button onClick={nextTour}>{activeTour.index+1===activeTour.stops.length?'Finish':'Next stop'} <Play size={14}/></button><button className="icon-btn" onClick={()=>setActiveTour(null)}><X size={15}/></button></div>}
    <button className="mobile-menu" onClick={()=>setPanel('explore')}><Menu/></button>
  </main>;
}
