interface StorageService {
  save(data: Buffer, filename: string): Promise<string>;
  get(filename: string): Promise<Buffer>;
  delete(filename: string): Promise<void>;
}