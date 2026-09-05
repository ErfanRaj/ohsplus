import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toFa } from "@/lib/catalog";

type Poll = { id: string; question: string; options: string[]; is_active: boolean };

export function ArticlePoll({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: poll } = useQuery({
    queryKey: ["article-poll", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_polls")
        .select("id, question, options, is_active")
        .eq("article_id", articleId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        options: Array.isArray(data.options) ? (data.options as string[]) : [],
      } as Poll;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["poll-results", poll?.id],
    enabled: Boolean(poll?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("poll_results", { _poll_id: poll!.id });
      if (error) throw error;
      return (data ?? []) as { option_index: number; votes: number }[];
    },
  });

  const { data: myVote } = useQuery({
    queryKey: ["poll-vote", poll?.id, user?.id],
    enabled: Boolean(poll?.id && user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poll_votes")
        .select("option_index")
        .eq("poll_id", poll!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.option_index ?? null;
    },
  });

  const vote = useMutation({
    mutationFn: async (optionIndex: number) => {
      const { error } = await supabase
        .from("poll_votes")
        .insert({ poll_id: poll!.id, user_id: user!.id, option_index: optionIndex });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("رأی شما ثبت شد");
      queryClient.invalidateQueries({ queryKey: ["poll-results", poll?.id] });
      queryClient.invalidateQueries({ queryKey: ["poll-vote", poll?.id] });
    },
    onError: () => toast.error("ثبت رأی انجام نشد."),
  });

  if (!poll) return null;

  const counts = new Map((results ?? []).map((row) => [row.option_index, Number(row.votes)]));
  const totalVotes = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const voted = myVote !== null && myVote !== undefined;

  return (
    <section
      aria-labelledby="poll-heading"
      className="rounded-xl border border-border/70 bg-card p-5"
    >
      <h2 id="poll-heading" className="flex items-center gap-2 text-base font-extrabold">
        <BarChart3 className="size-5 text-primary" aria-hidden="true" />
        {poll.question}
      </h2>

      <ul className="mt-4 space-y-3">
        {poll.options.map((option, index) => {
          const count = counts.get(index) ?? 0;
          const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <li key={index} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                {voted || !user ? (
                  <span className="text-sm">{option}</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold"
                    disabled={vote.isPending}
                    onClick={() => vote.mutate(index)}
                  >
                    {option}
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {toFa(percent)}٪ ({toFa(count)})
                </span>
              </div>
              <Progress value={percent} className="h-2" />
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        {user ? (
          `مجموع آرا: ${toFa(totalVotes)}`
        ) : (
          <>
            برای شرکت در نظرسنجی{" "}
            <Link to="/auth" className="text-accent underline-offset-4 hover:underline">
              وارد حساب خود شوید
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
