const express = require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const app=express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin-abhishek:ABHIs%40123@cluster0.ct2xg.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);
app.set('view engine','ejs');

const i1 = new Item({
  name: "Welcome to your todolist!"
});
const i2 = new Item({
  name: "Hit the + button to add  new item"
});
const i3 = new Item({
  name:"<-- Hit this to delete an item"
});
  const defaultItems =[i1 ,i2,i3];

const customListSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
  const List = mongoose.model("List",customListSchema);

app.get("/about",function(req,res){
  res.render("about");
});

app.get("/",function(req,res){
  Item.find({},function(err,founditem){
    if(founditem.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
        console.log(err);
        else
        console.log("successfully added ");
      });
    }else{
    res.render("list",{kindOfDay: "Today",newListItem: founditem});
}
});
});

app.get("/:custom",function(req,res){
  const customListName = req.params.custom;

List.findOne({name: customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else{
    res.render("list",{kindOfDay: foundList.name , newListItem: foundList.items });
    }
  }
});
});

app.post("/",function(req,res){
const itemname = req.body.rece;
const kindofList = req.body.btn;
const newItem = new Item({
  name: itemname
});

if(kindofList==="today"){
newItem.save();
  res.redirect("/");
}else{
  List.findOne({name: kindofList},function(err,foundList){
    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/"+kindofList);
  });
}
});

app.post("/delete",function(req,res){
const checkeditem= req.body.check;
Item.deleteOne({_id:checkeditem},function(err){
  if(err)
  console.log(err);
  else
  console.log("successfully deleted item");
});
res.redirect("/");
});

app.listen(process.env.PORT ||3000,function(){
  console.log("server running on port 3000");
})
