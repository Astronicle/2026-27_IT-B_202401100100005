"use client";

import { useRef, useState } from "react";
import { IUpload } from "./Icons";

export function UploadZone({
  onFiles,
  compact = false,
}: {
  onFiles: (files: FileList | File[]) => void;
  compact?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files"
      onClick={() => input.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") input.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={`cursor-pointer border border-dashed text-center transition-colors ${
        compact ? "px-6 py-8" : "px-6 py-14"
      } ${drag ? "border-[var(--blue)] bg-[var(--blue)]/5" : "border-[var(--ink2)]/50 hover:border-[var(--blue)]"}`}
    >
      <IUpload className={`mx-auto ${compact ? "h-6 w-6" : "h-8 w-8"} text-[var(--blue)]`} />
      <p className={`mt-4 font-bold tracking-tight ${compact ? "text-lg" : "text-2xl"}`}>
        {drag ? "RELEASE TO SEND" : "DROP FILES HERE"}
      </p>
      <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-[var(--ink2)]">OR CLICK TO BROWSE · UP TO 500MB</p>
      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
