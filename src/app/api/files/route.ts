import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import path from "path";

interface FileNode {
    name: string;
    path: string;
    isDir: boolean;
    url?: string | null;
    children?: FileNode[];
}

// Convert a flat list of UserFiles from the DB into a nested tree structure
function buildTreeFromFiles(files: { name: string; path: string; isDir: boolean; url?: string | null }[]): FileNode[] {
    const root: FileNode[] = [];
    const pathMap: Record<string, FileNode> = {};

    // Auto-infer parent directories if they don't explicitly exist in the files array
    const allNodesMap: Record<string, { name: string; path: string; isDir: boolean; url?: string | null }> = {};
    for (const file of files) {
        allNodesMap[file.path] = file;
        const parts = file.path.split("/");
        let currentPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
            currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
            if (!allNodesMap[currentPath]) {
                allNodesMap[currentPath] = {
                    name: parts[i],
                    path: currentPath,
                    isDir: true,
                };
            }
        }
    }

    // Sort: directories first, then alphabetical order
    const sortedNodes = Object.values(allNodesMap).sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
    });

    for (const node of sortedNodes) {
        const fileNode: FileNode = {
            name: node.name,
            path: node.path,
            isDir: node.isDir,
            url: node.url || null,
        };
        if (node.isDir) {
            fileNode.children = [];
        }
        pathMap[node.path] = fileNode;

        const parts = node.path.split("/");
        if (parts.length === 1) {
            root.push(fileNode);
        } else {
            const parentPath = parts.slice(0, -1).join("/");
            const parent = pathMap[parentPath];
            if (parent && parent.children) {
                parent.children.push(fileNode);
            } else {
                root.push(fileNode);
            }
        }
    }

    return root;
}

// Initialize default template files for a brand-new user
async function initializeDefaultFiles(userId: string) {
    const defaults = [
        {
            name: "README.md",
            path: "README.md",
            isDir: false,
            content: `# Selamat Datang di Asisten AI & Workspace Anda!

Ini adalah ruang kerja (workspace) virtual Anda. Semua berkas yang Anda buat di sini disimpan dengan aman di database Supabase Anda, dipisahkan secara privat dari pengguna lainnya.

### Fitur yang tersedia:
1. **File Explorer**: Kelola berkas teks/kode secara rekursif di panel sisi kiri ("Berkas").
2. **Monaco Code Editor**: Klik berkas apa saja untuk mengeditnya secara langsung di kanvas editor.
3. **Penyimpanan Cloud**: Berkas disimpan di Supabase, dan aset media diupload ke Cloudinary.`
        },
        {
            name: "index.js",
            path: "src/index.js",
            isDir: false,
            content: `// Contoh berkas JavaScript di workspace virtual Anda
function sapaPengguna(nama) {
    console.log("Halo, " + nama + "! Selamat bekerja!");
}

sapaPengguna("Developer");`
        }
    ];

    for (const file of defaults) {
        await prisma.userFile.upsert({
            where: {
                userId_path: {
                    userId,
                    path: file.path
                }
            },
            update: {},
            create: {
                userId,
                name: file.name,
                path: file.path,
                isDir: file.isDir,
                content: file.content,
                size: Buffer.byteLength(file.content)
            }
        });
    }
}

// GET: List files (tree) or read a single file
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const filePathParam = searchParams.get("filePath");

    // If filePath is provided, read that specific file
    if (filePathParam) {
        try {
            const file = await prisma.userFile.findUnique({
                where: {
                    userId_path: {
                        userId,
                        path: filePathParam
                    }
                }
            });

            if (!file) {
                return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 404 });
            }

            return NextResponse.json({ 
                content: file.content || "", 
                url: file.url || null 
            });
        } catch (error) {
            console.error("Error reading virtual file:", error);
            return NextResponse.json({ error: "Gagal membaca berkas" }, { status: 500 });
        }
    }

    // Default: return the full file tree for the user
    try {
        let files = await prisma.userFile.findMany({
            where: { userId }
        });

        // Initialize default welcome files if workspace is completely empty
        if (files.length === 0) {
            await initializeDefaultFiles(userId);
            files = await prisma.userFile.findMany({
                where: { userId }
            });
        }

        const tree = buildTreeFromFiles(files);
        return NextResponse.json(tree);
    } catch (error) {
        console.error("Error listing virtual files:", error);
        return NextResponse.json({ error: "Gagal memuat berkas" }, { status: 500 });
    }
}

// POST: Write/Save a file to the database
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { filePath, content, url, isDir } = await req.json();
        if (!filePath) {
            return NextResponse.json({ error: "filePath is required" }, { status: 400 });
        }

        const fileName = path.basename(filePath);

        await prisma.userFile.upsert({
            where: {
                userId_path: {
                    userId,
                    path: filePath
                }
            },
            update: {
                content: content || null,
                url: url || null,
                size: content ? Buffer.byteLength(content) : 0,
                updatedAt: new Date()
            },
            create: {
                userId,
                path: filePath,
                name: fileName,
                isDir: isDir === true,
                content: content || null,
                url: url || null,
                size: content ? Buffer.byteLength(content) : 0
            }
        });

        return NextResponse.json({ success: true, message: isDir ? "Folder berhasil dibuat" : "Berkas disimpan dengan sukses" });
    } catch (error: any) {
        console.error("Error writing virtual file:", error);
        return NextResponse.json({ error: error.message || "Gagal menyimpan berkas" }, { status: 500 });
    }
}

// DELETE: Delete a file or directory recursively
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { filePath } = await req.json();
        if (!filePath) {
            return NextResponse.json({ error: "filePath is required" }, { status: 400 });
        }

        // Delete the exact file/folder path OR any files nested inside it (like directory delete)
        await prisma.userFile.deleteMany({
            where: {
                userId,
                OR: [
                    { path: filePath },
                    { path: { startsWith: `${filePath}/` } }
                ]
            }
        });

        return NextResponse.json({ success: true, message: "Berkas berhasil dihapus" });
    } catch (error: any) {
        console.error("Error deleting virtual file:", error);
        return NextResponse.json({ error: error.message || "Gagal menghapus berkas" }, { status: 500 });
    }
}
