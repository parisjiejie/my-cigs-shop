interface PaymentInfoDisplayProps {
    payerName: string;
    paymentAmount: number;
    paymentDate: string | Date;
    paymentReference: string;
    status?: string;
}

export default function PaymentInfoDisplay({ payerName, paymentAmount, paymentDate, paymentReference, status }: PaymentInfoDisplayProps) {
    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
                💳 Payment Submitted
            </h3>

            <div className="bg-white/60 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Payer Name:</span>
                    <span className="font-bold text-gray-900">{payerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Amount Transferred:</span>
                    <span className="font-bold text-green-700">${parseFloat(paymentAmount.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Date:</span>
                    <span className="font-bold text-gray-900">{formatDate(paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Reference:</span>
                    <span className="font-bold text-gray-900">{paymentReference || 'N/A'}</span>
                </div>
            </div>

            {status === 'Paid' && (
                <p className="text-green-700 text-sm mt-4">
                    Payment submitted. We will ship your order soon.
                </p>
            )}
        </div>
    );
}
