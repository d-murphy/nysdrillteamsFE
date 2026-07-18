import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { fetchGet, fetchPost } from "../../utils/network";
import { Article } from "../../types/types";
import MutationStatus from "../../shared/components/MutationStatus";
import ArticleEditor from "./ArticleEditor";
import "./AdminArticles.scss";

declare var SERVICE_URL: string;

const emptyArticle = (author: string, nextId: number, sortOrder: number): Article => ({
    id: nextId,
    title: "",
    content: "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    author,
    tags: [],
    isPublished: false,
    isFeatured: false,
    sortOrder,
});

export default function AdminArticles() {
    const { sessionId, role, username } = useLoginContext();
    const queryClient = useQueryClient();
    const canEdit = role === "admin" || role === "article";

    const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
    const [draft, setDraft] = useState<Article | null>(null);
    const [tagsInput, setTagsInput] = useState("");

    const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
        queryKey: ["articles"],
        queryFn: () =>
            fetchGet(`${SERVICE_URL}/articles/getArticles?limit=200&offset=0`).then((res) =>
                res.json()
            ),
    });

    const saveMutation = useMutation({
        mutationFn: (article: Article) => {
            const { _id, ...rest } = article;
            return fetchPost(
                `${SERVICE_URL}/articles/upsertArticle`,
                { article: rest },
                sessionId
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            if (selectedId === "new" && draft) {
                setSelectedId(draft.id);
            }
        },
    });

    const nextId =
        articles.reduce((max, a) => (typeof a.id === "number" && a.id > max ? a.id : max), 0) + 1;
    const nextSortOrder =
        articles.reduce(
            (max, a) => (typeof a.sortOrder === "number" && a.sortOrder > max ? a.sortOrder : max),
            0
        ) + 1;

    function selectArticle(article: Article) {
        saveMutation.reset();
        setSelectedId(article.id);
        setDraft({ ...article, sortOrder: article.sortOrder ?? 0 });
        setTagsInput((article.tags || []).join(", "));
    }

    function startNew() {
        saveMutation.reset();
        const article = emptyArticle(username || "", nextId, nextSortOrder);
        setSelectedId("new");
        setDraft(article);
        setTagsInput("");
    }

    function updateField<K extends keyof Article>(key: K, value: Article[K]) {
        if (!draft) return;
        setDraft({ ...draft, [key]: value });
        saveMutation.reset();
    }

    function handleSave() {
        if (!draft || !canEdit) return;
        if (!draft.title.trim() || !draft.content.trim() || !draft.author.trim()) return;

        const now = new Date().toISOString();
        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const payload: Article = {
            ...draft,
            title: draft.title.trim(),
            author: draft.author.trim(),
            tags,
            updated: now,
            created: selectedId === "new" ? now : draft.created,
        };

        saveMutation.mutate(payload);
        setDraft(payload);
    }

    const formValid =
        Boolean(draft?.title.trim()) &&
        Boolean(draft?.content.trim()) &&
        Boolean(draft?.author.trim()) &&
        draft?.content !== "<p></p>";

    return (
        <div className="admin-articles">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h6 className="mb-0">Articles</h6>
                {canEdit && (
                    <button type="button" className="btn btn-success btn-sm" onClick={startNew}>
                        + New Article
                    </button>
                )}
            </div>

            {isError && (
                <div className="alert alert-danger">Sorry, there was an error loading articles.</div>
            )}
            {isLoading && <div className="text-muted">Loading…</div>}

            {!isLoading && !isError && (
                <div className="row g-3">
                    <div className="col-12 col-lg-3">
                        <div className="list-group article-list">
                            {articles.length === 0 && (
                                <div className="list-group-item text-muted small">No articles yet.</div>
                            )}
                            {articles.map((article) => (
                                <button
                                    type="button"
                                    key={article.id}
                                    className={`list-group-item list-group-item-action ${
                                        selectedId === article.id ? "active" : ""
                                    }`}
                                    onClick={() => selectArticle(article)}
                                >
                                    <div className="fw-semibold text-truncate">
                                        {article.title || "(untitled)"}
                                    </div>
                                    <div
                                        className={`small ${
                                            selectedId === article.id ? "text-white-50" : "text-muted"
                                        }`}
                                    >
                                        {article.author}
                                        {article.isPublished ? " · Published" : " · Draft"}
                                        {article.isFeatured ? " · Featured" : ""}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-12 col-lg-9">
                        {!draft && (
                            <div className="admin-articles-empty text-muted">
                                Select an article to edit, or create a new one.
                            </div>
                        )}

                        {draft && (
                            <div className="admin-article-compose">
                                <div className="admin-article-settings">
                                    <div className="row g-2 align-items-end">
                                        <div className="col-md-5">
                                            <label
                                                className="form-label small fw-semibold mb-1"
                                                htmlFor="article-tags"
                                            >
                                                Tags
                                            </label>
                                            <input
                                                id="article-tags"
                                                className="form-control form-control-sm"
                                                value={tagsInput}
                                                disabled={!canEdit}
                                                onChange={(e) => {
                                                    setTagsInput(e.target.value);
                                                    saveMutation.reset();
                                                }}
                                                placeholder="Use 'twanny-stat-files' to include in Twanny Stat Files"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label
                                                className="form-label small fw-semibold mb-1"
                                                htmlFor="article-sort-order"
                                            >
                                                Sort order
                                            </label>
                                            <input
                                                id="article-sort-order"
                                                type="number"
                                                className="form-control form-control-sm"
                                                value={draft.sortOrder}
                                                disabled={!canEdit}
                                                onChange={(e) =>
                                                    updateField(
                                                        "sortOrder",
                                                        parseInt(e.target.value, 10) || 0
                                                    )
                                                }
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex flex-wrap gap-3 pb-1">
                                                <div className="form-check mb-0">
                                                    <input
                                                        id="article-published"
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={draft.isPublished}
                                                        disabled={!canEdit}
                                                        onChange={(e) =>
                                                            updateField(
                                                                "isPublished",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="article-published"
                                                    >
                                                        Published
                                                    </label>
                                                </div>
                                                <div className="form-check mb-0">
                                                    <input
                                                        id="article-featured"
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={draft.isFeatured}
                                                        disabled={!canEdit}
                                                        onChange={(e) =>
                                                            updateField(
                                                                "isFeatured",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="article-featured"
                                                    >
                                                        Featured
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                                        <MutationStatus
                                            isSuccess={saveMutation.isSuccess}
                                            isError={saveMutation.isError}
                                        />
                                        <div className="d-flex gap-2 align-items-center">
                                            {!canEdit && (
                                                <span className="small text-muted">
                                                    Only admin or article editors can make changes.
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                disabled={
                                                    !canEdit ||
                                                    !formValid ||
                                                    saveMutation.isPending
                                                }
                                                onClick={handleSave}
                                            >
                                                {saveMutation.isPending ? "Saving…" : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-article-compose-card">
                                    <p className="admin-article-series">Article</p>
                                    <input
                                        id="article-title"
                                        className="admin-article-title-input"
                                        value={draft.title}
                                        disabled={!canEdit}
                                        onChange={(e) => updateField("title", e.target.value)}
                                        placeholder="Article title"
                                        autoComplete="off"
                                    />
                                    <div className="admin-article-byline-row">
                                        <label className="visually-hidden" htmlFor="article-author">
                                            Author
                                        </label>
                                        <input
                                            id="article-author"
                                            className="admin-article-meta-input"
                                            value={draft.author}
                                            disabled={!canEdit}
                                            onChange={(e) => updateField("author", e.target.value)}
                                            placeholder="Author"
                                            autoComplete="off"
                                        />
                                        <span className="admin-article-byline-sep" aria-hidden="true">
                                            ·
                                        </span>
                                        <span className="admin-article-meta-static">
                                            {selectedId === "new"
                                                ? "New draft"
                                                : `id ${draft.id}`}
                                        </span>
                                    </div>

                                    <ArticleEditor
                                        key={
                                            selectedId === "new"
                                                ? `new-${draft.id}`
                                                : String(draft.id)
                                        }
                                        content={draft.content}
                                        editable={canEdit}
                                        onChange={(html) => updateField("content", html)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
