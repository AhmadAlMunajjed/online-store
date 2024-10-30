const express = require('express');
const path = require('path');
const { Liquid } = require('liquidjs');

const app = express();

// Create a Liquid engine instance
const engine = new Liquid({
  root: path.resolve(__dirname, 'themes'), // Path to themes directory
  partials: true,                          // Enable partials
  extname: '.liquid',                      // File extension for Liquid templates
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

  try {
    const html = await engine.renderFile(`${theme}/${template}.liquid`, {
      title: 'My Online Store',
      lang
    });
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});