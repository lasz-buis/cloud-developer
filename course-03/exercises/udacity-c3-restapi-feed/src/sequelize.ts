import {Sequelize} from 'sequelize-typescript';
import { config } from './config/config';


const c = config.dev;

// Instantiate new Sequelize instance!
// export const sequelize = new Sequelize ({
//   "username" : 'udagramdev' ,
//   "password" : 'udagramdev' ,
//   "database" : 'udagramdev' ,
//   "host"     : 'udagramdev.cmdzikf1r4tb.us-west-2.rds.amazonaws.com' ,
//   dialect    : 'postgres' ,
//   storage    : ':memory:' ,
// });

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize ({
  "username" : c.username ,
  "password" : c.password ,
  "database" : c.database ,
  "host"     : c.host     ,
  dialect    : 'postgres' ,
  storage    : ':memory:' ,
});

