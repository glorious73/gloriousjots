/*----- This file is to check whether it's local host or production to choose the correct DB -----*/
if(process.env.NODE_ENV === 'production') {
  module.exports = {mongoUri: 'mongodb://gloriousteam:glorious73@ds141654.mlab.com:41654/gloriousdb'}
} else {
  module.exports = {mongoUri: 'mongodb://localhost/gloriousdb'}
}
