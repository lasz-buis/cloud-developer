import express from 'express';
import { sequelize } from './sequelize';

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import { config } from './config/config';
import { V0MODELS } from './controllers/v0/model.index';

const c = config.dev;

(async () => {
<<<<<<< HEAD

  console.log (config.dev);
  await sequelize.addModels(V0MODELS);
  await sequelize.sync()
    .then(()=>
      {
        console.log("Sync Success");
      })
    .catch (err => 
      {
        console.log ('Error:' + err);
      });

=======
  try
  {
    await sequelize.addModels(V0MODELS);
    await sequelize.sync();
  }
  catch (err)
  {
    console.log ("Sequelize Error : " + err);
  }
>>>>>>> release/1.0.2
  const app = express();
  const port = process.env.PORT || 8080; // default port to listen
  
  app.use(bodyParser.json());

  //CORS Should be restricted
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", c.url);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.use('/api/v0/', IndexRouter)

  // Root URI call
  app.get( "/", async ( req, res ) => {
    res.send( "/api/v0/" );
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running ` + c.url );
      console.log( `press CTRL+C to stop server` );
  } );
})();