"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  cardNumber: z.string().min(16, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date'),
  cvv: z.string().min(3, 'CVV must be 3 digits'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function CheckoutForm({ amount, onSuccess, onError }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);
      // Here you would typically integrate with your payment processor
      // For now, we'll just simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payment successful!');
      onSuccess();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          {...register('cardNumber')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            placeholder="MM/YY"
            {...register('expiryDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            {...register('cvv')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default CheckoutForm; 