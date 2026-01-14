
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    validate: (amount: number, recipient: string) => boolean;
    errorMessage: string;
}

export const DEFAULT_POLICIES: PolicyRule[] = [
    {
        id: 'max_transaction_limit',
        name: 'Max Transaction Limit',
        description: 'Prevents transfers over 5,000 tokens',
        validate: (amount: number) => amount <= 5000,
        errorMessage: 'Transaction exceeds the 5,000 tokens limit.'
    },
    {
        id: 'suspicious_address_check',
        name: 'Suspicious Address Check',
        description: 'Flags addresses with known suspicious patterns (mock)',
        validate: (_amount: number, recipient: string) => !recipient.toLowerCase().endsWith('dead'), // Mock rule
        errorMessage: 'Recipient address is flagged as suspicious.'
    }
];

export function validateTransaction(amount: number, recipient: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    DEFAULT_POLICIES.forEach(policy => {
        if (!policy.validate(amount, recipient)) {
            errors.push(policy.errorMessage);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
