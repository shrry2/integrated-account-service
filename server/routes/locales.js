const Router = require('express-promise-router');
const Boom = require('@hapi/boom');
const path = require('path');
const jsonfile = require('jsonfile');
const { query, validationResult } = require('express-validator');
const validators = require('../../shared/validators');

const localesRouter = Router();

const localesFolderPath = path.join(__dirname, '../../shared/locales');
const clientNamespaces = ['common', 'client_master', 'pages', 'components', 'validators'];

localesRouter.get('/', [
  query('lng').exists().isString(),
  query('ns').exists().isString(),
], async (req, res, next) => {
  // check required query
  const missingQuery = validationResult(req);
  if (!missingQuery.isEmpty()) {
    return next(Boom.badRequest('routes:locales.missingRequiredQuery'));
  }

  // split query string for multi loading
  const locales = req.query.lng.split(' ');
  const namespaces = req.query.ns.split(' ');

  // check all parameters and abort if something is wrong
  try {
    locales.forEach((locale) => validators.availableLocaleCode(locale));
    namespaces.forEach((ns) => {
      validators.translationNamespace(ns);
      if (clientNamespaces.indexOf(ns) === -1) {
        throw new Error('namespace not listed for client service');
      }
    });
  } catch (e) {
    return next(Boom.badRequest('routes:locales.badQuery'));
  }

  const loadTranslation = async (locale, ns) => {
    let translation = {};
    try {
      translation = await jsonfile.readFile(`${localesFolderPath}/${locale}/${ns}.json`);
    } catch (e) {
      // ignore if file does not exist
    }
    return translation;
  };

  // return in simple structure if only one translation requested
  if (locales.length === 1 && namespaces.length === 1) {
    const translation = await loadTranslation(locales[0], namespaces[0]);
    return res.json(translation);
  }

  // load files
  const allTranslations = await Promise.all(
    locales.map(async (locale) => {
      const translations = await Promise.all(
        namespaces.map(async (ns) => {
          const translation = await loadTranslation(locale, ns);
          return [ns, translation];
        }),
      );
      return [locale, translations];
    }),
  );

  // create output
  const output = {};

  allTranslations.forEach((localeTranslations) => {
    output[localeTranslations[0]] = {};
    localeTranslations[1].forEach((nsTranslations) => {
      // eslint-disable-next-line prefer-destructuring
      output[localeTranslations[0]][nsTranslations[0]] = nsTranslations[1];
    });
  });

  return res.json(output);
});

module.exports = localesRouter;
