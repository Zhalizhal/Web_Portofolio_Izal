import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'save-portfolio-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-portfolio' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const filePath = path.join(process.cwd(), 'src/data/portfolio.json');
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: (error as Error).message }));
              }
            });
          } else if (req.url === '/api/upload-asset' && req.method === 'POST') {
            const filename = req.headers['x-filename'] as string;
            if (!filename) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'x-filename header is required' }));
              return;
            }

            const ext = path.extname(filename).toLowerCase();
            let targetDir = '';
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
              targetDir = path.join(process.cwd(), 'src/assets/image');
            } else if (['.mp4', '.webm'].includes(ext)) {
              targetDir = path.join(process.cwd(), 'src/assets/video');
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Unsupported file type' }));
              return;
            }

            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetPath = path.join(targetDir, filename);
            const writeStream = fs.createWriteStream(targetPath);
            req.pipe(writeStream);

            req.on('end', () => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, filename }));
            });

            req.on('error', (err) => {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            });
          } else if (req.url === '/api/delete-asset' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { filename } = JSON.parse(body);
                if (!filename) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: 'Filename is required' }));
                  return;
                }

                const ext = path.extname(filename).toLowerCase();
                let targetDir = '';
                if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                  targetDir = path.join(process.cwd(), 'src/assets/image');
                } else if (['.mp4', '.webm'].includes(ext)) {
                  targetDir = path.join(process.cwd(), 'src/assets/video');
                } else {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: 'Unsupported file type' }));
                  return;
                }

                const targetPath = path.join(targetDir, filename);
                if (fs.existsSync(targetPath)) {
                  fs.unlinkSync(targetPath);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, message: `File ${filename} deleted successfully` }));
                } else {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, message: `File ${filename} was not found on disk, but removed from data` }));
                }
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: (error as Error).message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})
