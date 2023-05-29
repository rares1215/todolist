//jshint esversion:6
// requring the modules //

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Item = require("./Items");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// using css with express //

app.use(express.static(__dirname + "/public"))

// initalazing mongoose!

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://raresgiurgescu:M1TelFUAwlVC77F7@cluster0.vex6p9u.mongodb.net/todolistDB");
}

// Declaring the items from the items schema and model  from items.js using mongoose//

const item1 =  new Item({
  name:"Welcome to your ToDoList",
});

const item2 =  new Item({
  name:"Hit the + button to add a new item",
});

const item3 =  new Item({
  name:" <-- Check the box to delete an item",
});

// Array of items//
const defaultItems = [item1,item2,item3];
// ----------------------//

// Creating new List Schema //

const listSchema = new mongoose.Schema ({
  name:String,
  items: [Item.schema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    // Adding the array of items to our site and Data Base //

  find();
  async function find() {
    const findItems = await Item.find();
  if(findItems.length === 0 ) {
    //  Add the default array of items !//
      await Item.insertMany(defaultItems).then(function () {
      console.log("Successfully saved defult items to DB");
    }).catch(function (err) {
      console.log(err);
    });
    res.redirect("/");
  } else {
    //  Just render the page //
    res.render("list", {listTitle: "Today", newListItems: findItems});
  }
  }

});

app.post("/", function(req, res){
// Adding new Items to our web pages and Data base! //

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:itemName,
  });

  
  if (listName=== "Today") {
    // Add items to our home route!//
    newItem.save();
    res.redirect("/");
  } else {
    // Add items to the route that s specified//
    push();
    async function push () {
   const foundList = await List.findOne({name:listName});
   foundList.items.push(newItem);
   await foundList.save();
   res.redirect("/" + listName);
    }
  }
  
});

app.post("/delete", function(req, res){
  // Deleting items from our pages and Data base by checking the checkbox!//

  const checkedItemId = req.body.checkbox;
  const checkListName = req.body.listName
  if(checkListName === "Today") {
    // Remove items from our home route !//
    remove();
  async function remove () {
  await Item.findByIdAndRemove(checkedItemId);
  res.redirect("/");
  }
  } else {
    // Remove items from the specify route using the pull request //
    findAndDelete();
    async function findAndDelete() {
      try{
    await List.findOneAndUpdate (
      {name:checkListName},
       {$pull: {items : {_id: checkedItemId}}}
       )
       res.redirect("/" + checkListName);
    }catch(err) {
      console.log(err);
    }
    }
  }
})

app.get("/:customListName", function(req, res){
    //  Creating and rendering new pages using EJS rout parameters //

 const customListName = _.capitalize( req.params.customListName);
 check()
 async function check() {
 const foundList =  await List.findOne({name:customListName})
 if(!foundList) {
  // Create new List : 

  const list = new List ({
    name:customListName,
    items:defaultItems,
   })
  await list.save();
   res.redirect("/" + customListName);
 } else {
  // Show existent List:
   res.render("list.ejs", {listTitle: foundList.name, newListItems: foundList.items})
 }
 }


})

app.get("/about", function(req, res){
  res.render("about");
});
// Starting our web app on a specify port //
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

