const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
require('dotenv').config();
const _ = require('lodash');
const app = express();


mongoose.connect(process.env.DATABASE_URL);
const itemsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const listSchema = mongoose.Schema({
    listid: {
        type: String,
        required: true
    },
    items: [itemsSchema]
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get('/', (req, res) => {
    const day = date.getDate();
    List.findOne({listid : "test"}, (err, foundList) => { 
        if(err) return console.log(err);
        res.render('list', {listTitle: `${day}  Bevásárlólista`, newListItems: foundList.items, listid: undefined});
    });
});

app.post('/', (req, res) => {
    List.findOne({listid : "test"}, (err, foundList) => { 
        if(err) return console.log(err);
        
        const items = req.body.newItems.split(',')
        .filter(item => item)
        .map(item => new Item({name: item}));

        foundList.items.push(...items);     
        foundList.save();
        res.redirect("/");
    });
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    List.findOneAndUpdate({listid : "test"}, {$pull: {items: {_id: checkedItemId}}}, (err) => { 
        if(err) return console.log(err);
        res.redirect("/");
    });
});

app.get('/list/:listid', (req, res) => {
    const day = date.getDate();
    const listId = _.lowerCase(req.params.listid);
    List.findOne({listid : listId}, (err, foundList) => {
        if(err) return console.log(err);
        if(!foundList) return res.redirect('/');
        res.render('list', {listTitle: `${day}  Bevásárlólista`, newListItems: foundList.items, listid: listId});
    });  
});


app.post('/list/:listid', (req, res) => {
    const listId = _.lowerCase(req.params.listid);
    List.findOne({listid : listId}, (err, foundList) => { 
        if(err) return console.log(err);
        
        const items = req.body.newItems.split(',')
        .filter(item => item)
        .map(item => new Item({name: item}));

        foundList.items.push(...items);     
        foundList.save();
        res.redirect(`/list/${listId}`);
    });
});


app.post('/delete/:listid', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listId = _.lowerCase(req.params.listid);
    List.findOneAndUpdate({listid : listId}, {$pull: {items: {_id: checkedItemId}}}, (err) => { 
        if(err) return console.log(err);
        res.redirect(`/list/${listId}`);
    });
});


const server = app.listen(process.env.PORT || 10000, () => {
    console.log(`Server started on port ${server.address().port}`);
})