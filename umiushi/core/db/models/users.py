from flask import current_app

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import Base

from ..dictionarization import Dictionarizable


class User(Base, Dictionarizable):

    __tablename__ = 'user'

    _dictionarizable_attrs = ('login', 'name', 'avatar_url', 'workspaces')

    login = Column(String, primary_key=True, nullable=False)
    name = Column(String)
    access_token = Column(String)
    avatar_url = Column(String)

    workspaces = relationship('Workspace', backref='owner', passive_deletes=True)

    def __repr__(self):
        return '<User %r>' % (self.login)


class Workspace(Base, Dictionarizable):

    __tablename__ = 'workspace'

    _dictionarizable_attrs = ('id', 'name', 'language', 'owner')

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    language = Column(String)
    root_url = Column(String)

    owner_uid = Column(String, ForeignKey('user.login', ondelete='CASCADE'))

    def __repr__(self):
        return '<Workspace %s/%s>' % (self.owner.login, self.name)
