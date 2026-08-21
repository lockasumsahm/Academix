import { Link } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Heart, MessageSquare, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/network/EmptyState";
import { PageHeader } from "@/components/network/PageHeader";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useSeo } from "@/hooks/useSeo";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const kindIcon: Record<string, typeof Bell> = {
  follow: UserPlus,
  message: MessageSquare,
  reaction: Heart,
  comment: MessageSquare,
};

const Notifications = () => {
  const { notifications, unread, markAllRead } = useNotifications();
  useSeo("Notifications | Academix", "Your Academix activity: follows, reactions, comments and new messages.", { noindex: true });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Activity" title="Notifications" subtitle="Follows, reactions, comments and messages.">
        {unread > 0 && (
          <Button size="sm" variant="outline" className="rounded-lg gap-1.5" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Follows, reactions, comments and new messages from your network will land here."
          steps={[
            "Complete your research profile so others can find you.",
            "Follow researchers working in your field.",
            "Share a finding or question in the feed.",
          ]}
          action={<Link to="/researchers"><Button size="sm" className="rounded-lg">Find researchers</Button></Link>}
          secondaryAction={<Link to="/profile"><Button size="sm" variant="outline" className="rounded-lg">Complete profile</Button></Link>}
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = kindIcon[n.kind] ?? Bell;
            const content = (
              <div
                className={cn(
                  "surface card-lift flex items-start gap-3 p-4 transition-colors",
                  !n.read_at && "border-accent/40 bg-accent/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    n.read_at ? "bg-secondary text-muted-foreground" : "bg-accent/10 text-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mono mt-1 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                {n.link && <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
            );
            return (
              <li key={n.id}>{n.link ? <Link to={n.link}>{content}</Link> : content}</li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
