"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { saveBuilding, getBuildings } from "@/api/firebaseHelpers";

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

const MainPage = () => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState("city");
  const [grid, setGrid] = useState(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(""))
  );
  const router = useRouter();
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
  const [cityStatusVisible, setCityStatusVisible] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >("all");
  const [newResources, setNewResources] = useState({
    budget: "",
    materials: "",
    workers: "",
  });

  // Load buildings from Firebase when user logs in
  useEffect(() => {
    if (!user) return;

    async function fetchBuildings() {
      const buildings = await getBuildings();
      const newGrid = Array(10)
        .fill(null)
        .map(() => Array(10).fill(""));

      buildings.forEach(({ position, type, isUpgraded, upgradedIcon }) => {
        const iconToSet = isUpgraded && upgradedIcon ? upgradedIcon : type;
        newGrid[position.row][position.col] = iconToSet;
      });

      setGrid(newGrid);
    }

    fetchBuildings();
  }, [user]);

  const handleCellClick = (row: number, col: number): void => {
    setSelectedCell({ row, col });
  };

  const handleAddResources = (type: keyof typeof resources, amount: number) => {
    if (amount <= 0) {
      alert("Введіть додатне число!");
      return;
    }
    setResources((prev) => ({ ...prev, [type]: prev[type] + amount }));
  };

  const buildOrUpgrade = async () => {
    if (!selectedCell) return;
    if (!user) {
      alert("Ви повинні увійти в акаунт, щоб будувати.");
      return;
    }
    const { row, col } = selectedCell;
    const current = grid[row][col];
    let cost;
    let isUpgraded = false;
    let newIcon = "";

    if (current === "") {
      cost = defaultObjectCosts[objectType];
      newIcon = objectType;
    } else {
      const upgrade = upgradeCosts[current];
      if (!upgrade) {
        alert("Цю будівлю не можна покращити!");
        return;
      }
      cost = upgrade;
      isUpgraded = true;
      newIcon = upgrade.upgradedIcon;
    }

    if (
      resources.budget < cost.budget ||
      resources.materials < cost.materials ||
      resources.workers < cost.workers
    ) {
      alert("Недостатньо ресурсів!");
      return;
    }

    const newGrid = grid.map((rowArr) => [...rowArr]);
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

  const isVisible = (icon: string) =>
    filter === "all" ||
    (icon in objectCategories &&
      objectCategories[icon as keyof typeof objectCategories] === filter) ||
    icon === "";

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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="mb-4 px-4 py-2 border rounded"
          >
            <option value="all">Усі</option>
            <option value="residential">Житлові</option>
            <option value="commercial">Комерційні</option>
            <option value="industrial">Промислові</option>
          </select>
          <div className="grid grid-cols-10 gap-2">
            {grid.map((rowArr, row) =>
              rowArr.map((cell, col) =>
                isVisible(cell) ? (
                  <Cell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    content={cell}
                    onClick={handleCellClick}
                    isSelected={
                      selectedCell?.row === row && selectedCell?.col === col
                    }
                  />
                ) : null
              )
            )}
          </div>

          {selectedCell && grid[selectedCell.row][selectedCell.col] !== "" && (
            <button
              onClick={() =>
                router.push(
                  `/building-details?row=${selectedCell.row}&col=${selectedCell.col}`
                )
              }
              className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
            >
              Переглянути деталі
            </button>
          )}
        </div>
      )}

      {selectedSection === "build" && (
        <div className="section p-6 bg-white rounded-lg shadow-md mx-60">
          <h2 className="text-2xl text-center mb-4 text-black">Будівництво</h2>
          <select
            value={objectType}
            onChange={(e) =>
              setObjectType(e.target.value as keyof typeof defaultObjectCosts)
            }
            className="block w-full px-4 py-2 rounded-md border border-green-500 bg-green-200 mb-4 text-black"
          >
            {Object.entries(defaultObjectCosts).map(([emoji]) => (
              <option key={emoji} value={emoji}>
                {emoji}
              </option>
            ))}
          </select>
          <button
            onClick={buildOrUpgrade}
            disabled={!user}
            className={`w-full p-4 rounded-md text-black transition ${
              user
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Будувати / Покращити
          </button>
        </div>
      )}

      {selectedSection === "resources" && (
        <div className="section p-6 bg-white rounded-lg shadow-md mx-60">
          <h2 className="text-2xl text-center mb-4 text-black">
            Ресурси міста
          </h2>
          <ul className="space-y-2 text-black">
            <li>Бюджет: {resources.budget} ₴</li>
            <li>Матеріали: {resources.materials}</li>
            <li>Будівельники: {resources.workers}</li>
          </ul>
          <h3 className="text-xl text-center mt-4 text-black">
            Додати ресурси
          </h3>
          <div className="space-y-4 mt-4">
            {(["budget", "materials", "workers"] as const).map((type) => (
              <div key={type} className="flex flex-col">
                <label className="font-semibold text-black">{type}</label>
                <input
                  type="number"
                  min="1"
                  value={newResources[type]}
                  onChange={(e) =>
                    setNewResources((prev) => ({
                      ...prev,
                      [type]: e.target.value,
                    }))
                  }
                  className="p-2 border rounded-md mt-1  text-black"
                />
              </div>
            ))}
            <button
              className={`mt-4 px-4 py-2 w-full flex justify-center rounded-md transition ${
                user
                  ? "bg-green-500 text-white hover:bg-blue-600"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
              onClick={() => {
                if (!user) {
                  alert("Ви повинні увійти в акаунт, щоб додавати ресурси.");
                  return;
                }
                (["budget", "materials", "workers"] as const).forEach(
                  (type) => {
                    const value = parseInt(newResources[type]);
                    if (!isNaN(value) && value > 0) {
                      handleAddResources(type, value);
                    }
                  }
                );
                setNewResources({ budget: "", materials: "", workers: "" });
              }}
              disabled={!user}
            >
              Додати
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
