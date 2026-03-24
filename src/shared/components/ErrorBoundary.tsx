import * as React from "react";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="text-center pt-5">
                    Sorry, something went wrong. Please refresh and try again.
                </div>
            );
        }
        return this.props.children;
    }
}
