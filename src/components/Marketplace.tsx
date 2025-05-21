import { Search } from 'lucide-react';
import { Star } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string;
  tag: string;
  rating: number;
}

const agents: Agent[] = [
  {
    id: 1,
    name: "Real Estate Assistant",
    description: "Automate property research and client communication",
    tag: "Real Estate",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Fitness Coach",
    description: "Personalized workout plans and nutrition tracking",
    tag: "Gym",
    rating: 4.9,
  },
  {
    id: 3,
    name: "E-commerce Optimizer",
    description: "Product recommendations and inventory management",
    tag: "Ecommerce",
    rating: 4.7,
  },
];

export default function Marketplace() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">AI Agents Marketplace</h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse ready-made AI agents built from real client requests — automate your workflow in seconds.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for agents..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {agent.tag}
                </span>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600">{agent.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
              <p className="text-gray-600 mb-4">{agent.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                View Agent
              </button>
            </div>
          ))}
        </div>

        {/* Explore All Button */}
        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-300">
            Explore All Agents
          </button>
        </div>
      </div>
    </section>
  );
} 