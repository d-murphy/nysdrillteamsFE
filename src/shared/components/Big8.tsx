import * as React from "react";
import { useMemo } from "react";
import { Run } from "../../types/types";
import Big8Contest from "./Big8Contest";
import Big8ContestLoading from "./Big8ContestLoading";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface Big8Prop {
    year?: number;
}

declare var SERVICE_URL: string;

const CONTEST_ORDER = [
    "Three Man Ladder",
    "B Ladder",
    "C Ladder",
    "C Hose",
    "B Hose",
    "Efficiency",
    "Motor Pump",
    "Buckets",
] as const;

function getRun(contestName: string, big8arr: { _id: string; matched_doc: Run }[]) {
    return big8arr.find((el) => el._id == contestName)?.matched_doc;
}

export default function Big8(props: Big8Prop) {
    const big8Year = props.year
        ? props.year
        : new Date() < new Date(`6/15/${new Date().getFullYear()}`)
          ? new Date().getFullYear() - 1
          : new Date().getFullYear();

    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<{ _id: string; matched_doc: Run }[]>({
        queryKey: ["big8", big8Year],
        queryFn: () =>
            fetch(`${SERVICE_URL}/runs/getBig8?year=${big8Year}`).then((res) => res.json()),
    });
    const big8 = data ?? [];

    const runs = useMemo(
        () => CONTEST_ORDER.map((contest) => getRun(contest, big8)),
        [big8]
    );

    if (isError) return null;

    return (
        <div className="big8-panel bg-white rounded shadow-sm p-3 p-md-4 mt-3">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
                <div>
                    <div className="big8-panel-kicker">Season highlight</div>
                    <div className="d-flex flex-wrap align-items-baseline gap-2">
                        <h4 className="mb-0">The Big 8</h4>
                        <span className="text-muted small">
                            Top times from {big8Year}&apos;s motorized teams
                        </span>
                    </div>
                </div>
                {!isLoading && (
                    <button
                        type="button"
                        className="big8-top10-link"
                        onClick={() => navigate("/topRuns?year=" + big8Year)}
                    >
                        See the Top 10 for {big8Year}
                        <FontAwesomeIcon className="ms-2" icon={faList} />
                    </button>
                )}
            </div>

            <div className="row g-3">
                {isLoading
                    ? CONTEST_ORDER.map((contest) => (
                          <Big8ContestLoading key={contest} />
                      ))
                    : CONTEST_ORDER.map((contest, index) => {
                          const run = runs[index];
                          if (!run) return null;
                          return <Big8Contest key={contest} run={run} />;
                      })}
            </div>
        </div>
    );
}
