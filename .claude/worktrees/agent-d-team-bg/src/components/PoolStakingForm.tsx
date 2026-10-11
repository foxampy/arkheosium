import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface PoolStakingFormProps {
  onStakeCreated: () => void;
}

// Примерная средняя APY для пула (вычисляется как среднее по всем объектам)
const DEFAULT_POOL_APY = 8.5;

export default function PoolStakingForm({ onStakeCreated }: PoolStakingFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const estimatedReward = amount ? (parseFloat(amount) * DEFAULT_POOL_APY) / 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!amount) {
      setError('Пожалуйста, введите сумму');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Сумма должна быть больше нуля');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при создании стейка в пуле');
        return;
      }

      setSuccess(true);
      setAmount('');
      onStakeCreated();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating pool stake:', err);
      setError('Произошла ошибка при размещении токенов в пуле');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Разместить в пул объектов</CardTitle>
        <CardDescription>Диверсифицированное портфельное инвестирование</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Сумма (VOD)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Pool Info */}
          <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Тип инвестиции:</span>
              <span className="text-white font-semibold">Портфель объектов</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Средняя APY:</span>
              <span className="text-teal-400 font-semibold">{DEFAULT_POOL_APY.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Минимум:</span>
              <span className="text-white">1 VOD</span>
            </div>
          </div>

          {/* Expected Reward */}
          {estimatedReward > 0 && (
            <div className="p-3 bg-teal-950 rounded-lg border border-teal-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Ожидаемый годовой доход:</span>
                <span className="text-teal-400 font-bold">{estimatedReward.toFixed(2)} VOD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ежемесячно:</span>
                <span className="text-teal-300">{(estimatedReward / 12).toFixed(2)} VOD</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 text-sm space-y-2">
            <p className="text-slate-300">
              <span className="font-semibold">💡 Как это работает:</span>
            </p>
            <ul className="text-slate-400 space-y-1 ml-2">
              <li>• Ваша доля: <span className="text-slate-300">автоматическая</span></li>
              <li>• Переблансирование: <span className="text-slate-300">еженедельное</span></li>
              <li>• Награды: <span className="text-slate-300">выплачиваются ежемесячно</span></li>
            </ul>
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
              <AlertDescription className="text-green-400">
                Токены успешно размещены в пул!
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              'Разместить в пул'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
