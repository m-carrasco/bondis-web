var express = require('express');
var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
                                                defaultLayout:'main',
                                                helpers: {
                                                    section: function(name, options){
                                                                if(!this._sections) this._sections = {};
                                                                this._sections[name] = options.fn(this);
                                                                return null;
                                                            }
                                                        }
                                                });

var haversine = require('haversine');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect( 'mongodb://192.168.0.103/colectivos', function(err) { if (err) console.log(err); } )
var db = mongoose.connection;
 // esperamos a que se conecte a la base de datos para iniciar el servidor web
 db.once('open', function() {
    // we're connected!
    console.log("Connected")

    //db.collection('paradas').dropIndexes();
    
    schemaParada = new Schema({  
        linea: String,
        id: String, // bondicom
        nombre : String,
        loc : { type: { type: String, default: 'Point' }, coordinates: [Number]}
    });

    schemaParada.index({ loc : '2dsphere' });

    Parada = mongoose.model('Parada', schemaParada, 'paradas');

    //schemaParadas = new mongoose.Schema({ linea: 'string', paradas : ''});
    //Parada = mongoose.model('Parada', schemaParadas, 'paradas');

    schemaMov = new mongoose.Schema({ i: 'string', recorridoId : 'string', desdeBondicom : 'string', hastaBondicom : 'string', date : Date, lat: 'string', lon : 'string', repetido: { type: Boolean, default: false }, erroneo: { type: Boolean, default: false }, desdeOrdenNomb: 'string', hastaOrdenNomb : 'string', desdeOrdenNombC: 'string', hastaOrdenNombC: 'string', desdeOrdenC : 'string', hastaOrdenC: 'string'});
    Mov = mongoose.model('Mov', schemaMov, 'movimientos');

    schemaRecorrido = new mongoose.Schema({ id: 'string', hacia:'string', linea:'string', orden : '', ordenInv : ''});
    Recorrido = mongoose.model('Recorrido', schemaRecorrido, 'recorridos')

    // cargamos los nombres para las paradas.
    
    // extenderla para muchos recorridos.
    // nada mas anda para el 37 hacia palermo
    nombres = {} // tambien guarda posicion de cada parada
    fetchNombreParadas("219");
    orden = {};
    ordenInv = {};
    fetchRecorrido("219", function() {
        console.log("Nombres de paradas cargados");
        console.log("Iniciamos servidor web");
        corregirOrdenParadas();
        filtrarMovimientos();
        main();

    });

 });


function main()
{
    app.use(require('body-parser')());

    app.engine('handlebars', handlebars.engine);
    app.set('view engine', 'handlebars');

    app.set('domain','localhost');
    app.set('port', process.env.PORT || 3000);

    app.use(express.static(__dirname + '/public'));

    //app.use(bodyParser.urlencoded({ extended: false }));
    //app.use(bodyParser.json());

    app.get('/mapaRecorrido', function(req,res){ 

        locs = []

        for (var idx in orden)
        {
            var bondicomId = orden[idx];
            var loc = nombres[bondicomId].loc.coordinates;
            locs.push({lat:loc[1], lng:loc[0]});
        }

        res.render('maps', { layout: null, initialLoc: locs[0], locations : locs});
    });


    app.get('/', function(req, res) {
        res.render('home');
    });

    app.post('/buscarBondis', function(req, res){
        console.log("Handler para llenar formulario de movimientos.");
        fetchMovimientos(req, res);
    });

    app.post('/mapear', function(req, res){
        //determinarParadas();
        console.log("Handler para generar mapa con google maps.");
        if (req.body.data)
            fetchLocations(req.body.data,res);
    });


    // 404 catch-all handler (middleware)
    app.use(function(req, res, next){
        res.status(404);
        res.render('404');
    });

    // 500 error handler (middleware)
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500);
        res.render('500');
    });

    app.listen(app.get('port'), function(){
        console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
    });

}
function fetchRecorrido(linea, callback){

    Recorrido.find({"linea" : linea}, 'id linea orden ordenInv', 
        function(err, res){
            console.log(res);

            if (res){
                orden = res[0].orden;
                ordenInv = res[0].ordenInv;

            } 

            if (err){
                console.log("error al cargar recorrido");
                console.log(err);
            }

            if (callback)
                callback();
        }
    );
}
function determinarParadas(location, callback)
{
    // debemos ejecutar geoNear sobre las paradas del recorrido.
    // TODO: ordenInv deberia ser un parametro de la funcion
    var paradas = Object.keys(ordenInv);
    //console.log(ordenInv)
    Parada.geoNear(location, { limit : 2, spherical : true, query: {id: {$in: paradas}}}, function(err, results, stats) {
        var res = [];
        if (results)
        {
            for(var idx in results)
                res.push(results[idx].obj);            
        }

        if (err)
            console.log("determinarParadas " + err);
        //console.log(location)
        //console.log(res);
        if (callback){
            callback(null, res);
        }
    });
}

// generalizar el uso de nombres para otras lineas
function fetchNombreParadas(linea)
{
    Parada.find({"linea" : linea },'id nombre loc',
        function(err, res){

            // deberia haber un solo resultado
            for(var idx in res){
                id = res[idx].id; // de bondicom
                nombres[id] = {};
                nombres[id].name = res[idx]['nombre'];
                nombres[id].loc = res[idx]['loc'];
            }

        }
    );
}

