
import React from 'react';
import type { Resume } from '../types';

interface ResumeDisplayProps {
  resume: Resume | null;
}

const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ resume }) => {
  if (!resume) {
    return (
      <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Your Structured Resume</h3>
            <p className="mt-1 text-sm text-slate-500">Paste your resume and click "Parse" to see it here.</p>
        </div>
      </div>
    );
  }

  const { contactInfo, summary, workExperience, education, skills } = resume;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold text-slate-800">{contactInfo.name}</h1>
        <div className="text-sm text-slate-600 flex justify-center items-center gap-x-4 gap-y-1 flex-wrap mt-2">
            {contactInfo.phone && <span>{contactInfo.phone}</span>}
            {contactInfo.phone && <span>&bull;</span>}
            <span>{contactInfo.email}</span>
            {contactInfo.linkedin && <span>&bull;</span>}
            {contactInfo.linkedin && <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contactInfo.linkedin}</a>}
            {contactInfo.portfolio && <span>&bull;</span>}
            {contactInfo.portfolio && <a href={contactInfo.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contactInfo.portfolio}</a>}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">Summary</h2>
        <p className="text-slate-600 text-sm">{summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">Work Experience</h2>
        {workExperience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold text-slate-800">{exp.jobTitle}</h3>
                <span className="text-sm font-medium text-slate-500">{exp.dates}</span>
            </div>
            <div className="flex justify-between items-baseline">
                <h4 className="text-md font-semibold text-slate-600">{exp.company}</h4>
                <span className="text-sm text-slate-500">{exp.location}</span>
            </div>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {exp.responsibilities.map((resp, i) => (
                <li key={i} className="text-sm text-slate-600">{resp}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-2">
             <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold text-slate-800">{edu.degree}</h3>
                <span className="text-sm font-medium text-slate-500">{edu.graduationDate}</span>
            </div>
            <div className="flex justify-between items-baseline">
                <h4 className="text-md font-semibold text-slate-600">{edu.institution}</h4>
                <span className="text-sm text-slate-500">{edu.location}</span>
            </div>
          </div>
        ))}
      </div>

       <div>
        <h2 className="text-xl font-semibold text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
                <span key={index} className="bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
            ))}
        </div>
      </div>

    </div>
  );
};

export default ResumeDisplay;
