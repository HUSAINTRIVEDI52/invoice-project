import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const admin = await getSession();
  redirect(admin ? "/dashboard" : "/login");
}
