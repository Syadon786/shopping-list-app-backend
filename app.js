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
    },
    listId: {
        type: String,
        required: true
    }
});

const Item = mongoose.model('Item', itemsSchema);

// const itemOne = new Item({
//     name: "Kakaó"
// });

// const itemTwo = new Item({
//     name: "Zsebkendő"
// });

// const itemThree = new Item({
//     name: "Kukorica"
// });

// const defaultItems = [itemOne, itemTwo, itemThree];

// Item.insertMany(defaultItems, (err) => {
//     if(err) return console.log(err);
//     console.log("Default items inserted.");
// });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get('/', (req, res) => {
    const day = date.getDate();
    Item.find({listId: "test"}, (err, results) => {
        if(err) return console.log(err);
        res.render('list', {listTitle: `${day}  Bevásárlólista`, newListItems: results, listid: undefined});
    });
});

app.post('/', (req, res) => {
    const item = new Item({
        name: req.body.newItem,
        listId: "test"
    });
    item.save();
    res.redirect("/");
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    Item.deleteOne({listId: "test", _id: checkedItemId}, (err) => {
        if(err) return console.log(err);
        res.redirect('/'); 
    });
});

app.get('/list/:listid', (req, res) => {
    const day = date.getDate();
    const listId = _.lowerCase(req.params.listid);
    Item.find({listId: listId}, (err, results) => {
        if(err) return console.log(err);
        res.render('list', {listTitle: `${day}  Bevásárlólista`, newListItems: results, listid: listId});
    });
});


app.post('/list/:listid', (req, res) => {
    const listId = _.lowerCase(req.params.listid);
    const item = new Item({
        name: req.body.newItem,
        listId: listId
    });
    item.save();
    res.redirect(`/list/${listId}`);
});


app.post('/delete/:listid', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listId = _.lowerCase(req.params.listid);
    Item.deleteOne({listId: listId, _id: checkedItemId}, (err) => {
        if(err) return console.log(err);
        res.redirect(`/list/${listId}`);
    });
});


const server = app.listen(process.env.PORT || 10000, () => {
    console.log(`Server started on port ${server.address().port}`);
})