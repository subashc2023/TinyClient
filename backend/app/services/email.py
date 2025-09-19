import json
import logging
import os
import re
from pathlib import Path
from typing import Dict, NamedTuple, Optional

from dotenv import load_dotenv
import resend

load_dotenv()

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
PROJECT_NAME = os.getenv("PROJECT_NAME", "TinyClient")
RESEND_FROM_NAME = os.getenv("RESEND_FROM_NAME", PROJECT_NAME)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "email_templates"
MANIFEST_PATH = TEMPLATE_DIR / "manifest.json"
PLACEHOLDER_PATTERN = re.compile(r"{{\s*([a-zA-Z0-9_]+)\s*}}")


class TemplateContent(NamedTuple):
    subject: str
    html: str
    text: str


def _load_templates() -> Dict[str, TemplateContent]:
    if not MANIFEST_PATH.exists():
        logger.error(
            "Email template manifest not found at %s. Run 'bun install' in frontend/ followed by 'bun run emails:build'",
            MANIFEST_PATH,
        )
        return {}

    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse email template manifest: %s", exc)
        return {}

    templates: Dict[str, TemplateContent] = {}

    for name, meta in manifest.items():
        html_path = TEMPLATE_DIR / meta.get("html", "")
        text_path = TEMPLATE_DIR / meta.get("text", "")

        if not html_path.exists() or not text_path.exists():
            logger.error(
                "Email template files missing for '%s'. Expected files: %s and %s",
                name,
                html_path,
                text_path,
            )
            continue

        html = html_path.read_text(encoding="utf-8")
        text = text_path.read_text(encoding="utf-8")

        templates[name] = TemplateContent(
            subject=meta.get("subject", ""),
            html=html,
            text=text,
        )

    return templates


TEMPLATES = _load_templates()


def _require_templates() -> None:
    if not TEMPLATES:
        raise RuntimeError(
            "Email templates have not been generated. Run 'bun install' in frontend/ followed by 'bun run emails:build'"
        )


def _from_address() -> str:
    if RESEND_FROM_EMAIL and RESEND_FROM_NAME:
        return f"{RESEND_FROM_NAME} <{RESEND_FROM_EMAIL}>"
    return RESEND_FROM_EMAIL


def _render_template(template_name: str, **replacements: str) -> TemplateContent:
    _require_templates()

    template = TEMPLATES.get(template_name)
    if template is None:
        raise KeyError(f"Template '{template_name}' not found in manifest")

    html = template.html
    text = template.text

    for key, value in replacements.items():
        placeholder = f"{{{{{key}}}}}"
        html = html.replace(placeholder, value)
        text = text.replace(placeholder, value)

    unresolved = set(PLACEHOLDER_PATTERN.findall(html)) | set(PLACEHOLDER_PATTERN.findall(text))
    if unresolved:
        raise ValueError(
            f"Missing replacements for placeholders in template '{template_name}': {sorted(unresolved)}"
        )

    return TemplateContent(template.subject, html, text)


def _send_email(
    to: str,
    *,
    subject: str,
    html: str,
    text: str,
    headers: Optional[Dict[str, str]] = None,
) -> None:
    if not RESEND_API_KEY:
        logger.warning(
            "RESEND_API_KEY not configured. Pretending to send email to %s with subject '%s'",
            to,
            subject,
        )
        logger.debug("Email HTML body skipped: %s", html)
        logger.debug("Email text body skipped: %s", text)
        return

    payload: Dict[str, object] = {
        "from": _from_address(),
        "to": [to],
        "subject": subject,
        "html": html,
        "text": text,
    }

    if headers:
        payload["headers"] = headers

    try:
        resend.Emails.send(payload)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to send email via Resend: %s", exc)
        raise


def send_verification_email(*, email: str, verification_link: str) -> None:
    rendered = _render_template(
        "verification_email",
        verification_link=verification_link,
    )

    _send_email(
        email,
        subject=rendered.subject,
        html=rendered.html,
        text=rendered.text,
    )


def send_invite_email(*, email: str, invite_link: str, invited_by: Optional[str] = None) -> None:
    rendered = _render_template(
        "invite_email",
        invite_link=invite_link,
        invited_by=invited_by or "A teammate",
    )

    _send_email(
        email,
        subject=rendered.subject,
        html=rendered.html,
        text=rendered.text,
    )
