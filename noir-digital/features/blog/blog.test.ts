import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseInline, parseMarkdown, slugifyHeading } from "@/features/blog/markdown";
import { formatBlogDate } from "@/features/blog/post-types";
import { createBlogPost, getAllBlogPosts, sortBlogPosts } from "@/features/blog/posts";

const HEADER = [
  "---",
  "title: Um título: com dois pontos",
  "description: Resumo do artigo.",
  "date: 2026-11-16",
  "image: /blog/capa.webp",
  "imageAlt: Descrição da capa",
  "category: Sites",
  "---",
  "",
].join("\n");

describe("blog markdown", () => {
  it("reads the header and the supported blocks", () => {
    const { blocks, frontmatter } = parseMarkdown(
      `${HEADER}Primeiro parágrafo\nem duas linhas.\n\n## Seção Única\n\n- um\n- dois\n\n1. passo\n2. outro\n\n> Uma citação.\n\n### Detalhe`,
    );

    expect(frontmatter["title"]).toBe("Um título: com dois pontos");
    expect(blocks.map((block) => block.kind)).toEqual([
      "paragraph",
      "heading",
      "list",
      "list",
      "quote",
      "heading",
    ]);
    expect(blocks[0]).toEqual({
      kind: "paragraph",
      content: ["Primeiro parágrafo em duas linhas."],
    });
    expect(blocks[1]).toEqual({
      kind: "heading",
      id: "secao-unica",
      level: 2,
      text: "Seção Única",
    });
    expect(blocks[2]).toMatchObject({ ordered: false, items: [["um"], ["dois"]] });
    expect(blocks[3]).toMatchObject({ ordered: true });
    expect(blocks[5]).toMatchObject({ level: 3 });
  });

  it("keeps Windows line endings and repeated headings apart", () => {
    const { blocks } = parseMarkdown("## Igual\r\n\r\nTexto.\r\n\r\n## Igual\r\n");

    expect(blocks.map((block) => (block.kind === "heading" ? block.id : block.kind))).toEqual([
      "igual",
      "paragraph",
      "igual-2",
    ]);
  });

  it("reads bold, italics and links", () => {
    expect(parseInline("Um **forte**, um *leve* e um [link](/contato).")).toEqual([
      "Um ",
      { kind: "strong", text: "forte" },
      ", um ",
      { kind: "emphasis", text: "leve" },
      " e um ",
      { kind: "link", href: "/contato", text: "link" },
      ".",
    ]);
  });

  it("never turns an unsafe address into a link", () => {
    expect(parseInline("[clique](javascript:alert(1))")).not.toContainEqual(
      expect.objectContaining({ kind: "link" }),
    );
    expect(parseInline("<script>alert(1)</script>")).toEqual(["<script>alert(1)</script>"]);
  });

  it("builds heading anchors without accents", () => {
    expect(slugifyHeading("O que não fazer?")).toBe("o-que-nao-fazer");
  });
});

describe("blog posts", () => {
  it("builds a post from its file", () => {
    const post = createBlogPost("meu-post", `${HEADER}${"palavra ".repeat(410)}`);

    expect(post).toMatchObject({
      category: "Sites",
      date: "2026-11-16",
      image: { alt: "Descrição da capa", src: "/blog/capa.webp" },
      readingMinutes: 2,
      slug: "meu-post",
      title: "Um título: com dois pontos",
    });
  });

  it("explains what is wrong with a post that cannot be published", () => {
    expect(() => createBlogPost("meu-post", "Sem cabeçalho.")).toThrow('missing "date"');
    expect(() => createBlogPost("Meu Post", HEADER)).toThrow("lowercase letters");
    expect(() =>
      createBlogPost("meu-post", HEADER.replace("/blog/capa.webp", "https://exemplo.com/a.png")),
    ).toThrow('"image" must look like');
    expect(() => createBlogPost("meu-post", HEADER.replace("2026-11-16", "16/11/2026"))).toThrow(
      '"date" must look like',
    );
  });

  it("lists the newest post first and formats dates the way the site does", () => {
    const sorted = sortBlogPosts([
      createBlogPost("antigo", HEADER.replace("2026-11-16", "2026-01-02")),
      createBlogPost("novo", HEADER),
    ]);

    expect(sorted.map((post) => post.slug)).toEqual(["novo", "antigo"]);
    expect(formatBlogDate("2026-11-16")).toBe("16.11.2026");
  });

  it("publishes every file in content/blog with a complete header", () => {
    const posts = getAllBlogPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.blocks.length, post.slug).toBeGreaterThan(3);
      expect(post.description.length, post.slug).toBeLessThanOrEqual(200);
      expect(existsSync(join(process.cwd(), "public", post.image.src)), post.image.src).toBe(true);
    }
  });
});
