'use client';

import { Bell, Search, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAppShell } from './app-shell-provider';
import { ShellBreadcrumbs } from './shell-breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        }
      />
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

// ─── Shell Header ─────────────────────────────────────────────────────────────

export interface ShellHeaderProps {
  className?: string;
}

/**
 * ShellHeader
 *
 * Application header that renders breadcrumbs, extension slots
 * (search, notifications, user menu), and core controls (theme toggle).
 *
 * Extensions render in three zones:
 *   - header-left: search triggers, secondary controls
 *   - header-right: notifications, user menu, theme toggle
 *   - overlay: not rendered here (rendered at the shell root)
 */
export function ShellHeader({ className }: ShellHeaderProps) {
  const { getExtensionsAt, currentRoute } = useAppShell();
  const { logout } = useAuth();

  const leftExtensions = getExtensionsAt('header-left');
  const rightExtensions = getExtensionsAt('header-right');

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-4 border-b px-4',
        className,
      )}
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in oklch, var(--background) 80%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left zone: breadcrumbs + left extensions */}
      <div className="flex flex-1 items-center gap-3">
        <ShellBreadcrumbs />
        {leftExtensions}
      </div>

      {/* Search entry point (core, not an extension for discoverability) */}
      <div className="hidden w-72 md:flex items-center relative">
        <Search className="absolute left-3 h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
        <Input
          placeholder="Search agents, calls..."
          className="h-8 pl-8 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Right zone: core controls + extensions */}
      <div className="flex items-center gap-1">
        {/* Right-side extensions (notifications, etc.) */}
        {rightExtensions}

        <ThemeToggle />

        {/* Notification entry point */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--primary)' }}
          />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs font-semibold">HT</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
