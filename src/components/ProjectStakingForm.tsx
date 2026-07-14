import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  apy: number;
  description: string;
}

interface ProjectStakingFormProps {
  projects: Project[];
  onStakeCreated: () => void;
}

export default function ProjectStakingForm({ projects, onStakeCreated }: ProjectStakingFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);
  const estimatedReward = selectedProject && amount
    ? (parseFloat(amount) * selectedProject.apy) / 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedProjectId || !amount) {
      setError('Пожалуйста, выберите проект и введите сумму');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Сумма должна быть больше нуля');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/staking/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(selectedProjectId),
          amount: amountNum
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при создании стейка');
        return;
      }

      setSuccess(true);
      setSelectedProjectId('');
      setAmount('');
      onStakeCreated();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating stake:', err);
      setError('Произошла ошибка при размещении токенов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Разместить токены в проект</CardTitle>
        <CardDescription>Выберите R&D проект и размер инвестиции</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Выберите проект</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Выберите проект..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name} ({project.apy.toFixed(2)}% APY)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {/* Project Info */}
          {selectedProject && (
            <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Проект:</span>
                <span className="text-white font-semibold">{selectedProject.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">APY:</span>
                <span className="text-teal-400 font-semibold">{selectedProject.apy.toFixed(2)}%</span>
              </div>
            </div>
          )}

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
                Токены успешно размещены!
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !selectedProjectId || !amount}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              'Разместить токены'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
