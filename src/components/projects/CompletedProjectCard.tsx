
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  Droplets,
  Award,
  TrendingUp,
  Info
} from 'lucide-react';

interface CompletedProject {
  id: number;
  name: string;
  type: string;
  location: string;
  region: string;
  country: string;
  completionDate: string;
  capacity?: number;
  totalInvestment?: number;
  beneficiaries?: number;
  description: string;
  achievements?: string;
  partners?: string;
  technologies?: string;
  impact?: string;
  clientCompany?: string;
  industry?: string;
  equipmentUsed?: string;
  operationalSince?: string;
  maintenancePeriod?: number;
  qualityStandards?: string;
}

interface CompletedProjectCardProps {
  project: CompletedProject;
  onViewDetails: (project: CompletedProject) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  return `$${formatNumber(amount)}`;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'water_park':
    case 'sports_facility':
      return <Users className="h-4 w-4" />;
    case 'industrial':
      return <Building className="h-4 w-4" />;
    case 'municipal':
    case 'treatment_plant':
      return <Droplets className="h-4 w-4" />;
    default:
      return <Building className="h-4 w-4" />;
  }
};

const getTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'water_park': 'Аквапарк',
    'industrial': 'Промышленность',
    'sports_facility': 'Спорт комплекс',
    'transportation': 'Транспорт',
    'government': 'Государство',
    'corporate': 'Корпоративный',
    'municipal': 'Муниципальный',
    'treatment_plant': 'Очистные сооружения'
  };
  return typeNames[type] || type;
};

const CompletedProjectCard: React.FC<CompletedProjectCardProps> = ({ 
  project, 
  onViewDetails 
}) => {
  const achievements = project.achievements ? JSON.parse(project.achievements) : [];
  const partners = project.partners ? JSON.parse(project.partners) : [];
  const impact = project.impact ? JSON.parse(project.impact) : {};
  
  const operationalYears = project.operationalSince 
    ? new Date().getFullYear() - parseInt(project.operationalSince)
    : 0;

  return (
    <Card className="glassmorphism border-primary/20 hover:border-primary/40 transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2 line-clamp-2">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="bg-primary/20 text-primary border-primary/30"
              >
                {getTypeIcon(project.type)}
                <span className="ml-1">{getTypeName(project.type)}</span>
              </Badge>
              {operationalYears > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {operationalYears} лет работы
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-white/70 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {project.location}, {project.country}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-white/80 text-sm line-clamp-3">
          {project.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {project.totalInvestment && (
            <div>
              <p className="text-white/50 text-xs">Инвестиции</p>
              <p className="font-space font-medium text-white">
                {formatCurrency(project.totalInvestment)}
              </p>
            </div>
          )}
          
          {project.beneficiaries && project.beneficiaries > 0 && (
            <div>
              <p className="text-white/50 text-xs">Пользователи</p>
              <p className="font-space font-medium text-white">
                {formatNumber(project.beneficiaries)}
              </p>
            </div>
          )}

          {project.capacity && (
            <div>
              <p className="text-white/50 text-xs">Мощность</p>
              <p className="font-space font-medium text-white">
                {formatNumber(project.capacity)} м³/д
              </p>
            </div>
          )}

          <div>
            <p className="text-white/50 text-xs">Завершен</p>
            <p className="font-space font-medium text-white">
              {new Date(project.completionDate).getFullYear()}
            </p>
          </div>
        </div>

        {achievements.length > 0 && (
          <div>
            <p className="text-white/70 text-xs mb-2">Достижения:</p>
            <div className="space-y-1">
              {achievements.slice(0, 2).map((achievement: string, index: number) => (
                <div key={index} className="flex items-start text-xs text-white/60">
                  <TrendingUp className="h-3 w-3 mr-2 mt-0.5 text-accent flex-shrink-0" />
                  <span className="line-clamp-1">{achievement}</span>
                </div>
              ))}
              {achievements.length > 2 && (
                <p className="text-xs text-white/50">
                  +{achievements.length - 2} дополнительных достижений
                </p>
              )}
            </div>
          </div>
        )}

        {partners.length > 0 && (
          <div>
            <p className="text-white/70 text-xs mb-1">Партнеры:</p>
            <p className="text-xs text-white/60 line-clamp-1">
              {partners.join(', ')}
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(project)}
          className="w-full bg-background/10 hover:bg-background/20 border-primary/30 text-white"
        >
          <Info className="h-4 w-4 mr-2" />
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompletedProjectCard;
