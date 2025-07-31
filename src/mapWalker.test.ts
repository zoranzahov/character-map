import { describe, it, expect } from 'vitest';
import { useMapWalker } from './mapWalker';
import { PathError } from './errors';
import { MAPS } from './constants';

describe('walkMap', () => {
  it('works for basic example', () => {
    const result = useMapWalker(MAPS[0]);
    expect(result.collectedLetters).toBe('ACB');
    expect(result.pathString).toBe('@---A---+|C|+---+|+-B-x');
  });

  it('works for through intersections', () => {
    const result = useMapWalker(MAPS[1]);
    expect(result.collectedLetters).toBe('ABCD');
    expect(result.pathString).toBe('@|A+---B--+|+--C-+|-||+---D--+|x');
  });

    it('works for letters on turns', () => {
    const result = useMapWalker(MAPS[2]);
    expect(result.collectedLetters).toBe('ACB');
    expect(result.pathString).toBe('@---A---+|||C---+|+-B-x');
  });

  it('works with loop letters', () => {
    const result = useMapWalker(MAPS[3]);
    expect(result.collectedLetters).toBe('GOONIES');
    expect(result.pathString).toContain('@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x');
  });

  it('works for compact map', () => {
    const result = useMapWalker(MAPS[4]);
    expect(result.collectedLetters).toBe('BLAH');
    expect(result.pathString).toBe('@B+++B|+-L-+A+++A-+Hx');
  });

  it('works for ignore stuff after end of path', () => {
    const result = useMapWalker(MAPS[5]);
    expect(result.collectedLetters).toBe('AB');
    expect(result.pathString).toBe('@-A--+|+-B--x');
  });

  it('throws error on missing start @', () => {
    expect(() => useMapWalker(MAPS[6])).toThrow(PathError);
  });

  it('throws error on missing missing end', () => {
    expect(() => useMapWalker(MAPS[7])).toThrow(PathError);
  });
  
  it('throws error on multiple start', () => {
    expect(() => useMapWalker(MAPS[8])).toThrow(PathError);
  });

  it('throws error on fork in path', () => {
    expect(() => useMapWalker(MAPS[11])).toThrow(PathError);
  });

  it('throws error on broken path', () => {
    expect(() => useMapWalker(MAPS[12])).toThrow(PathError);
  });

  it('throws error on fake turn', () => {
    expect(() => useMapWalker(MAPS[13])).toThrow(PathError);
  });
});
