"""Tests for the Resend email sender."""
from unittest.mock import MagicMock, patch

import pytest


class TestSendEmail:
    """Tests for sending a single transactional email via Resend."""

    def _mock_resend(self, status=200, body=None):
        response = MagicMock()
        response.status_code = status
        response.json.return_value = body or {"id": "email-abc"}
        response.text = "" if body is None else str(body)
        return response

    def test_posts_to_resend_endpoint(self):
        from scripts.analytics.mailer import send_email

        response = self._mock_resend()
        with patch("requests.post", return_value=response) as mock_post:
            send_email(
                api_key="re_test",
                sender="X <test@example.com>",
                recipient="me@example.com",
                subject="hello",
                markdown_body="# Hi",
            )
        url = mock_post.call_args[0][0]
        assert url == "https://api.resend.com/emails"

    def test_sends_bearer_auth_header(self):
        from scripts.analytics.mailer import send_email

        with patch("requests.post", return_value=self._mock_resend()) as mock_post:
            send_email(
                api_key="re_test",
                sender="X <test@example.com>",
                recipient="me@example.com",
                subject="s",
                markdown_body="body",
            )
        headers = mock_post.call_args.kwargs["headers"]
        assert headers["Authorization"] == "Bearer re_test"
        assert headers["Content-Type"] == "application/json"

    def test_payload_contains_required_fields(self):
        from scripts.analytics.mailer import send_email

        with patch("requests.post", return_value=self._mock_resend()) as mock_post:
            send_email(
                api_key="re_test",
                sender="Rewire <onboarding@resend.dev>",
                recipient="me@example.com",
                subject="Daily report",
                markdown_body="# Title\n\nbody text",
            )
        payload = mock_post.call_args.kwargs["json"]
        assert payload["from"] == "Rewire <onboarding@resend.dev>"
        assert payload["to"] == "me@example.com"
        assert payload["subject"] == "Daily report"
        assert payload["text"] == "# Title\n\nbody text"
        assert "<h1>Title</h1>" in payload["html"]
        assert "body text" in payload["html"]

    def test_prefers_explicit_html_body_over_markdown_conversion(self):
        from scripts.analytics.mailer import send_email

        prebuilt = "<!DOCTYPE html><html><body><table></table></body></html>"
        with patch("requests.post", return_value=self._mock_resend()) as mock_post:
            send_email(
                api_key="re_test",
                sender="X <t@e.com>",
                recipient="me@e.com",
                subject="s",
                markdown_body="| a | b |\n|---|---|\n| 1 | 2 |",
                html_body=prebuilt,
            )
        payload = mock_post.call_args.kwargs["json"]
        # HTML part is the prebuilt document verbatim; text part stays Markdown.
        assert payload["html"] == prebuilt
        assert payload["text"] == "| a | b |\n|---|---|\n| 1 | 2 |"
        assert "<pre>" not in payload["html"]

    def test_falls_back_to_markdown_html_when_no_html_body(self):
        from scripts.analytics.mailer import send_email

        with patch("requests.post", return_value=self._mock_resend()) as mock_post:
            send_email(
                api_key="re_test",
                sender="X <t@e.com>",
                recipient="me@e.com",
                subject="s",
                markdown_body="# Title\n\nbody",
            )
        payload = mock_post.call_args.kwargs["json"]
        assert "<h1>Title</h1>" in payload["html"]

    def test_returns_resend_message_id_on_success(self):
        from scripts.analytics.mailer import send_email

        response = self._mock_resend(body={"id": "msg-xyz"})
        with patch("requests.post", return_value=response):
            result = send_email(
                api_key="re_test",
                sender="X <t@e.com>",
                recipient="me@e.com",
                subject="s",
                markdown_body="b",
            )
        assert result == "msg-xyz"

    def test_raises_on_non_2xx_response(self):
        from scripts.analytics.mailer import send_email

        response = self._mock_resend(status=422, body={"message": "domain unverified"})
        with patch("requests.post", return_value=response):
            with pytest.raises(RuntimeError) as exc:
                send_email(
                    api_key="re_test",
                    sender="X <t@e.com>",
                    recipient="me@e.com",
                    subject="s",
                    markdown_body="b",
                )
        assert "422" in str(exc.value)
        assert "domain unverified" in str(exc.value)


class TestMarkdownToHtml:
    """Tests for the minimal markdown converter (no external deps)."""

    def test_converts_h1_h2_paragraphs(self):
        from scripts.analytics.mailer import markdown_to_html

        md = "# Top\n\nfirst line\n\n## Sub\n\nsecond line"
        html = markdown_to_html(md)
        assert "<h1>Top</h1>" in html
        assert "<h2>Sub</h2>" in html
        assert "<p>first line</p>" in html
        assert "<p>second line</p>" in html

    def test_escapes_html_characters(self):
        from scripts.analytics.mailer import markdown_to_html

        html = markdown_to_html("# A & B <c>")
        assert "&amp;" in html
        assert "&lt;c&gt;" in html

    def test_preserves_table_rows_as_pre(self):
        from scripts.analytics.mailer import markdown_to_html

        md = "| col1 | col2 |\n|---|---|\n| a | b |"
        html = markdown_to_html(md)
        # We render tables inside a <pre> block for fidelity in email clients.
        assert "<pre>" in html
        assert "col1" in html and "a" in html
