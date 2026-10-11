import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CryptoPaymentFormProps {
  projectId: number;
  tokenPrice: number;
}

const paymentFormSchema = z.object({
  walletAddress: z
    .string()
    .min(26, 'Invalid wallet address')
    .regex(/^0x[a-fA-F0-9]{40}$|^T[a-zA-Z0-9]{33}$|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, 'Invalid wallet format'),
  tokenAmount: z
    .number()
    .min(20, 'Minimum 20 tokens ($10 USD)')
    .max(2000000, 'Maximum 2,000,000 tokens'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({ projectId, tokenPrice }) => {
  const [usdAmount, setUsdAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      walletAddress: '',
      tokenAmount: 100,
      email: '',
      acceptTerms: false,
    }
  });

  const tokenAmount = watch('tokenAmount');

  useEffect(() => {
    setUsdAmount(tokenAmount * tokenPrice);
  }, [tokenAmount, tokenPrice]);

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/token-presale/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: data.walletAddress,
          tokenAmount: data.tokenAmount,
          usdAmount,
          paymentMethod: 'ethereum', // Will be determined based on wallet format
          projectId,
          email: data.email || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const result = await response.json();
      setSuccessOrderId(result.orderId);
      reset();

      toast({
        title: 'Order Created Successfully',
        description: `Order #${result.orderId} has been created. Transaction hash: ${result.transactionHash || 'pending'}`,
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Token Amount */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Token Amount
          </label>
          <div className="relative">
            <Controller
              name="tokenAmount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="100"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="bg-white/5 border border-white/20 text-white placeholder:text-gray-500 pr-16"
                />
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-semibold">
              VOD
            </div>
          </div>
          {errors.tokenAmount && (
            <p className="text-red-400 text-sm mt-1">{errors.tokenAmount.message}</p>
          )}
        </div>

        {/* USD Amount Display */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
          <p className="text-gray-300 text-sm mb-1">You will pay:</p>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold text-white">${usdAmount.toFixed(2)}</span>
              <span className="text-gray-400 ml-2">USD</span>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-400">Rate: ${tokenPrice}/VOD</p>
              <p className="text-primary font-semibold">{(usdAmount / tokenPrice).toFixed(0)} tokens</p>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Wallet Address
          </label>
          <Controller
            name="walletAddress"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="0x... (Ethereum), T... (TRON), 1... (Bitcoin)"
                className="bg-white/5 border border-white/20 text-white placeholder:text-gray-500 text-xs"
              />
            )}
          />
          {errors.walletAddress && (
            <p className="text-red-400 text-sm mt-1">{errors.walletAddress.message}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            Send tokens to this address after completing the form
          </p>
        </div>

        {/* Email (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Email (Optional)
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="your@email.com"
                className="bg-white/5 border border-white/20 text-white placeholder:text-gray-500"
              />
            )}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            For order confirmation and updates
          </p>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-3">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1"
              />
            )}
          />
          <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-red-400 text-sm">{errors.acceptTerms.message}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-4 border-t border-white/10">
          <div>
            <p className="font-semibold text-white mb-1">Minimum</p>
            <p>$10 USD (20 tokens)</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Maximum</p>
            <p>$1,000,000 USD</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Processing</p>
            <p>1-5 minutes</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Network</p>
            <p>Multi-chain support</p>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={!!successOrderId} onOpenChange={() => setSuccessOrderId(null)}>
        <DialogContent className="glassmorphism border-primary/30">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <DialogTitle className="text-white text-center">Order Confirmed</DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Your order has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Order ID</p>
              <p className="text-white font-mono text-lg break-all">{successOrderId}</p>
            </div>
            <p className="text-gray-300 text-sm">
              Your order has been created. Please wait for payment confirmation, which typically takes 1-5 minutes.
            </p>
          </div>
          <Button
            onClick={() => setSuccessOrderId(null)}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CryptoPaymentForm;
