import { Callout } from "fumadocs-ui/components/callout";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Check, LandPlot, X } from "lucide-react";
import {
  Fragment,
  type ReactNode,
  type ReactElement,
  isValidElement,
} from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { MDXComponents } from "mdx/types";
import { siteConfig } from "@/lib/site-config";
import { RepositoryConfig, VersionConfig } from "@/lib/repo-config";

const githubCalloutRegex =
  /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/s;

// Helper function to extract text content from React children
function extractTextContent(children: any): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return children.toString();
  }
  if (children === null || children === undefined) {
    return "";
  }
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join("");
  }
  if (isValidElement(children)) {
    const props = children.props as any;
    if (props && typeof props === "object" && "children" in props) {
      return extractTextContent(props.children);
    }
  }
  return "";
}

// Helper function to parse GitHub callout from text content
function parseGitHubCallout(textContent: string) {
  const calloutMatch = textContent.match(githubCalloutRegex);

  if (!calloutMatch) {
    return null;
  }

  const calloutType = calloutMatch[1].toLowerCase();
  const contentAfterCallout = calloutMatch[2]?.trim() || "";

  // Convert to title case with colon
  const titleCaseType =
    calloutType.charAt(0).toUpperCase() + calloutType.slice(1).toLowerCase();

  // Map GitHub callout types to component types
  let type: "info" | "warn" | "error" = "info";
  let calloutTitle = `${titleCaseType}:`;

  switch (calloutType) {
    case "note":
    case "tip":
    case "important":
      type = "info";
      break;
    case "warning":
    case "caution":
      type = "warn";
      break;
    default:
      type = "info";
  }

  return {
    type,
    title: calloutTitle,
    content: contentAfterCallout,
  };
}

const mdxComponents = {
  ...defaultMdxComponents,
  // blockquote: Callout,
  blockquote: ({ children }: { children: ReactNode }) => {
    let type: "info" | "warn" | "error" = "info";
    let calloutContent = children;
    let calloutTitle: string | null = null;

    try {
      if (Array.isArray(children)) {
        // Find the first paragraph element
        const firstChild = children.find(
          (child) => isValidElement(child) && child.type === "p",
        );

        if (firstChild && firstChild.props.children) {
          // Extract text content using helper function
          const textContent = extractTextContent(firstChild.props.children);

          // Parse GitHub callout format
          const calloutData = parseGitHubCallout(textContent);

          if (calloutData) {
            type = calloutData.type;
            calloutTitle = calloutData.title;

            if (calloutData.content) {
              // Create new content with only the content after callout syntax
              calloutContent = [
                {
                  ...firstChild,
                  props: {
                    ...firstChild.props,
                    children: calloutData.content,
                  },
                },
                // ...children.slice(1)
              ];
            } else {
              // Remove the first paragraph if it only contained callout syntax
              calloutContent = children.slice(1);
            }
          }
        }
      }
    } catch (e) {
      console.warn("### MDX Blockquote parse error:", e);
    }

    return (
      <Callout type={type} title={calloutTitle}>
        {calloutContent}
      </Callout>
    );
  },
  Tabs,
  Tab,
  Check,
  Cross: X,
  img: (props: any) => {
    // Skip using ImageZoom for SVG, data URLs, img.shields.io, and if no src
    if (
      !props.src ||
      props.src.endsWith(".svg") ||
      props.src.startsWith("data:") ||
      props.src.includes("img.shields.io")
    ) {
      return <img {...props} />;
    }

    const defaultHeight = 300;
    const defaultWidth = 700;

    const width = props.width
      ? typeof props.width === "number"
        ? props.width
        : parseInt(props.width) || defaultWidth
      : defaultWidth;
    const height = props.height
      ? typeof props.height === "number"
        ? props.height
        : parseInt(props.height) || defaultHeight
      : defaultHeight;

    return (
      <div className="not-prose my-6 rounded-xl p-1 bg-gradient-to-br from-white/10 to-black/10 border shadow-lg">
        <ImageZoom
          src={props.src}
          height={height}
          width={width}
          loading="lazy"
          {...props}
          className="rounded-lg"
        />
      </div>
    );
  },
  pre: ({ ...props }) => {
    try {
      const children = props.children as ReactElement;
      let codeLang = "plaintext";
      const childProps = children.props as any;
      if (childProps?.className) {
        const match = childProps.className.match(/language-(\w+)/);
        if (match) {
          // eslint-disable-next-line prefer-destructuring
          codeLang = match[1];
        }
      }
      return (
        <DynamicCodeBlock
          lang={codeLang}
          code={childProps?.children?.trim() || ""}
          {...childProps}
        />
      );
    } catch (e) {
      return (
        <CodeBlock {...props}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      );
    }
  },
};

export function createMdxComponents(components?: MDXComponents) {
  return {
    ...mdxComponents,
    ...components,
    // PagesOnly: ({ children }: { children: ReactNode }) =>
    //   <Fragment>{children}</Fragment>,
  };
}

export function createRelativeLink(
  repository: RepositoryConfig,
  version: VersionConfig,
  href: string,
) {
  // Skip link creation for external URLs
  if (href.startsWith("http") || href.startsWith("https")) {
    // console.debug("### Skipping relative link creation for external URL:", href);
    return href;
  }

  // Skip link creation for mailto:, #, and other protocols
  if (href.startsWith("mailto:") || href.startsWith("#")) {
    // console.debug("### Skipping relative link creation for:", href);
    return href;
  }

  // const extractPaths = href.split('/').map((part) => getFileSlug(part)) || [];
  // const existPage = null;//source.getPage([repository.repo, version.version, ...extractPaths]);
  // if (existPage) {
  //   //return existPage.url;
  // }

  let repositoryUrl = `${repository.repository_url}/blob/${version.github_branch || version.version}/${href}`;
  // console.debug("### Creating relative link for:", href, repositoryUrl);

  return repositoryUrl;
}
