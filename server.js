// server.js
const express = require('express');
const { Liquid } = require('liquidjs');
const path = require('path');

const app = express();

// Initialize LiquidJS
const engine = new Liquid({
  root: path.resolve(__dirname, 'themes'), // Path to themes directory
  extname: '.liquid',                      // File extension for Liquid templates
});

// Serve static files (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware to render Liquid templates
app.get('/:theme/:template', async (req, res) => {
  const { theme, template } = req.params;
  console.log({
    theme: theme,
    template: template,
  });
  try {
    // Render the requested template with LiquidJS
    const templateUrl = `${theme}/${template}.liquid`;
    console.log({
      templateUrl: templateUrl,
    })
    const html = await engine.render(templateUrl, {
      title: 'My Online Store',
      products: [], // Example data
    });
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rendering template');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
