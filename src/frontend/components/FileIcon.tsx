import { IFile, IFolder } from "./Icons";

export function FileIcon({ name, isDir, className = "h-5 w-5" }: { name: string; isDir?: boolean; className?: string }) {
  if (isDir ?? name.endsWith("/")) return <IFolder className={`${className} text-[var(--blue)]`} />;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const color =
    ext === "zip" || ext === "pdf" || ext === "fig"
      ? "text-[var(--blue)]"
      : ext === "pptx" || ext === "txt"
        ? "text-[var(--ink2)]"
        : "text-[var(--ink2)]";
  return <IFile className={`${className} ${color}`} />;
}
