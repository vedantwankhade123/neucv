import os

file_path = r"c:\Users\vedan\OneDrive\Desktop\My Projects\biocv-main\src\components\ResumeForm.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Check for the specific pattern:
    # resumeData,
    # apiKey
    # );
    
    if i > 0 and i < len(lines) - 1:
        prev_line = lines[i-1]
        next_line = lines[i+1]
        
        if "resumeData," in prev_line and "apiKey" in line and ");" in next_line:
            # Check if it's the generateCustomSectionContent call
            # We can check if "generateCustomSectionContent" appeared recently
            found_call = False
            for j in range(i, max(0, i-10), -1):
                if "generateCustomSectionContent" in lines[j]:
                    found_call = True
                    break
            
            if found_call:
                indent = line[:line.find("apiKey")]
                new_lines.append(f"{indent}undefined,\n")
                new_lines.append(line)
                continue

    new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("Finished processing file.")
