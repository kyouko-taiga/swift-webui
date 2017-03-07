from flask import current_app

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import Base

from ..dictionarization import Dictionarizable


class User(Base, Dictionarizable):

    __tablename__ = 'user'

    _dictionarizable_attrs = ('login', 'avatar_url', 'repositories', 'name')

    login = Column(String, primary_key=True, nullable=False)
    access_token = Column(String)
    avatar_url = Column(String)
    name = Column(String)

    workspaces = relationship('Workspace', backref='owner', passive_deletes=True)

    def __repr__(self):
        return '<User %r>' % (self.login)


class Workspace(Base, Dictionarizable):

    __tablename__ = 'workspace'

    _dictionarizable_attrs = ('name', 'image', 'owner')

    name = Column(String, primary_key=True)
    image = Column(String)

    owner_uid = Column(String, ForeignKey('user.login', ondelete='CASCADE'))

    def __repr__(self):
        return '<Workspace %s/%s>' % (self.owner.name, self.name)
