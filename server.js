const express = require('express');
const path = require('path');
const { Liquid } = require('liquidjs');

const app = express();

const themesUri = path.resolve(__dirname, 'themes')
// Create a Liquid engine instance
const engine = new Liquid({
  root: themesUri,    // Path to themes directory
  partials: true,     // Enable partials
  extname: '.liquid', // File extension for Liquid templates
});

// Serve static files (CSS, JS, images) from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', async (req, res) => {
  const queryParams = req.query;
  let { lang } = req.params;
  const { theme, template } = queryParams;
  if (!theme || !template) {
    return res.status(400).send('Missing theme or template query parameter');
  }
  if (!lang) {
    // get list of store languages, check if browser language is supported so set it. otherwise, set default language
    lang = 'en';
  }
  try {
    const requestUrl = req.protocol + '://' + req.get('host')
    const url = requestUrl + req.originalUrl;
    const image = requestUrl + '/assets/logo.png'
    const html = await renderHtml(url, image, lang, theme, template);
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/:lang', async (req, res) => {
  const queryParams = req.query;
  const { lang } = req.params;
  const { theme, template } = queryParams;
  if (!theme || !template) {
    return res.status(400).send('Missing theme or template query parameter');
  }
  try {
    const requestUrl = req.protocol + '://' + req.get('host')
    const url = requestUrl + req.originalUrl;
    const image = requestUrl + '/assets/logo.png'
    const html = await renderHtml(url, image, lang, theme, template);
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

async function renderHtml(url, image, lang, theme, template) {
  const themeUri = `${themesUri}/${theme}`;

  // create translation filter that loads locale file
  engine.registerFilter('t', function (str) {
    return require(`${themeUri}/locales/${lang}.json`)[str] || str;
  });

  const html = await engine.renderFile(`${theme}/${template}.liquid`, {
    title: 'My Online Store',
    meta_description: 'This is an online store selling various products.',
    meta_keywords: 'online store, ecommerce, products',
    url: url,
    image: image,
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
  });
  return html
}
