"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ExternalLink,
  Download,
  Star,
  Zap,
  FileText,
  Video,
  Mic
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const upcomingEvents = [
  {
    title: "AI Agent Summit 2024",
    date: "2024-03-15",
    time: "9:00 AM - 6:00 PM PST",
    location: "San Francisco, CA",
    venue: "Moscone Center",
    type: "Conference",
    description: "The premier event for AI agent builders, featuring keynotes from industry leaders, hands-on workshops, and networking opportunities.",
    speakers: [
      "Sarah Chen, CTO at Xeinst",
      "Dr. Michael Rodriguez, AI Research Lead",
      "Lisa Park, Customer Success Manager"
    ],
    attendees: 2500,
    price: "$299",
    featured: true,
    category: "Conference",
    topics: [
      "Agent Architecture",
      "Deployment Strategies",
      "Monitoring & Observability",
      "Enterprise Security"
    ]
  },
  {
    title: "Xeinst User Meetup - New York",
    date: "2024-02-20",
    time: "6:00 PM - 9:00 PM EST",
    location: "New York, NY",
    venue: "WeWork Times Square",
    type: "Meetup",
    description: "Connect with fellow Xeinst users, share experiences, and learn about the latest features and best practices.",
    speakers: [
      "Alex Thompson, Developer Advocate",
      "Emily Watson, Solutions Architect"
    ],
    attendees: 150,
    price: "Free",
    featured: false,
    category: "Meetup",
    topics: [
      "User Stories",
      "Feature Updates",
      "Best Practices",
      "Q&A Session"
    ]
  },
  {
    title: "AI in Enterprise Workshop",
    date: "2024-02-28",
    time: "10:00 AM - 4:00 PM EST",
    location: "Boston, MA",
    venue: "MIT Media Lab",
    type: "Workshop",
    description: "Hands-on workshop for enterprise teams looking to implement AI agents in their operations.",
    speakers: [
      "Dr. Maria Santos, Compliance Officer",
      "James Liu, Head of Engineering"
    ],
    attendees: 75,
    price: "$199",
    featured: false,
    category: "Workshop",
    topics: [
      "Enterprise Architecture",
      "Compliance & Security",
      "Implementation Planning",
      "ROI Measurement"
    ]
  }
];

const pastEvents = [
  {
    title: "Xeinst Launch Event",
    date: "2024-01-10",
    location: "San Francisco, CA",
    venue: "Xeinst HQ",
    type: "Launch",
    description: "Celebrating the official launch of Xeinst with demos, networking, and exclusive previews of upcoming features.",
    attendees: 500,
    rating: 4.9,
    category: "Launch",
    recordingUrl: "#",
    photosUrl: "#"
  },
  {
    title: "AI Agent Security Workshop",
    date: "2023-12-15",
    location: "Austin, TX",
    venue: "SXSW Interactive",
    type: "Workshop",
    description: "Deep dive into AI agent security best practices and compliance requirements for enterprise deployments.",
    attendees: 200,
    rating: 4.8,
    category: "Workshop",
    recordingUrl: "#",
    photosUrl: "#"
  },
  {
    title: "Developer Meetup - Seattle",
    date: "2023-11-30",
    location: "Seattle, WA",
    venue: "Microsoft Reactor",
    type: "Meetup",
    description: "Technical deep dive into Xeinst's API, SDKs, and integration patterns for developers.",
    attendees: 120,
    rating: 4.7,
    category: "Meetup",
    recordingUrl: "#",
    photosUrl: "#"
  }
];

const eventTypes = [
  { name: "All", count: 8, active: true },
  { name: "Conference", count: 2, active: false },
  { name: "Workshop", count: 3, active: false },
  { name: "Meetup", count: 2, active: false },
  { name: "Launch", count: 1, active: false }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case "Conference":
      return <Video className="w-5 h-5" />;
    case "Workshop":
      return <FileText className="w-5 h-5" />;
    case "Meetup":
      return <Users className="w-5 h-5" />;
    case "Launch":
      return <Zap className="w-5 h-5" />;
    default:
      return <Calendar className="w-5 h-5" />;
  }
};

