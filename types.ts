import { ReactNode } from 'react';

export interface UserData {
  name: string;
  role: string;
  lastUpdate?: string;
  progress?: Record<string, boolean | number>;
}

export interface ProgressData {
  [key: string]: boolean | number | undefined;
  examenCompleted?: boolean;
  examenPassed?: boolean;
  examenScore?: number;
}

export interface Step {
  title: string;
  text: string;
  icon: ReactNode;
  interactiveComponent?: 'RcpGame' | 'BotiquinGame' | 'HeimlichGame';
}

export interface ModuleContent {
  videoUrls?: string[];
  steps: Step[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'module' | 'exam' | 'desa' | 'glossary' | 'certificate';
  content?: ModuleContent;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
}

export interface UserSummary extends UserData {
    id: string;
}