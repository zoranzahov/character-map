import { getCharAtPosition, isValidPathCharacter } from "./helpers";
import { PathError } from "./errors";
import { DIRECTIONS } from "./constants";
import { Direction } from "./types";

export function useMapWalker(map: string[]): { collectedLetters: string, pathString: string } {
  let startPositions: [number, number][] = [];
  let endPositions: [number, number][] = [];

  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === '@') {
        startPositions.push([r, c]);
      }
      if (map[r][c] === 'x') {
        endPositions.push([r, c]);
      }
    }
  }

  if (startPositions.length === 0) throw new PathError("No start '@' found");
  if (startPositions.length > 1) throw new PathError("Multiple '@' start positions found");

  let [startRow, startCol] = startPositions[0];
  let currentRow = startRow;
  let currentCol = startCol;

  let currentDir: Direction | null = null;
  for (const [rowDelta, colDelta] of DIRECTIONS) {
    let nextRow = currentRow + rowDelta;
    let nextCol = currentCol + colDelta;
    let nextChar = getCharAtPosition(map, nextRow, nextCol);

    if (isValidPathCharacter(nextChar)) {
      currentDir = [rowDelta, colDelta];
      break;
    }
  }
  
  if (!currentDir) throw new PathError("No initial direction found");

  let pathString = '@';
  let collectedLetters = '';
  let prevRow: number | null = null;
  let prevCol: number | null = null;
  const collectedPositions = new Set<string>();
  const visitedStates = new Set<string>();

  const MAX_STEPS = 10000;
  let steps = 0;

  while (steps++ < MAX_STEPS) {
    const visitedStateKey = `${currentRow},${currentCol},${currentDir[0]},${currentDir[1]}`;
    if (visitedStates.has(visitedStateKey)) {
      throw new PathError(`Infinite loop detected at ${currentRow},${currentCol} moving ${currentDir}`);
    }
    visitedStates.add(visitedStateKey);

    let nextRow = currentRow + currentDir[0];
    let nextCol = currentCol + currentDir[1];
    let nextChar = getCharAtPosition(map, nextRow, nextCol);

    if (nextChar === 'x') {
      pathString += nextChar;
      break;
    }

    if (isValidPathCharacter(nextChar) && !(nextRow === prevRow && nextCol === prevCol)) {
      prevRow = currentRow;
      prevCol = currentCol;
      currentRow = nextRow;
      currentCol = nextCol;
      pathString += nextChar;

      if (/[A-Z]/.test(nextChar)) {
        const positionKey = `${currentRow},${currentCol}`;
        if (!collectedPositions.has(positionKey)) {
          collectedLetters += nextChar;
          collectedPositions.add(positionKey);
        }
      }

      if (nextChar === '+') {
        const possibleDirs: Direction[] = [];
        for (const [rowDelta, colDelta] of DIRECTIONS) {
          if (rowDelta === -currentDir[0] && colDelta === -currentDir[1]) continue;
          const turnRow = currentRow + rowDelta;
          const turnCol = currentCol + colDelta;
          const turnChar = getCharAtPosition(map, turnRow, turnCol);
          if (isValidPathCharacter(turnChar)) {
            possibleDirs.push([rowDelta, colDelta]);
          }
        }

        const nonStraightDirs = possibleDirs.filter(
          ([rowDelta, colDelta]) => rowDelta !== currentDir![0] || colDelta !== currentDir![1]
        );

        if (nonStraightDirs.length > 1) {
          throw new PathError(`Fork in path at ${currentRow},${currentCol}`);
        }

        if (nonStraightDirs.length === 0) {
          throw new PathError(`Fake turn at intersection at ${currentRow},${currentCol}`);
        }

        let nextDirection: Direction | null = null;

        for (const [rowDelta, colDelta] of nonStraightDirs) {
          const candidate = `${currentRow},${currentCol},${rowDelta},${colDelta}`;
          if (!visitedStates.has(candidate)) {
            nextDirection = [rowDelta, colDelta];
            break;
          }
        }

        if (!nextDirection) {
          nextDirection = nonStraightDirs[0];
        }

        currentDir = nextDirection;
      }

      continue;
    }

    // Try other directions
    let moved = false;
    for (const [rowDelta, colDelta] of DIRECTIONS) {
      if (rowDelta === -currentDir[0] && colDelta === -currentDir[1]) continue;
      const turnRow = currentRow + rowDelta;
      const turnCol = currentCol + colDelta;
      const turnChar = getCharAtPosition(map, turnRow, turnCol);

      if (turnChar === 'x') {
        pathString += turnChar;
        moved = true;
        break;
      }

      if (isValidPathCharacter(turnChar) && !(turnRow === prevRow && turnCol === prevCol)) {
        prevRow = currentRow;
        prevCol = currentCol;
        currentRow = turnRow;
        currentCol = turnCol;
        currentDir = [rowDelta, colDelta];
        pathString += turnChar;

        if (/[A-Z]/.test(turnChar)) {
          const positionKey = `${currentRow},${currentCol}`;
          if (!collectedPositions.has(positionKey)) {
            collectedLetters += turnChar;
            collectedPositions.add(positionKey);
          }
        }

        moved = true;
        break;
      }
    }

    if (moved) continue;

    break;
  }

  if (steps >= MAX_STEPS) {
    throw new PathError("Exceeded max steps — possible infinite loop");
  }

  if (!pathString.includes('x')) {
    throw new PathError("No end 'x' found in path");
  }

  return { collectedLetters, pathString };
}
