import React from 'react';
import { Loader2 } from 'lucide-react';

interface EditorLoadingProps {
  message?: string;
}

export function EditorLoading({ message = "Loading..." }: EditorLoadingProps) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

