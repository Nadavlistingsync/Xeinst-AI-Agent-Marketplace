import { toast as hotToast } from 'react-hot-toast';

export function useToast() {
  return {
    toast: (props: { description: string; variant?: 'default' | 'destructive' }) => {
      return hotToast(props.description, {
        style: props.variant === 'destructive' ? {
          backgroundColor: '#ef4444',
          color: 'white'
        } : undefined
      });
    }
  };
} 