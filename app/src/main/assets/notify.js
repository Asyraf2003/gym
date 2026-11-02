/* Offline ForgeFit Android notification adapter. No remote services. */
(function(root,factory){
  const api=factory(root);
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.ForgeFitNotify=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(root){
  let lastRestKey=null,lastReminderKey=null;
  function bridge(){return root.ForgeFitAndroid||null;}
  function state(){
    const b=bridge();
    if(!b)return {available:false,permission:false,exact:false,restEnabled:true};
    try{
      const s=JSON.parse(b.getStatus());
      return {available:s.available===true,permission:s.permission===true,
        exact:s.exact===true,restEnabled:s.restEnabled!==false};
    }catch(e){return {available:true,permission:false,exact:false,restEnabled:true}}
  }
  function invoke(name,...args){
    const b=bridge();if(!b||typeof b[name]!=="function")return false;
    try{b[name](...args);return true}catch(e){return false}
  }
  function syncRest(active,enabled){
    const rest=!!enabled&&active?.phase==="rest"&&Number.isFinite(active.restUntil)&&active.restUntil>Date.now();
    const key=rest?String(active.restUntil)+"|"+String(active.exercises?.[active.exerciseIndex]?.name||"Latihan"):"none";
    if(key===lastRestKey)return;
    const b=bridge();if(!b)return;
    if(rest){
      if(invoke("scheduleRest",String(active.restUntil),String(active.exercises?.[active.exerciseIndex]?.name||"Latihan")))lastRestKey=key;
    }else{
      if(invoke("cancelRest"))lastRestKey=key;
    }
  }
  function syncReminder(enabled,time,mask){
    const safe=/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)?time:"18:00";
    const days=Number.isInteger(mask)?mask&127:127;
    const key=(enabled&&days?"1":"0")+"|"+safe+"|"+days;
    if(key===lastReminderKey)return;
    if(invoke("updateReminder",!!enabled&&days>0,safe,days))lastReminderKey=key;
  }
  function setRestEnabled(enabled){lastRestKey=null;invoke("setRestEnabled",!!enabled);}
  function reconnect(){lastRestKey=null;lastReminderKey=null;}
  return {
    state,syncRest,syncReminder,setRestEnabled,reconnect,
    requestPermission:()=>invoke("requestPermission"),
    openNotificationSettings:()=>invoke("openNotificationSettings"),
    requestExact:()=>invoke("requestExactAlarmAccess"),
    test:()=>invoke("testNotification")
  };
});