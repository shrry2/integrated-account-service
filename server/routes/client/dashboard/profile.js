const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const { body, query, param } = require('express-validator');
const { Op } = require('sequelize');

const moment = require('moment-timezone');

const models = require('../../../models');
const rateLimiter = require('../../../middlewares/rate-limiter');
const requestValidator = require('../../../middlewares/request-validator');
const image = require('../../../middlewares/image');

const profileRouter = Router();

const validators = require('../../../../shared/validators');

profileRouter.get('/display-name/history', [
  query('limit').isInt({ gt: 0, lt: 101 }).optional(),
  query('cursor').isInt().isLength({ max: 9999999999 }).optional(),
], requestValidator, async (req, res) => {
  const where = { accountId: req.account.id };
  if (req.query.cursor) {
    where.id = { [Op.lte]: Number(req.query.cursor) };
  }

  let limit;
  if (req.query.limit && req.query.limit > 0) {
    limit = (req.query.limit <= 100 ? Number(req.query.limit) : 100) + 1;
  }

  const displayNames = await models.DisplayName.findAll({
    where,
    order: [
      ['createdAt', 'DESC'],
    ],
    limit,
  });

  let nextCursor = 0;
  if (displayNames.length > limit - 1) {
    // there are more rows than limitation
    nextCursor = displayNames[displayNames.length - 1].id;
    displayNames.pop();
  }

  let previousCursor = 0;
  const previousRow = await models.DisplayName.findOne({
    where: {
      id: { [Op.gt]: displayNames[0].id },
    },
  });
  if (previousRow) {
    previousCursor = previousRow.id;
  }

  const history = displayNames.map((displayName) => ({
    id: displayName.id,
    displayName: displayName.displayName,
    createdAt: displayName.createdAt,
  }));

  // if (req.account.settings.timezone !== 'UTC') {
  //   const tz = req.account.settings.timezone;
  //   history.forEach((dn, i) => {
  //     history[i].createdAt = moment.utc(dn.createdAt).tz(tz).format();
  //     console.log(history[i].createdAt);
  //   });
  // }

  return res.json({
    history,
    nextCursor,
    previousCursor,
  });
});

profileRouter.put('/display-name', [
  body('displayName').exists().isString(),
], requestValidator, async (req, res, next) => {
  let displayName;
  try {
    displayName = validators.displayName(req.body.displayName);
  } catch (e) {
    return next(Boom.badRequest(`validators:${e.message}`));
  }

  // get latest one
  if (req.account.displayName === displayName) {
    // no need to update
    return res.json({
      result: 'notModified',
    });
  }

  // update database
  await models.DisplayName.create({
    accountId: req.account.id,
    displayName,
  });

  return res.json({
    result: 'ok',
    displayName,
  });
});

profileRouter.delete('/display-name/:id', [
  param('id').exists().isNumeric(),
], requestValidator, async (req, res, next) => {
  // find instance
  const displayName = await models.DisplayName.findByPk(req.params.id);

  if (!displayName) {
    // not found
    return next(Boom.badRequest());
  }

  if (displayName.accountId !== req.account.id) {
    // cannot delete other users' data
    req.logger.warn('Account Security Violation', {
      requestedAccountId: req.account.id,
      field: 'displayName',
      method: 'delete',
      itemId: displayName.id,
      threatenedAccountId: displayName.accountId,
    });
    return next(Boom.badRequest());
  }

  const count = await models.DisplayName.countByAccountId(req.account.id);
  if (count <= 1) {
    return next(Boom.badRequest('routes:client.dashboard.profile.displayName.lastOneError'));
  }

  await displayName.destroy();

  // get latest display name
  const latestDisplayName = await req.account.instance.displayName;

  let needUpdate = false;
  if (req.account.displayName !== latestDisplayName) {
    needUpdate = true;
    req.account.insance.clearCache();
  }

  return res.json({
    result: 'ok',
    needUpdate,
  });
});

