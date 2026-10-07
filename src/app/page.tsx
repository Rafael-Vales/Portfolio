import Portfolio from "@/components/Portfolio";
import { LocaleProvider } from "@/components/LocaleProvider";
import { portfolioMetadata } from "@/lib/metadata";
type Props = { searchParams: Promise<{ project?: string }> };
export async function generateMetadata({ searchParams }: Props) { return portfolioMetadata("es", (await searchParams).project); }
export default async function Home({ searchParams }: Props) {
  return <LocaleProvider locale="es"><Portfolio initialProject={(await searchParams).project} /></LocaleProvider>;
}
