"""App Store スクリーンショット検証スクリプト
使い方: python3 verify_screenshots.py <画像フォルダ or 画像ファイル...>
Apple の必須仕様(2025/2026)に合致するかを1px単位でチェックする。
"""
import sys, os, re
from PIL import Image

# (幅, 高さ) の許容セット。縦・横どちらも許可。
SPECS = {
    "6.9\" iPhone (必須)": [(1290, 2796), (2796, 1290), (1320, 2868), (2868, 1320)],
    "13\" iPad (iPad対応時のみ)": [(2064, 2752), (2752, 2064)],
}
ASCII_ONLY = re.compile(r"^[\x00-\x7F]+$")


def check(path: str) -> None:
    name = os.path.basename(path)
    try:
        img = Image.open(path)
    except Exception as e:
        print(f"❌ {name}: 開けません ({e})")
        return
    w, h = img.size
    fmt = img.format
    dpi = img.info.get("dpi", ("?", "?"))

    matched = next((label for label, sizes in SPECS.items() if (w, h) in sizes), None)
    issues = []
    if not matched:
        issues.append(f"寸法 {w}x{h} がどの必須サイズにも一致しない")
    if fmt != "PNG":
        issues.append(f"形式が {fmt}（PNG 推奨）")
    if not ASCII_ONLY.match(name):
        issues.append("ファイル名に非ASCII文字（日本語等）が含まれる")

    head = "✅" if not issues else "⚠️"
    label = matched or "サイズ不一致"
    print(f"{head} {name}: {w}x{h} {fmt} dpi={dpi} -> {label}")
    for i in issues:
        print(f"     - {i}")


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print("使い方: python3 verify_screenshots.py <フォルダ または 画像ファイル>")
        return
    files: list[str] = []
    for a in args:
        if os.path.isdir(a):
            files += [os.path.join(a, f) for f in os.listdir(a)
                      if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        else:
            files.append(a)
    if not files:
        print("画像が見つかりません。")
        return
    for f in sorted(files):
        check(f)


if __name__ == "__main__":
    main()
