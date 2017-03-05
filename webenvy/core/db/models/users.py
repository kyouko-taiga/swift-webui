from flask import current_app

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from .base import Base

from ..dictionarization import Dictionarizable


class User(Base, Dictionarizable):

    __tablename__ = 'user'

    _dictionarizable_attrs = ('login', 'avatar_url', 'repositories')

    login = Column(String, primary_key=True, nullable=False)
    home = Column(String, nullable=False)
    access_token = Column(String)
    avatar_url = Column(String)

    repositores = relationship('Repository', backref='owner', passive_deletes=True)

    def __repr__(self):
        return '<User %r>' % (self.login)
