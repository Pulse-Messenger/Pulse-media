import sharp from "sharp";

export class MediaService {
  private img: sharp.Sharp;
  private valid: boolean;
  private metadata?: sharp.Metadata;

  constructor(imageBuffer: Buffer) {
    this.img = sharp(imageBuffer, { animated: true });
    this.valid = true;
  }

  async validate(minW: number, maxW: number, minH?: number, maxH?: number) {
    if (!minH) minH = minW;
    if (!maxH) maxH = maxW;
    this.metadata = await this.img.metadata();

    if (!this.metadata.width || !this.metadata.height) {
      return false;
    }
    this.valid =
      (this.metadata.pageHeight ?? this.metadata.height) >= minH &&
      (this.metadata.pageHeight ?? this.metadata.height) <= maxH &&
      this.metadata.width >= minW &&
      this.metadata.width <= maxW;

    return this.valid;
  }

  async toWebp(width?: number, height?: number) {
    if (!this.valid) throw "Image is invalid";

    return await this.img.resize(width, height).webp().toBuffer();
  }
}
