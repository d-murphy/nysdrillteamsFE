import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import History from "@tiptap/extension-history";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBold,
    faItalic,
    faUnderline,
    faListUl,
    faListOl,
    faQuoteLeft,
    faLink,
    faHeading,
    faCode,
} from "@fortawesome/free-solid-svg-icons";

type EditorMode = "visual" | "html";

interface ArticleEditorProps {
    content: string;
    editable: boolean;
    onChange: (html: string) => void;
}

export default function ArticleEditor({ content, editable, onChange }: ArticleEditorProps) {
    const [mode, setMode] = React.useState<EditorMode>("visual");
    const [htmlSource, setHtmlSource] = React.useState(content || "");

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            Underline,
            Heading.configure({ levels: [2] }),
            BulletList,
            OrderedList,
            ListItem,
            Blockquote,
            History,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
            }),
            Placeholder.configure({ placeholder: "Write the article…" }),
        ],
        content,
        editable,
        onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    });

    React.useEffect(() => {
        if (!editor) return;
        editor.setEditable(editable && mode === "visual");
    }, [editor, editable, mode]);

    React.useEffect(() => {
        if (mode === "html") {
            setHtmlSource(content || "");
            return;
        }
        if (!editor) return;
        const current = editor.getHTML();
        if (content !== current) {
            editor.commands.setContent(content || "", false);
        }
    }, [content, editor, mode]);

    const switchToHtml = () => {
        const html = editor ? editor.getHTML() : content || "";
        setHtmlSource(html);
        setMode("html");
    };

    const switchToVisual = () => {
        if (editor) {
            editor.commands.setContent(htmlSource || "", false);
        }
        onChange(htmlSource || "");
        setMode("visual");
    };

    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        setHtmlSource(next);
        onChange(next);
    };

    if (!editor) return null;

    const setLink = () => {
        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("URL", previous || "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className={`article-editor ${editable ? "" : "article-editor-readonly"}`}>
            {editable && (
                <div className="article-editor-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex flex-wrap gap-1">
                        {mode === "visual" && (
                            <>
                                <ToolbarBtn
                                    active={editor.isActive("heading", { level: 2 })}
                                    onClick={() =>
                                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                                    }
                                    title="Heading"
                                >
                                    <FontAwesomeIcon icon={faHeading} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("bold")}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    title="Bold"
                                >
                                    <FontAwesomeIcon icon={faBold} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("italic")}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    title="Italic"
                                >
                                    <FontAwesomeIcon icon={faItalic} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("underline")}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    title="Underline"
                                >
                                    <FontAwesomeIcon icon={faUnderline} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("bulletList")}
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    title="Bullet list"
                                >
                                    <FontAwesomeIcon icon={faListUl} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("orderedList")}
                                    onClick={() =>
                                        editor.chain().focus().toggleOrderedList().run()
                                    }
                                    title="Numbered list"
                                >
                                    <FontAwesomeIcon icon={faListOl} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("blockquote")}
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    title="Quote"
                                >
                                    <FontAwesomeIcon icon={faQuoteLeft} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                    active={editor.isActive("link")}
                                    onClick={setLink}
                                    title="Link"
                                >
                                    <FontAwesomeIcon icon={faLink} />
                                </ToolbarBtn>
                            </>
                        )}
                        {mode === "html" && (
                            <span className="article-editor-html-hint small text-muted align-self-center">
                                Editing HTML source
                            </span>
                        )}
                    </div>

                    <div className="btn-group btn-group-sm" role="group" aria-label="Editor mode">
                        <button
                            type="button"
                            className={`btn ${
                                mode === "visual" ? "btn-secondary" : "btn-outline-secondary"
                            }`}
                            onClick={switchToVisual}
                        >
                            Visual
                        </button>
                        <button
                            type="button"
                            className={`btn ${
                                mode === "html" ? "btn-secondary" : "btn-outline-secondary"
                            }`}
                            onClick={switchToHtml}
                        >
                            <FontAwesomeIcon icon={faCode} className="me-1" />
                            HTML
                        </button>
                    </div>
                </div>
            )}

            {mode === "visual" ? (
                <EditorContent editor={editor} className="article-editor-content" />
            ) : (
                <textarea
                    className="article-editor-html-source"
                    value={htmlSource}
                    onChange={handleHtmlChange}
                    disabled={!editable}
                    spellCheck={false}
                    aria-label="HTML source"
                />
            )}
        </div>
    );
}

function ToolbarBtn({
    active,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            className={`btn btn-sm ${active ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
    );
}
