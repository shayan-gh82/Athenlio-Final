import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthField({
  error,
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { error?: string; label: string }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={Boolean(error)} aria-describedby={errorId} className="h-12 rounded-xl bg-background/70" {...props} />
      {error ? <p id={errorId} className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
