'use client';

import { useId, useState } from 'react';
import { Command } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js/max';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { phoneCountries } from '@/lib/phone-countries';

export function CountryCodeSelect({ country, onChange, disabled = false }: {
  country: CountryCode; onChange: (country: CountryCode) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const selected = phoneCountries.find(value => value.country === country)!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open}
          aria-controls={open ? popoverId : undefined} aria-haspopup="dialog" aria-label="Country calling code"
          title={`${selected.name} (+${selected.callingCode})`} disabled={disabled}
          className="h-10 w-28 shrink-0 justify-between gap-1 border-border bg-card px-2.5 font-normal text-foreground">
          <span className="text-xs text-muted-foreground">{selected.country}</span>
          <span>+{selected.callingCode}</span>
          <ChevronsUpDown aria-hidden="true" className="!size-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id={popoverId} aria-label="Choose a country calling code" align="start" className="w-[min(22rem,calc(100vw_-_4rem))] overflow-hidden border-cyan-azure/30 bg-card p-0 text-foreground">
        <Command label="Search country or calling code" defaultValue={`${selected.name} +${selected.callingCode} ${selected.country}`}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input aria-label="Search country or calling code"
              placeholder="Search country or code..." maxLength={64}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <Command.List className="max-h-[min(18rem,calc(var(--radix-popover-content-available-height)_-_3.5rem))] overflow-y-auto overscroll-contain p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No countries found.</Command.Empty>
            {phoneCountries.map(option => (
              <Command.Item key={option.country} value={`${option.name} +${option.callingCode} ${option.country}`}
                keywords={[option.country, option.callingCode, option.country === 'GB' ? 'UK Britain' : '']}
                onSelect={() => { onChange(option.country); setOpen(false); }}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-[selected=true]:bg-cyan-azure/15 data-[selected=true]:text-foreground">
                <Check aria-hidden="true" className={`size-4 shrink-0 ${country === option.country ? 'opacity-100' : 'opacity-0'}`} />
                <span className="min-w-0 flex-1">{option.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">+{option.callingCode}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
