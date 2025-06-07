'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState, useCallback } from "react";

export function MarketplaceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      try {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set(name, value);
        return params.toString();
      } catch (error) {
        console.error('Error creating query string:', error);
        return '';
      }
    },
    [searchParams]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("query", debouncedSearch);
    } else {
      params.delete("query");
    }
    router.push(`/marketplace?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search agents..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const query = createQueryString('q', e.target.value);
            if (query) {
              window.history.pushState(null, '', `?${query}`);
            }
          }}
          defaultValue={searchParams?.get('q') || ''}
        />
      </div>
    </div>
  );
} 