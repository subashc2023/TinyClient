import re
import sys
import types
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

if "resend" not in sys.modules:
    resend_stub = types.SimpleNamespace(Emails=types.SimpleNamespace(send=lambda *_args, **_kwargs: None))
    sys.modules["resend"] = resend_stub

from app.services import email


def test_templates_loaded() -> None:
    assert "verification_email" in email.TEMPLATES
    assert "invite_email" in email.TEMPLATES


def test_render_verification_email_replaces_placeholders() -> None:
    content = email._render_template(  # type: ignore[attr-defined]
        "verification_email",
        verification_link="https://tinyclient.app/verify?token=abc",
    )

    assert "https://tinyclient.app/verify?token=abc" in content.html
    assert "https://tinyclient.app/verify?token=abc" in content.text
    assert "{{" not in content.html
    assert "{{" not in content.text


def test_render_invite_email_requires_all_placeholders() -> None:
    with pytest.raises(ValueError, match=re.escape("['invited_by']")):
        email._render_template(  # type: ignore[attr-defined]
            "invite_email",
            invite_link="https://tinyclient.app/invite?token=abc",
        )


def test_render_invite_email_includes_invited_by() -> None:
    content = email._render_template(  # type: ignore[attr-defined]
        "invite_email",
        invite_link="https://tinyclient.app/invite?token=abc",
        invited_by="Taylor",
    )

    assert "Taylor" in content.html
    assert "Taylor" in content.text
    assert "{{" not in content.html
    assert "{{" not in content.text
