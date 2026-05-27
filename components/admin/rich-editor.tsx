"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROSE_CLASSES = cn(
  "min-h-[14rem] w-full px-4 py-3 text-sm outline-none",
  "[&_p]:my-2 [&_p]:leading-relaxed",
  "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-foreground/40 hover:[&_a]:decoration-foreground",
  "[&_strong]:font-semibold",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:font-mono",
  "[&_hr]:my-6 [&_hr]:border-border",
  // Placeholder rendering (Tiptap Placeholder extension)
  "[&_p.is-editor-empty:first-child]:before:text-muted-foreground/60",
  "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
  "[&_p.is-editor-empty:first-child]:before:float-left",
  "[&_p.is-editor-empty:first-child]:before:h-0",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none",
);

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

export function RichEditor({
  name,
  defaultValue = "",
  placeholder = "Write something…",
  className,
}: Props) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: PROSE_CLASSES,
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.isEmpty ? "" : editor.getHTML();
      setHtml(next);
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 overflow-hidden rounded-lg border transition-colors",
        className,
      )}
    >
      <input type="hidden" name={name} value={html} />
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Toolbar
// ────────────────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href ?? "";
    const next = window.prompt("Link URL", previous);
    if (next === null) return;
    if (next === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:|tel:|\/)/.test(next) ? next : `https://${next}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }, [editor]);

  return (
    <div className="border-border bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1.5">
      <ToolGroup>
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold") ?? false}
          title="Bold (Ctrl+B)"
          icon={Bold}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic") ?? false}
          title="Italic (Ctrl+I)"
          icon={Italic}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline") ?? false}
          title="Underline (Ctrl+U)"
          icon={UnderlineIcon}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike") ?? false}
          title="Strikethrough"
          icon={Strikethrough}
        />
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton
          editor={editor}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor?.isActive("heading", { level: 2 }) ?? false}
          title="Heading 2"
          icon={Heading2}
        />
        <ToolButton
          editor={editor}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor?.isActive("heading", { level: 3 }) ?? false}
          title="Heading 3"
          icon={Heading3}
        />
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList") ?? false}
          title="Bullet list"
          icon={List}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList") ?? false}
          title="Numbered list"
          icon={ListOrdered}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote") ?? false}
          title="Quote"
          icon={Quote}
        />
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton
          editor={editor}
          onClick={setLink}
          active={editor?.isActive("link") ?? false}
          title="Add link (Ctrl+K)"
          icon={LinkIcon}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().unsetLink().run()}
          active={false}
          title="Remove link"
          icon={Link2Off}
          disabled={!editor?.isActive("link")}
        />
      </ToolGroup>

      <Divider />

      <ToolGroup>
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().undo().run()}
          active={false}
          title="Undo (Ctrl+Z)"
          icon={Undo2}
          disabled={!editor?.can().undo()}
        />
        <ToolButton
          editor={editor}
          onClick={() => editor?.chain().focus().redo().run()}
          active={false}
          title="Redo (Ctrl+Shift+Z)"
          icon={Redo2}
          disabled={!editor?.can().redo()}
        />
      </ToolGroup>
    </div>
  );
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <span className="bg-border/80 mx-1 h-5 w-px" aria-hidden />;
}

function ToolButton({
  editor,
  onClick,
  active,
  title,
  icon: Icon,
  disabled,
}: {
  editor: Editor | null;
  onClick: () => void;
  active: boolean;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!editor || disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "grid size-7 place-items-center rounded-md transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
