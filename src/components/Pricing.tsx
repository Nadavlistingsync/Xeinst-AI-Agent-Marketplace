'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Starter',
    price: '$2,500',
    description: 'Perfect for small businesses looking to get started with AI.',
    features: [
      'Basic AI integration',
      'Monthly support',
      'Standard implementation',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: '$5,000',
    description: 'Ideal for growing businesses with more complex needs.',
    features: [
      'Advanced AI solutions',
      'Weekly support',
      'Custom implementation',
      'Advanced analytics',
      'Priority support',
      'Training sessions',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations requiring comprehensive AI solutions.',
    features: [
      'Custom AI development',
      '24/7 support',
      'Full integration',
      'Custom analytics',
      'Dedicated account manager',
      'On-site training',
      'Custom SLAs',
    ],
  },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl p-8 ${
                tier.featured
                  ? 'bg-blue-600 text-white shadow-xl ring-1 ring-blue-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-600">
                    Most popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-semibold">{tier.name}</h3>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {tier.description}
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                {tier.price !== 'Custom' && (
                  <span className="text-base font-medium text-gray-600 dark:text-gray-300">
                    /month
                  </span>
                )}
              </p>
              <ul
                role="list"
                className="mt-8 space-y-4 text-sm leading-6"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? 'text-white' : 'text-blue-600'
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-white text-blue-600 hover:bg-gray-50 focus-visible:outline-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              >
                Get started
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 