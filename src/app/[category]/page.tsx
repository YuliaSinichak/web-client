import MainPage from "@/components/MainPage";

const validFilters = [
  "all",
  "residential",
  "commercial",
  "industrial",
] as const;
type ValidFilter = (typeof validFilters)[number];

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = validFilters.includes(params.category as ValidFilter)
    ? (params.category as ValidFilter)
    : "all";

  return <MainPage initialFilter={category} />;
}
