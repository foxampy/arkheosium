
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building, 
  Droplets,
  Award,
  TrendingUp,
  Wrench,
  Target,
  CheckCircle,
  Factory
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

interface CompletedProjectDetailsProps {
  project: CompletedProject | null;
  isOpen: boolean;
  onClose: () => void;
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

const CompletedProjectDetails: React.FC<CompletedProjectDetailsProps> = ({
  project,
  isOpen,
  onClose
}) => {
  if (!project) return null;

  const achievements = project.achievements ? JSON.parse(project.achievements) : [];
  const partners = project.partners ? JSON.parse(project.partners) : [];
  const technologies = project.technologies ? JSON.parse(project.technologies) : [];
  const impact = project.impact ? JSON.parse(project.impact) : {};
  const equipmentUsed = project.equipmentUsed ? JSON.parse(project.equipmentUsed) : [];
  const qualityStandards = project.qualityStandards ? JSON.parse(project.qualityStandards) : [];
  
  const operationalYears = project.operationalSince 
    ? new Date().getFullYear() - parseInt(project.operationalSince)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glassmorphism border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-white text-xl mb-4">
            {project.name}
          </DialogTitle>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {project.industry || 'Промышленность'}
            </Badge>
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              {project.location}, {project.country}
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Завершен: {new Date(project.completionDate).getFullYear()}
            </Badge>
            {operationalYears > 0 && (
              <Badge variant="outline" className="text-accent">
                <Award className="h-3 w-3 mr-1" />
                {operationalYears} лет работы
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Описание */}
          <Card className="glassmorphism-dark border-primary/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Описание проекта</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">{project.description}</p>
            </CardContent>
          </Card>

          {/* Ключевые показатели */}
          <Card className="glassmorphism-dark border-primary/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Ключевые показатели</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.totalInvestment && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(project.totalInvestment)}
                    </div>
                    <div className="text-sm text-white/60">Общие инвестиции</div>
                  </div>
                )}
                
                {project.beneficiaries && project.beneficiaries > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {formatNumber(project.beneficiaries)}
                    </div>
                    <div className="text-sm text-white/60">Пользователей</div>
                  </div>
                )}

                {project.capacity && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {formatNumber(project.capacity)}
                    </div>
                    <div className="text-sm text-white/60">м³/день</div>
                  </div>
                )}

                {project.maintenancePeriod && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {project.maintenancePeriod}
                    </div>
                    <div className="text-sm text-white/60">лет службы</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Достижения */}
          {achievements.length > 0 && (
            <Card className="glassmorphism-dark border-primary/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  Достижения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-3 mt-1 text-accent flex-shrink-0" />
                      <span className="text-white/80">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Технологии и оборудование */}
          <div className="grid md:grid-cols-2 gap-6">
            {technologies.length > 0 && (
              <Card className="glassmorphism-dark border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-blue-400" />
                    Технологии
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {technologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {equipmentUsed.length > 0 && (
              <Card className="glassmorphism-dark border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Factory className="h-5 w-5 mr-2 text-purple-400" />
                    Оборудование
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {equipmentUsed.map((equipment: string, index: number) => (
                      <div key={index} className="flex items-center text-white/80">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                        {equipment}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Партнеры и стандарты */}
          <div className="grid md:grid-cols-2 gap-6">
            {partners.length > 0 && (
              <Card className="glassmorphism-dark border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-400" />
                    Партнеры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {partners.map((partner: string, index: number) => (
                      <div key={index} className="flex items-center text-white/80">
                        <Building className="h-4 w-4 mr-3 text-green-400" />
                        {partner}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {qualityStandards.length > 0 && (
              <Card className="glassmorphism-dark border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2 text-yellow-400" />
                    Стандарты качества
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {qualityStandards.map((standard: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2 border-yellow-400 text-yellow-400">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Информация о клиенте */}
          {project.clientCompany && (
            <Card className="glassmorphism-dark border-primary/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Информация о клиенте</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{project.clientCompany}</p>
                    <p className="text-white/60">{project.industry}</p>
                  </div>
                  {project.operationalSince && (
                    <div className="text-right">
                      <p className="text-white/60 text-sm">Запущен в</p>
                      <p className="text-white font-medium">{project.operationalSince} году</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedProjectDetails;
