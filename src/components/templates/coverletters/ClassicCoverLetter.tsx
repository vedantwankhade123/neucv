import { CoverLetterData } from '@/types/coverletter';

interface ClassicCoverLetterProps {
    data: CoverLetterData;
}

export default function ClassicCoverLetter({ data }: ClassicCoverLetterProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] font-serif text-gray-900 leading-relaxed">
            {/* Header Section */}
            <div className="border-b-2 border-gray-800 pb-6 mb-8">
                <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900 uppercase">{data.sender.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                    <span>{data.sender.email}</span>
                    <span className="text-gray-300">•</span>
                    <span>{data.sender.phone}</span>
                    <span className="text-gray-300">•</span>
                    <span>{data.sender.address}</span>
                </div>
            </div>

            {/* Date */}
            <div className="mb-8">
                <p className="text-gray-700 font-medium">{data.date}</p>
            </div>

            {/* Recipient */}
            <div className="mb-10 space-y-1">
                {data.recipient.hiringManagerName && (
                    <p className="font-bold text-gray-900">{data.recipient.hiringManagerName}</p>
                )}
                <p className="font-semibold text-gray-800">{data.recipient.position}</p>
                <p className="text-gray-700">{data.recipient.companyName}</p>
                {data.recipient.address && <p className="text-gray-600">{data.recipient.address}</p>}
            </div>

            {/* Opening */}
            <div className="mb-6">
                <p className="whitespace-pre-wrap text-gray-800 text-justify">{data.content.opening}</p>
            </div>

            {/* Body */}
            <div className="mb-6 space-y-4">
                <p className="whitespace-pre-wrap text-gray-800 text-justify">{data.content.body}</p>
            </div>

            {/* Closing */}
            <div className="mb-12">
                <p className="whitespace-pre-wrap text-gray-800">{data.content.closing}</p>
            </div>

            {/* Signature */}
            <div className="mt-auto">
                <p className="font-bold text-lg text-gray-900 border-t border-gray-300 pt-4 inline-block min-w-[200px]">
                    {data.sender.name}
                </p>
            </div>
        </div>
    );
}
