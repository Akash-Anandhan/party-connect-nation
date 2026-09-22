import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useI18n } from "@/i18n";
import {
  CARD_PLACEHOLDERS,
  PREVIEW_VALUES,
  STARTER_TEMPLATE,
  downloadCardTemplate,
  renderCardTemplate,
} from "@/lib/card-template";
import { activateTemplate, createTemplate, deleteTemplate, listTemplates } from "@/services/admin";

export function TemplatesManager() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["templates"],
    queryFn: listTemplates,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["templates"] });

  const save = useMutation({
    mutationFn: () => createTemplate(name.trim(), html),
    onSuccess: () => {
      toast.success(t("admin.templates.saved"));
      setName("");
      setHtml("");
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  const activate = useMutation({
    mutationFn: activateTemplate,
    onSuccess: () => {
      toast.success(t("admin.templates.activated"));
      invalidate();
    },
    onError: () => toast.error(t("common.error")),
  });

  const remove = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: invalidate,
    onError: () => toast.error(t("common.error")),
  });

  async function handleFile(file: File | null) {
    if (!file) return;
    setHtml(await file.text());
    if (!name) setName(file.name.replace(/\.html?$/i, ""));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !html.trim()) return;
    save.mutate();
  }

  const preview = data?.find((template) => template.id === previewId);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t("admin.templates.name")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t("admin.templates.upload")}</span>
            <input
              type="file"
              accept=".html,text/html"
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t("admin.templates.html")}</span>
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-md border border-input bg-card px-3 py-2 font-mono text-xs"
          />
        </label>

        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{t("admin.templates.placeholders")}</p>
          <p className="mt-1 font-mono">
            {CARD_PLACEHOLDERS.map((placeholder) => `{{${placeholder}}}`).join("  ")}
          </p>
          <button
            type="button"
            onClick={() => downloadCardTemplate("card-template-starter", STARTER_TEMPLATE)}
            className="mt-3 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {t("admin.templates.downloadStarter")}
          </button>
        </div>

        <button
          type="submit"
          disabled={save.isPending || !name.trim() || !html.trim()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {t("admin.templates.save")}
        </button>
      </form>

      {isPending ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : isError ? (
        <div className="text-sm">
          <p className="text-destructive">{t("common.error")}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 underline">
            {t("common.retry")}
          </button>
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.templates.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {data.map((template) => (
            <li key={template.id} className="panel flex flex-wrap items-center gap-3 p-4">
              <span className="font-medium">{template.name}</span>
              {template.is_active ? (
                <span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-success-foreground">
                  {t("admin.templates.active")}
                </span>
              ) : null}
              <span className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadCardTemplate(template.name, template.html)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                >
                  {t("admin.templates.download")}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewId(previewId === template.id ? null : template.id)}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                >
                  {previewId === template.id
                    ? t("admin.templates.closePreview")
                    : t("admin.templates.preview")}
                </button>
                {!template.is_active ? (
                  <>
                    <button
                      type="button"
                      onClick={() => activate.mutate(template.id)}
                      className="rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                    >
                      {t("admin.templates.activate")}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.mutate(template.id)}
                      className="rounded-md border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive"
                    >
                      {t("admin.templates.delete")}
                    </button>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {preview ? (
        <div className="panel overflow-x-auto p-5">
          <div
            dangerouslySetInnerHTML={{ __html: renderCardTemplate(preview.html, PREVIEW_VALUES) }}
          />
        </div>
      ) : null}
    </div>
  );
}
