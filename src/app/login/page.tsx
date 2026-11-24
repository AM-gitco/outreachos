"use client";

import * as React from "react";
import { useActionState } from "react";
import { loginAction, type AuthResponse } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { OutreachLogo } from "@/components/icons/outreach-logo";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthResponse | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-muted/30 dark:bg-black select-none">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-40 blur-md group-hover:opacity-70 transition duration-500" />
            <OutreachLogo size={64} className="relative rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                {APP_NAME}
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider uppercase">
                v1.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              {APP_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Sign In to Control Center
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to manage outreach operations
            </CardDescription>
          </CardHeader>

          <CardContent>
            {state?.error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="operator@company.com"
                    autoComplete="email"
                    required
                    className="pl-9 text-sm"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-foreground"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="pl-9 text-sm"
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-md shadow-primary/20 h-10 mt-2"
                disabled={isPending}
              >
                {isPending ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Restricted access: Single-tenant operator environment</span>
            </div>
          </CardContent>
        </Card>

        {/* Security / Help Note */}
        <p className="text-center text-xs text-muted-foreground px-4">
          Public signup is disabled for security. Contact your system administrator to provision access.
        </p>
      </div>
    </div>
  );
}
