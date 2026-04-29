-- Run this once in your Neon SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  homepage_url  TEXT        NOT NULL,
  secret_code   TEXT        NOT NULL,
  tov           TEXT        NOT NULL DEFAULT '',
  daily_limit   INTEGER     NOT NULL DEFAULT 3,
  monthly_limit INTEGER     NOT NULL DEFAULT 10,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS history (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  h1            TEXT        NOT NULL,
  occhiello     TEXT        NOT NULL,
  precise_title TEXT        NOT NULL,
  bold_title    TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage (
  project_id    UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  day           DATE        NOT NULL DEFAULT CURRENT_DATE,
  count         INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, day)
);

CREATE INDEX IF NOT EXISTS history_project_created ON history(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_project_day ON usage(project_id, day);
