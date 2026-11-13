import Fastify from "fastify";
import cors from "@fastify/cors";
import { randomUUID } from "node:crypto";
import { scrape } from "@wr/scraper";
import { structure } from "@wr/extractor";
import { rehost } from "@wr/assets";
import { emit, type ProjectFiles } from "@wr/assembler";
import { zipProject } from "@wr/exporter";
import type { AssetMap, SiteContent } from "@wr/schema";
import { renderPreviewHtml } from "./renderPreview.js";

type Job = {
  id: string;
  status: "pending" | "scraping" | "extracting" | "assets" | "assembling" | "done" | "error";
  content?: SiteContent;
  assets?: AssetMap;
  files?: ProjectFiles;
  error?: string;
};

const jobs = new Map<string, Job>();

async function run(job: Job, url: string, log: (msg: string, extra?: unknown) => void) {
  try {
    log(`[${job.id}] scraping ${url}`);
    job.status = "scraping";
    const raw = await scrape(url);

    log(`[${job.id}] extracting`);
    job.status = "extracting";
    job.content = await structure(raw);

    log(`[${job.id}] rehosting assets`);
    job.status = "assets";
    job.assets = await rehost(raw);

    log(`[${job.id}] assembling project`);
    job.status = "assembling";
    job.files = await emit(job.content, job.assets);

    job.status = "done";
    log(`[${job.id}] done`);
  } catch (e) {
    job.status = "error";
    job.error = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    log(`[${job.id}] FAILED at ${job.status}: ${job.error}`);
  }
}

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.post<{ Body: { url: string } }>("/generate", async (req) => {
  const { url } = req.body;
  if (!url) throw new Error("url required");
  const job: Job = { id: randomUUID(), status: "pending" };
  jobs.set(job.id, job);
  void run(job, url, (msg, extra) => app.log.info(extra ?? {}, msg));
  return { jobId: job.id };
});

app.get<{ Params: { id: string } }>("/jobs/:id", async (req, reply) => {
  const job = jobs.get(req.params.id);
  if (!job) return reply.code(404).send({ error: "not found" });
  return { id: job.id, status: job.status, error: job.error };
});

app.get<{ Params: { id: string } }>("/rendered/:id", async (req, reply) => {
  const job = jobs.get(req.params.id);
  if (!job) return reply.code(404).send({ error: "not found" });
  if (!job.content || !job.assets) return reply.code(409).send({ status: job.status });
  const html = renderPreviewHtml(job.content, job.assets);
  reply.header("content-type", "text/html; charset=utf-8");
  return html;
});

app.get<{ Params: { id: string } }>("/export/:id", async (req, reply) => {
  const job = jobs.get(req.params.id);
  if (!job || !job.files) return reply.code(404).send({ error: "not found" });
  const buf = await zipProject(job.files);
  reply
    .header("content-type", "application/zip")
    .header("content-disposition", `attachment; filename="landing-${job.id}.zip"`);
  return buf;
});

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
