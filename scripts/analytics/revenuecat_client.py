"""RevenueCat V2 API client.

Targets the snapshot endpoints required for the daily report:
  - GET /v2/projects/{id}/metrics/overview

The Charts time-series endpoints (mrr, churn, etc.) can be layered on later;
the overview is enough for the first pass since it already exposes MRR,
active subscriptions, new customers and active users.

Auth: V2 secret key (`sk_...`) passed as `Authorization: Bearer ...`.
"""
from typing import Dict

import requests


BASE_URL = "https://api.revenuecat.com/v2"


def _require(value: str, name: str) -> None:
    if not value:
        raise ValueError(f"{name} is required")


def fetch_overview(api_key: str, project_id: str) -> Dict[str, dict]:
    """Return the current snapshot metrics keyed by metric id.

    Each value is a dict with: ``value``, ``unit``, ``period``, ``name``.

    Raises:
        ValueError: when api_key or project_id is empty.
        RuntimeError: on non-2xx response from RevenueCat.
    """
    _require(api_key, "api_key")
    _require(project_id, "project_id")

    url = f"{BASE_URL}/projects/{project_id}/metrics/overview"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    resp = requests.get(url, headers=headers)
    if not (200 <= resp.status_code < 300):
        body = resp.text
        try:
            body = resp.json()
        except Exception:
            pass
        raise RuntimeError(
            f"RevenueCat overview fetch failed ({resp.status_code}): {body}"
        )

    payload = resp.json()
    result: Dict[str, dict] = {}
    for metric in payload.get("metrics", []):
        metric_id = metric.get("id")
        if not metric_id:
            continue
        result[metric_id] = {
            "value": metric.get("value"),
            "unit": metric.get("unit", ""),
            "period": metric.get("period", ""),
            "name": metric.get("name", metric_id),
        }
    return result


def summarize_overview(metrics: Dict[str, dict]) -> Dict[str, str]:
    """Format each metric as ``"$VALUE (PERIOD)"`` / ``"VALUE (PERIOD)"``.

    Helpful for embedding into the prompt sent to Claude without leaking the
    full nested shape.
    """
    summary: Dict[str, str] = {}
    for metric_id, info in metrics.items():
        value = info.get("value")
        if value is None:
            continue
        unit = info.get("unit", "")
        period = info.get("period", "")
        # Format integers without trailing zeros, floats with up to 2 decimals.
        if isinstance(value, float) and not value.is_integer():
            value_str = f"{value:.2f}"
        else:
            value_str = str(int(value)) if isinstance(value, (int, float)) else str(value)
        prefix = "$" if unit == "$" else ""
        suffix = f" ({period})" if period else ""
        summary[metric_id] = f"{prefix}{value_str}{suffix}"
    return summary
