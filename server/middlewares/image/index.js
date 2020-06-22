const Multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const Boom = require('@hapi/boom');
const sharp = require('sharp');
const Joi = require('@hapi/joi');
const path = require('path');
const generate = require('nanoid/async/generate');

const getEnvVar = require('../../utils/envvar-getter');

const CLOUD_BUCKET = getEnvVar('CLOUD_USER_CONTENT_BUCKET');

const storage = new Storage();

const bucket = storage.bucket(CLOUD_BUCKET);

const generateRandom = async (length = 20) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return generate(alphabet, length);
};

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

const cropper = async (req, res, next) => {
  const data = req.body;

  // check image file
  if (!req.file) {
    req.logger.error('file not set');
    return next(Boom.badRequest());
  }

  const imageData = sharp(req.file.buffer);
  const metadata = await imageData.metadata();

  // against exif orientation
  let naturalWidth = metadata.width;
  let naturalHeight = metadata.height;
  if (metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)) {
    naturalWidth = metadata.height;
    naturalHeight = metadata.width;
  }

  // validate crop data
  let cropData;
  try {
    cropData = JSON.parse(data.cropData);
  } catch (e) {
    req.logger.error('crop data parse failed');
    return next(Boom.badRequest());
  }


  const schema = Joi.object({
    x: Joi.number()
      .required(),
    y: Joi.number()
      .required(),
    width: Joi.number()
      .required(),
    height: Joi.number()
      .required(),
    cropAreaWidth: Joi.number()
      .required(),
    cropAreaHeight: Joi.number()
      .required(),
  });

  let crop;
  try {
    crop = await schema.validateAsync(cropData);
  } catch (e) {
    req.logger.error(e);
    return next(Boom.badRequest());
  }

  const scaleX = naturalWidth / crop.cropAreaWidth;
  const scaleY = naturalHeight / crop.cropAreaHeight;
  let x = Math.ceil(crop.x * scaleX);
  let y = Math.ceil(crop.y * scaleY);
  const width = Math.floor(crop.width * scaleX);
  const height = Math.floor(crop.height * scaleY);

  req.logger.debug({
    scaleX,
    scaleY,
    x,
    y,
    width,
    height,
    naturalWidth,
    naturalHeight,
  });

  if (width > naturalWidth || height > naturalHeight) {
    // crop size is bigger than maximum image size
    req.logger.error('crop size is bigger than natural image size');
    return next(Boom.badRequest());
  }

  const size = width > height ? height : width;

  if (size < 40) {
    return next(Boom.badRequest('Requested crop size is too small!'));
  }

  if (x < 0 || x > naturalWidth - size) {
    if (naturalWidth - size - x <= 1) {
      x -= 1;
    } else {
      // crop start position (x) exceeds limit
      req.logger.error('crop start position (x) is invalid');
      return next(Boom.badRequest());
    }
  }

  if (y < 0 || y > naturalHeight - size) {
    if (naturalHeight - size - y <= 1) {
      y -= 1;
    } else {
      // crop start position (y) exceeds limit
      req.logger.error('crop start position (y) is invalid');
      return next(Boom.badRequest());
    }
  }

  req.croppedImage = await imageData
    .rotate()
    .extract({
      left: x,
      top: y,
      width: size,
      height: size,
    })
    .resize(400, 400)
    .toBuffer();

  return next();
};

const uploadToGCS = async (req, res, next) => {
  let imageBuffer;
  let contentType;
  let extension;

  if (req.croppedImage) {
    imageBuffer = req.croppedImage;
    contentType = 'image/png';
    extension = '.png';
  } else if (req.file) {
    imageBuffer = req.file.buffer;
    contentType = req.file.mimetype;
    extension = path.extname(req.file.originalname);
  } else {
    return next(Boom.badRequest('file not set'));
  }

  const randomId = await generateRandom(20);
  const gcsname = `profile_${Date.now()}_${randomId}${extension}`;
  const file = bucket.file(gcsname);

  req.gcsInfo = {};

  const stream = file.createWriteStream({
    metadata: {
      contentType,
    },
    resumable: false,
  });

  stream.on('error', (err) => {
    req.gcsInfo.error = err;
    return next(err);
  });

  stream.on('finish', () => {
    req.gcsInfo.filename = gcsname;
    req.gcsInfo.bucket = CLOUD_BUCKET;
    file.makePublic().then(() => {
      req.logger.info('New image uploaded to GCS', {
        accountId: req.account,
        gcsInfo: req.gcsInfo,
      });
      return next();
    });
  });

  return stream.end(imageBuffer);
};

const deleteGCSItem = async (filename, bucketName = null) => {
  let targetBucket = bucket;
  if (typeof bucketName === 'string') {
    targetBucket = storage.bucket(bucketName);
  }
  return targetBucket.file(filename).delete();
};

module.exports = {
  multer,
  cropper,
  uploadToGCS,
  deleteGCSItem,
};
