
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WaterResource, ResourceStatus, ResourceCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Droplets, 
  DollarSign, 
  Users, 
  Building2, 
  TrendingUp, 
  MapPin, 
  Calendar,
  BarChart3,
  Target,
  ChevronDown,
  PiggyBank
} from 'lucide-react';

interface ObjectsListProps {
  resources: WaterResource[];
  searchTerm: string;
  filterStatus: string;
  filterCategory: string;
  onResourceSelect?: (resource: WaterResource) => void;
}

const ObjectsList: React.FC<ObjectsListProps> = ({
  resources,
  searchTerm,
  filterStatus,
  filterCategory,
  onResourceSelect
}) => {
  const { t } = useTranslation();
  const [selectedForStaking, setSelectedForStaking] = useState<string | null>(null);

  // Фильтрация объектов
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.CRITICAL:
        return 'destructive';
      case ResourceStatus.NEEDS_ATTENTION:
        return 'outline';
      case ResourceStatus.STABLE:
        return 'secondary';
      case ResourceStatus.EXCELLENT:
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColorClass = (status: ResourceStatus) => {
    switch (status) {
      case ResourceStatus.CRITICAL:
        return 'text-red-500 border-red-500/20 bg-red-500/10';
      case ResourceStatus.NEEDS_ATTENTION:
        return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      case ResourceStatus.STABLE:
        return 'text-green-500 border-green-500/20 bg-green-500/10';
      case ResourceStatus.EXCELLENT:
        return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
      default:
        return 'text-gray-500 border-gray-500/20 bg-gray-500/10';
    }
  };

  const handleStaking = (resourceId: string) => {
    setSelectedForStaking(resourceId);
    // Здесь будет логика открытия модального окна стейкинга
    console.log(`Opening staking for resource: ${resourceId}`);
  };

  if (filteredResources.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {t('dashboard.objectsList.noObjects', 'Объекты не найдены')}
          </p>
          <p className="text-sm text-muted-foreground text-center">
            {t('dashboard.objectsList.tryAdjustFilters', 'Попробуйте изменить фильтры поиска')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('dashboard.objectsList.title', 'Список объектов')}
          </div>
          <Badge variant="secondary">
            {filteredResources.length} {t('dashboard.objectsList.objects', 'объектов')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-4">
          {filteredResources.map((resource) => (
            <AccordionItem 
              key={resource.id} 
              value={resource.id.toString()}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-start">
                      <h4 className="font-semibold text-left">{resource.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {resource.region}, {resource.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getStatusColor(resource.status)}
                      className={getStatusColorClass(resource.status)}
                    >
                      {resource.status}
                    </Badge>
                    {resource.category === ResourceCategory.INVESTMENT && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Инвестиционный
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-4">
                <div className="space-y-6">
                  {/* Основная информация */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Droplets className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Качество воды</p>
                        <p className="font-semibold">{resource.qualityIndex}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Расход</p>
                        <p className="font-semibold">{resource.flowRate} м³/с</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Последнее обновление</p>
                        <p className="font-semibold text-xs">
                          {'—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Дополнительная информация для инвестиционных объектов */}
                  {resource.category === ResourceCategory.INVESTMENT && (
                    <div className="border-t pt-4">
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Инвестиционная информация
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                          <DollarSign className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">IRR</p>
                            <p className="font-bold text-green-500">{resource.irr}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Финансирование</p>
                            <p className="font-semibold">${resource.totalFunding?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                          <Users className="h-6 w-6 text-purple-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Участники</p>
                            <p className="font-semibold">{resource.participantsCount}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
                          <Target className="h-6 w-6 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Доступно DAO</p>
                            <p className="font-semibold">${resource.availableForDAO?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Прогресс финансирования */}
                      {resource.fundingProgress && resource.totalFunding && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Прогресс финансирования</span>
                            <span className="font-medium">
                              ${resource.fundingProgress.toLocaleString()} / ${resource.totalFunding.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min((resource.fundingProgress / resource.totalFunding) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round((resource.fundingProgress / resource.totalFunding) * 100)}% завершено
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Описание */}
                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-2">Описание</h5>
                    <p className="text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        onResourceSelect?.(resource);
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      Выбрать объект
                    </Button>
                    
                    {resource.category === ResourceCategory.INVESTMENT && (
                      <>
                        <Button 
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            // Логика инвестирования
                            console.log(`Investing in ${resource.name}`);
                          }}
                        >
                          <DollarSign className="h-4 w-4" />
                          Инвестировать
                        </Button>
                        
                        <Button 
                          variant="secondary"
                          className="flex items-center gap-2"
                          onClick={() => handleStaking(resource.id.toString())}
                        >
                          <PiggyBank className="h-4 w-4" />
                          Стейкинг
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ObjectsList;
