'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export function MarketplaceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/marketplace?${createQueryString("query", searchQuery)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="search"
        placeholder="Search agents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <SearchIcon className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
} 