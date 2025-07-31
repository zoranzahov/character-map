import { useMapWalker } from "./mapWalker";

export const isValidPathCharacter = (nextChar: string): boolean => {
  return /[A-Zx|\-+]/.test(nextChar);
}

export const getCharAtPosition = (map: string[], row: number, col: number): string => {
  if (row < 0 || row >= map.length) return ' ';
  if (col < 0 || col >= map[row].length) return ' ';
  return map[row][col];
}

export const runMultipleMaps = (maps: string[][]) => {
  for (let i = 0; i < maps.length; i++) {
    console.log(`\n=== Scenario ${i + 1} ===`);
    try {
      const result = useMapWalker(maps[i]);
      console.log("Letters:", result.collectedLetters);
      console.log("Path as characters:", result.pathString);
    } catch (e: any) {
      console.error("Error:", e.message);
    }
  }
}