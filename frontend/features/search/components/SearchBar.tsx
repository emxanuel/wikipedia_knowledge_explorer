"use client";

import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading = false,
}: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center gap-2">
      <Input
        type="search"
        placeholder="Search Wikipedia articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="max-w-xl flex-1 rounded-full"
        aria-label="Search query"
      />
      <Button type="submit" disabled={loading} size="default">
        {loading ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
