import React from 'react';
import { Button } from '@/components/ui/button';

const CreateProposal: React.FC = () => {
  return (
    <div className="glassmorphism rounded-xl p-6 mb-6">
      <h3 className="font-space font-medium text-lg text-white mb-4">Create a Proposal</h3>
      <p className="text-white/70 text-sm mb-4">
        Have an idea to improve water resource management? Create a proposal for the DAO to vote on.
      </p>
      
      <div className="space-y-4">
        <div>
          <p className="text-white/70 text-sm mb-1">Requirements to create a proposal:</p>
          <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
            <li>Hold at least 5,000 VOD tokens</li>
            <li>Been a DAO member for at least 30 days</li>
            <li>Participated in at least 3 previous votes</li>
          </ul>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-2 rounded-lg transition-opacity hover:opacity-90 flex items-center justify-center"
        >
          <span className="material-icons mr-1">add_circle</span>
          Create New Proposal
        </Button>
      </div>
    </div>
  );
};

export default CreateProposal;
