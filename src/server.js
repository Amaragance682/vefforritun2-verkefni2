import express from 'express';
import { router } from './routes.js';
import path from 'node:path';
import { fileURLToPath } from 'url';
import process from 'node:process';


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

app.use((req, res) => {
  res.status(404).render('error', { title: '404', error: 'Síða fannst ekki' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: '500', error: 'Villa kom upp' });
});

const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = process.env.PORT || 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at ${process.env.NODE_ENV === 'production'
    ? 'https://vefforritun2-verkefni2.onrender.com'
    : `http://${hostname}`}:${port}/`);
});
