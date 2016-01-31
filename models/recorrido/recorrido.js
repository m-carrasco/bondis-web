var db = require('../../db')

var schemaRecorrido = new db.driver().Schema({ id: { type: Number, index: true }, hacia:'string', linea:{ type: Number, index: true }, orden : '', ordenInv : ''});
var Recorrido = db.driver().model('Recorrido', schemaRecorrido, 'recorridos')

exports.allByLinea = function(linea,cb){
  Recorrido.find({"linea" : linea}, 'id linea orden ordenInv', 
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

exports.getByLineaHacia = function(linea,hacia,cb){
    Recorrido.findOne({"linea" : linea, "hacia":hacia}, '',
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

exports.get = function(id,cb){
  Recorrido.findOne({"id" : id}, '',
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
