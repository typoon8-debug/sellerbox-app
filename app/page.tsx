import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // 환경변수 미설정 시 createClient()가 TypeError를 던지므로 사전 차단
  if (!hasEnvVars) {
    redirect("/login");
  }

  const params = await searchParams;
  // iframe 분할 모드용 embed 파라미터를 리디렉트 시 보존
  const embedSuffix = params.embed === "1" ? "?embed=1" : "";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect(`/tenants${embedSuffix}`);
  } else {
    redirect("/login");
  }
}
