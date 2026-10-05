"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ARTICLES, type Article } from "./data";

/**
 * Stubbed post persistence for the Manage-posts UI.
 *
 * TODO(phase-2 — real auth + backend): replace with API-backed posts
 * (database table, POST/PATCH/DELETE routes, server-side capability checks).
 * Until then, seed articles ship statically and collaborator edits live in
 * localStorage as deltas on top. Client-side only — never treat as secure.
 */

export type PostDelta = {
  created: Article[];
  updated: Record<string, Article>;
  deleted: string[];
};

const POSTS_KEY = "magistick:posts-delta";

const EMPTY: PostDelta = { created: [], updated: {}, deleted: [] };

function readDelta(): PostDelta {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<PostDelta>;
      return {
        created: Array.isArray(d.created) ? d.created : [],
        updated: d.updated && typeof d.updated === "object" ? d.updated : {},
        deleted: Array.isArray(d.deleted) ? d.deleted : [],
      };
    }
  } catch {
    /* corrupted or private mode — start clean */
  }
  return EMPTY;
}

function writeDelta(d: PostDelta) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(d));
  } catch {
    /* private mode — edits just won't persist */
  }
}

/** Seed articles with stub deltas applied, newest first. */
export function mergePosts(delta: PostDelta): Article[] {
  const { created, updated, deleted } = delta;
  const deletedSet = new Set(deleted);
  const base = ARTICLES.filter((a) => !deletedSet.has(a.slug)).map(
    (a) => updated[a.slug] ?? a,
  );
  const live = created.filter((c) => !deletedSet.has(c.slug));
  return [...live, ...base].sort((a, b) => b.date.localeCompare(a.date));
}

export function slugify(title: string): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || `post-${Date.now()}`;
  return base;
}

export type PostInput = Omit<Article, "slug">;

export function usePosts() {
  const [delta, setDelta] = useState<PostDelta>(EMPTY);

  useEffect(() => {
    setDelta(readDelta());
  }, []);

  const posts = useMemo(() => mergePosts(delta), [delta]);

  const persist = useCallback(
    (next: PostDelta) => {
      setDelta(next);
      writeDelta(next);
    },
    [],
  );

  const createPost = useCallback(
    (input: PostInput): Article => {
      const taken = new Set([
        ...ARTICLES.map((a) => a.slug),
        ...delta.created.map((c) => c.slug),
      ]);
      const base = slugify(input.title);
      let slug = base;
      let i = 2;
      while (taken.has(slug)) slug = `${base}-${i++}`;
      const article: Article = { ...input, slug };
      persist({ ...delta, created: [article, ...delta.created] });
      return article;
    },
    [delta, persist],
  );

  const updatePost = useCallback(
    (slug: string, input: PostInput) => {
      const article: Article = { ...input, slug };
      if (delta.created.some((c) => c.slug === slug)) {
        persist({
          ...delta,
          created: delta.created.map((c) => (c.slug === slug ? article : c)),
        });
      } else {
        persist({ ...delta, updated: { ...delta.updated, [slug]: article } });
      }
    },
    [delta, persist],
  );

  const deletePost = useCallback(
    (slug: string) => {
      if (delta.created.some((c) => c.slug === slug)) {
        const { [slug]: _dropped, ...updated } = delta.updated;
        persist({
          ...delta,
          created: delta.created.filter((c) => c.slug !== slug),
          updated,
        });
      } else {
        const { [slug]: _dropped, ...updated } = delta.updated;
        persist({
          ...delta,
          updated,
          deleted: delta.deleted.includes(slug)
            ? delta.deleted
            : [...delta.deleted, slug],
        });
      }
    },
    [delta, persist],
  );

  const getPost = useCallback(
    (slug: string) => posts.find((p) => p.slug === slug),
    [posts],
  );

  return { posts, getPost, createPost, updatePost, deletePost };
}
