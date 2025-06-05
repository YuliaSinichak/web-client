import MainPage from "@/components/MainPage";

const validFilters = [
  "all",
  "residential",
  "commercial",
  "industrial",
] as const;
type ValidFilter = (typeof validFilters)[number];

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category: rawCategory } = await params;

  const category = validFilters.includes(rawCategory as ValidFilter)
    ? (rawCategory as ValidFilter)
    : "all";

  return <MainPage initialFilter={category} />;
}
