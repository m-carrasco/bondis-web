var db = require('../../db')


var schemaMov = new db.driver().Schema({ i: 'string', recorridoId : { type: Number, index: true }, desdeBondicom : 'string', hastaBondicom : 'string', date : Date, lat: 'string', lon : 'string', repetido: { type: Boolean, default: false }, erroneo: { type: Boolean, default: false }, desdeOrdenNomb: 'string', hastaOrdenNomb : 'string', desdeOrdenNombC: 'string', hastaOrdenNombC: 'string', desdeOrdenC : { type: Number, index: true }, hastaOrdenC: { type: Number, index: true }});
var Mov = db.driver().model('Mov', schemaMov, 'movimientos');


exports.allByRecorrido = function(recorridoId, cb){
    var query = Mov.find({});
    query.where('recorridoId').in([recorridoId]);

    query.exec(function (err, docs) {
        if (docs){
            cb(null, docs);
        }

        if (err){
            cb(err);
        }
    });
}

exports.allById = function(ids, cb){
  var query = Mov.find({});
  query.where('_id').in(ids);

  query.exec(function (err, docs) {
      if (docs){
        cb(null, docs);
      }

      if (err){
        cb(err);
      }
  });
}

exports.get = function(id, cb){
    // _id recorridoId i date desdeOrden hastaOrden desdeBondicom hastaBondicom lat lon
  Mov.findOne({"_id" : id}, '',
    function(err, res){
      if (err)
        cb(err)
      if(res)
        cb(null, res)
    })

}
// las devuelve orenadas por interno y luego por fecha ascendentemente
exports.all = function(lean, cb){
// _id recorridoId i date desdeOrden hastaOrden desdeBondicom hastaBondicom lat lon
  var fields = '';
  var callback = function(err,res){
      if (err)
        cb(err)
      if (res)
        cb(null, res);
  };

  var fn = Mov.find({},fields, {sort: {i: 1, date: 1}});

  if (lean)
    fn.lean().exec(callback);
  else
    fn.exec(callback);
}

exports.update = function(id, values, cb){
  Mov.update({ _id: id }, values, {}, 
    function(err,raw){
      if (err)
          cb(err);
      if (raw)
        cb(null, raw);
    });        
}        
