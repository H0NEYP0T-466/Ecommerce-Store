import re
import unicodedata
from datetime import datetime


def generate_slug(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    # Convert to lowercase
    text = text.lower()
    # Replace non-alphanumeric with hyphens
    text = re.sub(r"[^a-z0-9]+", "-", text)
    # Remove leading/trailing hyphens
    text = text.strip("-")
    # Collapse multiple hyphens
    text = re.sub(r"-+", "-", text)
    return text


def format_pkr(amount: float) -> str:
    """Format amount as Pakistani Rupees."""
    return f"Rs. {amount:,.0f}"


def format_date(dt: datetime) -> str:
    """Format datetime as DD MMM YYYY."""
    return dt.strftime("%d %b %Y")


def format_datetime(dt: datetime) -> str:
    """Format datetime as DD MMM YYYY hh:mm AM/PM."""
    return dt.strftime("%d %b %Y %I:%M %p")
