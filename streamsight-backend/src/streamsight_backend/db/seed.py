from sqlalchemy import select

from streamsight_backend.db.connection import get_database_manager
from streamsight_backend.db.schema import User
from streamsight_backend.services.auth import hash_password


def seed_initial_users() -> None:
    """Seed the database with three default users if the user table is empty.

    This function is idempotent: if there are already users present it does nothing.
    """
    db_manager = get_database_manager()
    session = db_manager.get_session()
    try:
        stmt = select(User)
        existing = session.execute(stmt).first()
        if existing:
            return

        users = [
            User(username="admin", email="admin@example.com", password=hash_password("admin")),
            User(username="alice", email="alice@example.com", password=hash_password("alice")),
            User(username="bob", email="bob@example.com", password=hash_password("bob")),
            User(username="carol", email="carol@example.com", password=hash_password("carol")),
        ]
        session.add_all(users)
        session.commit()
    finally:
        session.close()
