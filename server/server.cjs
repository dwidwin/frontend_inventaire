const path = require('path')
const fs = require('fs')
const express = require('express')
const compression = require('compression')

const app = express()
const port = process.env.PORT || 5173
const distDir = path.resolve(__dirname, '..', 'dist')

app.disable('x-powered-by')
app.use(compression())

app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
  })
)

app.use(
  express.static(distDir, {
    maxAge: 0,
    etag: true,
  })
)

app.get('*', (_req, res) => {
  const indexHtmlPath = path.join(distDir, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    res.setHeader('Cache-Control', 'no-cache')
    return res.sendFile(indexHtmlPath)
  }
  return res.status(503).send('Build not found. Run `npm run build`')
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`)
})


