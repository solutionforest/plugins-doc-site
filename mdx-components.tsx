import { Callout } from "fumadocs-ui/components/callout";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Check, X } from "lucide-react";
import {
  Fragment,
  type ReactNode,
  type ReactElement,
  isValidElement,
} from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { MDXComponents } from "mdx/types";
import { cn } from "./lib/utils";

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
  // blockquote: ({ children }: { children: ReactNode }) => {
  //   let type: "info" | "warn" | "error" = "info";
  //   let calloutContent = children;
  //   let calloutTitle: string | null = null;

  //   try {
  //     if (Array.isArray(children)) {
  //       // Find the first paragraph element
  //       const firstChild = children.find(
  //         (child) => isValidElement(child) && child.type === "p",
  //       );

  //       if (firstChild && firstChild.props.children) {
  //         // Extract text content using helper function
  //         const textContent = extractTextContent(firstChild.props.children);

  //         // Parse GitHub callout format
  //         const calloutData = parseGitHubCallout(textContent);

  //         if (calloutData) {
  //           type = calloutData.type;
  //           calloutTitle = calloutData.title;

  //           if (calloutData.content) {
  //             // Create new content with only the content after callout syntax
  //             calloutContent = [
  //               {
  //                 ...firstChild,
  //                 props: {
  //                   ...firstChild.props,
  //                   children: calloutData.content,
  //                 },
  //               },
  //               // ...children.slice(1)
  //             ];
  //           } else {
  //             // Remove the first paragraph if it only contained callout syntax
  //             calloutContent = children.slice(1);
  //           }
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.warn("### MDX Blockquote parse error:", e);
  //   }

  //   return (
  //     <Callout type={type} title={calloutTitle}>
  //       {calloutContent}
  //     </Callout>
  //   );
  // },
  Tabs,
  Tab,
  Check,
  Cross: X,
  img: (props: any) => {
    // Resolve src if it's an object (static import)
    const src = typeof props.src === 'object' && props.src !== null && 'src' in props.src ? props.src.src : props.src;

    // Skip using ImageZoom for SVG, data URLs, img.shields.io, and if no src
    if (
      !src ||
      (typeof src === 'string' && (
        src.endsWith(".svg") ||
        src.startsWith("data:") ||
        src.includes("img.shields.io")
      ))
    ) {
      // If props.src is an object (static import), pass it to next/image, otherwise standard img
      if (typeof props.src === 'object') {
         // We can't use standard <img> for object src, 
         // but if we are skipping ImageZoom, we likely want raw <img> behavior?
         // Actually, if it's an object, it's likely a standard image format (png/jpg) 
         // that we might want to Zoom, unless explicit opt-out?
         // But if we are here, strict check failed.
         // Wait, if it's an object, src.endsWith('.svg') is false (since src is contents).
         // So we proceed to ImageZoom below.
      } else {
         return <img {...props} />;
      }
    }
    
    // If it's a static import (object), we proceed to use ImageZoom.
    // ImageZoom from fumadocs-ui handles static imports?
    // Let's assume yes. Or fallback to Next.js Image.
    
    // ...
    // Wait, the original code had:
    /*
    if (
      !props.src ||
      props.src.endsWith(".svg") || ...
    ) { return <img ... /> }
    */
    
    // With my new check:
    /*
    const src = ...
    if (!src || (typeof src === 'string' && (...))) {
       return <img {...props} />;
    }
    */
    
    // If props.src is object: src is string (url).
    // If url ends with .svg, we enter block.
    // <img src={object} /> is INVALID in HTML.
    // <img src={object.src} /> is valid.
    
    // So distinct handling is needed.
    
    if (
       !src ||
       (typeof src === 'string' && (
         src.endsWith(".svg") ||
         src.startsWith("data:") ||
         src.includes("img.shields.io")
       ))
     ) {
        if (typeof props.src === 'object') {
            return <img {...props} src={src} />;
        }
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

    // Prepend NEXT_PUBLIC_BASE_PATH for local public images (src starts with /).
    // Next.js does NOT automatically prepend basePath to plain <img> or ImageZoom src strings —
    // only its own <Image> component gets that treatment. Since fetch-docs writes
    // <img src="/filaletter/..." /> with absolute paths, we must add the prefix here.
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    let url: string =
      typeof src === "string" && src.startsWith("/") && !src.startsWith("//")
        ? basePath + src
        : (src as string);

    return (
      <ImageZoom
        src={url}
        alt={props.alt || ""}
        height={height}
        width={width}
        loading="lazy"
        className="rounded-lg"
      />
    );
  },
  // pre: ({ ...props }) => {
  //   try {
  //     const children = props.children as ReactElement;
  //     let codeLang = "plaintext";
  //     const childProps = children.props as any;
  //     if (childProps?.className) {
  //       const match = childProps.className.match(/language-(\w+)/);
  //       if (match) {
  //         // eslint-disable-next-line prefer-destructuring
  //         codeLang = match[1];
  //       }
  //     }
  //     return (
  //       <DynamicCodeBlock
  //         lang={codeLang}
  //         code={childProps?.children?.trim() || ""}
  //         {...childProps}
  //       />
  //     );
  //   } catch (e) {
  //     return (
  //       <CodeBlock {...props}>
  //         <Pre>{props.children}</Pre>
  //       </CodeBlock>
  //     );
  //   }
  // },
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
    // PagesOnly: ({ children }: { children: ReactNode }) =>
    //   <Fragment>{children}</Fragment>,
  };
}
