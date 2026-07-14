import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Proposal } from '@/types';
import { getRemainingTime } from '@/lib/utils';

interface ActiveProposalProps {
  proposal: Proposal;
  onVoteYes: (proposalId: number) => void;
  onVoteNo: (proposalId: number) => void;
  onInfo: (proposalId: number) => void;
}

const ActiveProposal: React.FC<ActiveProposalProps> = ({ 
  proposal, 
  onVoteYes, 
  onVoteNo, 
  onInfo 
}) => {
  const { id, title, description, votesYes, votesNo, quorum, requiredQuorum, endDate } = proposal;
  
  // Calculate percentages
  const yesPercent = Math.round((votesYes / (votesYes + votesNo)) * 100) || 0;
  const noPercent = Math.round((votesNo / (votesYes + votesNo)) * 100) || 0;
  
  return (
    <div className="bg-background/50 rounded-lg p-5">
      <h4 className="font-space font-medium text-white text-lg mb-2">{title}</h4>
      <p className="text-white/70 text-sm mb-4">
        {description}
      </p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/70">
            Voting ends in: <span className="text-primary">{getRemainingTime(endDate)}</span>
          </span>
          <span className="text-white">Quorum: {quorum}% / {requiredQuorum}%</span>
        </div>
        <Progress
          value={quorum}
          max={requiredQuorum}
          className="h-3 bg-white/10 mb-3"
        />
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-primary">Yes</span>
              <span className="text-white">{yesPercent}%</span>
            </div>
            <Progress value={yesPercent} className="h-2 bg-white/10" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-accent">No</span>
              <span className="text-white">{noPercent}%</span>
            </div>
            <Progress value={noPercent} className="h-2 bg-white/10" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between space-x-3">
        <Button 
          className="flex-1 bg-primary hover:bg-primary/80 text-background font-medium py-2 rounded-lg transition-colors"
          onClick={() => onVoteYes(id)}
        >
          Vote Yes
        </Button>
        <Button
          variant="outline" 
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-colors"
          onClick={() => onVoteNo(id)}
        >
          Vote No
        </Button>
        <Button 
          variant="outline"
          className="flex-none bg-white/10 hover:bg-white/20 text-white font-medium p-2 rounded-lg transition-colors"
          onClick={() => onInfo(id)}
        >
          <span className="material-icons">info</span>
        </Button>
      </div>
    </div>
  );
};

export default ActiveProposal;
