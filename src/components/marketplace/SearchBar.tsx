"use client";

import { Input } from "../ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value) {
      router.push(`/marketplace?${createQueryString('search', value)}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div className="flex-1">
      <Input
        type="search"
        placeholder="Search agents..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full"
      />
    </div>
  );
} 