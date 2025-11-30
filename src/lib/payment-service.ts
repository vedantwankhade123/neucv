import { addCredits, addTemplateCredits, updateUserPlan } from './user-service';

export interface PaymentIntent {
    amount: number;
    currency: string;
    description: string;
    metadata?: any;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

// This is a mock implementation that will be replaced by actual Razorpay/Stripe integration
export const initiatePayment = async (
    userId: string,
    intent: PaymentIntent,
    onSuccess: () => Promise<void>
): Promise<PaymentResult> => {
    console.log(`[Payment] Initiating payment for user ${userId}:`, intent);

    // Simulate API call / Payment Gateway interaction
    return new Promise((resolve) => {
        setTimeout(async () => {
            // For now, we assume payment is always successful in this mock
            // In a real app, this would open Razorpay/Stripe modal

            try {
                await onSuccess();
                console.log(`[Payment] Payment successful for user ${userId}`);
                resolve({ success: true, transactionId: 'mock_txn_' + Date.now() });
            } catch (error) {
                console.error(`[Payment] Post-payment action failed:`, error);
                resolve({ success: false, error: 'Payment processing failed' });
            }
        }, 1500);
    });
};

export const handleCreditPurchase = async (userId: string, credits: number, amount: number) => {
    return initiatePayment(
        userId,
        {
            amount,
            currency: 'INR',
            description: `Purchase of ${credits} AI Credits`
        },
        async () => {
            await addCredits(userId, credits);
        }
    );
};

export const handleTemplatePurchase = async (userId: string, templateId: string, amount: number) => {
    return initiatePayment(
        userId,
        {
            amount,
            currency: 'INR',
            description: `Purchase of Template Credit`
        },
        async () => {
            await addTemplateCredits(userId, 1);
        }
    );
};

export const handlePlanUpgrade = async (userId: string, planId: 'pro', amount: number) => {
    return initiatePayment(
        userId,
        {
            amount,
            currency: 'INR',
            description: `Upgrade to ${planId.toUpperCase()} Plan`
        },
        async () => {
            await updateUserPlan(userId, planId);
            // Bonus credits for pro plan
            if (planId === 'pro') {
                await addCredits(userId, 50);
            }
        }
    );
};
