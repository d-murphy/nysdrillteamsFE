import * as React from 'react';

interface MutationStatusProps {
    isSuccess: boolean;
    isError: boolean;
    successMessage?: string;
    errorMessage?: string;
}

export default function MutationStatus({
    isSuccess,
    isError,
    successMessage = 'Update successful.',
    errorMessage = 'An error occurred. Try again later.',
}: MutationStatusProps) {
    if (!isSuccess && !isError) return null;
    return (
        <span className={isError ? 'text-danger' : 'text-success'}>
            {isError ? errorMessage : successMessage}
        </span>
    );
}
