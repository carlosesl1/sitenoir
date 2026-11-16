import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BlogArticle } from "@/components/blog/BlogArticle";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { createBlogPost } from "@/features/blog/posts";

afterEach(cleanup);

const post = (slug: string, category: string, date: string) =>
  createBlogPost(
    slug,
    [
      "---",
      `title: Artigo ${slug}`,
      `description: Resumo de ${slug}.`,
      `date: ${date}`,
      `category: ${category}`,
      "---",
      "",
      "Abertura com **destaque** e [contato](/contato).",
      "",
      "## Uma seção",
      "",
      "- primeiro",
      "- segundo",
    ].join("\n"),
  );

const posts = [
  post("sites-a", "Sites", "2026-11-16"),
  post("google-a", "Google", "2026-11-12"),
  post("sites-b", "Sites", "2026-11-09"),
];

describe("blog index", () => {
  it("lists every post with its address, date and category", () => {
    render(<BlogIndex posts={posts} />);

    expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
    const links = within(screen.getByRole("list")).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/blog/sites-a",
      "/blog/google-a",
      "/blog/sites-b",
    ]);
    expect(links[0]).toHaveTextContent("16.11.2026");
    expect(links[0]).toHaveTextContent("Artigo sites-a");
  });

  it("filters the list by category and back", () => {
    render(<BlogIndex posts={posts} />);

    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Todos",
      "Sites",
      "Google",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Google" }));
    expect(screen.getByRole("button", { name: "Google" })).toHaveAttribute("aria-pressed", "true");
    expect(within(screen.getByRole("list")).getAllByRole("link")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(within(screen.getByRole("list")).getAllByRole("link")).toHaveLength(3);
  });

  it("says so when there is nothing to read yet", () => {
    render(<BlogIndex posts={[]} />);

    expect(screen.getByText("Nenhum artigo publicado ainda.")).toBeInTheDocument();
  });
});

describe("blog article", () => {
  it("renders the post, a way back and the contact action", () => {
    const [first, ...rest] = posts;
    if (!first) throw new Error("missing fixture");
    render(<BlogArticle post={first} related={rest} />);

    expect(screen.getByRole("heading", { level: 1, name: "Artigo sites-a" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Uma seção" })).toHaveAttribute(
      "id",
      "uma-secao",
    );
    expect(screen.getByText("destaque").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "contato" })).toHaveAttribute("href", "/contato");
    expect(screen.getByRole("link", { name: "Entrar em contato" })).toHaveAttribute(
      "href",
      "/contato",
    );
    expect(screen.getByText("16.11.2026").closest("time")).toHaveAttribute(
      "datetime",
      "2026-11-16",
    );
    expect(screen.getByRole("heading", { name: "Continue lendo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Artigo google-a/ })).toHaveAttribute(
      "href",
      "/blog/google-a",
    );
  });
});
