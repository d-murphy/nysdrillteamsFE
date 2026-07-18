import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { fetchGet } from "../utils/network";
import { Article } from "../types/types";
import "./TwannyStatFiles.scss";

declare var SERVICE_URL: string;

function formatUpdated(value: Date | string | undefined) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function TwannyStatFile() {
    const { articleId } = useParams();
    const id = parseInt(articleId || "", 10);

    const { data: article, isLoading, isError } = useQuery<Article | null>({
        queryKey: ["article", id],
        queryFn: () =>
            fetchGet(`${SERVICE_URL}/articles/getArticle/${id}`).then(async (res) => {
                const body = await res.json();
                return body || null;
            }),
        enabled: !Number.isNaN(id),
    });

    const canShow =
        article &&
        article.isPublished &&
        (article.tags || []).includes("twanny-stat-files");

    const updatedLabel = article ? formatUpdated(article.updated) : null;

    return (
        <div className="twanny-article-page">
            <article className="twanny-article">
                <Link to="/TwannyStatFiles" className="twanny-article-back">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    All Twanny Stat Files
                </Link>

                {isLoading && <p className="twanny-article-status">Loading…</p>}
                {(isError || Number.isNaN(id) || (!isLoading && !canShow)) && (
                    <p className="twanny-article-status is-error">
                        Sorry, that article could not be found.
                    </p>
                )}

                {canShow && article && (
                    <>
                        <header className="twanny-article-header">
                            <p className="twanny-article-series">Twanny Stat Files</p>
                            <h1 className="twanny-article-title">{article.title}</h1>
                            <p className="twanny-article-byline">
                                {article.author && <span>{article.author}</span>}
                                {article.author && updatedLabel && (
                                    <span className="twanny-article-byline-sep" aria-hidden="true">
                                        ·
                                    </span>
                                )}
                                {updatedLabel && <span>Updated {updatedLabel}</span>}
                            </p>
                        </header>

                        <div
                            className="twanny-article-body"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </>
                )}
            </article>
        </div>
    );
}
