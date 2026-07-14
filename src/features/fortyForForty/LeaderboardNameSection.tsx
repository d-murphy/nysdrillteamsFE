import React, { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Filter } from "bad-words";
import { useUpdateLeaderboardName } from "../../hooks/fortyForForty/useUpdateLeaderboardName";

const NOT_SET = "not_set";
const filter = new Filter();

export function isLeaderboardNameSet(leaderboardName?: string): boolean {
    return !!leaderboardName && leaderboardName !== NOT_SET;
}

interface LeaderboardNameSectionProps {
    gameId: string;
    leaderboardName?: string;
}

export function LeaderboardNameSection({ gameId, leaderboardName }: LeaderboardNameSectionProps) {
    const [name, setName] = useState("");
    const mutation = useUpdateLeaderboardName();

    // Older games never got this field — hide the feature entirely.
    if (leaderboardName == null) {
        return null;
    }

    // Name already saved — show it on the results page.
    if (isLeaderboardNameSet(leaderboardName)) {
        return (
            <div className="text-center mb-4">
                <div
                    className="text-muted fw-semibold mb-1"
                    style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                >
                    Leaderboard Name
                </div>
                <div className="fw-bold" style={{ fontSize: '1.35rem' }}>
                    {leaderboardName}
                </div>
            </div>
        );
    }

    // Only new games awaiting a name (leaderboardName === "not_set") get the form.
    if (leaderboardName !== NOT_SET) {
        return null;
    }

    const trimmed = name.trim();
    const isProfane = trimmed.length > 0 && filter.isProfane(trimmed);
    const canSubmit = trimmed.length > 0 && !isProfane && !mutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        mutation.mutate({ gameId, leaderboardName: trimmed });
    };

    return (
        <div className="mb-4 mx-auto" style={{ maxWidth: 480 }}>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                    <Form.Label
                        className="text-muted fw-semibold mb-1 d-block text-center"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                    >
                        Leaderboard Name
                    </Form.Label>
                    <Form.Control
                        type="text"
                        className="text-center"
                        placeholder="Enter a name for the leaderboard"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={mutation.isPending}
                        maxLength={60}
                        autoComplete="off"
                        isInvalid={isProfane}
                    />
                    {isProfane && (
                        <Form.Control.Feedback type="invalid" className="text-center d-block">
                            Please choose a different name.
                        </Form.Control.Feedback>
                    )}
                </Form.Group>
                <Button
                    type="submit"
                    className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: '1rem' }}
                    disabled={!canSubmit}
                >
                    {mutation.isPending ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Saving…
                        </>
                    ) : (
                        'Save Name'
                    )}
                </Button>
                {mutation.isError && (
                    <div className="text-danger small mt-2 text-center">
                        {mutation.error.message}
                    </div>
                )}
            </Form>
        </div>
    );
}
