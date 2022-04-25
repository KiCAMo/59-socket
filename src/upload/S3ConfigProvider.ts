import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import config from 'config';
const AWS_SETTING = config.get<IAWSSetting>('AWS');

@Injectable()
export class S3ConfigProvider {
  private readonly _s3: S3;
  private readonly _bucketName: string;

  constructor() {
    (this._bucketName = AWS_SETTING.AWS_S3_BUCKET_NAME ?? 'testbucket'),
      (this._s3 = new S3({
        accessKeyId: AWS_SETTING.AWS_ACCESS_KEY_ID ?? 'testaccesskey',
        secretAccessKey: AWS_SETTING.AWS_SECRET_ACCESS_KEY ?? 'testsecretkey',
        s3ForcePathStyle: true,
        region: AWS_SETTING.AWS_REGION ?? 'ap-southeast-1',
        logger: console,
      }));
  }

  getS3() {
    return this._s3;
  }

  getBucketName() {
    return this._bucketName;
  }

  createBucket() {
    this.getS3().createBucket({ Bucket: 'testbucket' }, (err, data) => {
      console.log(err, data);
    });
  }
}
