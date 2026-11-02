const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../app/src/main/assets/guided.js');
function session(){return {startedAt:0,phase:'prepare',exerciseIndex:0,setIndex:0,restUntil:0,exercises:[
  {name:'Bench Press',type:'strength',sets:[{weight:20,reps:10,done:false},{weight:20,reps:10,done:false}]},
  {name:'Skipping',type:'cardio',minutes:10,intensity:6,done:false,seconds:0,running:false,startedAt:0}
]};}
test('preparation has no checkbox and does not complete before Start',()=>{
  const a=session();assert.equal(G.complete(a,90,1000),false);assert.equal(G.doneCount(a),0);
  assert.equal(G.start(a,1000),true);assert.equal(a.phase,'working');
});
test('one completion leads to rest, then next set without auto-completing',()=>{
  const a=session();G.start(a,1000);assert.equal(G.complete(a,90,2000),true);
  assert.equal(a.phase,'rest');assert.equal(a.restUntil,92000);assert.equal(G.complete(a,90,3000),false);
  G.ensure(a,92001);assert.equal(a.phase,'working');assert.equal(a.setIndex,1);assert.equal(G.doneCount(a),1);
});
test('completed steps are immutable even via future tuning',()=>{
  const a=session();G.start(a,1000);G.complete(a,90,2000);G.ensure(a,93000);
  assert.equal(G.tune(a,0,{sets:[{weight:300,reps:2},{weight:25,reps:8}]}),true);
  assert.equal(a.exercises[0].sets[0].weight,20);assert.equal(a.exercises[0].sets[0].reps,10);
  assert.equal(a.exercises[0].sets[1].weight,25);assert.equal(a.exercises[0].sets[1].reps,8);
});
test('after last set move to next exercise preparation, then start cardio',()=>{
  const a=session();G.start(a,1000);G.complete(a,0,2000);G.complete(a,0,3000);
  assert.equal(a.phase,'prepare');assert.equal(a.exerciseIndex,1);
  assert.equal(G.complete(a,90,4000),false);
  G.start(a,5000);assert.equal(a.exercises[1].running,true);
  G.pauseCardio(a,8500);assert.equal(a.exercises[1].seconds,3);
  G.playCardio(a,9000);G.complete(a,90,11000);assert.equal(a.exercises[1].seconds,5);
  assert.equal(a.phase,'complete');assert.equal(G.doneCount(a),3);
});
test('past exercises not editable, pending cardio is editable',()=>{
 const a=session();G.start(a,1000);G.complete(a,0,2000);G.complete(a,0,3000);
 assert.equal(G.tune(a,0,{sets:[{weight:100,reps:1}]}),false);
 assert.equal(G.tune(a,1,{minutes:16,intensity:8}),true);
 assert.equal(a.exercises[1].minutes,16);
});
test('set resize preserves completed and current set',()=>{
 const a=session();G.start(a,1000);G.complete(a,0,2000);
 assert.equal(G.resizeSets(a,0,1),true);assert.equal(a.exercises[0].sets.length,3);
 assert.equal(G.resizeSets(a,0,-1),true);
 assert.equal(G.resizeSets(a,0,-1),false);
 assert.equal(a.exercises[0].sets[0].done,true);
});
test('legacy partial session resumes at first unfinished set',()=>{
 const a=session();delete a.phase;a.exercises[0].sets[0].done=true;
 G.ensure(a,2000);assert.equal(a.phase,'prepare');assert.equal(a.setIndex,1);
 assert.equal(G.doneCount(a),1);
});
test('duplicate completion cannot advance twice',()=>{
 const a=session();G.start(a,1000);G.complete(a,90,2000);
 assert.equal(G.complete(a,90,3000),false);assert.equal(G.doneCount(a),1);
});
test('empty free workout can add its first exercise',()=>{
 const a={startedAt:0,phase:'prepare',exerciseIndex:0,setIndex:0,restUntil:0,exercises:[]};
 assert.equal(G.start(a,1000),false);assert.equal(G.count(a),0);
 a.exercises.push({name:'Push Up',type:'strength',sets:[{weight:0,reps:10,done:false}]});
 G.ensure(a);assert.equal(G.start(a,1000),true);
});
test('renaming an unstarted exercise preserves its targets and active cursor',()=>{
 const a=session();
 assert.equal(G.changeExercise(a,0,'Incline Cable Press','strength'),true);
 assert.equal(a.exercises[0].name,'Incline Cable Press');
 assert.equal(a.exercises[0].sets.length,2);
 assert.equal(a.exercises[0].sets[0].weight,20);
 assert.equal(a.phase,'prepare');
 assert.equal(a.exerciseIndex,0);
});
test('renaming after some sets creates a new step and locks previously finished sets',()=>{
 const a=session();G.start(a,1000);G.complete(a,0,2000);
 assert.equal(a.setIndex,1);
 assert.equal(G.changeExercise(a,0,'Cable Crunch','strength'),true);
 assert.equal(a.exercises.length,3);
 assert.equal(a.exercises[0].name,'Bench Press');
 assert.equal(a.exercises[0].sets.length,1);
 assert.equal(a.exercises[0].sets[0].done,true);
 assert.equal(G.finished(a.exercises[0]),true);
 assert.equal(a.exercises[1].name,'Cable Crunch');
 assert.equal(a.exercises[1].sets.length,1);
 assert.equal(a.exercises[1].sets[0].done,false);
 assert.equal(a.phase,'prepare');
 assert.equal(a.exerciseIndex,1);
 assert.equal(G.changeExercise(a,0,'Overwrite History','strength'),false);
 G.start(a,3000);G.complete(a,0,4000);
 assert.equal(a.exercises[0].name,'Bench Press');
 assert.equal(a.exercises[1].name,'Cable Crunch');
});
test('switching strength to cardio is supported before Start but rejected mid-set',()=>{
 const a=session();
 assert.equal(G.changeExercise(a,0,'Mountain Climbers','cardio'),true);
 assert.equal(a.exercises[0].type,'cardio');
 assert.equal(a.exercises[0].sets.length,0);
 assert.equal(a.phase,'prepare');
 G.start(a,1000);
 assert.equal(G.changeExercise(a,0,'Cable Crunch','strength'),false);
 assert.equal(a.exercises[0].name,'Mountain Climbers');
});
test('working cardio may be renamed without losing its elapsed data',()=>{
 const a=session();
 a.exerciseIndex=1;a.setIndex=0;a.phase='prepare';
 G.start(a,1000);
 G.pauseCardio(a,6000);
 assert.equal(a.exercises[1].seconds,5);
 assert.equal(G.changeExercise(a,1,'Treadmill HIIT','cardio'),true);
 assert.equal(a.exercises[1].seconds,5);
 assert.equal(a.exercises[1].name,'Treadmill HIIT');
});
test('completed cardio cannot be renamed and rest step is immutable',()=>{
 const a=session();
 G.start(a,1000);G.complete(a,90,2000);
 assert.equal(G.changeExercise(a,0,'Other','strength'),false);
 const b=session();b.exerciseIndex=1;b.phase='prepare';
 G.start(b,1000);G.complete(b,0,2000);
 assert.equal(G.changeExercise(b,1,'Other','cardio'),false);
});
