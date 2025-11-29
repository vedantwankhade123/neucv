import React from 'react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex items-center justify-center p-1 rounded-md bg-primary">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary-foreground">
          NEU
          <span className="ml-1 px-2 py-0.5 rounded-sm bg-background text-foreground">
            CV
          </span>
        </h1>
      </div>
    </div>
  );
};