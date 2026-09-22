import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ApplicationPhoto } from "./ApplicationPhoto";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/format";
import { approveApplication, listApplications, rejectApplication } from "@/services/admin";

export function PendingApplications() {
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["applications", "pending"],
    queryFn: () => listApplications("pending"),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["applications"] });
    void queryClient.invalidateQueries({ queryKey: ["members"] });
  };

  const approve = useMutation({
    mutationFn: approveApplication,
    onSuccess: (result) => {
      toast.success(`${t("admin.pending.approved")} · ${result.crf_no}`);
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string | null }) =>
      rejectApplication(id, reason),
    onSuccess: () => {
      toast.success(t("admin.pending.rejected"));
      setRejecting(null);
      setNotes("");
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isPending) return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (isError) {
    return (
      <div className="text-sm">
        <p className="text-destructive">{t("common.error")}</p>
        <button type="button" onClick={() => void refetch()} className="mt-2 underline">
          {t("common.retry")}
        </button>
      </div>
    );
  }
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("admin.pending.empty")}</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((application) => (
        <article key={application.id} className="panel flex flex-wrap gap-5 p-5">
          <ApplicationPhoto path={application.photo_path} alt={application.full_name} />
          <div className="min-w-56 flex-1 text-sm">
            <h3 className="font-display text-lg text-primary">{application.full_name}</h3>
            <p className="mt-1 text-muted-foreground">
              {t("common.phone")}: {application.phone}
            </p>
            <p className="text-muted-foreground">
              {t("common.address")}: {application.address}
            </p>
            <p className="text-muted-foreground">
              {application.district} · {application.constituency} · {application.state}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.pending.submitted")}: {formatDate(application.created_at, language)}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-44">
            <button
              type="button"
              disabled={approve.isPending}
              onClick={() => approve.mutate(application.id)}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground disabled:opacity-60"
            >
              {t("admin.pending.approve")}
            </button>
            {rejecting === application.id ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("admin.pending.rejectReason")}
                  rows={2}
                  className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={reject.isPending}
                  onClick={() => reject.mutate({ id: application.id, reason: notes || null })}
                  className="w-full rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
                >
                  {t("common.confirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(null)}
                  className="w-full rounded-md border border-border px-4 py-2 text-sm"
                >
                  {t("common.cancel")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRejecting(application.id)}
                className="rounded-md border border-destructive px-4 py-2 text-sm font-semibold text-destructive"
              >
                {t("admin.pending.reject")}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
