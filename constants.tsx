import React from 'react';
import { DailyPlan } from './types';

export const ICONS = {
  zap: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
  barChart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  bookmark: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.591 2.571-1.82m-2.571 1.82a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7.5 4.5a4.5 4.5 0 0 1 9 0M18.75 10.5a3.375 3.375 0 0 0-3.375-3.375V18.75a3.375 3.375 0 0 0 3.375-3.375Z" /></svg>,
  layers: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19A7.5 7.5 0 0 1 12 3v1.5a6 6 0 0 0-5.223 2.943L6.115 5.19Zm-.225 6.495a7.5 7.5 0 0 1 0-2.19c.148.06.292.127.44.195l-.215 1.995Zm-.495 4.493a7.5 7.5 0 0 1-.418-2.31c.243.09.484.187.727.284l-.309 2.026Zm12.115-4.493c.148-.06.292-.127.44-.195a7.5 7.5 0 0 0 0-2.19l-.215 1.995Zm.495 4.493-.309-2.026c.243-.09.484-.187.727-.284a7.5 7.5 0 0 0-.418-2.31Zm-4.113-1.096a6 6 0 0 0 5.223-2.943L18.115 5.19A7.5 7.5 0 0 1 12 3v1.5a6 6 0 0 0-5.223 2.943L6.115 5.19Zm-1.88 1.812a5.965 5.965 0 0 1-2.148-2.026l1.02-1.02a4.5 4.5 0 0 0 5.01 5.01l-1.02 1.02a5.965 5.965 0 0 1-2.026-2.148Zm4.256.026a5.965 5.965 0 0 1-2.148 2.026l1.02 1.02a4.5 4.5 0 0 0 5.01-5.01l-1.02-1.02a5.965 5.965 0 0 1-2.026 2.148Z" /></svg>,
  save: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>,
  saved: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>,
  lightning: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
  lightbulb: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-4.5c0-3.314-2.686-6-6-6S1.5 4.936 1.5 8.25a6.01 6.01 0 0 0 1.5 4.5m0-4.5h18" /></svg>,
  tutor: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  academicCap: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-6-3h12" /></svg>,
  link: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>,
  book: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>,
  chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.25A2.25 2.25 0 0 0 18 3H6A2.25 2.25 0 0 0 3.75 5.25v12.75A2.25 2.25 0 0 0 6 20.25Z" /></svg>,
  server: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m15.459 0a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25m15 0c0-1.657-1.343-3-3-3s-3 1.343-3 3m0 0c0-1.657-1.343-3-3-3s-3 1.343-3 3m-3 0c0-1.657-1.343-3-3-3s-3 1.343-3 3" /></svg>,
  desktop: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>,
  flag: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>,
};


export const TOPICS = {
  'AQA': {
    'Biology': {
      'Paper 1': [
        "Cell Biology",
        "Organisation",
        "Infection and response",
        "Bioenergetics"
      ],
      'Paper 2': [
        "Homeostasis and response",
        "Inheritance, variation and evolution",
        "Ecology"
      ]
    },
    'Chemistry': {
      'Paper 1': [
        "Atomic structure and the periodic table",
        "Bonding, structure, and the properties of matter",
        "Quantitative chemistry",
        "Chemical changes",
        "Energy changes"
      ],
      'Paper 2': [
        "The rate and extent of chemical change",
        "Organic chemistry",
        "Chemical analysis",
        "Chemistry of the atmosphere",
        "Using resources"
      ]
    },
    'Physics': {
        'Paper 1': [
            "Energy",
            "Electricity",
            "Particle model of matter",
            "Atomic structure"
        ],
        'Paper 2': [
            "Forces",
            "Waves",
            "Magnetism and electromagnetism",
            "Space physics"
        ]
    }
  }
};

