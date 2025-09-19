import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { getPasswordPolicy } from "@/lib/config";

const policy = getPasswordPolicy();

const RULES: Array<{ label: string; test: (value: string) => boolean }> = [
  { label: `At least ${policy.minLength} characters`, test: (value) => value.length >= policy.minLength },
  ...(policy.requireLower ? [{ label: "Contains a lowercase letter", test: (value: string) => /[a-z]/.test(value) }] : []),
  ...(policy.requireUpper ? [{ label: "Contains an uppercase letter", test: (value: string) => /[A-Z]/.test(value) }] : []),
  ...(policy.requireDigit ? [{ label: "Contains a number", test: (value: string) => /\d/.test(value) }] : []),
  ...(policy.requireSymbol ? [{ label: "Contains a symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) }] : []),
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
