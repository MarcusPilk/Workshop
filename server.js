let express = require('express');
let app = new express();
let ejs = require('ejs');
let bodyparser = require('body-parser');
let elastic = require('elasticsearch');

let client = new elastic.Client();


app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
client.ping({
    requestTimeout: 30000,
}, function(error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});


app.get('/',(req,res) =>{
    client.search({
        index: 'pokedex',
        type: 'Pokemon',
        size: '200',
        body: {
        sort: [{"#":{"order":"asc"}}]

        },
        q: 'Generation:1'
    }).then(function(resp) {
        let response = [];
        resp.hits.hits.forEach(res => {
            response.push(res._source);
        });
        res.render("index",{'pokemon':response})
    }, function(err) {
        console.trace(err.message);
    });

    }
);
let searchData = null;
app.post('/search', (req,res) => {
    searchData = req.body.query;
    res.redirect('/result');
});
app.get('/result',(req,res) =>{
        client.search({
            index: 'pokedex',
            type: 'Pokemon',
            size: '200',
            body: {
                sort: [{"#":{"order":"asc"}}]

            },
            q: searchData
        }).then(function(resp) {
            let response = [];
            resp.hits.hits.forEach(res => {
                response.push(res._source);
            });
            console.log(response);
            res.render('index', {'pokemon': response})
        }, function(err) {
            console.trace(err.message);
        });

    }
);


app.listen(9000);
