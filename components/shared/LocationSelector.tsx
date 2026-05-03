"use client";

import { Locate } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LocationSelectorProps {
  onPick?: (loc: { lat: number; lng: number; city: string }) => void;
}

export function LocationSelector({ onPick }: LocationSelectorProps) {
  const { location, requestGps } = useLocation();

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="City"
        placeholder="e.g. Kolkata"
        defaultValue={location?.city}
        onBlur={async (e) => {
          const q = e.target.value.trim();
          if (!q) return;
          const res = await fetch(`/api/geocode/reverse?lat=0&lng=0`).catch(() => null);
          void res;
          onPick?.({ lat: location?.coordinates.lat ?? 0, lng: location?.coordinates.lng ?? 0, city: q });
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        iconLeft={<Locate className="h-4 w-4" strokeWidth={1.5} />}
        onClick={async () => {
          const loc = await requestGps();
          if (loc) onPick?.({ lat: loc.coordinates.lat, lng: loc.coordinates.lng, city: loc.city });
        }}
      >
        Use my location
      </Button>
    </div>
  );
}
