//crud operations testing
const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient;

const connectionUrl='mongodb://127.0.0.1:27017';
const dbname='attendencedb';

MongoClient.connect(connectionUrl,{useNewUrlParser:true},(err,client)=>{
    if(err)
    {
        console.log("connection error");
    }
    const db=client.db(dbname);
    db.collection('formcollection').insertMany([{
        name:"harshaldon",
        dob:"20101997",
        city:"ahmednagar",
        salary:67800,
        hobbies:['cricket','reading']
      
    },{
        name:"ricky ponting",
        dob:"na",
        city:"mellbourn",
        salary:6780000,
    
    }],(error,result)=>{
        console.log(result.ops);
    });
    // console.log("connection sucessful");
    const db1=client.db('attendencedb');
    db1.collection('formcollection').find({name:"virat kohli"}).toArray((err,element)=>{
        console.log(element);

    })
}
);