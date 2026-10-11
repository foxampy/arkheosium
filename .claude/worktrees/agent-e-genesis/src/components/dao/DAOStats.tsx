import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DAOStatsProps {
  tvl: number;
  treasury: number;
  votingDistribution: {
    individuals: number;
    corporates: number;
    scientists: number;
    governments: number;
  };
}

const DAOStats: React.FC<DAOStatsProps> = ({ tvl, treasury, votingDistribution }) => {
  return (
    <div className="glassmorphism rounded-xl p-6 mb-6">
      <h3 className="font-space font-medium text-lg text-white mb-4">DAO Statistics</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">Total Value Locked</span>
            <span className="text-white font-medium">{tvl.toLocaleString()} VOD</span>
          </div>
          <Progress value={65} className="h-2 bg-white/10" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">Treasury Balance</span>
            <span className="text-white font-medium">{treasury.toLocaleString()} VOD</span>
          </div>
          <Progress value={42} className="h-2 bg-white/10" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">Voting Power Distribution</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mb-1">
            <div className="bg-primary h-2 rounded-l-full"></div>
            <div className="bg-blue-400 h-2"></div>
            <div className="bg-accent h-2"></div>
            <div className="bg-purple-400 h-2 rounded-r-full"></div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="text-white/70">Individuals<br/>{votingDistribution.individuals}%</div>
            <div className="text-white/70">Corporates<br/>{votingDistribution.corporates}%</div>
            <div className="text-white/70">Scientists<br/>{votingDistribution.scientists}%</div>
            <div className="text-white/70">Govs<br/>{votingDistribution.governments}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAOStats;
