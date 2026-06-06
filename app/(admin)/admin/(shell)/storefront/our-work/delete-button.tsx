"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteOurWorkAction } from "./actions";

type Props = {
  id: string;
  name: string;
  variant?: "icon" | "destructive";
  className?: string;
};

export function DeleteOurWorkButton({
  id,
  name,
  variant = "icon",
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {variant === "destructive" ? (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className={className}
          >
            <Trash2 className="size-4" />
            Delete item
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-destructive h-8",
              className,
            )}
            title="Delete item"
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-foreground font-medium">{name}</span> will be
            permanently removed from the Our Work page. This action can&apos;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteOurWorkAction}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
