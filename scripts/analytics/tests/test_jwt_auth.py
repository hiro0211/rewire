"""Tests for JWT authentication module for App Store Connect API."""
import json
import time
from unittest.mock import patch, mock_open
import pytest
import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization


def _generate_test_ec_key() -> str:
    """Generate a valid P-256 EC private key for testing."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    return pem.decode("utf-8")


# Module-level fixture so all tests share the same key
TEST_EC_PRIVATE_KEY = _generate_test_ec_key()


class TestLoadConfig:
    """Tests for loading ASC config from ~/.config/asc/."""

    def test_load_config_returns_issuer_and_key_id(self):
        from scripts.analytics.jwt_auth import load_config

        mock_config = json.dumps({
            "issuer_id": "test-issuer-id",
            "key_id": "TEST_KEY_ID"
        })
        with patch("builtins.open", mock_open(read_data=mock_config)):
            config = load_config("/fake/path/config.json")

        assert config["issuer_id"] == "test-issuer-id"
        assert config["key_id"] == "TEST_KEY_ID"

    def test_load_config_raises_on_missing_file(self):
        from scripts.analytics.jwt_auth import load_config

        with pytest.raises(FileNotFoundError):
            load_config("/nonexistent/config.json")

    def test_load_config_raises_on_missing_keys(self):
        from scripts.analytics.jwt_auth import load_config

        mock_config = json.dumps({"issuer_id": "only-issuer"})
        with patch("builtins.open", mock_open(read_data=mock_config)):
            with pytest.raises(KeyError):
                load_config("/fake/path/config.json")


class TestGenerateToken:
    """Tests for JWT token generation with ES256."""

    def test_generate_token_returns_string(self):
        from scripts.analytics.jwt_auth import generate_token

        token = generate_token(
            issuer_id="test-issuer",
            key_id="TEST_KEY",
            private_key=TEST_EC_PRIVATE_KEY,
        )
        assert isinstance(token, str)
        assert len(token) > 0

    def test_generate_token_has_correct_claims(self):
        from scripts.analytics.jwt_auth import generate_token

        token = generate_token(
            issuer_id="test-issuer",
            key_id="TEST_KEY",
            private_key=TEST_EC_PRIVATE_KEY,
        )
        # Decode without verification to inspect claims
        decoded = jwt.decode(token, options={"verify_signature": False})
        assert decoded["iss"] == "test-issuer"
        assert decoded["aud"] == "appstoreconnect-v1"
        assert "iat" in decoded
        assert "exp" in decoded

    def test_generate_token_expires_within_20_minutes(self):
        from scripts.analytics.jwt_auth import generate_token

        token = generate_token(
            issuer_id="test-issuer",
            key_id="TEST_KEY",
            private_key=TEST_EC_PRIVATE_KEY,
        )
        decoded = jwt.decode(token, options={"verify_signature": False})
        # exp should be at most 20 minutes (1200s) from iat
        assert decoded["exp"] - decoded["iat"] <= 1200
        # but at least 10 minutes to be useful
        assert decoded["exp"] - decoded["iat"] >= 600

    def test_generate_token_has_es256_algorithm(self):
        from scripts.analytics.jwt_auth import generate_token

        token = generate_token(
            issuer_id="test-issuer",
            key_id="TEST_KEY",
            private_key=TEST_EC_PRIVATE_KEY,
        )
        header = jwt.get_unverified_header(token)
        assert header["alg"] == "ES256"
        assert header["kid"] == "TEST_KEY"
        assert header["typ"] == "JWT"


class TestGetAuthHeaders:
    """Tests for building authorization headers."""

    def test_get_auth_headers_returns_bearer_token(self):
        from scripts.analytics.jwt_auth import get_auth_headers

        with patch("scripts.analytics.jwt_auth.generate_token", return_value="fake-token"):
            with patch("scripts.analytics.jwt_auth.load_config", return_value={
                "issuer_id": "test", "key_id": "KEY"
            }):
                with patch("builtins.open", mock_open(read_data="fake-key")):
                    headers = get_auth_headers()

        assert headers["Authorization"] == "Bearer fake-token"
        assert "Content-Type" in headers
