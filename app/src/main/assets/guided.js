/* Guided workout state machine (UI prototype; storage remains local). */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined" && module.exports) module.exports=api;
  root.ForgeFitGuided=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const phases=new Set(["prepare","working","rest","complete"]);
  function finished(e){return e.type==="cardio"?!!e.done:!!e.sets?.length&&e.sets.every(x=>x.done);}
  function count(a){return (a?.exercises||[]).reduce((n,e)=>n+(e.type==="cardio"?1:e.sets.length),0);}
  function doneCount(a){return (a?.exercises||[]).reduce((n,e)=>n+(e.type==="cardio"?Number(!!e.done):e.sets.filter(x=>x.done).length),0);}
  function findNext(a,fromEx=0,fromSet=0){
    for(let i=fromEx;i<a.exercises.length;i++){
      const e=a.exercises[i];
      if(e.type==="cardio"){if(!e.done)return {exerciseIndex:i,setIndex:0};}
      else for(let j=i===fromEx?fromSet:0;j<e.sets.length;j++)if(!e.sets[j].done)return {exerciseIndex:i,setIndex:j};
    }
    return null;
  }
  function ensure(a,now=Date.now()){
    if(!a)return null;
    if(!phases.has(a.phase)){
      const next=findNext(a);
      a.phase=next?"prepare":"complete";
      a.exerciseIndex=next?.exerciseIndex??a.exercises.length;
      a.setIndex=next?.setIndex??0;
      a.restUntil=0;
    }
    if(a.phase==="rest" && (!a.restUntil || a.restUntil<=now)) advance(a);
    return a;
  }
  function current(a){if(!a)return null;const e=a.exercises[a.exerciseIndex];return e?{exercise:e,exerciseIndex:a.exerciseIndex,setIndex:a.setIndex,set:e.type==="strength"?e.sets[a.setIndex]:null}:null;}
  function start(a,now=Date.now()){
    ensure(a,now);
    if(a.phase!=="prepare"||!current(a))return false;
    if(!a.startedAt)a.startedAt=now;
    a.phase="working";
    const e=current(a).exercise;
    if(e.type==="cardio"&&!e.running){e.running=true;e.startedAt=now;}
    return true;
  }
  function advance(a){
    if(!a||a.phase!=="rest")return false;
    const c=current(a);if(!c)return false;
    const next=findNext(a,c.exerciseIndex,c.exercise.type==="strength"?c.setIndex+1:0);
    if(!next){a.exerciseIndex=a.exercises.length;a.setIndex=0;a.phase="complete";}
    else{a.exerciseIndex=next.exerciseIndex;a.setIndex=next.setIndex;a.phase=next.exerciseIndex===c.exerciseIndex?"working":"prepare";}
    a.restUntil=0;
    return true;
  }
  function pauseCardio(a,now=Date.now()){
    const c=current(a);
    if(!c||a.phase!=="working"||c.exercise.type!=="cardio"||!c.exercise.running)return false;
    const e=c.exercise;e.seconds=(e.seconds||0)+Math.max(0,Math.floor((now-e.startedAt)/1000));e.running=false;e.startedAt=0;return true;
  }
  function playCardio(a,now=Date.now()){
    const c=current(a);
    if(!c||a.phase!=="working"||c.exercise.type!=="cardio"||c.exercise.running)return false;
    c.exercise.running=true;c.exercise.startedAt=now;return true;
  }
  function complete(a,restSeconds,now=Date.now()){
    ensure(a,now);
    if(a.phase!=="working")return false;
    const c=current(a);if(!c)return false;
    if(c.exercise.type==="strength"){
      if(!c.set||c.set.done)return false;
      c.set.done=true;c.set.completedAt=now;
    }else{
      if(c.exercise.done)return false;
      pauseCardio(a,now);c.exercise.done=true;
    }
    if(finished(c.exercise))c.exercise.completedAt=now;
    if(doneCount(a)===count(a)){
      a.phase="complete";a.exerciseIndex=a.exercises.length;a.setIndex=0;a.restUntil=0;return true;
    }
    const seconds=Math.max(0,Number(restSeconds)||0);
    if(seconds){a.phase="rest";a.restUntil=now+seconds*1000;}
    else{a.phase="rest";advance(a);}
    return true;
  }
  function skipRest(a){return advance(a);}
  function tune(a,i,values){
    ensure(a);
    if(!Number.isInteger(i)||i<a.exerciseIndex||i>=a.exercises.length)return false;
    const e=a.exercises[i];if(finished(e))return false;
    if(e.type==="cardio"){
      if(Number.isFinite(values.minutes))e.minutes=Math.min(300,Math.max(1,Math.round(values.minutes)));
      if(Number.isFinite(values.intensity))e.intensity=Math.min(10,Math.max(1,Math.round(values.intensity)));
    }else{
      (values.sets||[]).forEach((v,j)=>{
        const item=e.sets[j];
        if(!item||item.done|| (i===a.exerciseIndex&&j<a.setIndex))return;
        if(Number.isFinite(v.weight))item.weight=Math.max(0,Math.min(1000,v.weight));
        if(Number.isFinite(v.reps))item.reps=Math.max(0,Math.min(999,Math.floor(v.reps)));
      });
    }
    return true;
  }
  function changeExercise(a,i,name,type){
    ensure(a);
    if (!Number.isInteger(i)||i<a.exerciseIndex||i>=a.exercises.length||a.phase==="complete")return false;
    const e=a.exercises[i],newName=typeof name==="string"?name.trim():"";
    if(!newName||newName.length>70||!["strength","cardio"].includes(type)||finished(e))return false;
    const sameType=e.type===type;
    const active=i===a.exerciseIndex;
    // Changing logging model on an already running step invalidates its timer/set input.
    if(active&&a.phase==="working"&&!sameType)return false;
    if(active&&a.phase==="rest")return false;
    const hasDone=e.type==="strength"&&e.sets.some(set=>set.done);
    if(e.name===newName&&sameType)return true;
    function fresh(from){
      return type==="strength"?{
        name:newName,type,sets:from?.length?from.map(x=>({...x,done:false})):
          [{weight:20,reps:10,done:false},{weight:20,reps:10,done:false},{weight:20,reps:10,done:false}],
        minutes:10,intensity:5,done:false,seconds:0,running:false,startedAt:0
      }:{
        name:newName,type,sets:[],minutes:10,intensity:5,done:false,seconds:0,running:false,startedAt:0
      };
    }
    if(hasDone){
      // An exercise with completed sets is split. The finished sets keep the original name.
      // Only uncompleted sets are moved to the renamed entry.
      const done=e.sets.filter(x=>x.done),pending=e.sets.filter(x=>!x.done);
      if(!pending.length)return false;
      if(active&&a.phase==="working"&&!sameType)return false;
      const newer=fresh(sameType?pending:null);
      e.sets=done;
      e.completedAt=e.completedAt||Date.now();
      a.exercises.splice(i+1,0,newer);
      if(active){a.exerciseIndex=i+1;a.setIndex=0;a.phase="prepare";}
      return true;
    }
    const replacement=fresh(sameType?e.type==="strength"?e.sets:null:null);
    if(sameType){
      // Keep ongoing cardio time if this is purely a name correction.
      if(type==="cardio"){replacement.minutes=e.minutes;replacement.intensity=e.intensity;replacement.seconds=e.seconds||0;replacement.running=e.running;replacement.startedAt=e.startedAt||0;}
      else replacement.sets=e.sets;
    }
    a.exercises[i]=replacement;
    if(active){a.setIndex=0;if(!sameType)a.phase="prepare";}
    return true;
  }
  function resizeSets(a,i,delta){
    ensure(a);
    if(!Number.isInteger(i)||i<a.exerciseIndex||i>=a.exercises.length)return false;
    const e=a.exercises[i];if(e.type!=="strength"||finished(e))return false;
    if(delta===1){const from=e.sets.at(-1)||{weight:20,reps:10};e.sets.push({weight:from.weight,reps:from.reps,done:false});return true;}
    if(delta===-1&&e.sets.length>1&&!e.sets.at(-1).done&&!(i===a.exerciseIndex&&a.setIndex>=e.sets.length-1)){e.sets.pop();return true;}
    return false;
  }
  return {ensure,current,start,complete,advance,skipRest,finished,count,doneCount,tune,resizeSets,changeExercise,pauseCardio,playCardio};
});