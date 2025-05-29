"use client";
import { useSearchParams, useRouter } from "next/navigation";

const BuildingDetailsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const row = parseInt(searchParams.get("row") || "0");
  const col = parseInt(searchParams.get("col") || "0");

  const dummyBuildingData = {
    icon: "🏘️",
    type: "Житлова",
    level: "2 (покращена)",
    cost: "1800 ₴, 180 матеріалів, 3 працівники",
    residents: 40,
    satisfaction: "85%",
  };

  return (
    <div className="p-6 bg-white shadow-md max-w-xl mx-auto justify-center min-w-full py-30">
      <div className="p-16 shadow-md rounded-xl border-green-700 border-3 ">
        <h1 className="text-2xl text-black font-bold mb-4 text-center">
          Деталі будівлі
        </h1>
        <p className="text-xl text-center mb-2">{dummyBuildingData.icon}</p>
        <ul className="space-y-2 text-lg text-black">
          <li>
            <strong>Тип:</strong> {dummyBuildingData.type}
          </li>
          <li>
            <strong>Рівень:</strong> {dummyBuildingData.level}
          </li>
          <li>
            <strong>Вартість:</strong> {dummyBuildingData.cost}
          </li>
          <li>
            <strong>Жителі:</strong> {dummyBuildingData.residents}
          </li>
          <li>
            <strong>Задоволеність:</strong> {dummyBuildingData.satisfaction}
          </li>
        </ul>

        <button
          onClick={() => router.back()}
          className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition block mx-auto"
        >
          Повернутись назад
        </button>
      </div>
    </div>
  );
};

export default BuildingDetailsPage;
