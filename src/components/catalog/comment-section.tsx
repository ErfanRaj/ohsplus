import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  COMMENT_STATUS_LABELS,
  commentsQuery,
  myCommentsQuery,
  submitComment,
  type CommentTarget,
} from "@/lib/comments";
import { formatDateFa } from "@/lib/catalog";

const MIN_LENGTH = 2;
const MAX_LENGTH = 2000;

export function CommentSection({ target }: { target: CommentTarget }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const { data: comments, isLoading } = useQuery(commentsQuery(target));
  const { data: mine } = useQuery({
    ...myCommentsQuery(target, user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  const mutation = useMutation({
    mutationFn: () =>
      submitComment({
        target,
        userId: user!.id,
        body,
        authorName: String(user!.user_metadata?.full_name ?? "") || null,
      }),
    onSuccess: () => {
      setBody("");
      toast.success("دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود.");
      queryClient.invalidateQueries({ queryKey: ["my-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => toast.error("ثبت دیدگاه انجام نشد. لطفاً دوباره تلاش کنید."),
  });

  const trimmed = body.trim();
  const pendingMine = (mine ?? []).filter((comment) => comment.status !== "approved");

  return (
    <section aria-labelledby="comments-heading" className="space-y-5">
      <h2 id="comments-heading" className="flex items-center gap-2 text-lg font-extrabold">
        <MessageSquare className="size-5 text-primary" aria-hidden="true" />
        دیدگاه‌ها
      </h2>

      {user ? (
        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
          <Textarea
            value={body}
            rows={4}
            maxLength={MAX_LENGTH}
            placeholder="دیدگاه خود را بنویسید…"
            onChange={(event) => setBody(event.target.value)}
            aria-label="متن دیدگاه"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">
              دیدگاه‌ها پس از بررسی و تأیید مدیران منتشر می‌شوند.
            </p>
            <Button
              className="gap-2 font-semibold"
              disabled={trimmed.length < MIN_LENGTH || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              ثبت دیدگاه
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            برای ثبت دیدگاه ابتدا وارد حساب خود شوید.
          </p>
          <Button asChild variant="outline" className="font-semibold">
            <Link to="/auth">ورود / ثبت‌نام</Link>
          </Button>
        </div>
      )}

      {pendingMine.length > 0 ? (
        <ul className="space-y-3">
          {pendingMine.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold">دیدگاه شما</span>
                <Badge variant="secondary">{COMMENT_STATUS_LABELS[comment.status]}</Badge>
              </div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{comment.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : (comments ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">هنوز دیدگاهی ثبت نشده است.</p>
      ) : (
        <ul className="space-y-4">
          {(comments ?? []).map((comment) => (
            <li key={comment.id} className="rounded-lg border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold">{comment.author_name ?? "کاربر OHS Plus"}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDateFa(comment.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