export const SUBJECT_DATA = [
    { id: 'maths', name: 'Maths', icon: '➕', color: '#4E9FFF' },
    { id: 'english_lang', name: 'English Language', icon: '✍️', color: '#62F5A5' },
    { id: 'english_lit', name: 'English Literature', icon: '📖', color: '#50E3C2' },
    { id: 'biology', name: 'Biology', icon: '🧬', color: '#4CFFB0' },
    { id: 'chemistry', name: 'Chemistry', icon: '⚗️', color: '#C55FFF' },
    { id: 'physics', name: 'Physics', icon: '🔭', color: '#9F7BFF' },
    { id: 'history', name: 'History', icon: '🏺', color: '#FFB347' },
    { id: 'geography', name: 'Geography', icon: '🌍', color: '#7AD7F0' },
    { id: 'religious_studies', name: 'Religious Studies', icon: '🕊️', color: '#FFD66B' },
    { id: 'computer_science', name: 'Computer Science', icon: '💻', color: '#00E5FF' },
    { id: 'french', name: 'French', icon: '🇫🇷', color: '#FF6B6B' },
    { id: 'spanish', name: 'Spanish', icon: '🇪🇸', color: '#FF924C' },
    { id: 'german', name: 'German', icon: '🇩🇪', color: '#FAD02E' },
    { id: 'art_design', name: 'Art & Design', icon: '🎨', color: '#FF85B3' },
    { id: 'music', name: 'Music', icon: '🎵', color: '#A9A9FF' },
    { id: 'drama', name: 'Drama', icon: '🎭', color: '#E370FF' },
    { id: 'pe', name: 'PE', icon: '🏃‍♂️', color: '#62F5A5' },
    { id: 'business', name: 'Business Studies', icon: '💼', color: '#7AD7F0' },
    { id: 'economics', name: 'Economics', icon: '💹', color: '#B8FF6B' },
    { id: 'dt', name: 'Design & Technology', icon: '🛠️', color: '#FFD66B' },
];

export const EXAM_BOARD_DATA = [
    { id: 'AQA', name: 'AQA', icon: '📘', color: '#4E9FFF', tooltip: 'Most popular GCSE board — structured, clear questions.' },
    { id: 'Edexcel', name: 'Edexcel', icon: '📗', color: '#62F5A5', tooltip: 'Focuses on application and understanding.' },
    { id: 'OCR', name: 'OCR', icon: '📕', color: '#C55FFF', tooltip: 'Balanced papers — reasoning and explanation heavy.' },
    { id: 'WJEC', name: 'WJEC', icon: '📙', color: '#FFB347', tooltip: 'Used mainly in Wales — clear layout, logical mark schemes.' },
    { id: 'CCEA', name: 'CCEA', icon: '📒', color: '#7AD7F0', tooltip: 'Northern Ireland exam board — concise question style.' },
];

export const MOCK_PLAN_TEMPLATE: DailyPlan[] = [
  { day: 'Mon', date: 1, sessions: [
    { subject: 'Maths', duration: 45, color: 'blue', objective: 'Master algebraic fractions', tip: 'Start by factorising the numerator and denominator.' },
    { subject: 'Biology', duration: 30, color: 'magenta', objective: 'Review flashcards on cell structures', tip: 'Focus on the function of ribosomes and mitochondria.' }
  ]},
  { day: 'Tue', date: 2, sessions: [
    { subject: 'English', duration: 30, color: 'green', objective: 'Plan essay for "An Inspector Calls"', tip: 'Create a mind map of key themes like social responsibility.' },
    { subject: 'Maths', duration: 30, color: 'blue', objective: 'Practice trigonometry problems (SOH CAH TOA)', tip: 'Draw diagrams for each problem to visualise the triangle.' }
  ]},
  { day: 'Wed', date: 3, sessions: [
    { subject: 'Biology', duration: 45, color: 'magenta', objective: 'Past paper questions on photosynthesis', tip: 'Remember the balanced chemical equation for photosynthesis.' },
    { subject: 'English', duration: 30, color: 'green', objective: 'Read and annotate unseen poetry', tip: 'Look for examples of metaphor and simile.' }
  ]},
  { day: 'Thu', date: 4, sessions: [
    { subject: 'Maths', duration: 60, color: 'blue', objective: 'Complete a full mock paper section on algebra', tip: 'Manage your time carefully, allowing about a minute per mark.' },
    { subject: 'Biology', duration: 30, color: 'magenta', objective: 'Create a summary sheet for homeostasis', tip: 'Include diagrams of the skin and kidneys.' }
  ]},
  { day: 'Fri', date: 5, sessions: [
    { subject: 'English', duration: 45, color: 'green', objective: 'Write the introduction and first paragraph of your essay', tip: 'Your introduction should clearly state your main argument.' },
    { subject: 'Rest', duration: 0, color: 'default', objective: '', tip: ''}
  ]},
  { day: 'Sat', date: 6, sessions: [
    { subject: 'Maths', duration: 45, color: 'blue', objective: 'Review mistakes from Thursday\'s mock paper', tip: 'For each mistake, write down why you made it and the correct method.' },
    { subject: 'Biology', duration: 45, color: 'magenta', objective: 'Watch a video on the nervous system', tip: 'Pay close attention to the structure of a synapse.' }
  ]},
  { day: 'Sun', date: 7, sessions: [
    { subject: 'Review', duration: 60, color: 'amber', objective: 'Go over all saved questions from the week', tip: 'Can you answer them correctly now without looking at the notes?' }
  ]},
];
