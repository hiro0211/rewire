#!/usr/bin/env python3
"""Compose App Store screenshot #1 (JP) from HTML template -> headless Chrome -> flattened PNG.

Pipeline: base64-embed assets + fonts -> generate starfield + laurel SVG ->
render with headless Chrome at exact 1320x2868 -> Pillow flatten to RGB (no alpha) -> verify size.

Run: python3 scripts/appstore/build_screenshot1.py
"""
import base64
import math
import os
import random
import signal
import subprocess
import sys
import tempfile
import time

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, "screenshot1.template.html")
ICON = "/Users/arimurahiroaki/rewire/assets/images/icon.png"
SCREEN = os.path.join(HERE, "assets", "dashboard.jpg")
FONT_900 = os.path.join(HERE, "fonts", "NotoSansJP-900.woff2")
FONT_700 = os.path.join(HERE, "fonts", "NotoSansJP-700.woff2")
OUT_HTML = os.path.join(HERE, "screenshot1.html")
OUT_DIR = os.path.join(HERE, "output")
OUT_PNG = os.path.join(OUT_DIR, "appstore-jp-1_1320x2868.png")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

W, H = 1320, 2868


def b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


# --- starfield (seeded for reproducibility) -------------------------------
def make_stars(n: int = 130, seed: int = 7) -> str:
    rng = random.Random(seed)
    out = []
    for _ in range(n):
        x = rng.randint(0, W)
        y = rng.randint(0, H)
        size = rng.choice([1, 1, 1, 2, 2, 3])
        op = round(rng.uniform(0.25, 0.9), 2)
        bright = " bright" if size >= 3 and rng.random() < 0.7 else ""
        out.append(
            f'<div class="star{bright}" style="left:{x}px;top:{y}px;'
            f'width:{size}px;height:{size}px;opacity:{op}"></div>'
        )
    return "".join(out)


# --- laurel wreath (parametric: leaves sampled along a bezier stem) -------
def _bez(p0, p1, p2, p3, t):
    mt = 1 - t
    x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
    y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
    return x, y


def _bez_d(p0, p1, p2, p3, t):
    mt = 1 - t
    dx = 3 * mt**2 * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t**2 * (p3[0] - p2[0])
    dy = 3 * mt**2 * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t**2 * (p3[1] - p2[1])
    return dx, dy


def _branch(p0, p1, p2, p3, center, n_leaves=8, leaf_color="#E8D9A0", stem_color="#C9B570"):
    cx, cy = center
    parts = []
    # stem
    parts.append(
        f'<path d="M{p0[0]:.1f},{p0[1]:.1f} C{p1[0]:.1f},{p1[1]:.1f} '
        f'{p2[0]:.1f},{p2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f}" '
        f'fill="none" stroke="{stem_color}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>'
    )
    ts = [0.06 + (0.90 - 0.06) * i / (n_leaves - 1) for i in range(n_leaves)]
    for i, t in enumerate(ts):
        px, py = _bez(p0, p1, p2, p3, t)
        dx, dy = _bez_d(p0, p1, p2, p3, t)
        tl = math.hypot(dx, dy) or 1.0
        tx, ty = dx / tl, dy / tl  # unit tangent (up the branch)
        # outward normal: pick the one pointing away from center
        n1 = (-ty, tx)
        if (px + n1[0] - cx) ** 2 + (py + n1[1] - cy) ** 2 < (px - cx) ** 2 + (py - cy) ** 2:
            n1 = (ty, -tx)
        # leaf direction: outward, leaning toward branch tip
        dirx, diry = n1[0] + 0.55 * tx, n1[1] + 0.55 * ty
        dl = math.hypot(dirx, diry) or 1.0
        dirx, diry = dirx / dl, diry / dl
        ang = math.degrees(math.atan2(diry, dirx))
        tt = i / (n_leaves - 1)
        L = 22 + 17 * math.sin(math.pi * tt)
        w = L * 0.42
        leaf = (
            f"M0,0 Q{L*0.5:.1f},{-w:.1f} {L:.1f},0 Q{L*0.5:.1f},{w:.1f} 0,0 Z"
        )
        parts.append(
            f'<path d="{leaf}" fill="{leaf_color}" opacity="0.95" '
            f'transform="translate({px:.1f},{py:.1f}) rotate({ang:.1f})"/>'
        )
    return "".join(parts)


