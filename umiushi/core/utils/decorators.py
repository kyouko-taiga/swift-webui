
def copydoc(source_function, sep='\n'):
    """
    A decorator that copies the docstring from another function.

    This decorator prepends the docstring of ``source_function`` and prepends
    it to the decorated function. It is still possible to add extra docstring
    to the decorated funcion, which will be added after the copied docstring.

    :param source_function:
        The function from which copy the docstring.
    :param sep:
        The separator to use between the copied docstring and the extra
        docstring of the decorated function.
    """
    def decorate(fn):
        source_doc = source_function.__doc__
        if fn.__doc__ is None:
            fn.__doc__ = source_doc
        else:
            fn.__doc__ = sep.join([source_doc, fn.__doc__])
        return fn
    return decorate


class classproperty(object):
    """A decorator that converts a method into a read-only class property."""

    def __init__(self, getter):
        self.getter = getter

    def __get__(self, instance, owner):
        return self.getter(owner)


class cached_property(object):
    """
    A decorator that transforms a method into a cached property.

    A cached property is computed only once, in a lazy fashion. The first time
    one accesses the property, the decorated method is being called, while
    subsequent calls result in the cached value to be returned.
    """

    # This class is heavily inspired by the werkzeug.utils.cached_property
    # decorator. See http://werkzeug.pocoo.org/docs/0.9/utils/ for more
    # information on the implementation details and implications.

    def __init__(self, fn, name=None):
        """
        :param fn:
            A callable that accepts a reference on the instance owning the
            attribute as a single arguments, and returns the value of the
            wrapped attribute.
        :param name:
            The name by which the attribute to be overridden. If left empty,
            this parameter will default to `fn.__name__`.
        """
        self.__name__ = name or fn.__name__
        self.__module__ = fn.__module__
        self.__doc__ = fn.__doc__
        self.fn = fn

    _missing = object

    def __get__(self, instance, type=None):
        if instance is None:
            return self
        value = instance.__dict__.get(self.__name__, self._missing)
        if value is self._missing:
            value = self.fn(instance)
            instance.__dict__[self.__name__] = value
        return value
