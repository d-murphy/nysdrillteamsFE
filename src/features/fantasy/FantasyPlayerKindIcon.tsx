import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import useTeamNames from "../../hooks/fantasy/useTeamNames";

/** When passed from a parent that already uses `useTeamNames` for the batch, the icon does not fetch. */
export type FantasyPlayerKindTeamColors = {
    /** Glyph color (person / robot). */
    insideColor?: string;
    /** Circle background fill. */
    outsideColor?: string;
};

export interface FantasyPlayerKindIconProps {
    isAutodraft: boolean;
    className?: string;
    userEmail: string;
    users: string[];
    /** When set, overrides server colors for display (e.g. live preview while editing). */
    previewColors?: FantasyPlayerKindTeamColors | null;
    /** Multiplies default 2rem / 0.875rem icon size (e.g. `5` for profile preview). */
    sizeMultiplier?: number;
}

/**
 * Small circular “avatar” plate with robot vs person glyph — common pattern for
 * list rows: fixed diameter, centered icon, muted fill, inherits text color from className.
 */
export function FantasyPlayerKindIcon({
    isAutodraft,
    className,
    userEmail,
    users,
    previewColors,
    sizeMultiplier = 1,
}: FantasyPlayerKindIconProps) {
    const label = isAutodraft ? "Computer player" : "Human player";

    const { data: fetchedTeamNames } = useTeamNames(users);
    const teamNameInfo = fetchedTeamNames?.find((team) => team.email === userEmail);

    const iconColor = previewColors?.insideColor ?? teamNameInfo?.insideColor;
    const backgroundColor = previewColors?.outsideColor ?? teamNameInfo?.outsideColor;

    const hasIconColor = Boolean(iconColor);
    const hasBackgroundColor = Boolean(backgroundColor);

    const circleStyle: React.CSSProperties = {
        width: `${2 * sizeMultiplier}rem`,
        height: `${2 * sizeMultiplier}rem`,
        ...(hasBackgroundColor ? { backgroundColor } : {}),
    };

    const iconStyle = {
        fontSize: `${0.875 * sizeMultiplier}rem`,
        verticalAlign: "middle" as const,
        ...(hasIconColor ? { color: iconColor } : {}),
    };

    return (
        <span
            role="img"
            aria-label={label}
            title={label}
            className={[
                "rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0",
                !hasBackgroundColor && "bg-secondary bg-opacity-10",
                className,
                !className && !hasIconColor && "text-secondary",
            ]
                .filter(Boolean)
                .join(" ")}
            style={circleStyle}
        >
            <FontAwesomeIcon icon={isAutodraft ? faRobot : faUser} aria-hidden style={iconStyle} />
        </span>
    );
}
