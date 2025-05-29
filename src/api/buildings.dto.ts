import { Timestamp } from "firebase/firestore";

export type buildings = {
    userId: string,         
    position: { row: number; col: number },
    type: string,            
    isUpgraded: boolean,
    createdAt: Timestamp,
    upgradedIcon?: string,  
  }
  