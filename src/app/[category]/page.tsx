import MainPage from "../page";

const validFilters = [
  "all",
  "residential",
  "commercial",
  "industrial",
] as const;
type ValidFilter = (typeof validFilters)[number];

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = validFilters.includes(params.category as ValidFilter)
    ? (params.category as ValidFilter)
    : "all";

  return <MainPage initialFilter={category} />;
}
