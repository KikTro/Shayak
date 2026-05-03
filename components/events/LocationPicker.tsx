"use client";

import { MapPin, Locate } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface LocationPickerProps {
  radiusKm: number;
  onRadiusChange: (r: number) => void;
}

const RADII = [5, 10, 25, 50, 100];

export function LocationPicker({ radiusKm, onRadiusChange }: LocationPickerProps) {
  const { location, requestGps } = useLocation();

  const label = location
    ? [location.city, location.state, location.country].filter(Boolean).join(", ") ||
      `${location.coordinates.lat.toFixed(2)}, ${location.coordinates.lng.toFixed(2)}`
    : "Set your location";

  return (
    <div className="flex flex-col gap-4 border border-border bg-transparent p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-accent" strokeWidth={1.5} />
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Location
          </span>
          <span className="font-sans text-base text-foreground">{label}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={requestGps}
          iconLeft={<Locate className="h-4 w-4" strokeWidth={1.5} />}
          className="ml-2"
        >
          Use My Location
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Radius
        </span>
        {RADII.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRadiusChange(r)}
            className={cn(
              "min-h-[44px] border px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors",
              radiusKm === r
                ? "border-accent text-accent"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {r}km
          </button>
        ))}
      </div>
    </div>
  );
}
