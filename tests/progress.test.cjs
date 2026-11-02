const test=require("node:test"),assert=require("node:assert/strict");
const P=require("../app/src/main/assets/progress.js");
const now=Date.UTC(2026,10,2);
const workout=[
 {id:"w1",endedAt:now-3*86400000,exercises:[
  {name:"Bench Press",type:"strength",sets:[{weight:40,reps:8,done:true},{weight:60,reps:8,done:false},{weight:50,reps:10,done:true}]},
  {name:"Skipping",type:"cardio",done:true,seconds:125,intensity:7,minutes:10}
 ]},
 {id:"w2",endedAt:now-1*86400000,exercises:[
  {name:"Bench Press",type:"strength",sets:[{weight:55,reps:8,done:true},{weight:70,reps:10,done:false}]},
  {name:"Running",type:"cardio",done:true,seconds:0,intensity:6,minutes:20}
 ]}
];
test("strength uses only completed sets, no fabricated gains",()=>{
 const rows=P.strength(workout,30,now);
 assert.equal(rows.length,2);
 assert.equal(rows[0].volumeKg,820); // 40*8+50*10
 assert.equal(rows[0].sets,2);
 assert.equal(rows[0].maxLoadKg,50);
 assert.equal(rows[1].maxLoadKg,55);
 assert.equal(rows[1].volumeKg,440);
});
test("cardio uses measured actual seconds, never target minutes",()=>{
 const rows=P.cardio(workout,30,now);
 assert.equal(rows.length,2);
 assert.equal(rows[0].durationSeconds,125);
 assert.equal(rows[1].durationSeconds,0);
 assert.equal(rows.reduce((s,r)=>s+r.durationSeconds,0),125);
});
test("7/30 days filter and sorted history",()=>{
 assert.equal(P.strength(workout,1,now).length,1);
 assert.equal(P.filtered(workout,30,now)[0].id,"w1");
});
test("empty data returns empty trend and no fake points",()=>{
 assert.equal(P.seriesSvg([]),null);
 assert.equal(P.strength([],30,now).length,0);
 assert.equal(P.cardio([],30,now).length,0);
});
test("body weight supports distinct logs, validation and no implicit defaults",()=>{
 const rows=P.bodyWeight([{at:now-5000,kg:72.4},{at:now-10000,kg:72.9},{at:now-2000,kg:4000}],30,now);
 assert.deepEqual(rows.map(x=>x.kg),[72.9,72.4]);
 assert.equal(P.profile({}).weightKg,null);
 assert.equal(P.profile({}).sex,"");
 assert.equal(P.validateOptional("72,5",20,400,"BB"),72.5);
 assert.throws(()=>P.validateOptional("-4",20,400,"BB"));
 assert.throws(()=>P.validateOptional("999",20,400,"BB"));
 assert.equal(P.validateOptional("",20,400,"BB"),null);
});
test("one data point renders safe finite chart coordinates",()=>{
 const line=P.seriesSvg([{at:now,value:70}]);
 assert.ok(line.path.startsWith("M"));
 assert.ok(!line.path.includes("NaN"));
 assert.ok(!line.path.includes("Infinity"));
});
