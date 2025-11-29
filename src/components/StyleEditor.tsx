import { ResumeStyle } from '@/types/resume';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface StyleEditorProps {
  styles: ResumeStyle;
  setStyles: (styles: ResumeStyle) => void;
  templateId: string;
}

const fontFamilies = [
  { name: 'Sans Serif', value: 'sans-serif' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'monospace' },
];

const bodyFontSizes = [
  { name: 'Small', value: '12px' },
  { name: 'Medium', value: '14px' },
  { name: 'Large', value: '16px' },
];

const headingFontSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Medium', value: '16px' },
  { name: 'Large', value: '18px' },
  { name: 'Extra Large', value: '20px' },
];

const accentColors = [
  '#2563eb', '#d97706', '#16a34a', '#db2777', '#4f46e5', '#000000',
];

const backgroundColors = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4',
  '#111827', '#1f2937', '#374151', '#4b5563',
];

const fontColors = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8',
  '#4b5563', '#374151', '#1f2937', '#111827',
];

const sectionSpacings = [
  { name: 'Compact', value: '16px' },
  { name: 'Default', value: '24px' },
  { name: 'Relaxed', value: '32px' },
];

const pageMargins = [
  { name: 'Narrow', value: '24px' },
  { name: 'Default', value: '32px' },
  { name: 'Wide', value: '40px' },
];

const twoColumnTemplates = [
  'modern',
  'creative',
  'corporate',
  'executive',
  'designer',
  'impactful',
  'vibrant'
];

import { themes } from '@/data/themes';

const StyleEditor = ({ styles, setStyles, templateId }: StyleEditorProps) => {
  const isTwoColumn = twoColumnTemplates.includes(templateId);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setStyles({ ...styles, ...theme.styles });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Theme Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => applyTheme(theme.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border hover:bg-accent transition-colors"
            >
              <div
                className="w-full h-8 rounded-md border"
                style={{ backgroundColor: theme.previewColor }}
              />
              <span className="text-xs font-medium text-center">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={styles.fontFamily}
          onValueChange={(value) => setStyles({ ...styles, fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map(font => (
              <SelectItem key={font.value} value={font.value}>{font.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Heading Font Size</Label>
        <Select
          value={styles.headingFontSize || '16px'}
          onValueChange={(value) => setStyles({ ...styles, headingFontSize: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select heading font size" />
          </SelectTrigger>
          <SelectContent>
            {headingFontSizes.map(size => (
              <SelectItem key={size.value} value={size.value}>{size.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Body Font Size</Label>
        <Select
          value={styles.fontSize}
          onValueChange={(value) => setStyles({ ...styles, fontSize: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select body font size" />
          </SelectTrigger>
          <SelectContent>
            {bodyFontSizes.map(size => (
              <SelectItem key={size.value} value={size.value}>{size.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="grid grid-cols-6 gap-2">
          {accentColors.map(color => (
            <button
              key={color}
              onClick={() => setStyles({ ...styles, accentColor: color })}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                styles.accentColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Set color to ${color}`}
            />
          ))}
        </div>
      </div>
      {isTwoColumn ? (
        <>
          <div className="space-y-2">
            <Label>Primary Background Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {backgroundColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, primaryBackgroundColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.primaryBackgroundColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set primary background color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Background Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {backgroundColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, secondaryBackgroundColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.secondaryBackgroundColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set secondary background color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Primary Font Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {fontColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, primaryFontColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.primaryFontColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set primary font color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Font Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {fontColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, secondaryFontColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.secondaryFontColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set secondary font color to ${color}`}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {backgroundColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, primaryBackgroundColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.primaryBackgroundColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set background color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Font Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {fontColors.map(color => (
                <button
                  key={color}
                  onClick={() => setStyles({ ...styles, primaryFontColor: color })}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    styles.primaryFontColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Set font color to ${color}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label>Section Spacing</Label>
        <Select
          value={styles.sectionSpacing}
          onValueChange={(value) => setStyles({ ...styles, sectionSpacing: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select spacing" />
          </SelectTrigger>
          <SelectContent>
            {sectionSpacings.map(spacing => (
              <SelectItem key={spacing.value} value={spacing.value}>{spacing.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Page Margins</Label>
        <Select
          value={styles.pageMargins}
          onValueChange={(value) => setStyles({ ...styles, pageMargins: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select margins" />
          </SelectTrigger>
          <SelectContent>
            {pageMargins.map(margin => (
              <SelectItem key={margin.value} value={margin.value}>{margin.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Line Height</Label>
        <Select
          value={styles.lineHeight || '1.5'}
          onValueChange={(value) => setStyles({ ...styles, lineHeight: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select line height" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.2">Compact</SelectItem>
            <SelectItem value="1.5">Normal</SelectItem>
            <SelectItem value="1.8">Relaxed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Section Header Style</Label>
        <Select
          value={styles.sectionHeaderStyle || 'uppercase'}
          onValueChange={(value) => setStyles({ ...styles, sectionHeaderStyle: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select header style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uppercase">Uppercase</SelectItem>
            <SelectItem value="capitalize">Capitalize</SelectItem>
            <SelectItem value="underlined">Underlined</SelectItem>
            <SelectItem value="boxed">Boxed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StyleEditor;