function corregirOrdenParadas()
{

    Mov.find({},'_id recorridoId i date desdeOrden hastaOrden desdeBondicom hastaBondicom lat lon', {sort: {i: 1, date: 1}}).lean().exec(
        function (err, m) {

            if (err) {
                   console.log("Error al fetchear ");
                return console.log(err);
            }

            //console.log(m)
            //console.log(ordenInv);
            // agregamos informacion a lo obtenido de la base de datos
            // incorporamos los nombres de las paradas
            var callbacks = []
            for (var idx in m)
            {                   
                var loc = [Number(m[idx].lon), Number(m[idx].lat)];
                var fn = determinarParadas.bind(null, loc);
                // sincronizamos los callbacks de llamadas asincronicas que son los querys a la db
                callbacks.push(fn);
            }

            async.parallel(callbacks, function(err, results){
                callbacks = [];
                // results deberia ser una lista de listas
                //console.log(results)
                for (var idx in results)
                {
                    // resultados de las paradas cercanas 
                    var docs = results[idx];

                    var desdeOrden = Math.min(Number(ordenInv[docs[0].id]), Number(ordenInv[docs[1].id]));
                    var hastaOrden = Math.max(Number(ordenInv[docs[0].id]), Number(ordenInv[docs[1].id]));
                    
                    m[idx].desdeOrdenNomb = nombres[m[idx].desdeBondicom]['name'];
                    m[idx].hastaOrdenNomb = nombres[m[idx].hastaBondicom]['name'];

                    // La C hace referencia que son datos 'corregidos'
                    m[idx].desdeOrdenNombC = nombres[orden[desdeOrden]]['name'];
                    m[idx].hastaOrdenNombC = nombres[orden[hastaOrden]]['name'];
                    
                    m[idx].desdeOrdenC = desdeOrden;
                    m[idx].hastaOrdenC = hastaOrden;
                    
                    var fn = function(doc, callback){
                        var query = { desdeOrdenNomb: doc.desdeOrdenNomb, hastaOrdenNomb : doc.hastaOrdenNomb, desdeOrdenNombC: doc.desdeOrdenNombC, hastaOrdenNombC:doc.hastaOrdenNombC, desdeOrdenC : doc.desdeOrdenC, hastaOrdenC: doc.hastaOrdenC};
                        
                        Mov.update({ _id: doc._id }, query, {}, function(err,raw){
                            if (err)
                                console.log(err);
                            if (callback)
                                callback(null, null);
                        });
                    };

                    callbacks.push(fn.bind(null, m[idx]));

                }

                async.parallel(callbacks, function(err, results){
                });

            });  
        });
}

function filtrarMovimientos()
{
    Mov.find({},'_id recorridoId i date desdeOrden hastaOrden desdeOrdenC hastaOrdenC desdeBondicom hastaBondicom lat lon', {sort: {i: 1, date: 1}}).lean().exec(
    function (err, m) {

        if (err) {
               console.log("Error al fetchear ");
            return console.log(err);
        }


        //var lastIdx = 0; // ultimo indice valido
        //console.log(m);
        for (var idx in m)
        {   
            //console.log(idx);

            var item = m[idx];

            if (idx > 0)
            {
                var itemAnt = m[idx-1];

                var localTimeB = new Date(Date.parse(item.date));
                var localTimeA = new Date(Date.parse(itemAnt.date));
                var diffTime = (localTimeB.getTime() - localTimeA.getTime())/1000;
                var tolerancia = 120; // 100 segundos

                //var correcto = true;

                if (itemAnt.i == item.i && item.lat == itemAnt.lat && item.lon == itemAnt.lon && diffTime < tolerancia){
                    var query = { repetido:true};

                    Mov.update({ _id: itemAnt._id }, query, {}, function(err,raw){
                        if (err)
                            console.log(err);
                    });
                    //correcto = false;
                }

                //if (idx == 2)
                //    console.log("DIF " + diffTime)

                if (itemAnt.i == item.i && diffTime < tolerancia &&  item.hastaOrdenC < itemAnt.hastaOrdenC ){
                    //item.erroneo = true;

                    //console.log("ERRONEO");
                    var query = { erroneo:true};
                    Mov.update({ _id: itemAnt._id }, query, {}, function(err,raw){
                        if (err)
                            console.log(err);
                    });
                    //correcto = false;
                }

                //if (correcto) // no se lo modifico
                //lastIdx = idx;

            }
        }
    });
}


// buscamos los movimientos para mandarlos en el formulario
// TODO: ajustar para considerar recorridos de mas colecivos que no sean el 37 y hacia palermo.
function fetchMovimientos(req, res)
{
    var answer = { success: true }
    Mov.find({},{}, {sort: {i: 1, date: 1}}).lean().exec(
    function (err, m) {

        if (err) {
            console.log("Error al fetchear ");
            console.log(err);
        } else {

            answer.data = m;
            res.send(answer);
        }
    });
}

// funcion que busca los datos necesarios para generar el mapa
function fetchLocations(ids,res)
{
    // dependiendo de la cantidad seleccionada
    // las ids vienen en un array o una sola
    // la/s transformamos en objects ids de mongo
    if (ids instanceof Array){
        ids = ids.map(function(x,i) { 
                //console.log(x); 
                return mongoose.Types.ObjectId(x);
            });
    } else
    {
        ids = mongoose.Types.ObjectId(ids);
    }

    // buscamos los documentos por las ids seleccionadas.
    var query = Mov.find({});
    query.where('_id').in(ids);
    query.exec(function (err, docs) {

        var initial =  {lat:docs[0].lat, lng:docs[0].lon};
        
        var locs = []
        for (var i in docs){
            locs.push({lat:docs[i].lat, lng:docs[i].lon});
            //var loc = [docs[i].lon, docs[i].lat];

            //determinarParadas([Number(docs[i].lon), Number(docs[i].lat)]);
        }

        res.render('maps', { layout: null, initialLoc: initial, locations : locs});

    });
}

