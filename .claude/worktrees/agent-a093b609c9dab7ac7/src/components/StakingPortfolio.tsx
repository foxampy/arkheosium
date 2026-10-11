import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

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

interface StakingPortfolioProps {
  stakes: UserStake[];
  onUnstake: () => void;
}

export default function StakingPortfolio({ stakes, onUnstake }: StakingPortfolioProps) {
  const [unstakingId, setUnstakingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStakes = stakes.filter(s => !s.unstakedAt);
  const totalStaked = activeStakes.reduce((sum, s) => sum + s.amount, 0);
  const totalRewardsCollected = activeStakes.reduce((sum, s) => sum + s.rewardsCollected, 0);

  const calculateDaysStaked = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleUnstake = async (stakeId: number) => {
    setError(null);
    setSuccess(null);

    const confirmUnstake = window.confirm(
      'Вы уверены, что хотите вывести эти токены? Вы перестанете получать награды.'
    );

    if (!confirmUnstake) return;

    try {
      setUnstakingId(stakeId);
      const response = await fetch(`/api/staking/unstake/${stakeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при выводе токенов');
        return;
      }

      setSuccess('Токены успешно выведены!');
      onUnstake();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error unstaking:', err);
      setError('Произошла ошибка при выводе токенов');
    } finally {
      setUnstakingId(null);
    }
  };

  if (activeStakes.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Мой портфолио</CardTitle>
          <CardDescription>Ваши активные стейки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">
              У вас еще нет активных стейков
            </div>
            <p className="text-slate-500">
              Начните размещать токены в проекты или пул, чтобы начать получать награды
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Всего застейкировано</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-400">{totalStaked.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">VOD</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Накопленные награды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-400">{totalRewardsCollected.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">VOD</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Активных стейков</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-400">{activeStakes.length}</div>
            <p className="text-xs text-slate-500 mt-1">позиций</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-950 border-red-700">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="bg-green-950 border-green-700">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stakes List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Активные стейки</CardTitle>
          <CardDescription>Ваши текущие размещения и накопленные награды</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeStakes.map((stake) => (
              <div
                key={stake.id}
                className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-teal-500 transition"
              >
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  {/* Stake Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-white font-semibold">
                      {stake.projectName || 'Пул объектов'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Размещено {calculateDaysStaked(stake.createdAt)} дней назад
                    </p>
                    <p className="text-teal-400 text-sm mt-1">
                      {stake.type === 'project' ? 'Стейк в проект' : 'Стейк в пул'}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-center">
                    <div className="text-white font-bold">{stake.amount.toFixed(2)}</div>
                    <div className="text-slate-400 text-xs">VOD</div>
                  </div>

                  {/* APY & Rewards */}
                  <div className="text-center">
                    <div className="text-white font-bold">{stake.apy.toFixed(2)}%</div>
                    <div className="text-slate-400 text-xs">APY</div>
                    <div className="text-teal-400 text-sm mt-2">
                      +{stake.rewardsCollected.toFixed(2)} VOD
                    </div>
                  </div>

                  {/* Unstake Button */}
                  <div className="text-right">
                    <Button
                      onClick={() => handleUnstake(stake.id)}
                      disabled={unstakingId === stake.id}
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {unstakingId === stake.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Вывести
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
