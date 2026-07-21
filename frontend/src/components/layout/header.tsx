'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span style={{ color: 'var(--border)' }}>/</span>}
            <span className={cn(isLast && 'font-medium')} style={isLast ? { color: 'var(--foreground)' } : {}}>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      } />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  return (
    <header
      className="flex h-14 items-center gap-4 border-b px-4"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in oklch, var(--background) 80%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Search */}
      <div className="hidden w-72 md:flex items-center relative">
        <Search className="absolute left-3 h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
        <Input
          placeholder="Search agents, calls..."
          className="h-8 pl-8 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--primary)' }}
          />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs font-semibold">HT</AvatarFallback>
              </Avatar>
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
