import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/utils/env";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <GraduationCap className="h-6 w-6" />
      </div>
      <div>
        <div className="font-display text-xl font-bold tracking-tight text-foreground">{APP_NAME}</div>
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Role-aware auth and dashboards</div>
      </div>
    </div>
  );
}