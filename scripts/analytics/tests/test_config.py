"""Tests for analytics agent config loader."""
from pathlib import Path

import pytest


class TestLoadConfig:
    """Tests for loading config from ~/.config/rewire/.env.analytics."""

    def test_load_returns_resend_key_from_file(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real_value\n"
            "REPORT_TO_EMAIL=test@example.com\n"
        )
        cfg = load_config(str(env_file))
        assert cfg.resend_api_key == "re_real_value"
        assert cfg.report_to_email == "test@example.com"

    def test_load_applies_defaults_for_optional_fields(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text("RESEND_API_KEY=re_real\n")
        cfg = load_config(str(env_file))
        assert cfg.report_to_email == "arimurahiroaki40@gmail.com"
        assert cfg.claude_cmd == "claude"
        assert cfg.report_timezone == "Asia/Tokyo"
        assert "onboarding@resend.dev" in cfg.resend_from

    def test_load_raises_when_file_missing(self):
        from scripts.analytics.config import load_config

        with pytest.raises(FileNotFoundError) as exc:
            load_config("/nonexistent/.env.analytics")
        assert ".env.analytics" in str(exc.value)

    def test_load_raises_when_resend_key_missing(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text("REPORT_TO_EMAIL=test@example.com\n")
        with pytest.raises(ValueError) as exc:
            load_config(str(env_file))
        assert "RESEND_API_KEY" in str(exc.value)

    def test_load_raises_when_resend_key_is_placeholder(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text("RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n")
        with pytest.raises(ValueError) as exc:
            load_config(str(env_file))
        assert "placeholder" in str(exc.value).lower()

    def test_default_path_points_to_user_config(self):
        from scripts.analytics.config import DEFAULT_ENV_PATH

        assert DEFAULT_ENV_PATH.endswith("/.config/rewire/.env.analytics")
        assert DEFAULT_ENV_PATH.startswith(str(Path.home()))


class TestRevenueCatOptionalFields:
    """RevenueCat keys are optional — config must still load without them so
    Phase B (mail-only) keeps working. When both are present, both must be
    surfaced for downstream consumers."""

    def test_revenuecat_fields_default_to_none(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text("RESEND_API_KEY=re_real\n")
        cfg = load_config(str(env_file))
        assert cfg.revenuecat_api_key is None
        assert cfg.revenuecat_project_id is None

    def test_revenuecat_fields_loaded_when_present(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "REVENUECAT_API_KEY=sk_real_value\n"
            "REVENUECAT_PROJECT_ID=cb6956cd\n"
        )
        cfg = load_config(str(env_file))
        assert cfg.revenuecat_api_key == "sk_real_value"
        assert cfg.revenuecat_project_id == "cb6956cd"

    def test_revenuecat_placeholder_value_treated_as_unset(self, tmp_path):
        # If the user pasted the literal placeholder we treat it as not
        # configured rather than crashing — Phase B email still goes out.
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "REVENUECAT_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n"
            "REVENUECAT_PROJECT_ID=projxxxxxxxxxx\n"
        )
        cfg = load_config(str(env_file))
        assert cfg.revenuecat_api_key is None
        assert cfg.revenuecat_project_id is None

    def test_has_revenuecat_helper(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file_off = tmp_path / "off.env"
        env_file_off.write_text("RESEND_API_KEY=re_real\n")
        assert load_config(str(env_file_off)).has_revenuecat is False

        env_file_on = tmp_path / "on.env"
        env_file_on.write_text(
            "RESEND_API_KEY=re_real\n"
            "REVENUECAT_API_KEY=sk_x\n"
            "REVENUECAT_PROJECT_ID=cb6956cd\n"
        )
        assert load_config(str(env_file_on)).has_revenuecat is True


class TestFirebaseOptionalFields:
    """Firebase/GA4 keys are optional. has_firebase must additionally verify
    that the service-account JSON actually exists on disk — a missing file is
    the most common configuration mistake and we want to fail fast."""

    def test_firebase_fields_default_to_none(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text("RESEND_API_KEY=re_real\n")
        cfg = load_config(str(env_file))
        assert cfg.ga4_property_id is None
        assert cfg.google_application_credentials is None

    def test_firebase_fields_loaded_when_present(self, tmp_path):
        from scripts.analytics.config import load_config

        sa = tmp_path / "ga4-sa.json"
        sa.write_text('{"type":"service_account"}')

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "GA4_PROPERTY_ID=123456789\n"
            f"GOOGLE_APPLICATION_CREDENTIALS={sa}\n"
        )
        cfg = load_config(str(env_file))
        assert cfg.ga4_property_id == "123456789"
        assert cfg.google_application_credentials == str(sa)

    def test_firebase_placeholder_treated_as_unset(self, tmp_path):
        from scripts.analytics.config import load_config

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "GA4_PROPERTY_ID=123456789_REPLACE_ME\n"
            "GOOGLE_APPLICATION_CREDENTIALS=/path/to/REPLACE_ME.json\n"
        )
        cfg = load_config(str(env_file))
        assert cfg.ga4_property_id is None
        assert cfg.google_application_credentials is None

    def test_has_firebase_requires_credentials_file_to_exist(self, tmp_path):
        from scripts.analytics.config import load_config

        # Both env values present, but the JSON file does NOT exist.
        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "GA4_PROPERTY_ID=123456789\n"
            "GOOGLE_APPLICATION_CREDENTIALS=/nonexistent/ga4-sa.json\n"
        )
        assert load_config(str(env_file)).has_firebase is False

    def test_has_firebase_true_when_both_present_and_file_exists(self, tmp_path):
        from scripts.analytics.config import load_config

        sa = tmp_path / "ga4-sa.json"
        sa.write_text('{"type":"service_account"}')

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "GA4_PROPERTY_ID=123456789\n"
            f"GOOGLE_APPLICATION_CREDENTIALS={sa}\n"
        )
        assert load_config(str(env_file)).has_firebase is True

    def test_tilde_in_credentials_path_is_expanded(self, tmp_path, monkeypatch):
        """Common gotcha: users paste ~/.config/firebase/ga4-sa.json and the
        agent must expand to absolute or has_firebase silently returns False."""
        from scripts.analytics.config import load_config

        # Pretend the user's home is tmp_path so ~ expands somewhere we control.
        monkeypatch.setenv("HOME", str(tmp_path))
        sa_dir = tmp_path / ".config" / "firebase"
        sa_dir.mkdir(parents=True)
        sa = sa_dir / "ga4-sa.json"
        sa.write_text('{"type":"service_account"}')

        env_file = tmp_path / ".env.analytics"
        env_file.write_text(
            "RESEND_API_KEY=re_real\n"
            "GA4_PROPERTY_ID=123456789\n"
            "GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/ga4-sa.json\n"
        )
        cfg = load_config(str(env_file))
        # Stored expanded so downstream callers can hand it straight to the SDK.
        assert cfg.google_application_credentials == str(sa)
        assert cfg.has_firebase is True
