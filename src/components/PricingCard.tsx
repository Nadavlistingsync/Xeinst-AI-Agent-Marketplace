import { Button } from ".//ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from ".//ui/card";
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
  current: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  buttonText,
  buttonVariant,
  current,
}: PricingCardProps) {
  return (
    <Card className={`flex flex-col ${current ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <CardDescription className="mt-4">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={buttonVariant}
          className="w-full"
          asChild={!current}
        >
          {current ? (
            <span>Current Plan</span>
          ) : (
            <Link href={`/checkout?plan=${name.toLowerCase()}`}>
              {buttonText}
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 