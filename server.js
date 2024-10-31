const express = require('express');
const path = require('path');
const { Liquid } = require('liquidjs');

const app = express();

const themesOptions = {
  // File extension for Liquid templates
  extsionName: '.liquid',
  // Path to layouts directory
  layouts: 'layouts',
  partials: 'partials',
  // Path to themes directory if files are remote
  themesUri: 'http://localhost:3000/assets/themes'// 'https://assts.tajer.store/themes',
};

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

  const themesUri = themesOptions.themesUri;
  const themeUri = `${themesUri}/${theme}/`;
  const themeAssetsUri = `${themeUri}/assets`;
  const themeLocalsUri = `${themeUri}/locales`;
  
  console.log({
    themeUri,
    themeAssetsUri,
    themeLocalsUri
  })

  // Create a Liquid engine instance
  const customResolver = {
    resolve(dir, file, ext) {
      console.log('resolve', `${dir}${file}${ext}`);
      return `${dir}${file}${ext}`;
    },
    existsSync(filePath) {
      throw new Error('Not implemented. Call async exists instead. This is a sync method called only when engine.renderSync is called, you need to call engine.renderSync instead of engine.render');
    },
    readFileSync(filePath) {
      throw new Error('Not implemented. Call async readFile instead. This is a sync method called only when engine.renderSync is called, you need to call engine.renderSync instead of engine.render');
    },
    async readFile(filePath) {
      // Construct the full URL to the file
      const url = filePath//`${themeUri}/${filePath}`;
      console.log('readFile', url);
      // Fetch the file content from the remote URL
      const response = await fetch(url);
      return response.text();
    },
    async exists(filePath) {
      const url = filePath//`${themeUri}/${filePath}`;
      console.log('exists', url);
      const response = await fetch(url);
      return response.status === 200;
    },

  };

  const engine = new Liquid({
    root: themeUri,
    extname: themesOptions.extsionName,
    layouts: themeUri + themesOptions.layouts + '/',
    relativeReference: false,
    fs: customResolver
  });

  const response = await fetch(`${themeLocalsUri}/${lang}.json`);
  const local = await response.json();
  console.log('local', local)

  // create translation filter that loads locale file
  engine.registerFilter('t', async function (str) {
    return local[str] || str;
  });

  // crete asset_url filter
  engine.registerFilter('asset_url', function (str) {
    return `${themeAssetsUri}/${str}`;
  });

  const html = await engine.renderFile(`partials/${template}`, {
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
