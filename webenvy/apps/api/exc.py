from webenvy.core.exc import WebenvyError


class ApiError(WebenvyError):

    def __init__(self, message=''):
        self.message = message

    def __str__(self):
        return self.message

    def __repr__(self):
        return '<%s %i>' % (self.__class__.__name__)
