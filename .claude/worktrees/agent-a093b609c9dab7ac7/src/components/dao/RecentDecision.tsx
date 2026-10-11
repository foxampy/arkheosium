import React from 'react';
import { Proposal, ProposalStatus } from '@/types';
import { formatDateRelative } from '@/lib/utils';

interface RecentDecisionProps {
  proposal: Proposal;
}

const RecentDecision: React.FC<RecentDecisionProps> = ({ proposal }) => {
  const { title, description, votesYes, votesNo, quorum, status, endDate } = proposal;
  
  const getBorderColorClass = (status: ProposalStatus): string => {
    switch (status) {
      case ProposalStatus.PASSED:
        return 'border-primary';
      case ProposalStatus.FAILED:
        return 'border-accent';
      default:
        return 'border-yellow-400';
    }
  };

  const getStatusBgClass = (status: ProposalStatus): string => {
    switch (status) {
      case ProposalStatus.PASSED:
        return 'bg-primary/20 text-primary';
      case ProposalStatus.FAILED:
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-yellow-400/20 text-yellow-400';
    }
  };
  
  // Calculate percentages
  const totalVotes = votesYes + votesNo;
  const yesPercent = Math.round((votesYes / totalVotes) * 100) || 0;
  const noPercent = Math.round((votesNo / totalVotes) * 100) || 0;
  
  return (
    <div className={`bg-background/30 rounded-lg p-4 border-l-4 ${getBorderColorClass(status)}`}>
      <div className="flex justify-between mb-1">
        <h4 className="font-space font-medium text-white">{title}</h4>
        <span className={`${getStatusBgClass(status)} text-xs px-2 py-1 rounded-md`}>
          {status}
        </span>
      </div>
      <p className="text-white/70 text-sm mb-3">
        {description}
      </p>
      <div className="flex justify-between text-xs text-white/50">
        <span>{formatDateRelative(endDate)}</span>
        <span>Yes: {yesPercent}% | No: {noPercent}% | Quorum: {quorum}%</span>
      </div>
    </div>
  );
};

export default RecentDecision;
