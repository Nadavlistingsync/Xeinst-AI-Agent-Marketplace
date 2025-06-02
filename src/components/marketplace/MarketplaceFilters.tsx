import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const frameworks = [
  "All",
  "OpenAI",
  "Anthropic",
  "HuggingFace",
  "Custom",
];

const categories = [
  "All",
  "Chatbot",
  "Image Generation",
  "Text Analysis",
  "Data Processing",
  "Automation",
];

const accessLevels = [
  "All",
  "Public",
  "Basic",
  "Premium",
];

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
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

  return (
    <Card className="p-4 space-y-6">
      <div>
        <Label>Framework</Label>
        <Select
          value={searchParams.get("framework") || "All"}
          onValueChange={(value) => handleFilterChange("framework", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select framework" />
          </SelectTrigger>
          <SelectContent>
            {frameworks.map((framework) => (
              <SelectItem key={framework} value={framework}>
                {framework}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category</Label>
        <Select
          value={searchParams.get("category") || "All"}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Access Level</Label>
        <Select
          value={searchParams.get("accessLevel") || "All"}
          onValueChange={(value) => handleFilterChange("accessLevel", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select access level" />
          </SelectTrigger>
          <SelectContent>
            {accessLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Price Range</Label>
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
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>${searchParams.get("minPrice") || "0"}</span>
          <span>${searchParams.get("maxPrice") || "1000"}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={searchParams.get("verified") === "true"}
              onCheckedChange={(checked) =>
                handleFilterChange("verified", checked ? "true" : "false")
              }
            />
            <Label htmlFor="verified" className="text-sm">
              Verified Agents
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="popular"
              checked={searchParams.get("popular") === "true"}
              onCheckedChange={(checked) =>
                handleFilterChange("popular", checked ? "true" : "false")
              }
            />
            <Label htmlFor="popular" className="text-sm">
              Popular
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={searchParams.get("new") === "true"}
              onCheckedChange={(checked) =>
                handleFilterChange("new", checked ? "true" : "false")
              }
            />
            <Label htmlFor="new" className="text-sm">
              New Releases
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
} 