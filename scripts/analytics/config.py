"""Analytics agent config loader.

Reads runtime configuration from ~/.config/rewire/.env.analytics.
Single source of truth for all agent secrets and runtime knobs.
"""
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import dotenv_values


DEFAULT_ENV_PATH = str(Path.home() / ".config" / "rewire" / ".env.analytics")

_DEFAULT_FROM = "Rewire Analytics <onboarding@resend.dev>"
_DEFAULT_TO = "arimurahiroaki40@gmail.com"
_DEFAULT_CLAUDE_CMD = "claude"
_DEFAULT_TIMEZONE = "Asia/Tokyo"

# A value containing only the literal placeholder pattern from .env.example
_PLACEHOLDER_MARKERS = ("xxxxxxxx", "your_key_here", "REPLACE_ME")


@dataclass(frozen=True)
class AnalyticsConfig:
    resend_api_key: str
    resend_from: str
    report_to_email: str
    claude_cmd: str
    report_timezone: str
    revenuecat_api_key: Optional[str] = None
    revenuecat_project_id: Optional[str] = None

    @property
    def has_revenuecat(self) -> bool:
        return bool(self.revenuecat_api_key and self.revenuecat_project_id)


def _is_placeholder(value: str) -> bool:
    lower = value.lower()
    return any(marker.lower() in lower for marker in _PLACEHOLDER_MARKERS)


def _optional(raw, name: str) -> Optional[str]:
    value = (raw.get(name) or "").strip()
    if not value or _is_placeholder(value):
        return None
    return value


def load_config(env_path: str = DEFAULT_ENV_PATH) -> AnalyticsConfig:
    """Load and validate the analytics config.

    Raises:
        FileNotFoundError: env file missing.
        ValueError: required keys missing or unfilled placeholder.
    """
    path = Path(env_path)
    if not path.is_file():
        raise FileNotFoundError(
            f".env.analytics not found at {env_path}. "
            f"Copy scripts/analytics/.env.analytics.example and fill in values."
        )

    raw = dotenv_values(env_path)

    api_key = (raw.get("RESEND_API_KEY") or "").strip()
    if not api_key:
        raise ValueError(
            "RESEND_API_KEY is required in .env.analytics. "
            "Get one from https://resend.com/."
        )
    if _is_placeholder(api_key):
        raise ValueError(
            "RESEND_API_KEY still holds the placeholder value. "
            "Paste your actual key from https://resend.com/."
        )

    return AnalyticsConfig(
        resend_api_key=api_key,
        resend_from=(raw.get("RESEND_FROM") or _DEFAULT_FROM).strip(),
        report_to_email=(raw.get("REPORT_TO_EMAIL") or _DEFAULT_TO).strip(),
        claude_cmd=(raw.get("CLAUDE_CMD") or _DEFAULT_CLAUDE_CMD).strip(),
        report_timezone=(raw.get("REPORT_TIMEZONE") or _DEFAULT_TIMEZONE).strip(),
        revenuecat_api_key=_optional(raw, "REVENUECAT_API_KEY"),
        revenuecat_project_id=_optional(raw, "REVENUECAT_PROJECT_ID"),
    )