export default function EventsPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [showPastEvents, setShowPastEvents] = useState(false);

  const filteredUpcoming = upcomingEvents.filter(event => 
    selectedType === "All" || event.type === selectedType
  );

  const filteredPast = pastEvents.filter(event => 
    selectedType === "All" || event.type === selectedType
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gradient mb-6"
            >
              Events & Conferences
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join us at events around the world to learn, network, and discover the future of AI agents.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Calendar className="w-5 h-5 mr-2" />
                View All Events
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                Download Event Calendar
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Type Filter */}
      <section className="py-10 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-2 justify-center mb-6"
          >
            {eventTypes.map((type, index) => (
              <button
                key={index}
                onClick={() => setSelectedType(type.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type.name
                    ? 'bg-ai-primary text-white'
                    : 'bg-background/50 text-muted-foreground hover:text-white hover:bg-ai-primary/20'
                }`}
              >
                {type.name} ({type.count})
              </button>
            ))}
          </motion.div>
          
          <div className="flex justify-center">
            <div className="flex bg-background/50 rounded-lg p-1">
              <button
                onClick={() => setShowPastEvents(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showPastEvents
                    ? 'bg-ai-primary text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setShowPastEvents(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showPastEvents
                    ? 'bg-ai-primary text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="space-y-8">
            {!showPastEvents ? (
              // Upcoming Events
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-white mb-8"
                >
                  Upcoming Events
                </motion.h2>
                <div className="space-y-8">
                  {filteredUpcoming.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300 ${
                        event.featured ? 'bg-gradient-to-r from-ai-primary/5 to-ai-secondary/5' : ''
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              {event.featured && (
                                <Badge className="bg-gradient-ai text-white border-0">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                                {getEventIcon(event.type)}
                                <span className="ml-1">{event.type}</span>
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{event.price}</div>
                              <div className="text-sm text-muted-foreground">per ticket</div>
                            </div>
                          </div>
                          <CardTitle className="text-2xl text-white mb-2">{event.title}</CardTitle>
                          <CardDescription className="text-muted-foreground text-lg">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Event Details */}
                            <div className="lg:col-span-2 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Calendar className="w-5 h-5" />
                                  <div>
                                    <div className="font-medium text-white">{new Date(event.date).toLocaleDateString()}</div>
                                    <div className="text-sm">{event.time}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <MapPin className="w-5 h-5" />
                                  <div>
                                    <div className="font-medium text-white">{event.location}</div>
                                    <div className="text-sm">{event.venue}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Users className="w-5 h-5" />
                                  <div>
                                    <div className="font-medium text-white">{event.attendees} registered</div>
                                    <div className="text-sm">attendees</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Clock className="w-5 h-5" />
                                  <div>
                                    <div className="font-medium text-white">{event.time}</div>
                                    <div className="text-sm">duration</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Speakers</h4>
                                <div className="space-y-2">
                                  {event.speakers.map((speaker, speakerIndex) => (
                                    <div key={speakerIndex} className="flex items-center space-x-2 text-muted-foreground">
                                      <Mic className="w-4 h-4 text-ai-primary" />
                                      <span>{speaker}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Topics Covered</h4>
                                <div className="flex flex-wrap gap-2">
                                  {event.topics.map((topic, topicIndex) => (
                                    <Badge key={topicIndex} variant="outline" className="border-ai-primary/20 text-ai-primary">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                              <Button className="w-full bg-gradient-ai hover:bg-gradient-ai/90">
                                <Calendar className="w-4 h-4 mr-2" />
                                Register Now
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                              <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                                <Download className="w-4 h-4 mr-2" />
                                Add to Calendar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              // Past Events
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-white mb-8"
                >
                  Past Events
                </motion.h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredPast.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                              {getEventIcon(event.type)}
                              <span className="ml-1">{event.type}</span>
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{event.rating}</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl text-white mb-2">{event.title}</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {event.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{event.attendees} attended</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button className="flex-1 bg-gradient-ai hover:bg-gradient-ai/90">
                                <Video className="w-4 h-4 mr-2" />
                                Watch Recording
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                              <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                                <FileText className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Stay Updated on Events
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Get notified about upcoming events, workshops, and conferences in your area.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Subscribe to Event Updates
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Calendar className="w-5 h-5 mr-2" />
                Download Calendar
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
