import { motion } from 'framer-motion';
import { 
  LightBulbIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

const steps = [
  {
    title: 'Discovery',
    description: 'We analyze your business needs and identify AI opportunities that align with your goals.',
    icon: LightBulbIcon,
  },
  {
    title: 'Development',
    description: 'Our team builds custom AI solutions tailored to your specific requirements and challenges.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Deployment',
    description: 'We implement and optimize the solution, ensuring seamless integration with your existing systems.',
    icon: RocketLaunchIcon,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Our proven process ensures successful AI implementation
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
              >
                <div className="absolute -top-6 left-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                    <step.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
