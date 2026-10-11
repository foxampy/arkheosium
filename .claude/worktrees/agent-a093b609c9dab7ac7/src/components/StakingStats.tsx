import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Target } from 'lucide-react';

interface UserStake {
  id: number;
  projectId?: number;
  projectName?: string;
  amount: number;
  apy: number;
  createdAt: string;
  unstakedAt?: string;
  rewardsCollected: number;
  type: 'project' | 'pool';
}

interface StakingStatsResponse {
  totalStaked: number;
  activeStakeCount: number;
  totalRewardsCollected: number;
  averageAPY: number;
  estimatedAnnualRewards: number;
  estimatedMonthlyRewards: number;
  projectStakesCount: number;
  poolStakesCount: number;
}

interface StakingStatsProps {
  userStakes: UserStake[];
}

export default function StakingStats({ userStakes }: StakingStatsProps) {
  const [stats, setStats] = useState<StakingStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staking/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading staking stats:', error);
      // Fallback to local calculation
      const activeStakes = userStakes.filter(s => !s.unstakedAt);
      const totalStaked = activeStakes.reduce((sum, s) => sum + s.amount, 0);
      const totalRewardsCollected = activeStakes.reduce((sum, s) => sum + s.rewardsCollected, 0);
      const weightedApy = activeStakes.length > 0
        ? activeStakes.reduce((sum, s) => sum + (s.amount * s.apy), 0) / totalStaked
        : 0;
      const estimatedAnnualRewards = totalStaked > 0 ? (totalStaked * weightedApy) / 100 : 0;

      setStats({
        totalStaked,
        activeStakeCount: activeStakes.length,
        totalRewardsCollected,
        averageAPY: weightedApy,
        estimatedAnnualRewards,
        estimatedMonthlyRewards: estimatedAnnualRewards / 12,
        projectStakesCount: activeStakes.filter(s => s.type === 'project').length,
        poolStakesCount: activeStakes.filter(s => s.type === 'pool').length
      });
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return null;
  }

  const totalStaked = stats.totalStaked;
  const estimatedAnnualRewards = stats.estimatedAnnualRewards;
  const totalRewardsCollected = stats.totalRewardsCollected;
  const weightedApy = stats.averageAPY;

  const statsCards = [
    {
      title: 'Всего застейкировано',
      value: totalStaked.toFixed(2),
      unit: 'VOD',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      description: `${stats.activeStakeCount} активных позиций`
    },
    {
      title: 'Ожидаемый годовой доход',
      value: estimatedAnnualRewards.toFixed(2),
      unit: 'VOD',
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      description: `~${(estimatedAnnualRewards / 12).toFixed(2)} VOD в месяц`
    },
    {
      title: 'Накопленные награды',
      value: totalRewardsCollected.toFixed(2),
      unit: 'VOD',
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      description: `Средняя APY: ${weightedApy.toFixed(2)}%`
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {statsCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {stat.value}
                  </span>
                  <span className="text-sm text-slate-400">{stat.unit}</span>
                </div>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
