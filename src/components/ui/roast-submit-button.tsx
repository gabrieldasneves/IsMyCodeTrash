"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function RoastSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      disabled={isDisabled}
      className="w-full sm:w-auto"
    >
      {pending ? "$ roasting..." : "roast my code"}
    </Button>
  );
}
