
export interface WorkExperience {
  jobTitle: string;
  company: string;
  location: string;
  dates: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
}

export interface Resume {
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface AtsResult {
  score: number;
  strengths: string;
  suggestions: string[];
}
