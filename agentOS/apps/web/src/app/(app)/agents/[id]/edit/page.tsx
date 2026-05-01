import { redirect } from "next/navigation";

export default function AgentEditPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/agents/${params.id}`);
}
