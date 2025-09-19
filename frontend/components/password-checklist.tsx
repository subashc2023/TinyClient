import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RULES: Array<{ label: string; test: (value: string) => boolean }> = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "Contains a letter", test: (value) => /[A-Za-z]/.test(value) },
  { label: "Contains a number", test: (value) => /\d/.test(value) },
];

interface PasswordChecklistProps {
  password: string;
  className?: string;
}

export function PasswordChecklist({ password, className }: PasswordChecklistProps) {
  return (
    <ul className={cn("space-y-1.5 text-xs", className)}>
      {RULES.map((rule) => {
        const satisfied = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2">
            {satisfied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn(satisfied ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
