import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditTransaction } from '@/types/user';
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift } from 'lucide-react';
import { format } from 'date-fns';

interface CreditHistoryDialogProps {
    transactions: CreditTransaction[];
}

export const CreditHistoryDialog: React.FC<CreditHistoryDialogProps> = ({ transactions }) => {
    const getIcon = (type: CreditTransaction['type']) => {
        switch (type) {
            case 'usage': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            case 'purchase': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'monthly_reset': return <RefreshCw className="h-4 w-4 text-blue-500" />;
            case 'bonus': return <Gift className="h-4 w-4 text-purple-500" />;
            default: return <History className="h-4 w-4 text-slate-500" />;
        }
    };

    const getAmountColor = (amount: number) => {
        if (amount > 0) return "text-green-600 dark:text-green-400";
        if (amount < 0) return "text-red-600 dark:text-red-400";
        return "text-slate-600 dark:text-slate-400";
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    View History
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Credit History</DialogTitle>
                    <DialogDescription>
                        Recent transactions and usage details.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {transactions && transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-black rounded-full border shadow-sm">
                                            {getIcon(transaction.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{transaction.description}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {format(transaction.timestamp, 'MMM d, yyyy • h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-sm ${getAmountColor(transaction.amount)}`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No transaction history available.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
