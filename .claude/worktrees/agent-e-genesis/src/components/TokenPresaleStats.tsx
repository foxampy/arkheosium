import React, { useState, useEffect } from 'react';
import { DollarSign, Coins, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface StatsData {
  totalUsdRaised: number;
  totalTokensSold: number;
  totalOrdersConfirmed: number;
}

const TokenPresaleStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsdRaised: 0,
    totalTokensSold: 0,
    totalOrdersConfirmed: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/token-presale/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set default values if fetch fails
        setStats({
          totalUsdRaised: 0,
          totalTokensSold: 0,
          totalOrdersConfirmed: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total USD Raised',
      value: `$${stats.totalUsdRaised.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-400',
      target: '$1,000,000 USD',
      progress: (stats.totalUsdRaised / 1000000) * 100,
    },
    {
      title: 'Total Tokens Sold',
      value: `${(stats.totalTokensSold / 1000000).toFixed(2)}M`,
      icon: Coins,
      color: 'from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-400',
      target: '2M tokens',
      progress: (stats.totalTokensSold / 2000000) * 100,
    },
    {
      title: 'Orders Confirmed',
      value: stats.totalOrdersConfirmed.toString(),
      icon: CheckCircle2,
      color: 'from-purple-500/20 to-pink-500/20',
      textColor: 'text-purple-400',
      target: 'Active orders',
      progress: Math.min((stats.totalOrdersConfirmed / 1000) * 100, 100),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const progressPercentage = Math.min(card.progress, 100);

        return (
          <Card key={index} className={`glassmorphism-dark border-primary/20 bg-gradient-to-br ${card.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-white text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-white/5 ${card.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Value display */}
                <div>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">of {card.target}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        index === 0
                          ? 'from-green-500 to-emerald-500'
                          : index === 1
                          ? 'from-blue-500 to-cyan-500'
                          : 'from-purple-500 to-pink-500'
                      } transition-all duration-500`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{progressPercentage.toFixed(1)}%</p>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-300">Live</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TokenPresaleStats;
