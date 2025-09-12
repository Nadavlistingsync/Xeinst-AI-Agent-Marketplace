"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Filter, 
  X, 
  Sparkles, 
  Star, 
  Clock, 
  Zap, 
  Bot, 
  Globe,
  Database,
  Cpu,
  Shield,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const frameworks = [
  { value: "All", label: "All Frameworks", icon: Sparkles },
  { value: "OpenAI", label: "OpenAI", icon: Bot },
  { value: "Anthropic", label: "Anthropic", icon: Cpu },
  { value: "HuggingFace", label: "HuggingFace", icon: Database },
  { value: "Custom", label: "Custom", icon: Zap },
] as const;

const categories = [
  { value: "All", label: "All Categories", icon: Sparkles },
  { value: "Chatbot", label: "Chatbot", icon: Bot },
  { value: "Image Generation", label: "Image Generation", icon: Cpu },
  { value: "Text Analysis", label: "Text Analysis", icon: Database },
  { value: "Data Processing", label: "Data Processing", icon: Globe },
  { value: "Automation", label: "Automation", icon: Zap },
] as const;

const accessLevels = [
  { value: "All", label: "All Levels", icon: Sparkles },
  { value: "Public", label: "Public", icon: Globe },
  { value: "Basic", label: "Basic", icon: Shield },
  { value: "Premium", label: "Premium", icon: Star },
] as const;

const features = [
  { id: "verified", label: "Verified Agents", icon: Shield, description: "Official and tested" },
  { id: "popular", label: "Popular", icon: TrendingUp, description: "Most downloaded" },
  { id: "new", label: "New Releases", icon: Clock, description: "Recently added" },
  { id: "free", label: "Free", icon: Sparkles, description: "No cost" },
] as const;

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "false") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    return params.toString();
  };

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/marketplace?${createQueryString(name, value)}`);
  };

  const handlePriceChange = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", value[0].toString());
    params.set("maxPrice", value[1].toString());
    router.push(`/marketplace?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/marketplace');
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Framework Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Label className="text-sm font-medium mb-3 block">Framework</Label>
          <Select
            value={searchParams.get("framework") || "All"}
            onValueChange={(value: string) => handleFilterChange("framework", value)}
          >
            <SelectTrigger className="input-modern">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((framework) => (
                <SelectItem key={framework.value} value={framework.value}>
                  <div className="flex items-center gap-2">
                    <framework.icon className="w-4 h-4" />
                    {framework.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Label className="text-sm font-medium mb-3 block">Category</Label>
          <Select
            value={searchParams.get("category") || "All"}
            onValueChange={(value: string) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="input-modern">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Access Level Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Label className="text-sm font-medium mb-3 block">Access Level</Label>
          <Select
            value={searchParams.get("accessLevel") || "All"}
            onValueChange={(value: string) => handleFilterChange("accessLevel", value)}
          >
            <SelectTrigger className="input-modern">
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              {accessLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex items-center gap-2">
                    <level.icon className="w-4 h-4" />
                    {level.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Price Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="space-y-4">
            <Slider
              defaultValue={[0, 1000]}
              max={1000}
              step={10}
              value={[
                parseInt(searchParams.get("minPrice") || "0"),
                parseInt(searchParams.get("maxPrice") || "1000"),
              ]}
              onValueChange={handlePriceChange}
              className="mt-2"
            />
            <div className="flex justify-between text-sm">
              <Badge variant="outline" className="text-xs">
                ${searchParams.get("minPrice") || "0"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ${searchParams.get("maxPrice") || "1000"}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Features Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="space-y-3"
        >
          <Label className="text-sm font-medium block">Features</Label>
          <div className="space-y-3">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ x: 2 }}
              >
                <Checkbox
                  id={feature.id}
                  checked={searchParams.get(feature.id) === "true"}
                  onCheckedChange={(checked: boolean) =>
                    handleFilterChange(feature.id, checked ? "true" : "false")
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={feature.id} className="text-sm font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4" />
                      {feature.label}
                    </div>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-border"
          >
            <Label className="text-sm font-medium mb-3 block">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {Array.from(searchParams.entries()).map(([key, value]) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleFilterChange(key, "false")}
                >
                  {key}: {value}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
} 