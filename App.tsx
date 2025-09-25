import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import Header from './components/Header';
import ResumeDisplay from './components/ResumeDisplay';
import ScoreModal from './components/ScoreModal';
import LoadingSpinner from './components/LoadingSpinner';
import type { Resume, AtsResult } from './types';
import { parseResumeText, enhanceResume, modifyResumeWithPrompt, checkAtsScore } from './services/geminiService';

const App: React.FC = () => {
    const [rawResume, setRawResume] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [modificationPrompt, setModificationPrompt] = useState<string>('');
    
    const [structuredResume, setStructuredResume] = useState<Resume | null>(null);
    const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
    
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleApiCall = useCallback(async <T,>(apiCall: () => Promise<T>, successCallback: (result: T) => void, loadingMsg: string) => {
        setLoadingMessage(loadingMsg);
        setError('');
        try {
            const result = await apiCall();
            successCallback(result);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to process request. Please try again. Error: ${errorMessage}`);
        } finally {
            setLoadingMessage('');
        }
    }, []);

    const handleParse = useCallback(() => {
        if (!rawResume) {
            setError('Please paste your resume text first.');
            return;
        }
        handleApiCall(() => parseResumeText(rawResume), setStructuredResume, 'Parsing Resume...');
    }, [rawResume, handleApiCall]);

    const handleEnhance = useCallback(() => {
        if (!structuredResume) {
            setError('Please parse your resume first.');
            return;
        }
        handleApiCall(() => enhanceResume(structuredResume), setStructuredResume, 'Enhancing Resume...');
    }, [structuredResume, handleApiCall]);
    
    const handleModify = useCallback(() => {
        if (!structuredResume) {
            setError('Please parse your resume first.');
            return;
        }
        if (!modificationPrompt) {
            setError('Please enter a modification prompt.');
            return;
        }
        handleApiCall(() => modifyResumeWithPrompt(structuredResume, modificationPrompt), setStructuredResume, 'Applying Changes...');
    }, [structuredResume, modificationPrompt, handleApiCall]);

    const handleCheckScore = useCallback(() => {
        if (!structuredResume) {
            setError('Please parse your resume first.');
            return;
        }
        if (!jobDescription) {
            setError('Please paste the job description first.');
            return;
        }
        handleApiCall(() => checkAtsScore(structuredResume, jobDescription), setAtsResult, 'Checking ATS Score...');
    }, [structuredResume, jobDescription, handleApiCall]);

    const handleExportPdf = useCallback(() => {
        if (!structuredResume) {
            setError('No resume data available to export.');
            return;
        }

        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            const { contactInfo, summary, workExperience, education, skills } = structuredResume;

            const margin = 40;
            const pageHeight = doc.internal.pageSize.getHeight();
            const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
            let y = margin;

            const checkPageBreak = (spaceNeeded: number) => {
                if (y + spaceNeeded > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
            };

            // Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text(contactInfo.name, margin, y);
            y += 28;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const contactLine = [contactInfo.phone, contactInfo.email, contactInfo.linkedin, contactInfo.portfolio].filter(Boolean).join(' | ');
            doc.text(contactLine, margin, y);
            y += 30;

            // Summary
            checkPageBreak(50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Summary', margin, y);
            y += 5;
            doc.setLineWidth(1);
            doc.line(margin, y, usableWidth + margin, y);
            y += 15;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const summaryLines = doc.splitTextToSize(summary, usableWidth);
            doc.text(summaryLines, margin, y);
            y += summaryLines.length * 12 + 10;

            // Work Experience
            checkPageBreak(50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Work Experience', margin, y);
            y += 5;
            doc.line(margin, y, usableWidth + margin, y);
            y += 15;
            workExperience.forEach(exp => {
                checkPageBreak(60);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(exp.jobTitle, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(exp.dates, usableWidth + margin, y, { align: 'right' });
                y += 14;

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                doc.text(exp.company, margin, y);
                doc.text(exp.location, usableWidth + margin, y, { align: 'right' });
                y += 14;

                doc.setFont('helvetica', 'normal');
                exp.responsibilities.forEach(resp => {
                    const respLines = doc.splitTextToSize(resp, usableWidth - 15);
                    checkPageBreak(respLines.length * 12);
                    doc.text('•', margin + 5, y);
                    doc.text(respLines, margin + 15, y);
                    y += respLines.length * 12;
                });
                y += 10;
            });

            // Education
            checkPageBreak(50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Education', margin, y);
            y += 5;
            doc.line(margin, y, usableWidth + margin, y);
            y += 15;
            education.forEach(edu => {
                checkPageBreak(40);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(edu.degree, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(edu.graduationDate, usableWidth + margin, y, { align: 'right' });
                y += 14;
                
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                doc.text(edu.institution, margin, y);
                doc.text(edu.location, usableWidth + margin, y, { align: 'right' });
                y += 20;
            });

            // Skills
            checkPageBreak(50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Skills', margin, y);
            y += 5;
            doc.line(margin, y, usableWidth + margin, y);
            y += 15;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const skillsText = skills.join(', ');
            const skillsLines = doc.splitTextToSize(skillsText, usableWidth);
            doc.text(skillsLines, margin, y);

            const fileName = `${contactInfo.name.replace(/\s/g, '_')}_Resume.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate PDF. Error: ${errorMessage}`);
        }
    }, [structuredResume]);


    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
                    
                    {/* Column 1: Inputs */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm flex-grow flex flex-col">
                            <label htmlFor="resume-text" className="block text-sm font-medium text-slate-700 mb-2">
                                1. Paste Your Resume
                            </label>
                            <textarea
                                id="resume-text"
                                value={rawResume}
                                onChange={(e) => setRawResume(e.target.value)}
                                placeholder="Paste the full text of your resume here..."
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm flex-grow p-2"
                            />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm flex-grow flex flex-col">
                             <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 mb-2">
                                2. Paste Job Description (for ATS score)
                            </label>
                            <textarea
                                id="job-description"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to check your ATS score..."
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm flex-grow p-2"
                            />
                        </div>
                    </div>

                    {/* Column 2: AI Actions */}
                    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4 relative">
                        {loadingMessage && <LoadingSpinner message={loadingMessage} />}
                        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">AI Toolkit</h2>
                        
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>}

                        <button onClick={handleParse} disabled={!!loadingMessage || !rawResume} className="w-full text-left p-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-300 transition-colors">
                            <strong>Parse & Structure Resume</strong>
                            <p className="text-xs text-slate-200">Convert your raw text into a structured resume.</p>
                        </button>
                        
                        <button onClick={handleEnhance} disabled={!!loadingMessage || !structuredResume} className="w-full text-left p-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-300 transition-colors">
                            <strong>Auto-Enhance for ATS</strong>
                            <p className="text-xs text-slate-200">Improve wording and formatting automatically.</p>
                        </button>

                         <div className="space-y-2">
                            <input
                                type="text"
                                value={modificationPrompt}
                                onChange={(e) => setModificationPrompt(e.target.value)}
                                placeholder="e.g., Make my experience sound more technical"
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm p-2"
                            />
                            <button onClick={handleModify} disabled={!!loadingMessage || !structuredResume || !modificationPrompt} className="w-full p-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:bg-slate-300 transition-colors">
                                <strong>Modify with Prompt</strong>
                            </button>
                        </div>
                        
                        <div className="border-t pt-4 mt-auto space-y-2">
                            <button onClick={handleCheckScore} disabled={!!loadingMessage || !structuredResume || !jobDescription} className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 transition-colors">
                                <strong>Check ATS Score</strong>
                            </button>
                            <button onClick={handleExportPdf} disabled={!!loadingMessage || !structuredResume} className="w-full p-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-slate-300 transition-colors">
                                <strong>Export as PDF</strong>
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Output */}
                    <div className="lg:col-span-1 md:col-span-2">
                        <ResumeDisplay resume={structuredResume} />
                    </div>

                </div>
            </main>
            <ScoreModal result={atsResult} onClose={() => setAtsResult(null)} />
        </div>
    );
};

export default App;