var bodyParser = require('body-parser');
var bodyParser = requier('body-parser');
var mongoose = reqiure('mongoose');
var _ =reqiure('underscore');
var Movie = reqiure('./modues/movie.js');
var post = process.env.PORT || 3000;
var app = express();
mongoose.connect('mongoose.db: //localhost/movie');
app.locals.moment = reqiure('moment');
app.set('views','./views/pages');
app.set('views engine','jade');
app.set('views','./views/pages');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./modules/movie.js');

var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongoose.db: //localhost/movie');//链接数据库

app.locals.moment = require('moment');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log('movie started on port' + port);