profileRouter.get(
  '/profile-picture/library',
  async (req, res) => {
    const profilePictures = await models.ProfilePicture.findAll({
      where: {
        accountId: req.account.id,
      },
    });

    const output = profilePictures.map((picture) => ({
      id: picture.id,
      url: picture.publicUrl,
      imgixUrl: picture.imgixUrl,
      createdAt: picture.createdAt,
    }));

    res.json(output);
  },
);

profileRouter.post(
  '/profile-picture/select', [
    body('id').exists().isString(),
  ],
  requestValidator,
  async (req, res, next) => {
    const selectedPicture = await models.ProfilePicture.findByPk(req.body.id);

    if (!selectedPicture) {
      // not found
      return next(Boom.badRequest());
    }

    if (selectedPicture.accountId !== req.account.id) {
      req.logger.warn('Account Security Violation', {
        requestedAccountId: req.account.id,
        field: 'profilePicture',
        method: 'select',
        itemId: selectedPicture.id,
        threatenedAccountId: selectedPicture.accountId,
      });
      return next(Boom.badRequest());
    }

    try {
      await req.account.instance.setProfilePicture(selectedPicture);
    } catch (e) {
      if (e.message === 'NOT_OWNED_BY_THE_USER') {
        return next(Boom.badRequest());
      }
      req.logger.error(e);
      return next(Boom.internal());
    }

    return res.json({ result: 'ok' });
  },
);

profileRouter.delete(
  '/profile-picture/:id', [
    param('id').exists().isString(),
  ],
  requestValidator,
  async (req, res, next) => {
    // find instance
    const selectedPicture = await models.ProfilePicture.findByPk(req.params.id);

    if (!selectedPicture) {
      // not found
      return next(Boom.badRequest());
    }

    if (selectedPicture.accountId !== req.account.id) {
      // cannot delete other users' data
      req.logger.warn('Account Security Violation', {
        requestedAccountId: req.account.id,
        field: 'profilePicture',
        method: 'delete',
        itemId: selectedPicture.id,
        threatenedAccountId: selectedPicture.accountId,
      });
      return next(Boom.badRequest());
    }

    // destroy the data
    const destroyedPicture = await selectedPicture.destroy();

    let needUpdate = false;

    // reset current icon if it was deleted
    if (destroyedPicture.id === req.account.profilePictureId) {
      await req.account.instance.setProfilePicture(null);
      needUpdate = true;
    }

    // reset icon if there is no images left
    const count = await models.ProfilePicture.countByAccountId(req.account.id);
    if (count <= 0) {
      needUpdate = true;
    }

    if (needUpdate) {
      req.account.instance.clearCache();
    }

    return res.json({
      result: 'ok',
      needUpdate,
    });
  },
);

profileRouter.post(
  '/profile-picture',
  image.multer.single('image'),
  async (req, res, next) => {
    try {
      await models.ProfilePicture.checkBeforeUpload(req.account.id);
    } catch (e) {
      if (e.message === 'PROFILE_PICTURE_LIMIT_EXCEEDED') {
        return next(Boom.badRequest('routes:client.dashboard.profile.profilePicture.limitExceeded'));
      }
      req.logger.error(e);
      return next(Boom.internal());
    }
    return next();
  },
  image.cropper,
  image.uploadToGCS,
  async (req, res, next) => {
    if (!req.file || !req.gcsInfo) {
      req.logger.error('file or gcs upload info does not exist');
      return next(Boom.internal());
    }

    let addedPicture;
    try {
      addedPicture = await models.ProfilePicture
        .addPicture(req.account.id, req.gcsInfo.bucket, req.gcsInfo.filename);
    } catch (e) {
      req.logger.error(e);
      // cancel the upload to GCS
      await image.deleteGCSItem(req.gcsInfo.filename, req.gcsInfo.bucket);
      return next(Boom.internal());
    }

    if (!addedPicture) {
      req.logger.error('failed to add profile picture to db');
      return next(Boom.internal());
    }

    await req.account.instance.setProfilePicture(addedPicture);

    return res.json({
      result: 'ok',
    });
  },
);

module.exports = profileRouter;
