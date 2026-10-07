import Portfolio from "@/components/Portfolio";
import { LocaleProvider } from "@/components/LocaleProvider";
import { portfolioMetadata } from "@/lib/metadata";
type Props = { searchParams: Promise<{ project?: string }> };
export async function generateMetadata({ searchParams }: Props) { return portfolioMetadata("en", (await searchParams).project); }
export default async function EnglishHome({ searchParams }: Props) {
  return <LocaleProvider locale="en"><Portfolio initialProject={(await searchParams).project} /></LocaleProvider>;
}
