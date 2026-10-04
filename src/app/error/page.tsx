import type { Metadata } from "next";
import { connection } from "next/server";
import { CourseProvider } from "@/components/CourseProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Response } from "@/components/Response";

export const metadata: Metadata = {
  title: "Payment Could Not Be Completed | VLS Law Academy",
  robots: { index: false, follow: false },
};

export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  await connection();
  const { reason } = await searchParams;
  // eslint-disable-next-line react-hooks/purity
  const initialNow = Date.now();
  return (
    <CourseProvider initialNow={initialNow}>
      <Header linkBase="/" showCta={false} />
      <main className="flex-1">
        <Response variant="error" reason={reason === "unverified" || reason === "unconfirmed" ? reason : "failed"} />
      </main>
      <Footer />
    </CourseProvider>
  );
}
