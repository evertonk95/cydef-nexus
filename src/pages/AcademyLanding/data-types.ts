// Shared content shapes for the Academy landing (PT canonical in data.ts;
// EN/ES editorial translations in data.en.ts / data.es.ts).

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  topics: string[];
}

export interface StepItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
