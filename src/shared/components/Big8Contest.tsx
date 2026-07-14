import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Run } from "../../types/types";
import dateUtil from "../../utils/dateUtils";
import { niceTime } from "../../utils/timeUtils";
import { SizedImage } from "./SizedImage";
import getImgLocation from "../../utils/imgLU";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareYoutube } from "@fortawesome/free-brands-svg-icons";
import StateRecordIcon from "./StateRecordIcon";

interface Big8ContestProp {
    run: Run;
}

function contestLabel(contest: string | undefined) {
    if (!contest) return "";
    return contest === "Three Man Ladder" ? "3 Man Ladder" : contest;
}

export default function Big8Contest({ run }: Big8ContestProp) {
    const navigate = useNavigate();
    const dateStr = run ? dateUtil.getMMDDYYYY(run.date) : "";
    const hasRecord = Boolean(run?.stateRecord || run?.currentStateRecord);

    return (
        <div className="col-6 col-md-3">
            <div
                className="big8-tile h-100"
                onClick={() => {
                    if (run.tournamentId) navigate(`/Tournament/${run.tournamentId}`);
                }}
                role={run.tournamentId ? "button" : undefined}
            >
                <div className="big8-tile-contest text-truncate">
                    {contestLabel(run.contest)}
                </div>

                <div className="big8-tile-time">
                    {run.time ? niceTime(run.time) : ""}
                    {hasRecord && (
                        <span className="ms-1">
                            <StateRecordIcon run={run} size="sm" />
                        </span>
                    )}
                </div>

                <div className="big8-tile-team">
                    <SizedImage imageSrc={getImgLocation(run.team || "")} size="sm" />
                    <div className="big8-tile-team-name text-truncate">{run.team}</div>
                </div>

                <div className="big8-tile-meta">
                    <span className="text-truncate">{run.tournament}</span>
                    <span className="big8-tile-meta-trail">
                        {dateStr}
                        {run.urls?.length ? (
                            <a
                                href={run.urls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-1"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Watch video"
                            >
                                <FontAwesomeIcon className="video-links" icon={faSquareYoutube} />
                            </a>
                        ) : null}
                    </span>
                </div>
            </div>
        </div>
    );
}
