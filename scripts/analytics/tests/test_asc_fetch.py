"""Tests for high-level data fetch and save functions."""
import json
import tempfile
from pathlib import Path

import pytest


class TestSaveDailyData:
    """Tests for saving fetched data to disk."""

    def test_save_creates_date_directory(self, tmp_path):
        from scripts.analytics.asc_fetch import save_daily_data

        data = {"Test Report": "col1\tcol2\nval1\tval2\n"}
        result = save_daily_data(data, "2026-04-03", output_dir=tmp_path)

        assert result == tmp_path / "2026-04-03"
        assert result.is_dir()

    def test_save_writes_tsv_files(self, tmp_path):
        from scripts.analytics.asc_fetch import save_daily_data

        data = {
            "App Store Engagement": "date\timpressions\n2026-04-03\t5000\n",
            "App Downloads": "date\tunits\n2026-04-03\t100\n",
        }
        result = save_daily_data(data, "2026-04-03", output_dir=tmp_path)

        files = list((tmp_path / "2026-04-03").glob("*.tsv"))
        assert len(files) == 2

    def test_save_writes_manifest(self, tmp_path):
        from scripts.analytics.asc_fetch import save_daily_data

        data = {"My Report": "header\nrow\n"}
        save_daily_data(data, "2026-04-03", output_dir=tmp_path)

        manifest_path = tmp_path / "2026-04-03" / "manifest.json"
        assert manifest_path.exists()
        manifest = json.loads(manifest_path.read_text())
        assert manifest["date"] == "2026-04-03"
        assert manifest["file_count"] == 1
        assert "My Report" in manifest["reports"]

    def test_save_sanitizes_filenames(self, tmp_path):
        from scripts.analytics.asc_fetch import save_daily_data

        data = {"App Store/Engagement Data": "data\n"}
        save_daily_data(data, "2026-04-03", output_dir=tmp_path)

        files = list((tmp_path / "2026-04-03").glob("*.tsv"))
        assert len(files) == 1
        # No slashes or spaces in filename
        assert " " not in files[0].name
        assert "/" not in files[0].name

    def test_save_empty_data(self, tmp_path):
        from scripts.analytics.asc_fetch import save_daily_data

        data = {}
        result = save_daily_data(data, "2026-04-03", output_dir=tmp_path)

        assert result.is_dir()
        manifest = json.loads((result / "manifest.json").read_text())
        assert manifest["file_count"] == 0
