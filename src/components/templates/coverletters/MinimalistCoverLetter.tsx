import { CoverLetterData } from '@/types/coverletter';

interface MinimalistCoverLetterProps {
    data: CoverLetterData;
}

export default function MinimalistCoverLetter({ data }: MinimalistCoverLetterProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] font-sans text-gray-900">
            {/* Header */}
            <div className="mb-16 flex justify-between items-end border-b border-black pb-6">
                <div>
                    <h1 className="text-5xl font-light tracking-tighter mb-2">{data.sender.name}</h1>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">Cover Letter</p>
                </div>
                <div className="text-right text-xs font-medium text-gray-600 space-y-1">
                    <p>{data.sender.email}</p>
                    <p>{data.sender.phone}</p>
                    <p>{data.sender.address}</p>
                </div>
            </div>

            {/* Date & Recipient Grid */}
            <div className="grid grid-cols-3 gap-8 mb-16">
                <div className="col-span-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Date</p>
                    <p className="text-sm font-medium">{data.date}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">To</p>
                    <div className="space-y-0.5">
                        {data.recipient.hiringManagerName && (
                            <p className="font-bold text-lg">{data.recipient.hiringManagerName}</p>
                        )}
                        <p className="font-medium">{data.recipient.position}</p>
                        <p className="text-gray-600">{data.recipient.companyName}</p>
                        {data.recipient.address && <p className="text-gray-500 text-sm">{data.recipient.address}</p>}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl ml-auto">
                <div className="mb-8">
                    <p className="whitespace-pre-wrap text-lg font-light leading-relaxed text-gray-800">{data.content.opening}</p>
                </div>

                <div className="mb-8">
                    <p className="whitespace-pre-wrap text-base leading-loose text-gray-600 text-justify">{data.content.body}</p>
                </div>

                <div className="mb-16">
                    <p className="whitespace-pre-wrap text-lg font-light text-gray-800">{data.content.closing}</p>
                </div>

                {/* Signature */}
                <div>
                    <p className="font-medium text-xl tracking-tight">{data.sender.name}</p>
                </div>
            </div>
        </div>
    );
}
