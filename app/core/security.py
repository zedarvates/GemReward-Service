import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)

def verify_github_signature(body: bytes, signature_header: str, secret: str) -> bool:
    """
    Vérifie la signature HMAC-SHA256 d'un webhook GitHub.
    """
    if not signature_header or not secret:
        return False

    if not signature_header.startswith("sha256="):
        return False

    received_sig = signature_header[len("sha256="):]
    expected_sig = hmac.new(
        secret.encode("utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(received_sig, expected_sig)
