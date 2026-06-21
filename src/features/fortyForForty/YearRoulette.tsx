import React, { useEffect, useState } from "react";

interface YearRouletteProps {
    year: number;
    isAnimating: boolean;
    variant?: 'hero' | 'pill';
}

export function YearRoulette({ year, isAnimating, variant = 'pill' }: YearRouletteProps) {
    const [displayYear, setDisplayYear] = useState(year);

    useEffect(() => {
        if (!isAnimating) {
            setDisplayYear(year);
            return;
        }
        const interval = setInterval(() => {
            setDisplayYear(Math.floor(Math.random() * (2025 - 1970 + 1)) + 1970);
        }, 80);
        return () => clearInterval(interval);
    }, [isAnimating, year]);

    if (variant === 'hero') {
        return (
            <div
                className="fw-bold font-monospace text-center"
                style={{
                    fontSize: '9rem',
                    lineHeight: 1,
                    color: isAnimating ? '#adb5bd' : '#212529',
                    transition: 'color 0.3s',
                    letterSpacing: '-0.02em',
                }}
            >
                {displayYear}
            </div>
        );
    }

    return (
        <span
            className="fw-bold font-monospace rounded-pill nav-bg-color-dk text-white px-4 py-1"
            style={{ fontSize: '1.75rem', display: 'inline-block', minWidth: 130, textAlign: 'center' }}
        >
            {displayYear}
        </span>
    );
}
