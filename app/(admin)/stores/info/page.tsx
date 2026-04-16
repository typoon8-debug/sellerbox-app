// 가게 정보 관리는 가게관리(/stores) 페이지에 통합되었습니다.
import { redirect } from "next/navigation";

export default function StoresInfoPage() {
  redirect("/stores");
}
