import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type CommentTarget = { productId: string } | { articleId: string };

export type CommentRow = {
  id: string;
  body: string;
  author_name: string | null;
  rating: number | null;
  status: "pending" | "approved" | "rejected";
  user_id: string;
  created_at: string;
};

export const COMMENT_STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار تأیید",
  approved: "تأیید شده",
  rejected: "رد شده",
};

const COMMENT_FIELDS = "id, body, author_name, rating, status, user_id, created_at";

function applyTarget<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  target: CommentTarget,
) {
  return "productId" in target
    ? query.eq("product_id", target.productId)
    : query.eq("article_id", target.articleId);
}

function targetKey(target: CommentTarget) {
  return "productId" in target ? `product:${target.productId}` : `article:${target.articleId}`;
}

/** Approved comments, visible to everyone. */
export const commentsQuery = (target: CommentTarget) =>
  queryOptions({
    queryKey: ["comments", targetKey(target)],
    queryFn: async () => {
      const { data, error } = await applyTarget(
        supabase.from("comments").select(COMMENT_FIELDS).eq("status", "approved"),
        target,
      ).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommentRow[];
    },
  });

/** The signed-in user's own comments on this item, including pending ones. */
export const myCommentsQuery = (target: CommentTarget, userId: string) =>
  queryOptions({
    queryKey: ["my-comments", targetKey(target), userId],
    queryFn: async () => {
      const { data, error } = await applyTarget(
        supabase.from("comments").select(COMMENT_FIELDS).eq("user_id", userId),
        target,
      ).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommentRow[];
    },
  });

export async function submitComment(input: {
  target: CommentTarget;
  userId: string;
  body: string;
  authorName?: string | null;
  rating?: number | null;
}) {
  const { error } = await supabase.from("comments").insert({
    product_id: "productId" in input.target ? input.target.productId : null,
    article_id: "articleId" in input.target ? input.target.articleId : null,
    user_id: input.userId,
    body: input.body.trim(),
    author_name: input.authorName?.trim() || null,
    rating: input.rating ?? null,
    status: "pending",
  });
  if (error) throw error;
}

export async function moderateComment(id: string, status: "approved" | "rejected", userId: string) {
  const { error } = await supabase
    .from("comments")
    .update({ status, moderated_by: userId, moderated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}
