/* Deterministic, local-only workout suggestions from actually completed sessions. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ForgeFitRecommend=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAIN=['Dada','Punggung','Kaki'];
 const HOURS=3600000;
 function readSessions(history,catalog,now){
   const byName=new Map((catalog||[]).map(e=>[String(e.name).toLocaleLowerCase('id-ID'),e.cat]));
   return (Array.isArray(history)?history:[]).filter(h=>Number.isFinite(Number(h?.endedAt))&&Number(h.endedAt)>0&&Number(h.endedAt)<=now).map(h=>{
     const counts={Dada:0,Punggung:0,Kaki:0};let cardio=false,completed=0;
     for(const e of h.exercises||[]){
       const done=e.type==='cardio'?Number(!!e.done):Array.isArray(e.sets)?e.sets.filter(s=>s.done).length:0;
       if(!done)continue;
       completed+=done;
       const cat=byName.get(String(e.name||'').toLocaleLowerCase('id-ID'));
       if(MAIN.includes(cat)&&e.type==='strength')counts[cat]+=done;
       if(e.type==='cardio')cardio=true;
     }
     return {at:Number(h.endedAt),counts,completed,cardio};
   }).filter(x=>x.completed>0).sort((a,b)=>a.at-b.at);
 }
 function recommend(history,routines,catalog,now=Date.now()){
   const available=Array.isArray(routines)?routines:[];
   const byCategory=cat=>available.find(r=>r.category===cat);
   const recovery=available.find(r=>r.name==='Pemulihan aktif')||available.find(r=>r.name==='Pemanasan seluruh tubuh')||byCategory('Kardio');
   const sessions=readSessions(history,catalog,now);
   const lastOf=Object.fromEntries(MAIN.map(c=>[c,Math.max(0,...sessions.filter(s=>s.counts[c]>0).map(s=>s.at))]));
   const heavy=sessions.filter(s=>MAIN.some(c=>s.counts[c]>0));
   const last=heavy.at(-1);
   const lastFocus=last?MAIN.slice().sort((a,b)=>last.counts[b]-last.counts[a])[0]:null;
   const countLast72=heavy.filter(s=>now-s.at<=72*HOURS).length;
   let selected=null,reason='',status='latihan';
   if(last && (now-last.at<12*HOURS || countLast72>=3)){
     selected=recovery;status='pemulihan';
     reason=countLast72>=3?'Tiga sesi beban dalam 72 jam terakhir. Pilih gerakan ringan atau istirahat jika lelah.':'Baru menyelesaikan latihan beban. Beri waktu pulih; aktivitas ringan opsional.';
   }
   if(!selected){
     const start=lastFocus===null?0:(MAIN.indexOf(lastFocus)+1)%MAIN.length;
     const order=MAIN.slice(start).concat(MAIN.slice(0,start));
     const recovered=order.filter(c=>now-lastOf[c]>=36*HOURS);
     if(!recovered.length&&last&&recovery){
       selected=recovery;status='pemulihan';
       reason='Fokus beban utama masih dekat dengan sesi sebelumnya. Pilih pemulihan ringan atau istirahat.';
     }
     const next=recovered.find(c=>byCategory(c));
     if(!selected)selected=next?byCategory(next):recovery||available[0];
     if(status==='pemulihan'){}
     else if(lastFocus&&next){
       reason=next===lastFocus?'Kelompok otot lain belum punya rutinitas atau masih dekat dengan sesi sebelumnya.':'Sesi beban terakhir fokus '+lastFocus+'. Berikutnya '+next+' agar latihan lebih merata.';
     }else if(next){reason='Belum ada riwayat beban selesai. Mulai dari '+next+' atau pilih rutinitas lain.';}
     else reason='Belum ada rutinitas yang cocok; pilih latihan sesuai kondisi.';
   }
   const alternative=available.find(r=>r.id!==selected?.id&&(r.name==='Pemulihan aktif'||r.name==='Pemanasan seluruh tubuh'))||available.find(r=>r.id!==selected?.id);
   return {routine:selected||null,alternative:alternative||null,reason,status,lastFocus,sessions:sessions.length};
 }
 return {readSessions,recommend};
});