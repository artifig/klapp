import Assessments from "@/components/Dashboard/Assessments";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title:
    "Tehnopal Dashboard | Tehnopol",
  description: "This is Tehnopal Home for Tehnopol's AI Matchmaking Platform",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Home />
      </DefaultLayout>
    </>
  );
}
