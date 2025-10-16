import {
  BadRequestException,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { WeightClass } from '../constants';
import { DeliveryItem, FileValidationProps } from '../types/global-types';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as ffprobeStatic from 'ffprobe-static';
import { getMetadataArgsStorage } from 'typeorm';
import { YadsaleItemOffer } from 'src/modules/yadsale/entity/yadsale-item-offer.entity';
import { YadsaleItem } from 'src/modules/yadsale/entity/yadsale-item.entity';
import { Config } from 'src/config';

const handleDbErrors = (err) => {
  //foreign key voiation error
  if (err.number === 547) {
    // Handle foreign key violation error here
    throw new BadRequestException('Invalid Foreign Key');
  }
  //duplicate value
  else if (err.number === 2627 || err.number === 2601) {
    throw new BadRequestException('DB duplicate error value already exists');
  }
};

export const handleErrorCatch = (err) => {
  console.log(err);
  const logger = new Logger();
  logger.error(err);
  // console.log(err)
  handleDbErrors(err);

  if (
    err.status === HttpStatus.NOT_FOUND ||
    err.status === HttpStatus.BAD_REQUEST ||
    err.status === HttpStatus.UNAUTHORIZED ||
    err.status === HttpStatus.FORBIDDEN ||
    err.status === HttpStatus.CONFLICT
  ) {
    throw new HttpException(
      {
        status: err.status,
        message:
          err.response.message ||
          err.response.data.message ||
          err.response.error,
        error: err.response.error,
      },
      err.status,
    );
  }

  const message = err.message;

  throw new HttpException(
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: `An error occured with the message: ${err.message}`,
      message: message,
      errorType: 'Internal server error',
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

export const decodeBase64Image = (
  base64String: string,
): { buffer: Buffer; mimetype: string } => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }

  const mimetype = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  return { buffer, mimetype };
};

export const convertToHighestCurrencyDenomination = (
  amount: number,
): number => {
  return amount / 100;
};

export const convertToLowestCurrencyDenomination = (amount: number): number => {
  return amount * 100;
};

export const generateOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const getWeightFromWeightClass = (weightClass: WeightClass): number => {
  const weight = weightClass.split('-');
  // we should get the average of the two numbers
  return (parseInt(weight[0]) + parseInt(weight[1])) / 2;
};

export const validateFile = ({
  files,
  maxFileSize,
  supportedFormats,
}: FileValidationProps) => {
  if (!files.length) {
    throw new BadRequestException('no file detected');
  }

  files.forEach((file) => {
    const checkFormat = supportedFormats.find(
      (format) => format == file.mimetype,
    );

    if (!checkFormat) {
      throw new BadRequestException('file format not supported');
    }

    //900kb 900 000
    if (file.size > maxFileSize) {
      throw new BadRequestException(file.originalname + ' is too large');
    }
  });

  return true;
};

export const generateVideoThumbnail = async (
  videoFile: Express.Multer.File,
): Promise<Express.Multer.File> => {
  try {
    // Generate a consistent timestamp for file naming
    const timestamp = Date.now();
    const tempVideoPath = `/tmp/${timestamp}-${videoFile.originalname}`;
    const thumbnailPath = `/tmp/thumbnail-${timestamp}.jpg`;

    await fs.promises.writeFile(tempVideoPath, videoFile.buffer);

    ffmpeg.setFfmpegPath(ffmpegStatic as any);
    ffmpeg.setFfprobePath(ffprobeStatic.path);

    return new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .on('error', (err) => {
          console.error('Error during ffmpeg processing:', err);
          reject(new Error(`Failed to generate thumbnail: ${err.message}`));
        })
        .screenshots({
          count: 1,
          folder: '/tmp',
          filename: `thumbnail-${timestamp}.jpg`,
          size: '320x240',
        })
        .on('end', async () => {
          console.log('ffmpeg processing ended.');
          try {
            // Read the generated thumbnail
            const thumbnailBuffer = await fs.promises.readFile(thumbnailPath);

            // Clean up temporary files
            await fs.promises.unlink(tempVideoPath);
            await fs.promises.unlink(thumbnailPath);

            // Create a Multer-like file object
            const thumbnailFile = {
              fieldname: 'thumbnail',
              originalname: `thumbnail-${videoFile.originalname}.jpg`,
              encoding: '7bit',
              mimetype: 'image/jpeg',
              buffer: thumbnailBuffer,
              size: thumbnailBuffer.length,
            } as Express.Multer.File;

            resolve(thumbnailFile);
          } catch (error) {
            reject(error);
          }
        });
    });
  } catch (error) {
    throw new Error(`Error generating thumbnail: ${error.message}`);
  }
};

export const getKeyFromUrl = (url: string): string => {
  // Check if the URL has a protocol and domain structure
  if (url.includes('://')) {
    // Split by the domain which is usually followed by the first "/" after the protocol
    const parts = url.split(/\/\//)[1].split(/\/(.+)/);
    if (parts.length > 1) {
      return parts[1];
    }
    return '';
  }

  // If no protocol is found, just return the string as is or handle accordingly
  return url;
};

export const getEntityColumns = (entityClass: any): Record<string, boolean> => {
  const metadata = getMetadataArgsStorage();
  const columns = metadata.columns.filter(
    (column) => column.target === entityClass,
  );

  const fields: Record<string, boolean> = {};
  columns.forEach((column) => {
    if (typeof column.propertyName === 'string') {
      fields[column.propertyName] = true;
    }
  });

  return fields;
};

export const calculateBuyerServiceCharge = ({
  offer,
  items,
}: {
  offer?: YadsaleItemOffer;
  items?: DeliveryItem[];
}): number => {
  const price = offer
    ? offer.price
    : items && items.length
      ? items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)
      : null;

  if (price === null) {
    throw new BadRequestException('Price not found');
  }

  const cap = 2500;
  const baseCharge = 300;
  const percentage = 3.125;
  const percentageCharge = price * (percentage / 100);
  const totalServiceFee = baseCharge + percentageCharge;

  return Math.min(totalServiceFee, cap);
};

export const calculateSellerServiceCharge = ({
  offer,
  item,
}: {
  offer?: YadsaleItemOffer;
  item?: YadsaleItem;
}): number => {
  const price = offer ? offer.price : item ? item.price : null;

  if (price === null) {
    throw new BadRequestException('Price not found');
  }

  const baseCharge = 300;
  const percentage = 5;
  const percentageCharge = price * (percentage / 100);
  const totalServiceFee = baseCharge + percentageCharge;

  return totalServiceFee;
};

export const formatPhoneNumberToStartWithPlus = (
  phoneNumber: string,
): string => {
  return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
};

export const validateFilesGeneric = (files: Express.Multer.File[]) => {
  validateFile({
    files,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    supportedFormats: [
      'image/jpeg',
      'image/png',
      'video/mp4',
      'video/quicktime',
    ],
  });
};

export const getMediaUrl = (url: string): string => {
  return `https://${Config.DIGITAL_OCEAN_SPACES_BUCKET}.${Config.DIGITAL_OCEAN_SPACES_CDN_ENDPOINT}/${url}`;
};

export const removeEmojis = (text: string): string => {
  if (!text) return text;
  const emojiRegex =
    /[\u2700-\u27BF]|[\uE000-\uF8FF]|[\u2011-\u26FF]|[\uFE00-\uFE0F]|\u24C2|\uD83C[\uDDE6-\uDDFF]{1,2}|\uD83C[\uDC04-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();
};
