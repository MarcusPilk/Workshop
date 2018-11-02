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
        var response = [];
        resp.hits.hits.forEach(res => {
            response.push(res._source);
        });
        res.render("index",{'pokemon':response})
    }, function(err) {
        console.trace(err.message);
    });

    }
);

app.post('/search',(req,res) =>{
    let terms = req.body.query;
    client.search({
            index: 'pokedex',
            type: 'Pokemon',
            size: '200',
            body: {
                sort: [{"#":{"order":"asc"}}]

            },
            q: terms.toString()
        }).then(function(resp) {
            var results = [];
            resp.hits.hits.forEach(res => {
                results.push(res._source);
            });
            console.log(results);
            res.render("index",{'pokemon':results})
        }, function(err) {
            console.trace(err.message);
        });

    }
);


app.listen(9000);
