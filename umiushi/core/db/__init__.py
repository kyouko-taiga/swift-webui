from sqlalchemy.orm import scoped_session, create_session

from flask import current_app


db_session = scoped_session(
    lambda: create_session(bind=current_app.db_engine, autocommit=False, autoflush=False))
