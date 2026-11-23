import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StagePlaceholderProps {
  title: string;
  stage: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export function StagePlaceholder({
  title,
  stage,
  description,
  features,
  icon: Icon,
}: StagePlaceholderProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Back to Overview</span>
          </Link>
        </Button>
        <Badge variant="secondary" className="text-xs font-semibold">
          {stage}
        </Badge>
      </div>

      <Card className="border-border">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-dashed border-border bg-accent/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Scheduled Implementation Scope</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Stage 1 layout and routing verified</span>
            </div>
            <p>Will be activated in subsequent stage.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
