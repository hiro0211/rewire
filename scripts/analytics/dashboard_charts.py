"""Dependency-free chart primitives for the dashboard.

No chart library, no CDN, no external font — the generated page has to open
from a file:// URL and survive a strict CSP, same as the rest of the report.
Everything here is inline CSS on plain table cells.
"""
from typing import Optional, Sequence

from scripts.analytics.html_report import _esc

#: Number of shading steps above "empty".
HEATMAP_STEPS = 6

#: Cyan ramp, light to saturated. Index 0 is the "no data" cell — deliberately
#: a visible grey rather than white, so an empty cell reads as measured-zero
#: rather than as a hole in the table.
_RAMP = (
    "#1f2937",
    "#0e4b5a",
    "#116379",
    "#137e99",
    "#159ab8",
    "#22b8d4",
    "#67e8f9",
)


def intensity(value: int, peak: int) -> int:
    """Map ``value`` to a shading step in 0..HEATMAP_STEPS.

    Any non-zero value gets at least step 1. A plain proportional round would
    send small counts to step 0 — measured during verification, a cell of 1
    against a peak of 85 rendered identically to an unused hour, so a used
    slot looked emptier than an empty one.
    """
    if value <= 0 or peak <= 0:
        return 0
    step = round(value / peak * HEATMAP_STEPS)
    return max(1, min(HEATMAP_STEPS, step))


def rate_cell(rate: Optional[float]) -> str:
    """A percentage, or an em dash when the rate is genuinely unknown.

    None and 0.0 must not look alike: "nobody came back" is a finding, while
    "not enough time has passed" is an absence of one.
    """
    if rate is None:
        return "—"
    return f"{rate * 100:.1f}%"


def heatmap_html(
    grid: Sequence[Sequence[int]],
    row_labels: Sequence[str],
    unit: str = "件",
) -> str:
    """A 7×24 shaded grid as an HTML table.

    Cells are too small for numbers, so each carries a ``title`` attribute with
    its value and slot — hovering is the way to read an exact count.

    Raises:
        ValueError: when the label count does not match the grid height.
    """
    if len(row_labels) != len(grid):
        raise ValueError(
            f"{len(row_labels)} row labels for {len(grid)} rows — "
            "a mismatch silently relabels every row"
        )

    peak = max((max(row) for row in grid if row), default=0)

    header = "".join(
        f'<th style="font-weight:400;font-size:9px;color:#71717a;padding:0 1px">'
        f'{h if h % 3 == 0 else ""}</th>'
        for h in range(24)
    )

    body = []
    for label, row in zip(row_labels, grid):
        cells = "".join(
            f'<td title="{_esc(label)}曜 {hour}時台: {value}{_esc(unit)}" '
            f'style="background:{_RAMP[intensity(value, peak)]};'
            f'width:11px;height:14px;padding:0;border:1px solid #09090b"></td>'
            for hour, value in enumerate(row)
        )
        body.append(
            f'<tr><th style="font-weight:600;font-size:11px;color:#a1a1aa;'
            f'padding-right:6px;text-align:right">{_esc(label)}</th>{cells}'
            f'<td style="font-size:11px;color:#a1a1aa;padding-left:8px">'
            f'{sum(row)}</td></tr>'
        )

    return (
        '<table style="border-collapse:collapse;margin:8px 0 4px">'
        f'<tr><th></th>{header}<th></th></tr>'
        f'{"".join(body)}'
        "</table>"
        '<p style="color:#71717a;font-size:11px;margin:0 0 12px">'
        "左が 0 時、右が 23 時（JST）。濃いほど利用が多い。"
        "セルにカーソルを合わせると件数が出る。</p>"
    )
