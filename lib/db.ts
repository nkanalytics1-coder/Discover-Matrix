import { neon } from "@neondatabase/serverless";
import type { Project, HistoryRow, UsageStats, ProjectWithUsage } from "./types";

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  return neon(process.env.DATABASE_URL);
}

// ── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const db = getDb();
  const rows = await db`SELECT * FROM projects ORDER BY created_at DESC`;
  return rows as unknown as Project[];
}

export async function getProjectsWithUsage(): Promise<ProjectWithUsage[]> {
  const db = getDb();
  const rows = await db`
    SELECT p.*,
      COALESCE(SUM(CASE WHEN u.day = CURRENT_DATE THEN u.count ELSE 0 END), 0)::int AS today_usage,
      COALESCE(SUM(CASE WHEN u.day >= DATE_TRUNC('month', CURRENT_DATE) THEN u.count ELSE 0 END), 0)::int AS month_usage
    FROM projects p
    LEFT JOIN usage u ON u.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  return rows as unknown as ProjectWithUsage[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const db = getDb();
  const rows = await db`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as unknown as Project) ?? null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = getDb();
  const rows = await db`SELECT * FROM projects WHERE id = ${id} LIMIT 1`;
  return (rows[0] as unknown as Project) ?? null;
}

export async function createProject(data: {
  name: string; slug: string; homepage_url: string; secret_code: string; tov: string;
}): Promise<Project> {
  const db = getDb();
  const rows = await db`
    INSERT INTO projects (name, slug, homepage_url, secret_code, tov)
    VALUES (${data.name}, ${data.slug}, ${data.homepage_url}, ${data.secret_code}, ${data.tov})
    RETURNING *
  `;
  return rows[0] as unknown as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const db = getDb();
  await db`DELETE FROM projects WHERE id = ${id}`;
}

export async function updateProjectLimits(id: string, daily: number, monthly: number): Promise<void> {
  const db = getDb();
  await db`UPDATE projects SET daily_limit = ${daily}, monthly_limit = ${monthly} WHERE id = ${id}`;
}

// ── Usage & rate limiting ───────────────────────────────────────────────────

export async function getUsageStats(projectId: string): Promise<UsageStats> {
  const db = getDb();
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Project not found");
  const rows = await db`
    SELECT
      COALESCE(SUM(CASE WHEN day = CURRENT_DATE THEN count ELSE 0 END), 0)::int AS today,
      COALESCE(SUM(CASE WHEN day >= DATE_TRUNC('month', CURRENT_DATE) THEN count ELSE 0 END), 0)::int AS month
    FROM usage WHERE project_id = ${projectId}
  `;
  const row = rows[0] as unknown as { today: number; month: number };
  return { today: Number(row.today), month: Number(row.month), daily_limit: project.daily_limit, monthly_limit: project.monthly_limit };
}

export async function checkAndIncrementUsage(projectId: string): Promise<UsageStats> {
  const stats = await getUsageStats(projectId);
  if (stats.today >= stats.daily_limit) throw new RateLimitError("Limite giornaliero raggiunto", stats);
  if (stats.month >= stats.monthly_limit) throw new RateLimitError("Limite mensile raggiunto", stats);
  const db = getDb();
  await db`
    INSERT INTO usage (project_id, day, count) VALUES (${projectId}, CURRENT_DATE, 1)
    ON CONFLICT (project_id, day) DO UPDATE SET count = usage.count + 1
  `;
  return { ...stats, today: stats.today + 1, month: stats.month + 1 };
}

export class RateLimitError extends Error {
  stats: UsageStats;
  constructor(message: string, stats: UsageStats) {
    super(message);
    this.name = "RateLimitError";
    this.stats = stats;
  }
}

// ── History ─────────────────────────────────────────────────────────────────

export async function saveHistory(data: {
  project_id: string; h1: string; occhiello: string; precise_title: string; bold_title: string;
}): Promise<void> {
  const db = getDb();
  await db`
    INSERT INTO history (project_id, h1, occhiello, precise_title, bold_title)
    VALUES (${data.project_id}, ${data.h1}, ${data.occhiello}, ${data.precise_title}, ${data.bold_title})
  `;
}

export async function getHistory(projectId: string, limit = 50): Promise<HistoryRow[]> {
  const db = getDb();
  const rows = await db`
    SELECT * FROM history WHERE project_id = ${projectId}
    ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as unknown as HistoryRow[];
}
