import { Client } from "minio";

export class S3Service {
  protected s3: Client;

  constructor() {
    this.s3 = new Client({
      endPoint: process.env.S3_ENDPOINT ?? "",
      useSSL: true,
      port: 443,
      accessKey: process.env.S3_ACCESS_KEY ?? "",
      secretKey: process.env.S3_SECRET ?? "",
    });
  }

  protected async checkBucket(name: string) {
    const bucketStatus = await this.s3.bucketExists(name);

    if (bucketStatus) {
      console.log(`Bucket ${name} is working`);
      return true;
    } else {
      console.error(`Bucket ${name} is not working`);
      return false;
    }
  }

  public async verify() {
    return await this.checkBucket(process.env.S3_BUCKET ?? "");
  }

  public async uploadBuffer(key: string, buffer: Buffer, contentType: string) {
    try {
      key = key.replace(/~/g, "");

      const metadata = {
        "Content-Type": contentType,
        "x-amz-acl": "public-read", // set the ACL to public-read
        "Cache-Control": `max-age=${15}`,
      };

      const { etag } = await this.s3.putObject(
        process.env.S3_BUCKET ?? "",
        key,
        buffer,
        metadata
      );
    } catch {
      return;
    }
  }

  async getFile(name: string) {
    const expTime = 30;

    try {
      const [stat, metaData] = await Promise.all([
        this.s3.statObject(process.env.S3_BUCKET!, name),
        this.s3.getObject(process.env.S3_BUCKET!, name),
      ]);

      // Collect the buffer data from the stream
      const chunks = [];
      for await (const chunk of metaData) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const fileName = name.split("/");

      return {
        headers: {
          "Content-Type": stat.metaData["content-type"],
          "Content-Disposition": `attachment; filename="${
            fileName[fileName.length - 1]
          }"`,
          "Content-Length": buffer.length,
          "Cache-Control": `max-age=${expTime}`,
        },
        buffer,
      };
    } catch {
      return false;
    }
  }
}

export const s3Service = new S3Service();
