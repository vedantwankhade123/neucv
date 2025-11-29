import { CoverLetterData } from '@/types/coverletter';

interface ModernCoverLetterProps {
    data: CoverLetterData;
}

export default function ModernCoverLetter({ data }: ModernCoverLetterProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800 relative overflow-hidden">
            {/* Geometric Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-0" />

            {/* Header */}
            <div className="bg-slate-900 text-white p-[20mm] pb-12 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 tracking-tight">{data.sender.name}</h1>
                        <p className="text-slate-400 text-lg font-light">Professional Portfolio</p>
                    </div>
                    <div className="text-right text-sm space-y-1 text-slate-300 font-light">
                        <p>{data.sender.email}</p>
                        <p>{data.sender.phone}</p>
                        <p>{data.sender.address}</p>
                    </div>
                </div>
            </div>

            <div className="px-[20mm] -mt-6 relative z-20">
                <div className="bg-blue-600 h-2 w-32 rounded-full shadow-md mb-12"></div>

                {/* Date */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{data.date}</p>
                </div>

                {/* Recipient */}
                <div className="mb-10 pl-6 border-l-4 border-slate-200">
                    {data.recipient.hiringManagerName && (
                        <p className="font-bold text-xl text-slate-900">{data.recipient.hiringManagerName}</p>
                    )}
                    <p className="font-semibold text-slate-700 text-lg">{data.recipient.position}</p>
                    <p className="text-slate-600 font-medium">{data.recipient.companyName}</p>
                    {data.recipient.address && <p className="text-slate-500 text-sm mt-1">{data.recipient.address}</p>}
                </div>

                {/* Content */}
                <div className="space-y-6 text-slate-700 leading-relaxed">
                    <div className="mb-6">
                        <p className="whitespace-pre-wrap font-medium text-slate-800">{data.content.opening}</p>
                    </div>

                    <div className="mb-6">
                        <p className="whitespace-pre-wrap text-justify">{data.content.body}</p>
                    </div>

                    <div className="mb-12">
                        <p className="whitespace-pre-wrap font-medium text-slate-800">{data.content.closing}</p>
                    </div>
                </div>

                {/* Signature */}
                <div className="mt-12">
                    <p className="text-2xl font-signature text-blue-700 mb-2">{data.sender.name}</p>
                    <p className="font-bold text-slate-900 uppercase tracking-wider text-sm">{data.sender.name}</p>
                </div>
            </div>
        </div>
    );
}
