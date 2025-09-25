
import { GoogleGenAI, Type } from "@google/genai";
import type { Resume, AtsResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        phone: { type: Type.STRING },
        email: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        portfolio: { type: Type.STRING },
      },
      required: ['name', 'email']
    },
    summary: { type: Type.STRING },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          dates: { type: Type.STRING },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['jobTitle', 'company', 'dates', 'responsibilities']
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          location: { type: Type.STRING },
          graduationDate: { type: Type.STRING },
        },
        required: ['degree', 'institution', 'graduationDate']
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['contactInfo', 'summary', 'workExperience', 'education', 'skills']
};


export const parseResumeText = async (resumeText: string): Promise<Resume> => {
    const prompt = `Parse the following resume text and extract the information into the specified JSON format. Make sure to accurately capture all sections. If a piece of information like a portfolio URL is missing, return an empty string for that field.

Resume Text:
---
${resumeText}
---`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
            thinkingConfig: { thinkingBudget: 0 }, // Optimize for lower latency
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Resume;
};


export const enhanceResume = async (resume: Resume): Promise<Resume> => {
    const prompt = `Given the following resume in JSON format, enhance it to be more ATS-friendly. Focus on using strong action verbs, quantifying achievements where possible, and ensuring clear, standard phrasing. Rephrase responsibilities to highlight impact and results. Do not add any new information or skills. Return the enhanced resume in the exact same JSON format.

Resume JSON:
---
${JSON.stringify(resume, null, 2)}
---`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Resume;
};


export const modifyResumeWithPrompt = async (resume: Resume, userPrompt: string): Promise<Resume> => {
    const prompt = `Given the following resume in JSON format, apply the following modification requested by the user. Adhere strictly to the user's request. Return the modified resume in the exact same JSON format.

User's Request: "${userPrompt}"

Resume JSON:
---
${JSON.stringify(resume, null, 2)}
---`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Resume;
};


export const checkAtsScore = async (resume: Resume, jobDescription: string): Promise<AtsResult> => {
    const prompt = `Act as an advanced Applicant Tracking System (ATS) and resume expert. Analyze the following resume (in JSON format) against the provided job description. 
    Provide a score out of 100 representing the match quality. 
    Also, provide a brief summary of the resume's strengths for this role, and a list of specific, actionable suggestions for improvement to better align with the job description.

The output must be a JSON object with keys: "score" (number), "strengths" (string), and "suggestions" (an array of strings).

Job Description:
---
${jobDescription}
---

Resume JSON:
---
${JSON.stringify(resume, null, 2)}
---`;

    const atsSchema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.INTEGER, description: "A score from 0 to 100." },
            strengths: { type: Type.STRING, description: "A paragraph summarizing the resume's strengths." },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of actionable suggestions." },
        },
        required: ['score', 'strengths', 'suggestions']
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: atsSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AtsResult;
};