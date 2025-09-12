import { useState } from 'react';
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";

interface FeedbackResponseProps {
  feedbackId: string;
  initialResponse?: string;
  onResponseSubmitted: () => void;
}

export function FeedbackResponse({
  feedbackId,
  initialResponse,
  onResponseSubmitted,
}: FeedbackResponseProps) {
  const { toast } = useToast();
  const [response, setResponse] = useState(initialResponse || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast({ description: 'Please enter a response', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      toast({ description: 'Response submitted successfully' });
      onResponseSubmitted();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({ description: 'Failed to submit response', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Enter your response to this feedback..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !response.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Response'}
        </Button>
      </div>
    </div>
  );
} 