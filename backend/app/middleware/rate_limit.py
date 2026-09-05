from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limits
AUTH_RATE_LIMIT = "5/minute"
DEFAULT_RATE_LIMIT = "30/minute"
