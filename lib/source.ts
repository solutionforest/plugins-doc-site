import { loader } from "fumadocs-core/source";
import * as path from "node:path";
import { createGitHubSource } from "./sources/github";
import { createLocalSource } from "./sources/local";

const FileNameRegex = /^\d\d-(.+)$/;

export const isLocal =
  process.env.NEXT_DOC_SOURCE === 'local'; // || process.env.NEXT_PHASE === "phase-production-build";

export const source = loader({
  baseUrl: "/docs",
  // source: await createLocalSource(),
  // source: await createGitHubSource(),
  source: isLocal ? await createLocalSource() : await createGitHubSource(),
  slugs(info) {
    try {
      const segments = info.path
        .split("/")
        .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")));

      if (segments.at(-1) === "index") {
        segments.pop();
      }
      // console.debug("Generating slugs for:", info.path, "->", segments);

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

  title = removeLeadingNumber(title);

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


/**
 * Remove leading number and slash from file path
 * e.g. 1-foo/bar.md -> foo/bar.md
 */
export function removeLeadingNumber(file: string): string {

  // If the file have number prefix, remove it
  // e.g. 01-introduction.md -> introduction
  if (file.match(/^\d-/)) {
    file = file.replace(/^\d-/, "");
  }

  return file;
}