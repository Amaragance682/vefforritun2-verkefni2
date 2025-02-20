import express from 'express';
import { router } from './routes.js';
import path from 'node:path';
import { fileURLToPath } from 'url';


const app = express();

app.use(express.urlencoded({ extended: true }));

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the views directory explicitly
app.set('views', path.join(__dirname, 'views'));

// Ensure EJS is set as the view engine
app.set('view engine', 'ejs');

app.use('/', router);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
