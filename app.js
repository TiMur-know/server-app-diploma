const express = require('express');
const cors = require('cors');
const transportsRoutes = require('./routes/transport.routes');
const routeRoutes = require('./routes/route.routes');
const utilRoutes=require('./routes/utils.routes')
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.use('/transports', transportsRoutes);
app.use('/routes', routeRoutes);
app.use('/utils',utilRoutes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' }); 
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server started on port " + port);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});