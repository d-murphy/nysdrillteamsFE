import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const ABBREVIATIONS: Record<string, string> = {
    "Three Man Ladder": "3ML",
    "B Ladder":         "BL",
    "C Ladder":         "CL",
    "C Hose":           "CH",
    "B Hose":           "BH",
    "Efficiency":       "EFF",
    "Motor Pump":       "MP",
    "Buckets":          "BUC",
};

interface ContestPickerProps {
    contests: string[];
    selectedContest: string;
    pickedContests: string[];
    onContestChange: (contest: string) => void;
    disabled?: boolean;
}

export function ContestPicker({ contests, selectedContest, pickedContests, onContestChange, disabled }: ContestPickerProps) {
    return (
        <div className="d-flex flex-row flex-wrap gap-1">
            {contests.map(contest => {
                const isPicked = pickedContests.includes(contest);
                const isSelected = contest === selectedContest;
                const abbr = ABBREVIATIONS[contest] ?? contest;
                return (
                    <Button
                        key={contest}
                        size="sm"
                        className="text-nowrap"
                        title={contest}
                        variant={
                            isPicked    ? 'outline-success' :
                            isSelected  ? 'primary' :
                                          'outline-secondary'
                        }
                        disabled={isPicked || disabled}
                        onClick={() => onContestChange(contest)}
                    >
                        {isPicked && <FontAwesomeIcon icon={faCheck} className="me-1" />}
                        {abbr}
                    </Button>
                );
            })}
        </div>
    );
}