def make_laurel(bw=380, bh=196) -> str:
    center = (bw / 2, bh / 2)
    # left branch "(" hugging left edge
    lp = [(170, 180), (30, 158), (30, 38), (170, 16)]
    # right branch ")" = mirror of left across vertical center
    rp = [(bw - x, y) for (x, y) in lp]
    left = _branch(*lp, center=center)
    right = _branch(*rp, center=center)
    return (
        f'<svg viewBox="0 0 {bw} {bh}" xmlns="http://www.w3.org/2000/svg">'
        f"{left}{right}</svg>"
    )


# --- render ---------------------------------------------------------------
def render():
    html = open(TEMPLATE, encoding="utf-8").read()
    html = (
        html.replace("{{FONT_900}}", b64(FONT_900))
        .replace("{{FONT_700}}", b64(FONT_700))
        .replace("{{ICON}}", b64(ICON))
        .replace("{{SCREEN}}", b64(SCREEN))
        .replace("{{STARS}}", make_stars())
        .replace("{{LAUREL}}", make_laurel())
    )
    with open(OUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {OUT_HTML} ({len(html)} bytes)")

    os.makedirs(OUT_DIR, exist_ok=True)
    with tempfile.TemporaryDirectory() as udd:
        tmp_png = os.path.join(udd, "shot.png")
        log = os.path.join(udd, "chrome.log")
        cmd = [
            CHROME,
            "--headless=new",
            f"--user-data-dir={udd}/prof",
            "--no-first-run",
            "--hide-scrollbars",
            "--disable-gpu",
            "--use-mock-keychain",
            "--force-device-scale-factor=1",
            f"--window-size={W},{H}",
            f"--screenshot={tmp_png}",
            f"file://{OUT_HTML}",
        ]
        print("rendering with headless Chrome (file-poll; Chrome holds the stdout pipe open, so we never read it)...")
        # Do NOT pipe/capture stdout: Chrome leaves helper procs that keep the pipe
        # open, which would hang any reader. Send output to a file and poll for the PNG.
        logf = open(log, "wb")
        proc = subprocess.Popen(cmd, stdout=logf, stderr=logf, start_new_session=True)
        deadline = time.time() + 90
        last = -1
        while time.time() < deadline:
            if os.path.exists(tmp_png):
                sz = os.path.getsize(tmp_png)
                if sz > 0 and sz == last:  # size stable across two polls -> fully written
                    break
                last = sz
            time.sleep(0.5)
        # targeted teardown: kill our process group only (unique --user-data-dir)
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except ProcessLookupError:
            pass
        subprocess.run(["pkill", "-f", f"{udd}/prof"], capture_output=True)
        logf.close()
        if not os.path.exists(tmp_png) or os.path.getsize(tmp_png) == 0:
            print(open(log, errors="replace").read())
            sys.exit("Chrome render failed: no output produced")
        im = Image.open(tmp_png)
        print(f"raw render: {im.width}x{im.height} {im.mode}")
        if im.mode != "RGB":
            im = im.convert("RGB")  # drop alpha -> App Store requires no alpha
        if (im.width, im.height) != (W, H):
            print(f"resizing {im.width}x{im.height} -> {W}x{H}")
            im = im.resize((W, H), Image.LANCZOS)
        im.save(OUT_PNG, "PNG")
    print(f"saved {OUT_PNG}")
    final = Image.open(OUT_PNG)
    print(f"FINAL: {final.width}x{final.height} mode={final.mode}")
    assert (final.width, final.height) == (W, H), "size mismatch!"
    assert final.mode == "RGB", "alpha channel present!"


if __name__ == "__main__":
    render()
