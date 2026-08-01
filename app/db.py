"""Пул подключений к PostgreSQL и схема базы."""
import os
import asyncpg

SCHEMA = """
CREATE TABLE IF NOT EXISTS services(
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  price      INT  NOT NULL DEFAULT 0,
  traffic    TEXT NOT NULL DEFAULT 'Безлимит',
  devices    TEXT NOT NULL DEFAULT '—',
  protocols  TEXT[] NOT NULL DEFAULT '{}',
  whitelist  TEXT NOT NULL DEFAULT 'mid' CHECK (whitelist IN ('ok','mid','no')),
  trial      BOOL NOT NULL DEFAULT FALSE,
  visible    BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes(
  id         SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status     TEXT NOT NULL CHECK (status IN ('ok','mid','no')),
  operator   TEXT NOT NULL DEFAULT 'Другой',
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, ip_hash)
);

CREATE TABLE IF NOT EXISTS reviews(
  id         SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  author     TEXT NOT NULL DEFAULT 'Аноним',
  operator   TEXT NOT NULL DEFAULT 'Другой',
  stars      INT CHECK (stars BETWEEN 1 AND 5),
  text       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id, status);

CREATE TABLE IF NOT EXISTS submissions(
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  link       TEXT NOT NULL,
  price      TEXT NOT NULL DEFAULT '',
  protocols  TEXT NOT NULL DEFAULT '',
  comment    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_hash    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

_pool: asyncpg.Pool | None = None


async def init_pool() -> None:
    """Создаёт пул и таблицы. Вызывается один раз при старте приложения."""
    global _pool
    dsn = os.environ.get("DATABASE_URL", "")
    if not dsn:
        raise RuntimeError("Переменная DATABASE_URL не задана")
    # Railway иногда отдаёт postgres:// — asyncpg хочет postgresql://
    if dsn.startswith("postgres://"):
        dsn = "postgresql://" + dsn[len("postgres://"):]
    _pool = await asyncpg.create_pool(dsn, min_size=1, max_size=5)
    async with _pool.acquire() as conn:
        await conn.execute(SCHEMA)


async def close_pool() -> None:
    if _pool is not None:
        await _pool.close()


def pool() -> asyncpg.Pool:
    assert _pool is not None, "Пул ещё не инициализирован"
    return _pool
