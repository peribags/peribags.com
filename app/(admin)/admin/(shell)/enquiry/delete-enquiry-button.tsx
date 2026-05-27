"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { deleteEnquiryAction } from "./actions";

type Variant = "icon" | "destructive";

type Props = {
  id: string;
  customerName: string;
  variant?: Variant;
  className?: string;
};

export function DeleteEnquiryButton({
  id,
  customerName,
  variant = "icon",
  className,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "destructive" ? (
          <Button variant="destructive" size="sm" className={className}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            title="Delete enquiry"
            className={cn(
              "text-muted-foreground hover:text-destructive h-8 px-2",
              className,
            )}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-foreground font-medium">{customerName}</span>
            ’s enquiry will be permanently removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteEnquiryAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
