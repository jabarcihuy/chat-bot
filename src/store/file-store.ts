import { create } from "zustand";
import { toast } from "sonner";

export interface FileNode {
    name: string;
    path: string;
    isDir: boolean;
    children?: FileNode[];
}

interface FileState {
    fileTree: FileNode[];
    activeFilePath: string | null;
    activeFileContent: string | null;
    isDirty: boolean;
    isLoadingTree: boolean;
    isLoadingFile: boolean;

    fetchFileTree: () => Promise<void>;
    openFile: (path: string) => Promise<void>;
    saveFile: (path: string, content: string) => Promise<boolean>;
    createFile: (path: string, isDir: boolean) => Promise<boolean>;
    deleteFile: (path: string) => Promise<boolean>;
    closeActiveFile: () => void;
    setFileContent: (content: string) => void;
}

export const useFileStore = create<FileState>()((set, get) => ({
    fileTree: [],
    activeFilePath: null,
    activeFileContent: null,
    isDirty: false,
    isLoadingTree: false,
    isLoadingFile: false,

    fetchFileTree: async () => {
        set({ isLoadingTree: true });
        try {
            const res = await fetch("/api/files");
            if (res.status === 401) {
                // Silently clear tree if unauthenticated (e.g. on login page)
                set({ fileTree: [] });
                return;
            }
            if (!res.ok) throw new Error("Gagal memuat daftar berkas");
            const data = await res.json();
            set({ fileTree: data });
        } catch (error: any) {
            console.error("fetchFileTree error:", error);
            toast.error(error.message || "Gagal memuat berkas proyek.");
        } finally {
            set({ isLoadingTree: false });
        }
    },

    openFile: async (filePath: string) => {
        set({ isLoadingFile: true });
        try {
            const res = await fetch(`/api/files?filePath=${encodeURIComponent(filePath)}`);
            if (!res.ok) throw new Error(`Gagal membuka berkas: ${filePath}`);
            const data = await res.json();
            set({ 
                activeFilePath: filePath, 
                activeFileContent: data.content,
                isDirty: false 
            });
            toast.success(`Membuka: ${filePath.split("/").pop()}`);
        } catch (error: any) {
            console.error("openFile error:", error);
            toast.error(error.message || "Gagal membuka berkas.");
        } finally {
            set({ isLoadingFile: false });
        }
    },

    saveFile: async (filePath: string, content: string) => {
        try {
            const res = await fetch("/api/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath, content }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan berkas");
            set({ isDirty: false });
            toast.success("Berkas berhasil disimpan!");
            return true;
        } catch (error: any) {
            console.error("saveFile error:", error);
            toast.error(error.message || "Gagal menyimpan berkas.");
            return false;
        }
    },

    deleteFile: async (filePath: string) => {
        try {
            const res = await fetch("/api/files", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath }),
            });
            if (!res.ok) throw new Error("Gagal menghapus berkas");

            // Close file if it was deleted
            const active = get().activeFilePath;
            if (active === filePath || (active && active.startsWith(filePath + "/"))) {
                set({ activeFilePath: null, activeFileContent: null, isDirty: false });
            }

            toast.success("Berkas berhasil dihapus!");
            await get().fetchFileTree();
            return true;
        } catch (error: any) {
            console.error("deleteFile error:", error);
            toast.error(error.message || "Gagal menghapus berkas.");
            return false;
        }
    },

    createFile: async (filePath: string, isDir: boolean) => {
        try {
            const res = await fetch("/api/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filePath, isDir, content: isDir ? null : "" }),
            });
            if (!res.ok) throw new Error(isDir ? "Gagal membuat folder" : "Gagal membuat berkas");
            toast.success(isDir ? "Folder berhasil dibuat!" : "Berkas berhasil dibuat!");
            await get().fetchFileTree();
            return true;
        } catch (error: any) {
            console.error("createFile error:", error);
            toast.error(error.message || "Gagal membuat item.");
            return false;
        }
    },

    closeActiveFile: () => {
        set({ activeFilePath: null, activeFileContent: null, isDirty: false });
    },

    setFileContent: (content: string) => {
        set({ activeFileContent: content, isDirty: true });
    }
}));
