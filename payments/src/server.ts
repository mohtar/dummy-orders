import app from './app';

const port = process.argv[2] || 8080;
app.listen(port);
