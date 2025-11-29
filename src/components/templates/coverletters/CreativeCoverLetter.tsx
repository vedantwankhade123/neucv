import { CoverLetterData } from '@/types/coverletter';

interface CreativeCoverLetterProps {
    data: CoverLetterData;
}

export default function CreativeCoverLetter({ data }: CreativeCoverLetterProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-gray-800 flex">
            {/* Sidebar */}
            <div className="w-[80mm] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-10 flex flex-col relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                {/* Sender Info */}
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-8 leading-tight">{data.sender.name}</h1>

                    <div className="space-y-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-70 mb-1 font-semibold">Contact</p>
                            <div className="space-y-2 text-sm font-light opacity-95">
                                <p className="break-words">{data.sender.email}</p>
                                <p>{data.sender.phone}</p>
                                <p className="leading-relaxed">{data.sender.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Lines */}
                <div className="mt-auto relative z-10">
                    <div className="w-12 h-1 bg-white/40 mb-2 rounded-full"></div>
                    <div className="w-8 h-1 bg-white/20 rounded-full"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-[20mm] relative">
                {/* Date */}
                <div className="mb-10 flex items-center gap-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <p className="text-sm font-medium text-gray-500">{data.date}</p>
                </div>

                {/* Recipient */}
                <div className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    {data.recipient.hiringManagerName && (
                        <p className="font-bold text-lg text-violet-700 mb-1">{data.recipient.hiringManagerName}</p>
                    )}
                    <p className="font-semibold text-gray-800">{data.recipient.position}</p>
                    <p className="text-gray-600">{data.recipient.companyName}</p>
                    {data.recipient.address && <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">{data.recipient.address}</p>}
                </div>

                {/* Content */}
                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div className="mb-6">
                        <p className="whitespace-pre-wrap first-letter:text-4xl first-letter:font-bold first-letter:text-violet-600 first-letter:mr-1 first-letter:float-left">
                            {data.content.opening}
                        </p>
                    </div>

                    <div className="mb-6">
                        <p className="whitespace-pre-wrap text-justify">{data.content.body}</p>
                    </div>

                    <div className="mb-12">
                        <p className="whitespace-pre-wrap font-medium">{data.content.closing}</p>
                    </div>
                </div>

                {/* Signature */}
                <div>
                    <p className="font-bold text-xl text-violet-700">{data.sender.name}</p>
                </div>
            </div>
        </div>
    );
}
