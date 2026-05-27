"use client";

import { useRef, useState } from "react";
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
import { deleteCategoryAction } from "./actions";

type Props = {
  id: string;
  name: string;
  descendantCount?: number;
  /** "icon" = trash glyph; "labeled" = trash + "Delete"; "destructive" = filled destructive button. */
  variant?: "icon" | "labeled" | "destructive";
  className?: string;
};

export function DeleteCategoryButton({
  id,
  name,
  descendantCount = 0,
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
            Delete category
          </Button>
        ) : variant === "labeled" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("text-destructive hover:text-destructive", className)}
          >
            <Trash2 className="size-3.5" />
            Delete
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
            title="Delete category"
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this category?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-foreground font-medium">{name}</span>{" "}
            will be permanently removed.
            {descendantCount > 0 && (
              <>
                {" "}
                This will also delete{" "}
                <span className="text-foreground font-medium">
                  {descendantCount} nested{" "}
                  {descendantCount === 1 ? "category" : "categories"}
                </span>{" "}
                inside it.
              </>
            )}{" "}
            This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Form submission lets the server action's redirect() work cleanly. */}
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton
              total={descendantCount + 1}
              showCount={descendantCount > 0}
            />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmButton({
  total,
  showCount,
}: {
  total: number;
  showCount: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
    >
      {pending ? "Deleting…" : showCount ? `Delete ${total} categories` : "Delete"}
    </Button>
  );
}
