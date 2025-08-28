import { loader } from "fumadocs-core/source";
import * as path from "node:path";
import { createGitHubSource } from "./sources/github";
import { createLocalSource } from "./sources/local";

const FileNameRegex = /^\d\d-(.+)$/;

// export const isLocal =
//   process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build";
//   // process.env.ENV === "local" || process.env.NEXT_PHASE === "phase-production-build";
export const isLocal =
  process.env.LOCAL || process.env.NEXT_PHASE === "phase-production-build";

export const source = loader({
  baseUrl: "/docs",
  // source: await createLocalSource(),
  source: await createGitHubSource(),
  // source: isLocal ? await createLocalSource() : await createGitHubSource(),
  slugs(info) {
    try {
      const segments = info.path
        .split("/")
        .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")))
        .map((seg) => {
          const res = FileNameRegex.exec(seg);

          return res ? res[1] : seg;
        });

      if (segments.at(-1) === "index") {
        segments.pop();
      }

      return segments;
    } catch (error) {
      return [];
    }
  },
});

export function getTitleFromFile(file: string) {
  const acronyms = ["css", "ui", "cli"];
  const connectives = ["and"];
  const parsed = path.parse(file);
  const name =
    parsed.name === "index" ? path.basename(parsed.dir) : parsed.name;

  const match = FileNameRegex.exec(name);
  let title = match ? match[1] : name;

  // If the file have number prefix, remove it
  // e.g. 01-introduction.md -> introduction
  if (title.match(/^\d-/)) {
    title = title.replace(/^\d-/, "");
  }

  const segs = title.split("-");
  for (let i = 0; i < segs.length; i++) {
    if (acronyms.includes(segs[i])) {
      segs[i] = segs[i].toUpperCase();
    } else if (!connectives.includes(segs[i])) {
      segs[i] = segs[i].slice(0, 1).toUpperCase() + segs[i].slice(1);
    }
  }

  const out = segs.join(" ");
  return out.length > 0 ? out : "Overview";
}
