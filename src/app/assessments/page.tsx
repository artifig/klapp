import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import Assessments from "@/components/Assessments/Assessments";


export const metadata: Metadata = {
  title: "Tehnopal | Assessments",
  description:
    "Tehnopal Assessments page for Tehnopol's AI Matchmaking Platform",
};

export default function Page() {
  return (
    <DefaultLayout>
      <Assessments />
    </DefaultLayout>
  );
}