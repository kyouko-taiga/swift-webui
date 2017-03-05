from flask import current_app

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import Base

from ..dictionarization import Dictionarizable


class Repository(Base, Dictionarizable):

    __tablename__ = 'repository'

    _dictionarizable_attrs = ('name', 'language', 'clone_url', 'owner')

    name = Column(String, primary_key=True)
    language = Column(String)
    clone_url = Column(String, nullable=False)

    owner_uid = Column(String, ForeignKey('user.login', ondelete='CASCADE'))

    def __repr__(self):
        return '<Repository %s/%s>' % (self.owner.name, self.name)
