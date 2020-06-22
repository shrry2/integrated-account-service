const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const jsonfile = require('jsonfile');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const emailValidator = require('../../shared/validators').email;
const isTranslationKey = require('../utils/trans-key-detector');
const getEnvVar = require('../utils/envvar-getter');

const fromDomain = 'amid.cc';
const CDNURL = 'https://static-cdn.stayt.co/amid/';

class Mailer {
  constructor(logger = undefined) {
    sgMail.setApiKey(getEnvVar('SENDGRID_API_KEY'));

    this.logger = logger;
    this.template = null;
  }

  async prepareTemplate(templateName, version = 1) {
    const templateDir = path.join(__dirname, `/templates/${templateName}/v${version}`);

    let templateManifest;
    try {
      templateManifest = await jsonfile.readFile(`${templateDir}/manifest.json`);
    } catch (error) {
      throw new Error('Mailer: Template not found.');
    }

    let from = `${templateManifest.fromAccount}@${fromDomain}`;
    try {
      from = emailValidator(from);
    } catch (error) {
      throw new Error('Mailer: Invalid sender email address.');
    }

    // compile text template
    const textTemplatePath = `${templateDir}/template.ejs`;
    let textTemplate = '';

    try {
      textTemplate = await readFile(textTemplatePath, 'utf8');
    } catch (error) {
      throw new Error('Mailer: Text template file not found.');
    }
    textTemplate = ejs.compile(textTemplate, { filename: textTemplatePath });

    // compile html template if exists
    const htmlTemplatePath = `${templateDir}/htmlTemplate.ejs`;
    let htmlTemplate = null;

    try {
      htmlTemplate = await readFile(htmlTemplatePath, 'utf8');
    } catch (error) {
      // no html template is not a problem
    }
    htmlTemplate = htmlTemplate ? ejs.compile(htmlTemplate, { filename: htmlTemplatePath }) : null;

    this.template = {
      name: templateName,
      version,
      from,
      fromName: templateManifest.fromName,
      subject: templateManifest.subject,
      textTemplate,
      htmlTemplate,
    };
  }

  compileTemplate(t, data = {}) {
    if (!this.template) {
      throw new Error('Mailer.compileTemplate: Template not prepared.');
    }

    const defaultData = {
      t,
      commonImageDir: `${CDNURL}email/images/common/`,
      templateImageDir: `${CDNURL}email/images/${this.template.name}/v${this.template.version}/`,
    };

    // merge data
    Object.assign(data, defaultData);

    this.compiledText = this.template.textTemplate(data);

    this.compiledHtml = null;
    if (this.template.htmlTemplate) {
      this.compiledHtml = this.template.htmlTemplate(data);
    }

    // translate
    if (isTranslationKey(this.template.subject)) {
      this.template.subject = t(this.template.subject);
    }

    if (isTranslationKey(this.template.fromName)) {
      this.template.fromName = t(this.template.fromName);
    }
  }

  async send(to, name = null) {
    if (!this.compiledText) {
      throw new Error('Mailer.send: Template is not compiled yet.');
    }

    // check recipient email address
    let email;
    try {
      email = emailValidator(to);
    } catch (e) {
      throw new Error('Mailer.send: Invalid recipient address.');
    }

    // create message file
    const message = {
      to: {
        email,
        name,
      },
      from: {
        email: this.template.from,
        name: this.template.fromName,
      },
      subject: this.template.subject,
      text: this.compiledText,
    };

    if (name === null) {
      message.to = email;
    }

    if (this.compiledHtml) {
      message.html = this.compiledHtml;
    }

    await sgMail.send(message);

    if (this.logger) {
      this.logger.info(`Mailer.send: New email has been sent to [${email}].`);
    }
  }
}

module.exports = Mailer;
