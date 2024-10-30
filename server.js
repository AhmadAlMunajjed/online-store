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
  try {
    const html = await engine.renderFile('index.liquid', {
      title: 'My Online Store',
      products: [], // Example data
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/:theme', async (req, res) => {
  const { theme } = req.params;
  const themeUri = `${themesUri}/${theme}`

  try {
    const html = await engine.renderFile(`${theme}/index.liquid`, {
      title: 'My Online Store'
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/:lang/:theme/:template', async (req, res) => {
  const { lang, theme, template } = req.params;
  const themeUri = `${themesUri}/${theme}`
  try {
    // create translation filter that loads locale file
    engine.registerFilter('t', function (str) {
      return require(`${themeUri}/locales/${lang}.json`)[str] || str;
    });

    const html = await engine.renderFile(`${theme}/${template}.liquid`, {
      title: 'My Online Store',
      meta_description: 'This is an online store selling various products.',
      meta_keywords: 'online store, ecommerce, products',
      url: req.protocol + '://' + req.get('host') + req.originalUrl,
      image: req.protocol + '://' + req.get('host') + '/assets/logo.png',
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});