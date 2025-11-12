import React from 'react';
import GlassCard from '../ui/GlassCard';

interface GradeCardProps {
  grade: string | null | undefined;
  score: number | null | undefined;
  previousScore: number | null | undefined;
  targetGrade: number;
}

const GradeCard: React.FC<GradeCardProps> = ({ grade, score, previousScore, targetGrade }) => {
  const gradeValue = grade ? parseInt(grade, 10) : 0;
  const highlightClass = gradeValue >= 7 ? 'text-green-500' : 'text-amber-500';
  
  let emoji = '➡️';
  if (previousScore !== null && score !== null && score !== undefined && previousScore !== undefined) {
    if (score > previousScore) emoji = '⬆️';
    if (score < previousScore) emoji = '⬇️';
  }
  
  const isTargetMet = gradeValue >= targetGrade;

  return (
    <GlassCard className="flex flex-col items-center justify-center text-center">
      <h3 className="text-sm font-bold text-primary mb-1">Latest Grade</h3>
      <p className={`text-4xl font-bold ${highlightClass}`}>{grade || '-'}</p>
      <p className="text-xs text-secondary mt-1">
        from {score?.toFixed(0) ?? '-'}% score {emoji}
      </p>
      {isTargetMet && <p className="text-xs font-bold text-green-500 mt-1">🎯 Target Met!</p>}
    </GlassCard>
  );
};

export default GradeCard;