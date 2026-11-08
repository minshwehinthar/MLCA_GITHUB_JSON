"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Link2, Quote, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const tools = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "formatBlock", value: "h2", icon: Heading2, label: "Heading" },
  { command: "insertUnorderedList", icon: List, label: "Bullet list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { command: "formatBlock", value: "blockquote", icon: Quote, label: "Quote" },
  { command: "undo", icon: Undo2, label: "Undo" },
  { command: "redo", icon: Redo2, label: "Redo" },
] as const;

export function RichTextEditor({ value = "", onChange, placeholder = "Write content...", className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const addLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) exec("createLink", url);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-burgundy/30", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-cream-dark/60 p-1.5">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <button
              key={`${tool.command}-${index}`}
              type="button"
              title={tool.label}
              onClick={() => exec(tool.command, "value" in tool ? tool.value : undefined)}
              className="rounded p-1.5 text-stone-600 transition-colors hover:bg-white hover:text-burgundy"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <button
          type="button"
          title="Link"
          onClick={addLink}
          className="rounded p-1.5 text-stone-600 transition-colors hover:bg-white hover:text-burgundy"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="ce-editor rich-content min-h-[180px] max-h-[420px] overflow-y-auto px-3 py-2 text-sm focus:outline-none"
      />
    </div>
  );
}
