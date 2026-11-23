"use client";

import * as React from "react";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  email?: string | null;
  role?: string;
  name?: string | null;
}

export function UserMenu({ email, role = "admin", name }: UserMenuProps) {
  const [isPending, startTransition] = React.useTransition();
  const displayName = name || email?.split("@")[0] || "Admin";

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none cursor-pointer"
          aria-label="User account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground">{displayName}</p>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">
                {role}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">{email || "admin@outreachos.internal"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground cursor-default flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Role: <strong className="capitalize text-foreground">{role}</strong></span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>{isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
