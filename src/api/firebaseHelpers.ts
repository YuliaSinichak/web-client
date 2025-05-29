export type Building = {
    id: string;
    userId: string;
    position: { row: number; col: number };
    type: string;
    isUpgraded: boolean;
    createdAt: string; // ISO string from backend
    upgradedIcon?: string | null;
  };
  
  export type SaveBuildingPayload = {
    userId: string;
    row: number;
    col: number;
    type: string;
    isUpgraded: boolean;
    upgradedIcon?: string | null;
  };
  
  const BASE_URL = 'http://localhost:8080'; 
  // Make sure you set NEXT_PUBLIC_API_URL to your NestJS backend URL or leave empty for same origin
  
  export async function getBuildings(): Promise<Building[]> {
    const res = await fetch(`${BASE_URL}/buildings`);
    if (!res.ok) {
      throw new Error('Failed to fetch buildings');
    }
    return res.json();
  }
  
  export async function saveBuilding(data: SaveBuildingPayload): Promise<void> {
    const res = await fetch(`${BASE_URL}/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Failed to save building');
    }
  }
  