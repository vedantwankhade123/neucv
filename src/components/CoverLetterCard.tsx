import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, FileSignature, Download, Share2, Copy, Mail } from 'lucide-react';
import { CoverLetterData } from '@/types/coverletter';
import { CoverLetterPreview } from '@/components/CoverLetterPreview';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Checkbox } from '@/components/ui/checkbox';

interface CoverLetterCardProps {
    coverLetter: CoverLetterData;
    onDelete: (id: string) => void;
    onRename: (coverLetter: CoverLetterData) => void;
    onDuplicate: (id: string) => void;
    onDownload: (coverLetter: CoverLetterData, format: 'pdf' | 'png' | 'jpeg' | 'html') => void;
    className?: string;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
    onOpen?: (coverLetter: CoverLetterData) => void;
}

export const CoverLetterCard = ({ coverLetter, onDelete, onRename, onDuplicate, onDownload, className, isSelected, onSelect, onOpen }: CoverLetterCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onOpen) {
            onOpen(coverLetter);
        } else {
            navigate(`/cover-letter/${coverLetter.templateId}/${coverLetter.id}`);
        }
    };

    return (
        <Card
            className={cn(
                "group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                "border-2 hover:border-primary/50 bg-muted/50",
                isSelected && "border-primary bg-primary/5",
                className
            )}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-2 pt-3 px-3">
                <div className="flex items-start gap-3 overflow-hidden">
                    {onSelect && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelect(checked as boolean)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md flex-shrink-0">
                            <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="overflow-hidden">
                            <CardTitle className="text-sm font-semibold truncate">{coverLetter.title || 'Untitled'}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {new Date(coverLetter.lastModified).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClick}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRename(coverLetter)}>
                            <FileSignature className="mr-2 h-4 w-4" />
                            <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => onDownload(coverLetter, 'pdf')}>PDF</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownload(coverLetter, 'png')}>PNG</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownload(coverLetter, 'jpeg')}>JPG</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDownload(coverLetter, 'html')}>HTML</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem disabled>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(coverLetter.id);
                        }}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(coverLetter.id)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent
                className="relative p-2 min-h-0 flex-1 cursor-pointer"
                onClick={handleClick}
            >
                <CoverLetterPreview
                    data={coverLetter}
                    className="aspect-[210/297] w-full shadow-sm border rounded-sm overflow-hidden"
                    showHoverEffect={false}
                />
            </CardContent>
        </Card>
    );
};
