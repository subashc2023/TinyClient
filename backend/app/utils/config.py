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
    """Get the frontend base URL from unified config."""
    domain = os.getenv("APP_DOMAIN", "localhost")
    protocol = os.getenv("APP_PROTOCOL", "http")
    port = os.getenv("FRONTEND_PORT", "3000")

    return build_url(domain, protocol, port)

def get_backend_base_url() -> str:
    """Get the backend base URL from unified config."""
    domain = os.getenv("APP_DOMAIN", "localhost")
    protocol = os.getenv("APP_PROTOCOL", "http")
    port = os.getenv("BACKEND_PORT", "8001")

    return build_url(domain, protocol, port)

def _origin_from_url(url: str) -> str:
    """Return the origin (scheme://host[:port]) for a given absolute URL string."""
    # Very small parsing to avoid importing urlparse
    if not url:
        return ""
    # Expect format: scheme://host[:port][/...]
    try:
        scheme_sep = url.find("://")
        if scheme_sep == -1:
            return url
        scheme = url[:scheme_sep]
        rest = url[scheme_sep + 3 :]
        slash_idx = rest.find("/")
        authority = rest if slash_idx == -1 else rest[:slash_idx]
        return f"{scheme}://{authority}"
    except Exception:
        return url

def get_allowed_cors_origins() -> list[str]:
    """Compute strict CORS origins:
    - Frontend base origin
    - Backend base origin (to allow direct browsing on same IP)
    - Optional comma-separated EXTRA_ALLOWED_ORIGINS
    """
    frontend = _origin_from_url(get_frontend_base_url())
    backend = _origin_from_url(get_backend_base_url())

    # Always include localhost/127.0.0.1 for development ergonomics
    # This still keeps CORS tight and avoids random origins in production
    protocol = os.getenv("APP_PROTOCOL", "http").strip() or "http"
    frontend_port = os.getenv("FRONTEND_PORT", "3000").strip() or "3000"
    backend_port = os.getenv("BACKEND_PORT", "8001").strip() or "8001"

    local_dev_origins = [
        f"{protocol}://localhost:{frontend_port}",
        f"{protocol}://127.0.0.1:{frontend_port}",
        f"{protocol}://localhost:{backend_port}",
        f"{protocol}://127.0.0.1:{backend_port}",
    ]

    extras_raw = os.getenv("EXTRA_ALLOWED_ORIGINS", "").strip()
    extras: list[str] = []
    if extras_raw:
        extras = [o.strip() for o in extras_raw.split(",") if o.strip()]

    # De-duplicate while preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for origin in [frontend, backend, *local_dev_origins, *extras]:
        if origin and origin not in seen:
            seen.add(origin)
            ordered.append(origin)

    return ordered


def get_cookie_settings() -> dict:
    """Return cookie settings derived from environment.

    Keys:
    - secure: bool
    - samesite: str ("lax" | "strict" | "none")
    - domain: str | None
    - path: str
    """
    protocol = os.getenv("APP_PROTOCOL", "http").strip().lower() or "http"

    # Sane defaults: secure only when using https; SameSite Lax; path "/"; domain optional
    secure_raw = os.getenv("COOKIE_SECURE")
    secure = (secure_raw.strip().lower() in {"1", "true", "yes", "on"}) if secure_raw else (protocol == "https")

    samesite = (os.getenv("COOKIE_SAMESITE", "lax").strip().lower() or "lax")
    if samesite not in {"lax", "strict", "none"}:
        samesite = "lax"

    domain = os.getenv("COOKIE_DOMAIN")
    domain = domain.strip() if domain else None

    path = os.getenv("COOKIE_PATH", "/").strip() or "/"

    return {
        "secure": secure,
        "samesite": samesite,
        "domain": domain,
        "path": path,
    }