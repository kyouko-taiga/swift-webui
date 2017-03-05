
class WebenvyError(Exception):
    """Generic error class."""


class AuthenticationError(WebenvyError):
    """Raised when an error related to authentication occured."""


class InvalidTokenError(AuthenticationError):
    """Raised when an invalid authentication token was given."""
