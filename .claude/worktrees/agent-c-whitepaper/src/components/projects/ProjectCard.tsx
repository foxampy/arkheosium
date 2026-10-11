import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onInvest: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onInvest }) => {
  return (
    <div className="glassmorphism rounded-xl overflow-hidden relative hex-border">
      <div className="h-48 bg-gradient-to-b from-background/50 to-background/50 relative">
        {project.imageUrl && (
          <img 
            src={project.imageUrl} 
            alt={project.name} 
            className="w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute top-4 right-4 bg-accent/90 text-white font-space font-bold px-3 py-1 rounded-full text-xs">
          {project.irr}% IRR
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-space font-bold text-lg text-white mb-2">{project.name}</h3>
        <p className="text-white/70 text-sm mb-4">{project.region}, {project.country}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-white/50 text-xs">Total Funding</p>
            <p className="font-space font-medium text-white">
              {formatCurrency(project.totalFunding)}
            </p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Available for DAO</p>
            <p className="font-space font-medium text-accent">
              {formatCurrency(project.availableForDAO)}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/70">Funding Progress</span>
            <span className="text-white">{project.fundingProgress}%</span>
          </div>
          <Progress value={project.fundingProgress} className="h-2 bg-white/10" />
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/80 text-background font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
          onClick={() => onInvest(project)}
        >
          <span className="material-icons mr-1 text-sm">add_circle</span>
          Invest Now
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
