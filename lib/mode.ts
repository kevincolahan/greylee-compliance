export type AudienceMode = "federal" | "practice";

export function resolveMode(
  searchParams:
    | URLSearchParams
    | Record<string, string | string[] | undefined>,
  pathname: string
): AudienceMode {
  const fromQuery =
    searchParams instanceof URLSearchParams
      ? searchParams.get("mode")
      : (searchParams.mode as string | undefined);
  if (fromQuery === "practice") return "practice";
  if (pathname.startsWith("/practice")) return "practice";
  return "federal";
}
