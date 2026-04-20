import { CRM_STAGE_LABEL, CRM_STATUS_LABEL } from "@/lib/ui/brand";

interface Conv {
  id: string;
  role: "visitor" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface Evt {
  id: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

type Item =
  | { kind: "conv"; data: Conv }
  | { kind: "evt"; data: Evt };

export function ActivityTimeline({
  conversations,
  events,
}: {
  conversations: Conv[];
  events: Evt[];
}) {
  const items: Item[] = [
    ...conversations.map((c) => ({ kind: "conv" as const, data: c })),
    ...events.map((e) => ({ kind: "evt" as const, data: e })),
  ].sort(
    (a, b) =>
      new Date(a.data.created_at).getTime() -
      new Date(b.data.created_at).getTime()
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((item) =>
        item.kind === "conv" ? (
          <ConvItem key={item.data.id} conv={item.data} />
        ) : (
          <EvtItem key={item.data.id} evt={item.data} />
        )
      )}
    </ol>
  );
}

function ConvItem({ conv }: { conv: Conv }) {
  if (conv.role === "visitor") {
    return (
      <li className="flex flex-col items-end">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[#1E2761] text-white text-sm leading-relaxed whitespace-pre-wrap">
          {conv.content}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 pr-1">
          Visitor · {formatTime(conv.created_at)}
        </p>
      </li>
    );
  }
  if (conv.role === "assistant") {
    return (
      <li className="flex flex-col items-start">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {conv.content}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 pl-1">
          Assistant · {formatTime(conv.created_at)}
        </p>
      </li>
    );
  }
  return (
    <li className="flex justify-center">
      <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
        {conv.content}
      </div>
    </li>
  );
}

function EvtItem({ evt }: { evt: Evt }) {
  const label = describeEvent(evt);
  return (
    <li className="flex justify-center my-1">
      <div className="text-[11px] text-gray-600 bg-[#eef0fa] border border-[#dbe0f3] rounded-full px-3 py-1">
        <span className="font-medium text-[#1E2761]">{label.title}</span>
        {label.detail && <span className="text-gray-500"> · {label.detail}</span>}
        <span className="text-gray-400"> · {formatTime(evt.created_at)}</span>
      </div>
    </li>
  );
}

function describeEvent(evt: Evt): { title: string; detail?: string } {
  const payload = evt.payload ?? {};
  switch (evt.event_type) {
    case "crm_stage_change": {
      const from = String(payload.from ?? "none");
      const to = String(payload.to ?? "");
      return {
        title: "Stage changed",
        detail: `${CRM_STAGE_LABEL[from] ?? from} → ${CRM_STAGE_LABEL[to] ?? to}`,
      };
    }
    case "crm_status_change": {
      const from = String(payload.from ?? "open");
      const to = String(payload.to ?? "");
      return {
        title: "Status changed",
        detail: `${CRM_STATUS_LABEL[from] ?? from} → ${CRM_STATUS_LABEL[to] ?? to}`,
      };
    }
    case "tour_requested":
      return { title: "Tour requested", detail: payload.when as string | undefined };
    case "page_view":
      return { title: "Page view", detail: payload.path as string | undefined };
    case "link_click":
      return { title: "Link click", detail: payload.href as string | undefined };
    case "lead_captured":
      return { title: "Lead captured" };
    case "email_sent":
      return { title: "Email sent", detail: payload.subject as string | undefined };
    default:
      return { title: evt.event_type.replace(/_/g, " ") };
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
