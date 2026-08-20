import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Check, RotateCcw, Loader2 } from "lucide-react";

const GLOBAL = "*";
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const keyFor = (scope: string, text: string) => `${scope}::${norm(text)}`;

/** Remembers the original text of every node we have touched. */
const originals = new WeakMap<Text, string>();

const isEditableNode = (node: Text) => {
  const parent = node.parentElement;
  if (!parent) return false;
  if (parent.closest("[data-site-editor], script, style, textarea, input, code, pre")) return false;
  const text = node.nodeValue ?? "";
  return norm(text).length > 0;
};

const walkTextNodes = (fn: (node: Text) => void) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  nodes.forEach(fn);
};

export const SiteTextEditor = () => {
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const location = useLocation();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState<{ original: string; value: string; global: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const overridesRef = useRef(overrides);
  const pathRef = useRef(location.pathname);
  overridesRef.current = overrides;
  pathRef.current = location.pathname;

  /* ---------------- load content */
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error) return;
    const map: Record<string, string> = {};
    (data ?? []).forEach((row) => {
      map[row.key] = row.value;
    });
    setOverrides(map);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---------------- apply overrides to the live DOM */
  const apply = useCallback(() => {
    const map = overridesRef.current;
    const scope = pathRef.current;
    walkTextNodes((node) => {
      if (!isEditableNode(node) && !originals.has(node)) return;
      const original = originals.get(node) ?? node.nodeValue ?? "";
      const replacement = map[keyFor(scope, original)] ?? map[keyFor(GLOBAL, original)];
      if (replacement !== undefined) {
        if (!originals.has(node)) originals.set(node, original);
        if (node.nodeValue !== replacement) node.nodeValue = replacement;
      } else if (originals.has(node) && node.nodeValue !== original) {
        node.nodeValue = original;
      }
    });
  }, []);

  useEffect(() => {
    if (!Object.keys(overrides).length) return;
    apply();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [overrides, apply, location.pathname]);

  /* ---------------- edit mode capture */
  useEffect(() => {
    if (!editing) return;
    document.body.classList.add("site-editing");

    const pickTextNode = (event: MouseEvent): Text | null => {
      const doc = document as Document & {
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
      };
      const range = doc.caretRangeFromPoint?.(event.clientX, event.clientY);
      let node: Node | null = range?.startContainer ?? doc.caretPositionFromPoint?.(event.clientX, event.clientY)?.offsetNode ?? null;
      if (node && node.nodeType !== Node.TEXT_NODE) {
        const el = node as Element;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        node = walker.nextNode();
      }
      if (!node || node.nodeType !== Node.TEXT_NODE) return null;
      return isEditableNode(node as Text) ? (node as Text) : null;
    };

    const onClick = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null;
      if (el?.closest("[data-site-editor]")) return;
      const node = pickTextNode(event);
      if (!node) return;
      event.preventDefault();
      event.stopPropagation();
      const original = originals.get(node) ?? node.nodeValue ?? "";
      const current = node.nodeValue ?? original;
      setTarget({ original, value: current, global: false });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.body.classList.remove("site-editing");
      document.removeEventListener("click", onClick, true);
    };
  }, [editing]);

  if (!isAdmin) return null;

  const save = async () => {
    if (!target) return;
    setSaving(true);
    const scope = target.global ? GLOBAL : location.pathname;
    const key = keyFor(scope, target.original);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value: target.value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast.error("Could not save this text");
      return;
    }
    setOverrides((prev) => ({ ...prev, [key]: target.value }));
    setTarget(null);
    toast.success("Text updated");
  };

  const reset = async () => {
    if (!target) return;
    setSaving(true);
    const keys = [keyFor(location.pathname, target.original), keyFor(GLOBAL, target.original)];
    await supabase.from("site_content").delete().in("key", keys);
    setSaving(false);
    setOverrides((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
    setTarget(null);
    // Restore instantly.
    requestAnimationFrame(apply);
    toast.success("Reverted to the original text");
  };

  return (
    <>
      <style>{`
        body.site-editing *:hover:not(:has(*)) { outline: 2px dashed hsl(var(--accent)); outline-offset: 2px; cursor: text; }
      `}</style>

      <div data-site-editor className="fixed bottom-4 left-4 z-[100] flex items-center gap-2">
        <Button
          size="sm"
          variant={editing ? "default" : "secondary"}
          className="shadow-lg"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? <Check className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {editing ? "Done editing" : "Edit site text"}
        </Button>
        {editing && (
          <span className="rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow">
            Click any text on the page to change it
          </span>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent data-site-editor className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit website text</DialogTitle>
            <DialogDescription className="line-clamp-2">Original: “{norm(target?.original ?? "")}”</DialogDescription>
          </DialogHeader>
          <Textarea
            value={target?.value ?? ""}
            rows={4}
            onChange={(e) => setTarget((t) => (t ? { ...t, value: e.target.value } : t))}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={target?.global ?? false}
              onCheckedChange={(v) => setTarget((t) => (t ? { ...t, global: v === true } : t))}
            />
            Apply this change everywhere on the site
          </label>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={reset} disabled={saving}>
              <RotateCcw className="mr-2 h-4 w-4" /> Revert
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTarget(null)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
