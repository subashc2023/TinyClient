import os

def build_url(domain: str, protocol: str, port: str) -> str:
    """Build a URL from domain, protocol, and port components."""
    normalized_protocol = protocol or "http"
    normalized_domain = domain or "localhost"

    # Handle default ports
    if ((normalized_protocol == "http" and port == "80") or
        (normalized_protocol == "https" and port == "443")):
        return f"{normalized_protocol}://{normalized_domain}"

    return f"{normalized_protocol}://{normalized_domain}:{port}" if port else f"{normalized_protocol}://{normalized_domain}"

def get_frontend_base_url() -> str:
    """Get the frontend base URL, with fallback to unified config."""
    # Check for explicit frontend base URL first (backward compatibility)
    explicit_url = os.getenv("FRONTEND_BASE_URL")
    if explicit_url:
        return explicit_url

    # Build from unified config
    domain = os.getenv("APP_DOMAIN", "localhost")
    protocol = os.getenv("APP_PROTOCOL", "http")
    port = os.getenv("FRONTEND_PORT", "3000")

    return build_url(domain, protocol, port)

def get_backend_base_url() -> str:
    """Get the backend base URL, with fallback to unified config."""
    # Check for explicit backend base URL first (backward compatibility)
    explicit_url = os.getenv("BACKEND_BASE_URL")
    if explicit_url:
        return explicit_url

    # Build from unified config
    domain = os.getenv("APP_DOMAIN", "localhost")
    protocol = os.getenv("APP_PROTOCOL", "http")
    port = os.getenv("BACKEND_PORT", "8001")

    return build_url(domain, protocol, port)