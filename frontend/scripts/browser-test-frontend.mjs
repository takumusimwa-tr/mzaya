import { createServer } from 'vite';
import process from 'node:process';
process.env.VITE_API_URL = 'http://127.0.0.1:5107/api';
process.env.VITE_SOCKET_URL = 'http://127.0.0.1:5107';
const server = await createServer({ server: { host: '127.0.0.1', port: 5177, strictPort: true } });
await server.listen();
server.printUrls();
