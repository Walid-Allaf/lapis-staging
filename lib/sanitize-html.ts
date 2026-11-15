import "server-only";
import sanitizeHtml from "sanitize-html";

const forbiddenContent = ["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "svg", "math", "link", "meta", "base", "template"];
const hasControls = /[\u0000-\u0020\u007f-\u009f]/;

function safeHref(value: string | undefined): string | undefined {
  if (!value || hasControls.test(value) || value.startsWith("//")) return undefined;
  try {
    const url = new URL(value, "https://relative.invalid");
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? value : undefined;
  } catch { return undefined; }
}

function safeImage(value: string | undefined): string | undefined {
  if (!value || hasControls.test(value) || value.startsWith("//")) return undefined;
  try {
    if (/^https:\/\//i.test(value)) return new URL(value).protocol === "https:" ? value : undefined;
    if (!/^\/?uploads\//.test(value) || !process.env.NEXT_PUBLIC_API_BASE_URL) return undefined;
    const base = new URL(process.env.NEXT_PUBLIC_API_BASE_URL);
    const url = new URL(`/${value.replace(/^\//, "")}`, base);
    return url.protocol === "https:" && url.origin === base.origin && url.pathname.startsWith("/uploads/") ? url.href : undefined;
  } catch { return undefined; }
}

export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: ["p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "del", "code", "pre", "blockquote", "ul", "ol", "li", "a", "span", "img"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    nonTextTags: forbiddenContent,
    transformTags: {
      a: (tagName, attributes) => {
        const attribs = { ...attributes };
        const href = safeHref(attribs.href);
        if (href) attribs.href = href; else delete attribs.href;
        if (attribs.target === "_blank") attribs.rel = "noopener noreferrer";
        else delete attribs.target;
        return { tagName, attribs };
      },
      img: (tagName, attributes) => {
        const attribs = { ...attributes };
        const src = safeImage(attribs.src);
        if (src) attribs.src = src; else delete attribs.src;
        for (const key of ["width", "height"]) if (attribs[key] && !/^\d{1,5}$/.test(attribs[key])) delete attribs[key];
        return { tagName, attribs };
      },
    },
    exclusiveFilter: frame => frame.tag === "img" && !frame.attribs.src,
  });
}
