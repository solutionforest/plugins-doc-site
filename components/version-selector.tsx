"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import type { RepositoryConfig, VersionConfig } from "@/lib/repo-config";
import { getRepositoryBySlug, getVersionBySlug } from "@/lib/repo-config";

interface VersionSelectorProps {
  repository: RepositoryConfig;
  currentVersion: VersionConfig;
  baseUrl: string;
}

export function VersionSelector({
  repository,
  currentVersion,
  baseUrl,
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleVersionChange = (version: VersionConfig) => {
    const newUrl = baseUrl.replace(currentVersion.version, version.version);
    router.push(newUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-fd-border rounded-md hover:bg-fd-muted transition-colors"
      >
        <span>v{currentVersion.version}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-1 min-w-[120px] bg-fd-background border border-fd-border rounded-md shadow-lg z-50">
            <div className="py-1">
              {repository.versions.map((version) => (
                <button
                  key={version.version}
                  onClick={() => handleVersionChange(version)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-fd-muted transition-colors"
                >
                  <span>v{version.version}</span>
                  {currentVersion.version === version.version && (
                    <Check size={14} className="text-fd-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function VersionSelectorSidebar() {
  const params = useParams();
  const slugs = params.slug as string[] | undefined;
  if (!slugs || slugs.length < 2) return null;

  const [repoSlug, versionSlug] = slugs;

  const repository = getRepositoryBySlug(repoSlug);
  if (!repository) return null;

  const currentVersion =
    getVersionBySlug(repository, versionSlug) ??
    getVersionBySlug(repository, repository.latest_version);
  if (!currentVersion) return null;

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleVersionChange = (version: string) => {
    const newPath = `/docs/${repoSlug}/${version}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      <div className="flex items-center justify-between p-2 border border-fd-border rounded-lg bg-fd-card">
        <span className="text-sm font-medium">Version</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm hover:text-fd-primary transition-colors"
        >
          {currentVersion.version}
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-1 w-full bg-fd-background border border-fd-border rounded-lg shadow-lg z-50">
            <div className="py-1">
              {repository.versions.map((version) => (
                <button
                  key={version.version}
                  onClick={() => handleVersionChange(version.version)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-fd-muted transition-colors"
                >
                  <span>{version.version}</span>
                  {currentVersion.version === version.version && (
                    <Check size={14} className="text-fd-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
