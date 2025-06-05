"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { saveBuilding, getBuildings } from "@/api/firebaseHelpers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const defaultObjectCosts = {
  "🏠": { budget: 1000, materials: 100, workers: 2 },
  "🛣️": { budget: 500, materials: 50, workers: 1 },
  "🏭": { budget: 3000, materials: 200, workers: 5 },
};

const objectCategories: Record<
  string,
  "residential" | "commercial" | "industrial"
> = {
  "🏠": "residential",
  "🏘️": "residential",
  "🛣️": "commercial",
  "🛤️": "commercial",
  "🏭": "industrial",
  "🏢": "industrial",
};

type UpgradeCost = {
  budget: number;
  materials: number;
  workers: number;
  upgradedIcon: string;
};

const upgradeCosts: Record<string, UpgradeCost> = {
  "🏠": { budget: 800, materials: 80, workers: 1, upgradedIcon: "🏘️" },
  "🛣️": { budget: 400, materials: 30, workers: 1, upgradedIcon: "🛤️" },
  "🏭": { budget: 2000, materials: 150, workers: 3, upgradedIcon: "🏢" },
};

type CellProps = {
  row: number;
  col: number;
  content: string;
  onClick: (row: number, col: number) => void;
  isSelected: boolean;
};

const Cell: React.FC<CellProps> = ({
  row,
  col,
  content,
  onClick,
  isSelected,
}) => (
  <div
    className={`cell flex items-center gap-2 justify-center text-2xl ${
      isSelected ? "bg-green-700" : "bg-green-500"
    } border rounded-md`}
    style={{
      width: "70px",
      height: "70px",
      backgroundColor: (row + col) % 2 === 0 ? "#e0e0e0" : "#d4d4d4",
      cursor: "pointer",
      userSelect: "none",
    }}
    onClick={() => onClick(row, col)}
  >
    {content}
  </div>
);

type ValidFilter = "all" | "residential" | "commercial" | "industrial";

type MainPageProps = {
  initialFilter: "all" | "residential" | "commercial" | "industrial";
};

