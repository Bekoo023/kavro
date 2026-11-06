import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { AppointmentForm, type RequestOption } from "../../../_components/appointment-form";
import { ymd } from "../../../_lib/format";
import { requestLabel } from "../../../_lib/request-label";

export const dynamic = "force-dynamic";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";


export default async function NewAppointmentPage({ searchParams }: PageProps<"/beheer/agenda/nieuw">) {
  await requireAdmin();
  const sp = await searchParams;
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(first(sp.datum)) ? first(sp.datum) : ymd();
  const requests = (await (await getStorage()).listRequests()).filter((r) => r.status !== "afgerond" && r.status !== "geannuleerd");
  const options: RequestOption[] = requests.map((r) => ({ id: r.id, label: requestLabel(r) }));
  const pre = requests.find((r) => r.id === first(sp.aanvraag));

  return (
    <div className="max-w-[720px]">
      <Link href={pre ? `/beheer/aanvragen/${pre.id}` : "/beheer/agenda"} className="inline-flex min-h-9 items-center text-[14px] text-mute hover:text-paper">
        ← {pre ? "Terug naar aanvraag" : "Agenda"}
      </Link>
      <h1 className="display mt-4 text-[40px] md:text-[52px]">{pre ? "Inplannen" : "Nieuw agenda-item"}</h1>
      {pre && <p className="mt-1 text-mute">{requestLabel(pre)}</p>}
      <div className="card mt-8 p-6 md:p-8">
        <AppointmentForm
          defaults={{ date: pre?.preferredDate && pre.preferredDate >= ymd() ? pre.preferredDate : datum, requestId: pre?.id, title: pre ? requestLabel(pre) : "" }}
          requests={options}
        />
      </div>
    </div>
  );
}
