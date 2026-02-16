"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const components: Partial<Components> = {
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");

            // Block code (has language class or is multi-line inside pre)
            if (match) {
                return <CodeBlock language={match[1]} code={codeStr} />;
            }

            // Check if it's inside a <pre> (block code without language)
            const isBlock = codeStr.includes("\n");
            if (isBlock) {
                return <CodeBlock language="text" code={codeStr} />;
            }

            // Inline code
            return (
                <code
                    className="px-1.5 py-0.5 rounded-md bg-secondary/80 text-sm font-mono text-primary"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        pre({ children }) {
            // If children is already a CodeBlock, don't wrap it in <pre>
            return <>{children}</>;
        },
        a({ href, children, ...props }) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    {...props}
                >
                    {children}
                </a>
            );
        },
    };

    return (
        <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
