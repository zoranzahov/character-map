export class PathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathError';
  }
}
