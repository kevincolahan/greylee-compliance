import { resolveMode } from "@/lib/mode";
import QuestionFlow from "@/components/QuestionFlow";

export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const mode = resolveMode(searchParams, "/");
  return <QuestionFlow mode={mode} />;
}
