import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Experience, Education } from '@/types/resume';

interface ParsedResumeEditorProps {
    parsedData: {
        personalInfo: {
            name: string;
            email: string;
            phone: string;
            address: string;
            linkedin: string;
            github: string;
        };
        summary: string;
        experience: Experience[];
        education: Education[];
        skills: string[];
    };
    onSaveAndContinue: (data: any) => void;
    onBack: () => void;
}

export default function ParsedResumeEditor({ parsedData, onSaveAndContinue, onBack }: ParsedResumeEditorProps) {
    const [editedData, setEditedData] = useState(parsedData);
    const [newSkill, setNewSkill] = useState('');

    const updatePersonalInfo = (field: string, value: string) => {
        setEditedData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [field]: value
            }
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        setEditedData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setEditedData(prev => ({
            ...prev,
            education: prev.education.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !editedData.skills.includes(newSkill.trim())) {
            setEditedData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setEditedData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const missingFields = [
        !editedData.personalInfo.name && 'Name',
        !editedData.personalInfo.email && 'Email',
        editedData.experience.length === 0 && 'Work Experience',
    ].filter(Boolean);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Review & Edit Your Resume</h2>
                <p className="text-muted-foreground mt-2">
                    We've extracted the following information. Please review and make any necessary corrections.
                </p>
            </div>

            {/* Warning for missing fields */}
            {missingFields.length > 0 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900 dark:text-yellow-100">Missing Information</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                    Please add: {missingFields.join(', ')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Edit2 className="w-5 h-5 mr-2" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={editedData.personalInfo.name}
                            onChange={(e) => updatePersonalInfo('name', e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={editedData.personalInfo.email}
                            onChange={(e) => updatePersonalInfo('email', e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={editedData.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                    <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                            id="linkedin"
                            value={editedData.personalInfo.linkedin}
                            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                        />
                    </div>
                    <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                            id="github"
                            value={editedData.personalInfo.github}
                            onChange={(e) => updatePersonalInfo('github', e.target.value)}
                            placeholder="github.com/johndoe"
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="address">Location</Label>
                        <Input
                            id="address"
                            value={editedData.personalInfo.address}
                            onChange={(e) => updatePersonalInfo('address', e.target.value)}
                            placeholder="San Francisco, CA"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Edit2 className="w-5 h-5 mr-2" />
                        Professional Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={editedData.summary}
                        onChange={(e) => setEditedData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="A brief summary of your professional background..."
                        rows={4}
                    />
                </CardContent>
            </Card>

            {/* Experience */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Edit2 className="w-5 h-5 mr-2" />
                        Work Experience
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {editedData.experience.map((exp, index) => (
                        <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Role</Label>
                                    <Input
                                        value={exp.role}
                                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                        placeholder="Software Engineer"
                                    />
                                </div>
                                <div>
                                    <Label>Company</Label>
                                    <Input
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                        placeholder="Tech Corp"
                                    />
                                </div>
                                <div>
                                    <Label>Start Date</Label>
                                    <Input
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                        placeholder="Jan 2020"
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <Input
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                        placeholder="Present"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    placeholder="- Achievement 1&#10;- Achievement 2"
                                    rows={4}
                                />
                            </div>
                        </div>
                    ))}
                    {editedData.experience.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No work experience found. You can add it manually later.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Education */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Edit2 className="w-5 h-5 mr-2" />
                        Education
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editedData.education.map((edu, index) => (
                        <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Degree</Label>
                                    <Input
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        placeholder="Bachelor of Science"
                                    />
                                </div>
                                <div>
                                    <Label>Institution</Label>
                                    <Input
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                        placeholder="University Name"
                                    />
                                </div>
                                <div>
                                    <Label>Start Year</Label>
                                    <Input
                                        value={edu.startDate}
                                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                        placeholder="2016"
                                    />
                                </div>
                                <div>
                                    <Label>End Year</Label>
                                    <Input
                                        value={edu.endDate}
                                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                        placeholder="2020"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {editedData.education.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No education found. You can add it manually later.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Skills */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Edit2 className="w-5 h-5 mr-2" />
                        Skills
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            placeholder="Add a skill..."
                        />
                        <Button onClick={addSkill} variant="secondary">
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {editedData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1.5">
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="ml-2 hover:text-destructive"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                    {editedData.skills.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No skills found. Add them above.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between sticky bottom-0 bg-background py-4 border-t">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button
                    onClick={() => onSaveAndContinue(editedData)}
                    size="lg"
                    disabled={missingFields.length > 0}
                >
                    <Check className="w-4 h-4 mr-2" />
                    Continue to Template Selection
                </Button>
            </div>
        </div>
    );
}
