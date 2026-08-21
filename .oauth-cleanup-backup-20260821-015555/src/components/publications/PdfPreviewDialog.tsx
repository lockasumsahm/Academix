import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSignedUrl } from "@/lib/storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileRef: string | null;
  fileName: string | null;
  onDownload: () => void;
}

export const PdfPreviewDialog = ({ open, onOpenChange, title, fileRef, fileName, onDownload }: Props) => {
  const [url, setUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    if (!open || !fileRef) return;
    setUrl(null);
    setBlobUrl(null);
    setError(false);

    (async () => {
      const signed = await getSignedUrl(fileRef);
      if (!active) return;
      if (!signed) {
        setError(true);
        return;
      }
      setUrl(signed);
      // Chrome blocks cross-origin documents rendered inside sandboxed frames.
      // Fetching the bytes and previewing a same-origin blob URL avoids that.
      try {
        const res = await fetch(signed);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        if (!active) return;
        created = URL.createObjectURL(blob);
        setBlobUrl(created);
      } catch {
        /* fall back to the signed URL / download button */
      }
    })();

    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [open, fileRef]);

  const ext = (fileName ?? fileRef ?? "").split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  const previewSrc = blobUrl ?? url;

  const download = () => {
    if (!previewSrc) return;
    onDownload();
    const a = document.createElement("a");
    a.href = previewSrc;
    a.download = fileName ?? "document";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const openInTab = () => {
    if (!previewSrc) return;
    window.open(previewSrc, "_blank", "noopener,noreferrer");
  };

  const unavailable = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        This file can’t be shown inside the app. Open it in a new tab or download it.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" className="rounded-lg" onClick={openInTab} disabled={!previewSrc}>
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open in new tab
        </Button>
        <Button size="sm" className="rounded-lg" onClick={download} disabled={!previewSrc}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90dvh] w-[calc(100vw-1.5rem)] max-w-4xl flex-col gap-3 p-4 sm:p-6">
        <DialogHeader className="shrink-0 space-y-1 pr-8 text-left">
          <DialogTitle className="serif line-clamp-2 text-base sm:text-lg">{title}</DialogTitle>
          <p className="truncate text-xs text-muted-foreground">{fileName ?? "Attached document"}</p>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" className="rounded-lg" onClick={download} disabled={!previewSrc}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={openInTab} disabled={!previewSrc}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open in new tab
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted/40">
          {error ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              This file is no longer available.
            </div>
          ) : !previewSrc ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto p-3">
              <img src={previewSrc} alt={title} className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          ) : isPdf ? (
            // <object> renders its children whenever the browser refuses to display the file.
            <object data={previewSrc} type="application/pdf" className="h-full w-full">
              {unavailable}
            </object>
          ) : (
            unavailable
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
