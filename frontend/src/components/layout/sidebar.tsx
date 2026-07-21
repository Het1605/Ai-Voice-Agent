'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { routes, groupRoutes } from '@/navigation';
import type { RouteDefinition } from '@/navigation';
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShellStore } from '@/store/shell-store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

function NavLink({ item, collapsed }: { item: RouteDefinition; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && !item.exact);
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive
          ? 'bg-sidebar-accent text-sidebar-primary nav-glow'
          : 'text-sidebar-foreground/70',
        collapsed && 'justify-center px-2',
      )}
    >
      {item.icon && (
        <item.icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground',
          )}
        />
      )}
      {!collapsed && (
        <span className="truncate">{item.title}</span>
      )}
      {!collapsed && item.badge != null && (
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useShellStore();
  const navGroups = groupRoutes(routes.filter((r) => !r.hidden && r.group));
  const groupOrder = ['main', 'org'];
  const orderedGroups = groupOrder
    .map((key) => ({ title: key === 'org' ? 'Organization' : undefined, items: navGroups[key] || [] }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-14 items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'gap-2.5',
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-md">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            VoiceGateway
          </span>
        )}
      </div>

      {/* Nav Sections */}
      <ScrollArea className="flex-1 py-3">
        <div className="space-y-4 px-2">
          {orderedGroups.map((section, si) => (
            <div key={si}>
              {section.title && !collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {section.title}
                </p>
              )}
              {section.title && collapsed && <Separator className="mx-auto w-8 bg-sidebar-border" />}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.id} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn(
            'w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed ? 'justify-center px-0' : 'justify-end',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <span className="text-xs">Collapse</span>
              <ChevronLeft className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
