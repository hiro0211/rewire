"""JWT authentication for App Store Connect API.

Generates ES256 JWT tokens using credentials stored in ~/.config/asc/.
Never stores or logs sensitive credentials.
"""
import json
import time
from pathlib import Path

import jwt


DEFAULT_CONFIG_PATH = str(Path.home() / ".config" / "asc" / "config.json")
DEFAULT_KEY_DIR = str(Path.home() / ".config" / "asc")


def load_config(config_path: str = DEFAULT_CONFIG_PATH) -> dict:
    """Load ASC config (issuer_id, key_id) from JSON file.

    Args:
        config_path: Path to config.json.

    Returns:
        Dict with 'issuer_id' and 'key_id'.

    Raises:
        FileNotFoundError: If config file does not exist.
        KeyError: If required keys are missing.
    """
    with open(config_path, "r") as f:
        config = json.load(f)

    # Validate required keys
    _ = config["issuer_id"]
    _ = config["key_id"]

    return config


def generate_token(
    issuer_id: str,
    key_id: str,
    private_key: str,
    duration_seconds: int = 1140,  # 19 minutes (under 20min limit)
) -> str:
    """Generate a JWT token for App Store Connect API.

    Args:
        issuer_id: The Issuer ID from App Store Connect.
        key_id: The Key ID for the API key.
        private_key: The private key content (PEM format).
        duration_seconds: Token validity in seconds (max 1200).

    Returns:
        Encoded JWT token string.
    """
    now = int(time.time())
    payload = {
        "iss": issuer_id,
        "iat": now,
        "exp": now + duration_seconds,
        "aud": "appstoreconnect-v1",
    }
    headers = {
        "alg": "ES256",
        "kid": key_id,
        "typ": "JWT",
    }
    token = jwt.encode(payload, private_key, algorithm="ES256", headers=headers)
    return token


def get_auth_headers(
    config_path: str = DEFAULT_CONFIG_PATH,
    key_dir: str = DEFAULT_KEY_DIR,
) -> dict:
    """Build authorization headers for ASC API requests.

    Args:
        config_path: Path to config.json.
        key_dir: Directory containing the .p8 private key.

    Returns:
        Dict with Authorization and Content-Type headers.
    """
    config = load_config(config_path)
    key_file = Path(key_dir) / f"AuthKey_{config['key_id']}.p8"

    with open(key_file, "r") as f:
        private_key = f.read()

    token = generate_token(
        issuer_id=config["issuer_id"],
        key_id=config["key_id"],
        private_key=private_key,
    )
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
