import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { AppointmentForm, DeleteAppointmentButton, type RequestOption } from "../../../_components/appointment-form";
import { requestLabel } from "../../../_lib/request-label";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({ params }: PageProps<"/beheer/agenda/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const storage = await getStorage();
  const appointment = await storage.getAppointment(id);
  if (!appointment) notFound();

  const all = await storage.listRequests();
  // Open aanvragen, plus de gekoppelde (ook als die al is afgerond).
  const options: RequestOption[] = all
    .filter((r) => (r.status !== "afgerond" && r.status !== "geannuleerd") || r.id === appointment.requestId)
    .map((r) => ({ id: r.id, label: requestLabel(r) }));
  const linked = all.find((r) => r.id === appointment.requestId);

  return (
    <div className="max-w-[720px]">
      <Link href={`/beheer/agenda?maand=${appointment.startDate.slice(0, 7)}`} className="inline-flex min-h-9 items-center text-[14px] text-mute hover:text-paper">
        ← Agenda
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px] md:text-[52px]">Agenda-item</h1>
        <DeleteAppointmentButton id={appointment.id} />
      </div>
      {linked && (
        <p className="mt-2 text-[14.5px] text-mute">
          Gekoppeld aan{" "}
          <Link href={`/beheer/aanvragen/${linked.id}`} className="text-paper underline underline-offset-4">
            {linked.name} · {linked.vehicle}
          </Link>
        </p>
      )}
      <div className="card mt-8 p-6 md:p-8">
        <AppointmentForm appointment={appointment} defaults={{ date: appointment.startDate }} requests={options} />
      </div>
    </div>
  );
}
