var db = require('../../db')

var schemaParada = new db.driver().Schema({  
    linea: { type: Number, index: true },
    id: { type: Number, index: true }, // bondicom
    nombre : String,
    loc : { type: { type: String, default: 'Point' }, coordinates: [Number]}
});

schemaParada.index({ loc : '2dsphere' });
var Parada = db.driver().model('Parada', schemaParada, 'paradas');

// no esta testeada hasta ahora.
exports.geoNear = function(loc, limit, paradas, cb){
  Parada.geoNear(loc, { limit : limit, spherical : true, query: {id: {$in: paradas}}}, 
    function(err, results, stats) {
      if (results){
        cb(null, results);
      }

      if (err){
        cb(err);
      }
  });
}

exports.allByLinea = function(linea, cb){
  Parada.find({"linea" : linea}, 'id nombre loc', 
    function(err, res){
        if (res){
          cb(null, res);
        } 
        if (err){
            cb(err);
        }
    }
  );
}

exports.all = function(cb){
    Parada.find({}, 'id nombre loc', 
    function(err, res){
        if (res){
          cb(null, res);
        } 
        if (err){
            cb(err);
        }
    }
  );
}

exports.update = function(id, linea, values,cb){
    Parada.update({"id":id, "linea":linea}, values, function(err, res){
        if (err)
            cb(err)
        if (res)
            cb(null, err)
    } )
}

exports.get = function(id, linea, cb){
  Parada.findOne({"id" : id, "linea" : linea}, 'id nombre loc', 
    function(err, res){
        if (res){
          cb(null, res);
        } 
        if (err){
            cb(err);
        }
    }
  );
}
