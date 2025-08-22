"use client";

import { useParams, useRouter } from "next/navigation";
import { plugins, getPluginBySlug } from "@/lib/plugins";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";

export function VersionSelector() {
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const slug = params.slug as string[] | undefined;
  if (!slug || slug.length < 2) return null;
  
  const [pluginSlug, currentVersion, docType] = slug;
  const plugin = getPluginBySlug(pluginSlug);
  
  if (!plugin) return null;
  
  const handleVersionChange = (newVersion: string) => {
    const newPath = `/docs/${pluginSlug}/${newVersion}/${docType || 'readme'}`;
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
          {currentVersion}
          <ChevronDown 
            size={14} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 border border-fd-border rounded-lg bg-fd-card shadow-lg z-20">
            {plugin.versions.map((version) => (
              <button
                key={version.version}
                onClick={() => handleVersionChange(version.version)}
                className="w-full flex items-center justify-between p-2 text-sm hover:bg-fd-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <span>{version.version}</span>
                {version.version === currentVersion && (
                  <Check size={14} className="text-fd-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function PluginSidebar() {
  const params = useParams();
  const slug = params.slug as string[] | undefined;
  
  if (!slug || slug.length < 2) return null;
  
  const [pluginSlug, version, currentDoc] = slug;
  const plugin = getPluginBySlug(pluginSlug);
  
  if (!plugin) return null;
  
  const docs = [
    { key: 'readme', title: 'Overview', path: 'readme' },
    { key: 'documentation', title: 'Documentation', path: 'documentation' },
    { key: 'changelog', title: 'Changelog', path: 'changelog' },
  ];

  const filteredDocs = docs.filter((doc) => plugin.markdown_files.some((file) => file.name.toLowerCase() === `${doc.path}.md`));

  return (
    <div className="space-y-4">
      <VersionSelector />
      
      <div>
        <h3 className="text-sm font-medium mb-2 text-fd-muted-foreground">
          Documentation
        </h3>
        <nav className="space-y-1">
          {filteredDocs.map((doc) => (
            <a
              key={doc.key}
              href={`/docs/${pluginSlug}/${version}/${doc.path}`}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                currentDoc === doc.path
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'hover:bg-fd-accent text-fd-muted-foreground hover:text-fd-foreground'
              }`}
            >
              {doc.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
