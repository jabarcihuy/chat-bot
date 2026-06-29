"use client";

import { useEffect, useState } from "react";
import { useFileStore, FileNode } from "@/store/file-store";
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, RefreshCw, Trash2, FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FileExplorerProps {
    onFileSelect?: () => void;
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
    const { fileTree, isLoadingTree, fetchFileTree, openFile, activeFilePath, createFile } = useFileStore();

    useEffect(() => {
        fetchFileTree();
    }, [fetchFileTree]);

    const handleCreateFile = async () => {
        const path = prompt("Masukkan nama/path berkas baru (contoh: src/test.js):");
        if (path && path.trim()) {
            await createFile(path.trim(), false);
        }
    };

    const handleCreateFolder = async () => {
        const path = prompt("Masukkan nama/path folder baru (contoh: components):");
        if (path && path.trim()) {
            await createFile(path.trim(), true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/5 shrink-0 bg-muted/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Direktori Proyek</span>
                <div className="flex items-center gap-0.5">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={handleCreateFile}
                        title="Buat Berkas Baru"
                    >
                        <FilePlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={handleCreateFolder}
                        title="Buat Folder Baru"
                    >
                        <FolderPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={fetchFileTree}
                        disabled={isLoadingTree}
                        title="Muat Ulang"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", isLoadingTree && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-2">
                {isLoadingTree && fileTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground/60 gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>Memuat berkas proyek...</span>
                    </div>
                ) : fileTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground/40">
                        <span>Tidak ada berkas ditemukan</span>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {fileTree.map((node) => (
                            <TreeNode 
                                key={node.path} 
                                node={node} 
                                depth={0} 
                                activePath={activeFilePath}
                                onOpenFile={(path) => {
                                    openFile(path);
                                    if (onFileSelect) onFileSelect();
                                }}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

interface TreeNodeProps {
    node: FileNode;
    depth: number;
    activePath: string | null;
    onOpenFile: (path: string) => void;
}

function TreeNode({ node, depth, activePath, onOpenFile }: TreeNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { deleteFile } = useFileStore();
    const hasChildren = node.isDir && node.children && node.children.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.isDir) {
            setIsOpen(!isOpen);
        } else {
            onOpenFile(node.path);
        }
    };

    const isSelected = activePath === node.path;

    return (
        <div className="select-none">
            <div
                onClick={handleToggle}
                className={cn(
                    "group flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer text-xs font-medium transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10",
                    isSelected ? "bg-primary/10 border-primary/20 text-primary" : "text-foreground/80 hover:text-foreground"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {node.isDir ? (
                    <>
                        <span className="text-muted-foreground/60 shrink-0">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-amber-500/80 shrink-0">
                            {isOpen ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
                        </span>
                    </>
                ) : (
                    <span className={cn("shrink-0", isSelected ? "text-primary" : "text-muted-foreground/60")}>
                        <File className="h-3.5 w-3.5 ml-3.5" />
                    </span>
                )}
                <span className="truncate flex-1 py-0.5">{node.name}</span>
                
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-all focus:opacity-100 shrink-0 text-muted-foreground/50 hover:bg-red-500/10"
                    title="Hapus berkas"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title={node.isDir ? "Hapus Folder?" : "Hapus Berkas?"}
                description={`Apakah Anda yakin ingin menghapus "${node.name}"? Semua isi di dalamnya akan dihapus secara permanen.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
                onConfirm={async () => {
                    await deleteFile(node.path);
                }}
            />

            {node.isDir && isOpen && hasChildren && (
                <div className="mt-0.5">
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            activePath={activePath}
                            onOpenFile={onOpenFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
