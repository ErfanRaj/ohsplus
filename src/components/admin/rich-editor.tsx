import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  { value: "inherit", label: "پیش‌فرض سایت" },
  { value: "Vazirmatn, sans-serif", label: "وزیرمتن" },
  { value: "Tahoma, sans-serif", label: "تاهوما" },
  { value: "Georgia, serif", label: "جورجیا" },
  { value: "'Courier New', monospace", label: "مونواسپیس" },
];

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "32px"];

const BLOCKS = [
  { value: "paragraph", label: "متن معمولی" },
  { value: "1", label: "عنوان ۱" },
  { value: "2", label: "عنوان ۲" },
  { value: "3", label: "عنوان ۳" },
  { value: "4", label: "عنوان ۴" },
];

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      aria-pressed={active}
      className={cn("size-8", active && "bg-primary/10 text-primary")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentBlock = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : editor.isActive("heading", { level: 4 })
          ? "4"
          : "paragraph";

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "articles");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "بارگذاری تصویر ناموفق بود");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-border bg-muted/40 p-2">
      <Select
        value={currentBlock}
        onValueChange={(value) => {
          if (value === "paragraph") editor.chain().focus().setParagraph().run();
          else
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 })
              .run();
        }}
      >
        <SelectTrigger className="h-8 w-32 text-xs" aria-label="سبک متن">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLOCKS.map((block) => (
            <SelectItem key={block.value} value={block.value}>
              {block.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={editor.getAttributes("textStyle").fontFamily ?? "inherit"}
        onValueChange={(value) =>
          value === "inherit"
            ? editor.chain().focus().unsetFontFamily().run()
            : editor.chain().focus().setFontFamily(value).run()
        }
      >
        <SelectTrigger className="h-8 w-32 text-xs" aria-label="فونت">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={editor.getAttributes("textStyle").fontSize ?? "16px"}
        onValueChange={(value) => editor.chain().focus().setFontSize(value).run()}
      >
        <SelectTrigger className="h-8 w-20 text-xs" aria-label="اندازه فونت">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size.replace("px", "")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        label="درشت"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="مورب"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="زیرخط"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {(
        [
          ["right", AlignRight, "راست‌چین"],
          ["center", AlignCenter, "وسط‌چین"],
          ["left", AlignLeft, "چپ‌چین"],
          ["justify", AlignJustify, "هم‌تراز"],
        ] as const
      ).map(([align, Icon, label]) => (
        <ToolbarButton
          key={align}
          label={label}
          active={editor.isActive({ textAlign: align })}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
        >
          <Icon className="size-4" aria-hidden="true" />
        </ToolbarButton>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        label="فهرست نقطه‌ای"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="فهرست شماره‌دار"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label="نقل قول"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="خط جداکننده" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        label="افزودن پیوند"
        active={editor.isActive("link")}
        onClick={() => {
          const previous = editor.getAttributes("link").href ?? "";
          const url = window.prompt("نشانی پیوند را وارد کنید", previous);
          if (url === null) return;
          if (url.trim() === "") {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().setLink({ href: url.trim() }).run();
        }}
      >
        <Link2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="افزودن تصویر" onClick={() => fileRef.current?.click()}>
        {uploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-4" aria-hidden="true" />
        )}
      </ToolbarButton>
      <ToolbarButton
        label="درج جدول"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <TableIcon className="size-4" aria-hidden="true" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton label="واگرد" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="ازنو" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" aria-hidden="true" />
      </ToolbarButton>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => handleImage(event.target.files?.[0])}
      />
    </div>
  );
}

export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class:
          "article-content min-h-72 rounded-b-lg border border-border bg-background p-4 focus:outline-none",
        dir: "rtl",
      },
    },
  });

  if (!editor) {
    return <div className="h-80 animate-pulse rounded-lg bg-muted" aria-hidden="true" />;
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
