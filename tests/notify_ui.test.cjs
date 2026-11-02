const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assets=path.join(__dirname,'../app/src/main/assets');
function harness(permission=true,hasNative=true){
 const calls=[];
 const native={
   getStatus:()=>JSON.stringify({available:true,permission,exact:false,restEnabled:true}),
   requestPermission:()=>calls.push(['requestPermission']),
   openNotificationSettings:()=>calls.push(['notificationSettings']),
   requestExactAlarmAccess:()=>calls.push(['requestExact']),
   setRestEnabled:enabled=>calls.push(['restEnabled',enabled]),
   scheduleRest:(due,name)=>calls.push(['rest',Number(due),name]),
   cancelRest:()=>calls.push(['cancelRest']),
   updateReminder:(enabled,time,days)=>calls.push(['reminder',enabled,time,days]),
   testNotification:()=>calls.push(['test'])
 };
 const el=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},offsetWidth:100});
 const els=new Map(['#app','#nav','#dialog','#toast'].map(x=>[x,el()]));
 const handlers={},data=new Map();
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const document={
   querySelector:q=>els.get(q)||{...el(),setAttribute(){}},
   getElementById:()=>null,
   addEventListener:(k,fn)=>handlers[k]=fn,
   body:{classList:{toggle(){}}},documentElement:{classList:{toggle(){}}}
 };
 const window={matchMedia:()=>({matches:true,addEventListener(){}}),scrollTo(){}};
 const ctx={window,document,localStorage:storage,console,Math,Date,Intl,structuredClone,setInterval(){},setTimeout(){return 1},clearTimeout(){},location:{reload(){}}};
 if(hasNative)ctx.ForgeFitAndroid=native;
 for(const name of ['guided.js','progress.js','progress-ui.js','notify.js','app.js'])
   vm.runInNewContext(fs.readFileSync(path.join(assets,name),'utf8'),ctx,{filename:name});
 return {
   calls,
   html:()=>els.get('#app').innerHTML,
   state:()=>JSON.parse(data.get('forgefit-ui-demo-v3')),
   click:(act,props={})=>{
     const node={dataset:{act,...props},classList:{toggle(){}},setAttribute(){}};
     handlers.click({target:{closest:()=>node}})
   },
   changeTime:value=>handlers.change({target:{id:'reminderTime',value,dataset:{}}}),
   native
 };
}
test('Native notification settings show permission and reminder controls; defaults are opt-in',()=>{
 const h=harness();
 h.click('pindah',{page:'pengaturan'});
 assert.match(h.html(),/Izin notifikasi/);
 assert.match(h.html(),/Istirahat selesai/);
 assert.match(h.html(),/Jam pengingat/);
 assert.match(h.html(),/Hari latihan/i);
 assert.match(h.html(),/Uji notifikasi sekarang/);
 assert.equal(h.state().notifyRest,true);
 assert.equal(h.state().notifyReminder,false);
 assert.equal(h.state().reminderTime,'18:00');
 assert.equal(h.state().reminderDays,127);
 assert.ok(h.calls.some(x=>x[0]==='reminder'&&!x[1]));
});
test('A completed set arms rest alarm; +15 re-arms; skip and finish cancel it',()=>{
 const h=harness();
 h.click('mulai',{id:'r1'});
 h.click('guidedStart');
 h.click('guidedComplete');
 const alarms=h.calls.filter(x=>x[0]==='rest');
 assert.ok(alarms.length>0,'Expected a native scheduled rest');
 assert.ok(alarms.at(-1)[1]>Date.now(),'Rest deadline is in future');
 assert.equal(alarms.at(-1)[2],'Bench Press');
 const firstDue=alarms.at(-1)[1];
 h.click('guidedRestPlus');
 const next=h.calls.filter(x=>x[0]==='rest').at(-1);
 assert.equal(next[1],firstDue+15000);
 h.click('guidedSkip');
 assert.ok(h.calls.at(-1)[0]==='cancelRest','Skipping rest cancels native alarm');
 h.click('guidedComplete');
 h.click('selesai');h.click('konfirmasiSelesai');
 assert.ok(h.calls.at(-1)[0]==='cancelRest','Finishing workout cancels native alarm');
 assert.equal(h.state().active,null);
});
test('Daily reminder schedule updates immediately on enable/time/day and disables cleanly',()=>{
 const h=harness();
 h.click('pindah',{page:'pengaturan'});
 h.click('ubahNotifReminder');
 assert.equal(h.state().notifyReminder,true);
 assert.ok(h.calls.some(x=>x[0]==='reminder'&&x[1]===true&&x[2]==='18:00'&&x[3]===127));
 h.changeTime('06:30');
 assert.equal(h.state().reminderTime,'06:30');
 assert.ok(h.calls.some(x=>x[0]==='reminder'&&x[2]==='06:30'));
 h.click('notifDay',{day:'2'});
 assert.equal(h.state().reminderDays,125); // Monday removed
 assert.ok(h.calls.some(x=>x[0]==='reminder'&&x[3]===125));
 h.click('ubahNotifReminder');
 assert.equal(h.state().notifyReminder,false);
 assert.equal(h.calls.at(-1)[1],false);
});
test('Permission and exact-alarm controls invoke Android bridge only on explicit action',()=>{
 const h=harness(false);
 h.click('pindah',{page:'pengaturan'});
 assert.match(h.html(),/Izinkan agar pengingat/);
 h.click('izinNotifikasi');
 h.click('izinAlarmPresisi');
 assert.ok(h.calls.some(x=>x[0]==='requestPermission'));
 assert.ok(h.calls.some(x=>x[0]==='requestExact'));
 h.click('ujiNotifikasi');
 assert.ok(h.calls.some(x=>x[0]==='test'));
});
test('Browser preview remains functional without Android bridge, no background claim',()=>{
 const h=harness(false,false);
 h.click('pindah',{page:'pengaturan'});
 assert.match(h.html(),/Hanya tersedia di aplikasi Android/);
 h.click('mulai',{id:'r1'});h.click('guidedStart');h.click('guidedComplete');
 assert.equal(h.state().active.phase,'rest');
 assert.equal(h.calls.length,0);
});
