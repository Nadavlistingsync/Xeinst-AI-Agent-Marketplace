import { Select } from "../ui/select";
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    if (value) {
      router.push(`/marketplace?${createQueryString(name, value)}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      router.push(`/marketplace?${params.toString()}`);
    }
  };

  return (
    <div className="flex gap-4">
      <Select
        value={searchParams.get('framework') || ''}
        onValueChange={(value: string) => handleFilterChange('framework', value)}
      >
        <option value="">All Frameworks</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
      </Select>

      <Select
        value={searchParams.get('access_level') || ''}
        onValueChange={(value: string) => handleFilterChange('access_level', value)}
      >
        <option value="">All Access Levels</option>
        <option value="public">Public</option>
        <option value="basic">Basic</option>
        <option value="premium">Premium</option>
      </Select>
    </div>
  );
} 