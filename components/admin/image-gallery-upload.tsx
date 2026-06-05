"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Star, X } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

function publicUrl(key: string): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

type Props = {
  /** Form field name. Renders one hidden input per image; use `formData.getAll(name)` on submit. */
  name: string;
  defaultValue?: string[];
  folder?: string;
  className?: string;
};

/**
 * Multi-image gallery field. The add tile opens the media library, which
 * covers both picking existing files and uploading new ones.
 */
export function ImageGalleryUpload({
  name,
  defaultValue = [],
  folder = "products",
  className,
}: Props) {
  const [keys, setKeys] = useState<string[]>(defaultValue);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const addFromLibrary = (picked: string[]) => {
    setKeys((prev) => [...prev, ...picked.filter((k) => !prev.includes(k))]);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...keys];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setKeys(next);
  };

  const remove = (idx: number) => {
    setKeys((prev) => prev.filter((_, i) => i !== idx));
  };

  const setHero = (idx: number) => {
    if (idx === 0) return;
    setKeys((prev) => {
      const next = [...prev];
      const [pulled] = next.splice(idx, 1);
      next.unshift(pulled);
      return next;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {keys.map((key) => (
        <input key={key} type="hidden" name={name} value={key} />
      ))}

      {keys.length === 0 ? (
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="border-input bg-background hover:bg-accent text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-xs transition-colors"
        >
          <ImagePlus className="size-5" />
          Add images
          <span className="text-muted-foreground/70 text-[10px]">
            Pick from the library or upload new. Multiple supported.
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {keys.map((key, idx) => (
            <Thumb
              key={key}
              src={publicUrl(key)}
              isHero={idx === 0}
              isFirst={idx === 0}
              isLast={idx === keys.length - 1}
              onSetHero={() => setHero(idx)}
              onMoveLeft={() => move(idx, -1)}
              onMoveRight={() => move(idx, 1)}
              onRemove={() => remove(idx)}
            />
          ))}
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="border-input bg-background hover:bg-accent text-muted-foreground flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-[10px] transition-colors"
          >
            <ImagePlus className="size-4" />
            Add
          </button>
        </div>
      )}

      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onPick={addFromLibrary}
        multiple
        type="image"
        folder={folder}
      />
    </div>
  );
}

function Thumb({
  src,
  isHero,
  isFirst,
  isLast,
  onSetHero,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: {
  src: string;
  isHero: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSetHero: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group/thumb border-border bg-muted/30 relative aspect-square overflow-hidden rounded-xl border">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : null}

      {isHero && (
        <span className="bg-foreground text-background absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
          <Star className="size-2.5 fill-current" />
          Hero
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover/thumb:opacity-100"
      >
        <X className="size-3" />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1.5 opacity-0 transition-opacity group-hover/thumb:opacity-100">
        <div className="flex gap-0.5">
          <ActionButton
            onClick={onMoveLeft}
            disabled={isFirst}
            label="Move left"
          >
            <ChevronLeft className="size-3" />
          </ActionButton>
          <ActionButton
            onClick={onMoveRight}
            disabled={isLast}
            label="Move right"
          >
            <ChevronRight className="size-3" />
          </ActionButton>
        </div>
        {!isHero && (
          <button
            type="button"
            onClick={onSetHero}
            className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-900 hover:bg-white"
          >
            Set hero
          </button>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-5 place-items-center rounded bg-white/90 text-zinc-900 transition-colors hover:bg-white disabled:opacity-40 disabled:hover:bg-white/90"
    >
      {children}
    </button>
  );
}