const MainPage: React.FC<MainPageProps> = ({ initialFilter = "all" }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userRole, setUserRole] = useState<string | null>(null);

  const [selectedSection, setSelectedSection] = useState("city");
  const [grid, setGrid] = useState(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(""))
  );
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [resources, setResources] = useState({
    budget: 10000,
    materials: 1000,
    workers: 20,
  });
  const [objectType, setObjectType] =
    useState<keyof typeof defaultObjectCosts>("🏠");
  const [filter, setFilter] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >(initialFilter);
  const [newResources, setNewResources] = useState({
    budget: "",
    materials: "",
    workers: "",
  });

  // Fetch user role from Firestore
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      return;
    }

    const fetchUserRole = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserRole(data.role ?? null);
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  // Sync filter state with URL on mount or path change
  useEffect(() => {
    const pathFilter = pathname.replace("/", "") as
      | "all"
      | "residential"
      | "commercial"
      | "industrial"
      | "";

    if (
      pathFilter === "residential" ||
      pathFilter === "commercial" ||
      pathFilter === "industrial"
    ) {
      setFilter(pathFilter);
    } else {
      setFilter("all");
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    async function fetchBuildings() {
      const buildings = await getBuildings();
      const newGrid = Array(10)
        .fill(null)
        .map(() => Array(10).fill(""));
      buildings.forEach(({ position, type, isUpgraded, upgradedIcon }) => {
        const icon = isUpgraded && upgradedIcon ? upgradedIcon : type;
        newGrid[position.row][position.col] = icon;
      });
      setGrid(newGrid);
    }
    fetchBuildings();
  }, [user]);

  const handleCellClick = (row: number, col: number) =>
    setSelectedCell({ row, col });

  const handleAddResources = (type: keyof typeof resources, amount: number) => {
    if (amount <= 0) return alert("Введіть додатне число!");
    setResources((prev) => ({ ...prev, [type]: prev[type] + amount }));
  };

  const buildOrUpgrade = async () => {
    if (!selectedCell || !user)
      return alert("Ви повинні увійти в акаунт, щоб будувати.");

    if (!userRole) return alert("Роль користувача не визначена.");

    const { row, col } = selectedCell;
    const current = grid[row][col];
    let cost,
      isUpgraded = false,
      newIcon = "";

    // Check if building or upgrading is allowed by role
    if (current === "") {
      // Building new building - only admin allowed
      if (userRole !== "admin") {
        return alert("Тільки адміністратори можуть будувати нові будівлі.");
      }
      cost = defaultObjectCosts[objectType];
      newIcon = objectType;
    } else {
      // Upgrading existing building - admin and builder allowed
      if (userRole !== "admin" && userRole !== "builder") {
        return alert("У вас немає прав для покращення будівлі.");
      }
      const upgrade = upgradeCosts[current];
      if (!upgrade) return alert("Цю будівлю не можна покращити!");
      cost = upgrade;
      isUpgraded = true;
      newIcon = upgrade.upgradedIcon;
    }

    if (
      resources.budget < cost.budget ||
      resources.materials < cost.materials ||
      resources.workers < cost.workers
    ) {
      return alert("Недостатньо ресурсів!");
    }

    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = newIcon;
    setGrid(newGrid);
    setResources({
      budget: resources.budget - cost.budget,
      materials: resources.materials - cost.materials,
      workers: resources.workers - cost.workers,
    });

    await saveBuilding({
      userId: user.uid,
      row,
      col,
      type: objectType,
      isUpgraded,
      upgradedIcon: newIcon,
    });
    setSelectedCell(null);
  };

  // Filter condition for showing cells' contents or empty string
  const filteredGrid = grid.map((row) =>
    row.map((icon) =>
      filter === "all"
        ? icon
        : icon === ""
        ? ""
        : objectCategories[icon] === filter
        ? icon
        : ""
    )
  );

  const isVisible = (icon: string) =>
    filter === "all" ||
    (icon in objectCategories &&
      objectCategories[icon as keyof typeof objectCategories] === filter) ||
    icon === "";

  // Визначаємо поточну вартість для вибраної клітинки (будівництво або покращення)
  const costToBuildOrUpgrade = React.useMemo(() => {
    if (!selectedCell) return null;
    const { row, col } = selectedCell;
    const current = grid[row][col];

    if (current === "") {
      // Порожня клітинка - будівництво нового типу (objectType)
      return defaultObjectCosts[objectType];
    } else {
      // Існуюча будівля - покращення, якщо можливо
      return upgradeCosts[current] || null;
    }
  }, [selectedCell, grid, objectType]);

  // Handle filter button click with navigation
  const onFilterClick = (
    cat: "all" | "residential" | "commercial" | "industrial"
  ) => {
    setFilter(cat);
    router.push(cat === "all" ? "/" : `/${cat}`);
    setSelectedCell(null); // reset selection on filter change
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex justify-center space-x-4 my-4">
        <button
          onClick={() => setSelectedSection("city")}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition"
        >
          Моє місто
        </button>
        <button
          onClick={() => setSelectedSection("build")}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition"
        >
          Будівництво
        </button>
        <button
          onClick={() => setSelectedSection("resources")}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition"
        >
          Ресурси міста
        </button>
      </div>

      {selectedSection === "city" && (
        <div className="section p-6 bg-white rounded-lg shadow-md mx-60">
          <h2 className="text-2xl text-center mb-6 text-black">Моє місто</h2>
          <div className="flex justify-center gap-2 mb-4">
            {["all", "residential", "commercial", "industrial"].map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1 rounded ${
                  filter === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() =>
                  onFilterClick(
                    cat as "all" | "residential" | "commercial" | "industrial"
                  )
                }
              >
                {cat === "all"
                  ? "Всі"
                  : cat === "residential"
                  ? "Житлові"
                  : cat === "commercial"
                  ? "Комерційні"
                  : "Промислові"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-10 gap-1">
            {filteredGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  content={cell}
                  onClick={handleCellClick}
                  isSelected={
                    selectedCell?.row === rowIndex &&
                    selectedCell?.col === colIndex
                  }
                />
              ))
            )}
          </div>

          {selectedCell && (
            <div className="mt-4 p-4 border rounded bg-green-50 text-green-900">
              <div>
                <strong>Вибрана клітинка:</strong> рядок {selectedCell.row + 1},
                стовпець {selectedCell.col + 1}
              </div>
              {costToBuildOrUpgrade ? (
                <div className="mt-2 text-black">
                  <strong className="text-black font-black">
                    Вартість{" "}
                    {grid[selectedCell.row][selectedCell.col] === ""
                      ? "будівництва"
                      : "покращення"}
                    :
                  </strong>
                  <ul className="list-disc ml-6 mt-1">
                    <li>Бюджет: {costToBuildOrUpgrade.budget}</li>
                    <li>Матеріали: {costToBuildOrUpgrade.materials}</li>
                    <li>Працівники: {costToBuildOrUpgrade.workers}</li>
                  </ul>
                </div>
              ) : (
                <div>Цю будівлю не можна покращити</div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedSection === "build" && (
        <div className="section p-6 bg-white rounded-lg shadow-md mx-60">
          <h2 className="text-2xl text-center mb-6 text-black">Будівництво</h2>
          <div className="mb-4 flex justify-center gap-4 text-black">
            {Object.keys(defaultObjectCosts).map((icon) => (
              <button
                key={icon}
                onClick={() =>
                  setObjectType(icon as keyof typeof defaultObjectCosts)
                }
                className={`text-5xl p-2 rounded ${
                  objectType === icon ? "bg-green-600 text-white" : ""
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          <button
            onClick={buildOrUpgrade}
            disabled={!selectedCell}
            className={`block mx-auto bg-green-500 text-white py-2 px-6 rounded ${
              !selectedCell
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
            }`}
          >
            {selectedCell
              ? grid[selectedCell.row][selectedCell.col] === ""
                ? "Побудувати"
                : "Покращити"
              : "Виберіть клітинку"}
          </button>
        </div>
      )}

      {selectedSection === "resources" && (
        <div className="section p-6 bg-white rounded-lg shadow-md mx-60">
          <h2 className="text-2xl text-center mb-6 text-black">
            Ресурси міста
          </h2>
          <div className="text-center mb-6 text-black">
            <p>Бюджет: {resources.budget}</p>
            <p>Матеріали: {resources.materials}</p>
            <p>Працівники: {resources.workers}</p>
          </div>

          <div className="flex justify-center gap-4 text-black">
            {Object.keys(resources).map((resKey) => (
              <div key={resKey} className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Введіть кількість"
                  value={newResources[resKey as keyof typeof newResources]}
                  onChange={(e) =>
                    setNewResources((prev) => ({
                      ...prev,
                      [resKey]: e.target.value,
                    }))
                  }
                  className="border rounded px-2 py-1 mb-1 w-24 text-black"
                />
                <button
                  onClick={() =>
                    handleAddResources(
                      resKey as keyof typeof resources,
                      Number(newResources[resKey as keyof typeof newResources])
                    )
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Додати {resKey}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
