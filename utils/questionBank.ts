import { Question } from '../types';

const questionBank: { [subject: string]: Question[] } = {
  'Biology': [
    {
      id: 'prime-bio-1',
      questionText: 'Describe the function of the mitochondria in an animal cell.',
      marks: 2,
      markScheme: 'To carry out aerobic respiration (1 mark), which releases energy for the cell (1 mark).',
      topic: 'Cell Biology',
    },
    {
      id: 'prime-bio-2',
      questionText: 'Explain the term "diffusion" and give one example of where it occurs in the human body.',
      marks: 3,
      markScheme: 'Diffusion is the net movement of particles from an area of higher concentration to an area of lower concentration (1 mark). Example: Gas exchange (oxygen/carbon dioxide) in the alveoli of the lungs (2 marks).',
      topic: 'Organisation',
    },
    {
      id: 'prime-bio-3',
      questionText: 'What are the components of blood?',
      marks: 4,
      markScheme: 'Plasma, red blood cells, white blood cells, and platelets.',
      topic: 'Organisation'
    }
  ],
  'Chemistry': [
    {
      id: 'prime-chem-1',
      questionText: 'What is the difference between an atom and an ion?',
      marks: 2,
      markScheme: 'An atom has a neutral charge with an equal number of protons and electrons (1 mark). An ion is a charged particle formed when an atom loses or gains electrons (1 mark).',
      topic: 'Atomic structure and the periodic table',
    },
    {
        id: 'prime-chem-2',
        questionText: 'Define covalent bonding.',
        marks: 2,
        markScheme: 'The strong electrostatic attraction between a shared pair of electrons (1 mark) and the nuclei of the bonded atoms (1 mark).',
        topic: 'Bonding, structure, and the properties of matter',
    },
    {
        id: 'prime-chem-3',
        questionText: 'What is produced during the complete combustion of a hydrocarbon?',
        marks: 2,
        markScheme: 'Carbon dioxide (1 mark) and water (1 mark).',
        topic: 'Organic chemistry',
    }
  ],
  'Physics': [
    {
      id: 'prime-phys-1',
      questionText: 'State the law of conservation of energy.',
      marks: 2,
      markScheme: 'Energy cannot be created or destroyed (1 mark), only transferred from one form to another (1 mark).',
      topic: 'Energy',
    },
    {
        id: 'prime-phys-2',
        questionText: 'What is the difference between a scalar and a vector quantity? Give one example of each.',
        marks: 4,
        markScheme: 'A scalar quantity has magnitude only (1 mark), e.g., speed or mass (1 mark). A vector quantity has both magnitude and direction (1 mark), e.g., velocity or force (1 mark).',
        topic: 'Forces',
    },
    {
        id: 'prime-phys-3',
        questionText: 'Define acceleration.',
        marks: 2,
        markScheme: 'Acceleration is the rate of change of velocity.',
        topic: 'Forces',
    }
  ],
};

// NEW: Generic questions for subjects without a dedicated priming bank.
export const genericPrimingQuestions: Question[] = [
  {
    id: 'generic-prime-1',
    questionText: 'This is a sample practice question while your personalized AI session is being generated.',
    marks: 1,
    markScheme: 'This is a placeholder and will be replaced by a real question shortly.',
    topic: 'Getting Started',
  },
  {
    id: 'generic-prime-2',
    questionText: 'The AI is currently selecting the best questions to target your specific learning needs...',
    marks: 1,
    markScheme: 'This is another placeholder.',
    topic: 'AI Generation in Progress',
  },
];


/**
 * Retrieves a specified number of priming questions for a given subject.
 * If no specific questions are found, it returns generic placeholders.
 * @param subject The subject to get questions for.
 * @param count The number of questions to retrieve.
 * @returns An array of Question objects.
 */
export const getPrimingQuestions = (subject: string, count: number): Question[] => {
    const availableQuestions = questionBank[subject as keyof typeof questionBank] || [];
    
    // MODIFIED: If no specific questions are found, use the generic ones.
    if (availableQuestions.length === 0) {
        return genericPrimingQuestions.slice(0, count);
    }

    // Simple shuffle and slice to get random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};