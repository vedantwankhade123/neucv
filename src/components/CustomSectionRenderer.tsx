import React from 'react';
import { CustomSection } from '@/types/resume';

// Helper to parse inline formatting like **bold**
const renderInlineFormatting = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

interface CustomSectionRendererProps {
  section: CustomSection;
  className?: string;
}

const CustomSectionRenderer = ({ section, className }: CustomSectionRendererProps) => {
  if (!section) return null;

  if (section.type === 'list' && section.items) {
    return (
      <ul className={`list-disc list-inside space-y-1 leading-relaxed ${className}`}>
        {section.items.map((item) => (
          <li key={item.id}>
            {item.title && <span className="font-semibold">{item.title}: </span>}
            {renderInlineFormatting(item.description || '')}
          </li>
        ))}
      </ul>
    );
  }

  if (section.type === 'experience' && section.items) {
    return (
      <div className={`space-y-4 ${className}`}>
        {section.items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold" style={{ fontSize: 'var(--heading-font-size)' }}>{item.title}</h3>
              {(item.startDate || item.endDate) && (
                <span className="text-sm opacity-80">{item.startDate} - {item.endDate}</span>
              )}
            </div>
            {item.subtitle && <div className="font-medium opacity-90 mb-1">{item.subtitle}</div>}
            {item.description && <p className="leading-relaxed opacity-90">{renderInlineFormatting(item.description)}</p>}
          </div>
        ))}
      </div>
    );
  }

  // Default to text/markdown rendering
  const content = section.content;
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 leading-relaxed">
          {listItems.map((item, index) => (
            <li key={index}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(<h3 key={index} className="text-md font-semibold mt-3 mb-1">{renderInlineFormatting(trimmedLine.substring(2))}</h3>);
    } else if (trimmedLine.startsWith('- ')) {
      listItems.push(trimmedLine.substring(2));
    } else if (trimmedLine === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={index} className="leading-relaxed">{renderInlineFormatting(trimmedLine)}</p>);
    }
  });

  flushList();

  return <div className={className}>{elements}</div>;
};

export default CustomSectionRenderer;