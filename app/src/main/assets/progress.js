/* ForgeFit v0.7: deterministic preview analytics; only completed, actually recorded values. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.ForgeFitProgress=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const valid=(n)=>typeof n==="number"&&Number.isFinite(n);
  const completed=(session)=>Number.isFinite(Number(session?.endedAt))&&Number(session.endedAt)>0;
  const filtered=(history,days,now=Date.now())=>(Array.isArray(history)?history:[])
    .filter(h=>completed(h)&&(!Number.isFinite(days)||Number(h.endedAt)>=now-days*86400000))
    .sort((a,b)=>Number(a.endedAt)-Number(b.endedAt));
  const sets=(e)=>(e?.type==="strength"&&Array.isArray(e.sets)?e.sets:[])
    .filter(s=>s.done&&valid(Number(s.weight))&&Number(s.weight)>=0&&valid(Number(s.reps))&&Number(s.reps)>=0);
  function strength(history,days=30,now=Date.now()){
    return filtered(history,days,now).flatMap(h=>(h.exercises||[]).flatMap(e=>{
      if(e.type!=="strength")return [];
      const done=sets(e);if(!done.length)return [];
      const weighted=done.filter(s=>Number(s.weight)>0&&Number(s.reps)>0);
      const volumeKg=weighted.reduce((sum,s)=>sum+Number(s.weight)*Number(s.reps),0);
      return [{id:h.id,at:Number(h.endedAt),name:e.name||"Gerakan",sets:done.length,
        maxLoadKg:weighted.length?Math.max(...weighted.map(s=>Number(s.weight))):null,
        volumeKg:Math.round(volumeKg*100)/100,
        e1rmKg:weighted.filter(s=>Number(s.reps)<=12).reduce((v,s)=>Math.max(v,Number(s.weight)*(1+Number(s.reps)/30)),0)||null
      }];
    }));
  }
  function cardio(history,days=30,now=Date.now()){
    return filtered(history,days,now).flatMap(h=>(h.exercises||[]).filter(e=>e.type==="cardio"&&e.done).map(e=>({
      id:h.id,at:Number(h.endedAt),name:e.name||"Kardio",
      durationSeconds:valid(Number(e.seconds))?Math.max(0,Math.floor(Number(e.seconds))):0,
      intensity:valid(Number(e.intensity))&&Number(e.intensity)>=1&&Number(e.intensity)<=10?Number(e.intensity):null,
      targetMinutes:valid(Number(e.minutes))?Number(e.minutes):null
    })));
  }
  function bodyWeight(entries,days=30,now=Date.now()){
    return (Array.isArray(entries)?entries:[]).filter(e=>valid(Number(e.at))&&
      (!Number.isFinite(days)||Number(e.at)>=now-days*86400000)&&valid(Number(e.kg))&&Number(e.kg)>=20&&Number(e.kg)<=400)
      .sort((a,b)=>Number(a.at)-Number(b.at)).map(e=>({at:Number(e.at),kg:Number(e.kg)}));
  }
  function seriesSvg(values){
    if(!values.length)return null;
    const v=values.filter(p=>valid(p.value)&&valid(p.at)).sort((a,b)=>a.at-b.at);
    if(!v.length)return null;
    const min=Math.min(...v.map(x=>x.value)),max=Math.max(...v.map(x=>x.value)),span=Math.max(max-min,Math.max(Math.abs(max)*0.08,1));
    const from=v[0].at,to=v[v.length-1].at;
    const mapped=v.map((p,i)=>({x:from===to?170:16+308*(p.at-from)/(to-from),
      y:118-94*((p.value-min+span*0.12)/(max-min+span*0.24)),value:p.value,at:p.at}));
    const path=mapped.map((p,i)=>(i?"L":"M")+p.x.toFixed(2)+" "+p.y.toFixed(2)).join(" ");
    return {path,points:mapped,low:min,high:max};
  }
  function profile(input){
    const p=input||{};
    return {weightKg:valid(p.weightKg)&&p.weightKg>=20&&p.weightKg<=400?p.weightKg:null,
      heightCm:valid(p.heightCm)&&p.heightCm>=80&&p.heightCm<=250?p.heightCm:null,
      sex:["Laki-laki","Perempuan","Tidak ingin menyebutkan"].includes(p.sex)?p.sex:"",
      goal:["Menjaga kebugaran","Meningkatkan stamina","Meningkatkan kekuatan","Membangun otot","Mengatur berat badan"].includes(p.goal)?p.goal:"Menjaga kebugaran"};
  }
  function validateOptional(input,min,max,label){
    const raw=String(input??"").trim();if(!raw)return null;
    if(!/^\d+(?:[.,]\d{1,2})?$/.test(raw))throw new Error(label+" harus berupa angka positif");
    const n=Number(raw.replace(",","."));if(!valid(n)||n<min||n>max)throw new Error(label+" harus "+min+"–"+max);
    return n;
  }
  return {filtered,strength,cardio,bodyWeight,seriesSvg,profile,validateOptional};
});