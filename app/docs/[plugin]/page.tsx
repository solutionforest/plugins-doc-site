import { generatePageMeta } from "@/lib/meta";
import {
  DocsPage,
  DocsBody,
} from "fumadocs-ui/page";
import { 
  getRepositoryBySlug,
  getRepositoryDisplayName,
  repositories,
} from "@/lib/repo-config";
import { notFound } from "next/navigation";
import { DocPageHeading } from "../components";
import { Cards, Card } from 'fumadocs-ui/components/card';
import { Star } from "lucide-react";

type Props = {
  params: Promise<{ plugin: string }>;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const repoSlug = params.plugin;

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
    notFound();
  }
  
  return (
    <DocsPage>
      <DocPageHeading repository={repository} />
      <DocsBody>
        <Cards>
          {repository.versions?.map((version) => (
            <Card
              key={version.version}
              href={`/docs/${repoSlug}/${version.version}`}
              title={version.version}
              icon={version.version === repository.latest_version ? <Star size={16} /> : null}
              className="flex items-center gap-2"
            />
          ))}
        </Cards>
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const repoSlug = resolvedParams.plugin;

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) {
      return generatePageMeta(
        "Repository Not Found",
      );
  }

  return generatePageMeta(
    `${getRepositoryDisplayName(repository)} - Documentation`,
    `Documentation for ${repository.owner}/${repository.repo}`
  );
}

export async function generateStaticParams() {

  // Generate params for all repository and version combinations
  const params: { plugin: string }[] = [];

  for (const repository of repositories) {
    params.push({ plugin: repository.repo });
  }

  return params;
}