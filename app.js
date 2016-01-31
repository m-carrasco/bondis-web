var express = require('express')
  , app = express();

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

var config = require('./config');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('domain','localhost');
app.set('port', process.env.PORT || config.http_port);
app.use(express.static(__dirname + '/public'));

var db = require('./db');

db.connect('mongodb://'+config.db_ip+'/colectivos', function(err) {
    if (!err) {
        // no estoy del todo seguro de esto

        app.use(express.static(__dirname + '/public'));
        //app.use(require('./middlewares/users'))
        app.use(require('./controllers'));

        app.listen(app.get('port'), function () {
            console.log('Express started on http://localhost:' +
                app.get('port') + '; press Ctrl-C to terminate.');
        });

    } else {
        console.log('Unable to connect to Mongo.');
        process.exit(1)
    }
});

