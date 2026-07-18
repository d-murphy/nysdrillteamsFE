import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { fetchGet } from "../utils/network";
import { Article } from "../types/types";
import dateUtil from "../utils/dateUtils";
import "./TwannyStatFiles.scss";

declare var SERVICE_URL: string;

const TAG = "twanny-stat-files";

function formatUpdated(value: Date | string | undefined) {
    if (!value) return "—";
    return dateUtil.getMMDDYYYY(new Date(value));
}

export default function TwannyStatFiles() {
    const { data: articles = [], isLoading, isError } = useQuery<Article[]>({
        queryKey: ["articles", TAG, "published"],
        queryFn: () =>
            fetchGet(
                `${SERVICE_URL}/articles/getArticles?limit=200&offset=0&isPublished=true&tag=${encodeURIComponent(TAG)}`
            ).then((res) => res.json()),
    });

    const sorted = [...articles].sort((a, b) => {
        const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (sortDiff !== 0) return sortDiff;
        const aTime = new Date(a.updated).getTime();
        const bTime = new Date(b.updated).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });

    return (
        <div className="container mb-4">
            <div className="bg-white rounded shadow-sm p-4 mt-3">
                <div className="border-bottom border-secondary mb-3 d-flex align-items-center gap-3">
                    <FontAwesomeIcon icon={faFileLines} className="crud-links fs-3" />
                    <div>
                        <h3 className="my-2 mb-0">Twanny Stat Files</h3>
                        <p className="text-muted small mb-2 mb-md-0">
                            Curated racing history notes, clubs, and State Drill deep dives.
                        </p>
                    </div>
                </div>

                {isLoading && <div className="text-muted">Loading…</div>}
                {isError && (
                    <div className="alert alert-danger mb-0">
                        Sorry, there was an error loading these articles.
                    </div>
                )}
                {!isLoading && !isError && sorted.length === 0 && (
                    <div className="text-muted">No Twanny Stat Files have been published yet.</div>
                )}

                {!isLoading && !isError && sorted.length > 0 && (
                    <div className="row g-3 twanny-stat-files-grid">
                        {sorted.map((article) => (
                            <div className="col-12 col-md-6 col-lg-4" key={article.id}>
                                <Link
                                    to={`/TwannyStatFiles/${article.id}`}
                                    className="text-decoration-none h-100 d-block"
                                >
                                    <article className="twanny-stat-card h-100">
                                        <h4 className="twanny-stat-card-title">
                                            {article.title}
                                        </h4>
                                        <div className="twanny-stat-card-cta">Read article</div>
                                        <div className="twanny-stat-card-date">
                                            Updated {formatUpdated(article.updated)}
                                        </div>
                                    </article>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
