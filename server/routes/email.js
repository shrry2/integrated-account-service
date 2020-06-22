const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Boom = require('@hapi/boom');

router.get('/image/common/:fileName', (req, res) => {
  const filePath = path.resolve(`./email/templates/common/images/${req.params.fileName}`);

  try {
    fs.statSync(filePath);
  } catch (error) {
    throw Boom.notFound();
  }

  const allowedExtentions = ['.jpg', '.jpeg', '.png', '.gif'];
  if (allowedExtentions.indexOf(path.extname(filePath)) === -1) {
    throw Boom.notFound();
  }

  res.sendFile(filePath);
});

router.get('/image/:templateName/v:version/:fileName', (req, res) => {
  const filePath = path.resolve(`./email/templates/${req.params.templateName}/v${req.params.version}/images/${req.params.fileName}`);

  try {
    fs.statSync(filePath);
  } catch (error) {
    throw Boom.notFound();
  }

  const allowedExtentions = ['.jpg', '.jpeg', '.png', '.gif'];
  if (allowedExtentions.indexOf(path.extname(filePath)) === -1) {
    throw Boom.notFound();
  }

  res.sendFile(filePath);
});

module.exports = router;
