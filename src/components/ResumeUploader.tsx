import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResumeUploaderProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export default function ResumeUploader({ onFileSelect, isProcessing }: ResumeUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ACCEPTED_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return 'Please upload a PDF or DOCX file';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 10MB';
        }
        return null;
    };

    const handleFileChange = (file: File) => {
        const error = validateFile(file);
        if (error) {
            setError(error);
            return;
        }

        setError('');
        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card
                className={`border-2 border-dashed transition-colors ${isDragging
                        ? 'border-primary bg-primary/5'
                        : error
                            ? 'border-destructive'
                            : 'border-muted-foreground/25'
                    }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="p-12">
                    {!selectedFile ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                                <Upload className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Upload Your Resume</h3>
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop your resume here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports PDF and DOCX files (max 10MB)
                                </p>
                            </div>

                            <Button
                                onClick={handleBrowseClick}
                                variant="default"
                                size="lg"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Browse Files
                                    </>
                                )}
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileInputChange}
                                className="hidden"
                                disabled={isProcessing}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                                <FileText className="w-10 h-10 text-primary" />
                                <div>
                                    <p className="font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            {!isProcessing && (
                                <Button
                                    onClick={handleRemoveFile}
                                    variant="ghost"
                                    size="icon"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {isProcessing && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing your resume...</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium">What we'll extract:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Personal information (name, email, phone)</li>
                    <li>✓ Work experience (companies, roles, descriptions)</li>
                    <li>✓ Education history</li>
                    <li>✓ Skills and competencies</li>
                    <li>✓ Professional summary</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                    Your resume is processed locally in your browser. We don't upload it to any server.
                </p>
            </div>
        </div>
    );
}
