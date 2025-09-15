import { DocsTitle, DocsDescription } from "fumadocs-ui/page";
import {
  getRepositoryDisplayName,
  type RepositoryConfig,
} from "@/lib/repo-config";
import Link from "next/link";
import { Github } from "lucide-react";

export function DocPageHeading({
  repository,
  includeDocsDescription = true,
}: {
  repository: RepositoryConfig;
  includeDocsDescription?: boolean;
}) {
  return (
    <>
      <DocsTitle>
        <div className="flex items-center gap-4">
          {includeDocsDescription && (
            <span>{getRepositoryDisplayName(repository)}</span>
          )}
          <div className="ml-auto flex gap-2">
            {!repository.is_private && repository.repository_url && (
              <Link
                href={repository.repository_url}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-fd-muted-foreground hover:text-fd-primary transition-colors"
              >
                <Github size={16} />
                Repository
              </Link>
            )}
          </div>
        </div>
      </DocsTitle>
      {repository.description && includeDocsDescription && (
        <DocsDescription>{repository.description}</DocsDescription>
      )}
    </>
  );
}