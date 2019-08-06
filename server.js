
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const eventRoutes = express.Router();
const PORT = 4000;


let Register = require('./registermodel');
const UserLogin=require('./userloginmodel');
const AdminLogin=require('./adminloginmodel');
const Attendance=require('./attendancemodel');
const Leave=require('./leavemodel');
const auth = require('./auth')
const logger =require('./winston');

app.use(cors());
app.use(bodyParser.json());



mongoose.connect('mongodb://127.0.0.1:27017/attendencedb', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
    logger.log("info","MongoDB database connection established successfully");
})




 eventRoutes.route('/login').post( async function(req, res) {
    let userlogin = new UserLogin(req.body);
    let adminlogin=new AdminLogin(req.body);
    if(req.body.type==="user")
    {
             await UserLogin.findOne({username:req.body.username,password:req.body.password}, function (err, user) { 
            if(user)
            {
                    //console.log(user.tokens[0].token)
                    res.json({result:"success",token:user.tokens[0].token});
                    logger.log("info",{result:"Success"});
            }
            else
            {
                    res.json({result:"failure"});
                    logger.log("error",{result:"failure"});
            }
         });
    }   
    else if(req.body.type==="admin")
    {
        AdminLogin.findOne({empid:req.body.empid,password:req.body.password}, function (err, user) { 
            if(user)
            {
                    res.json({result:"success"});
            }
            else
            {
                    res.json({result:"failure"});
            }
         });
    }
    else{
        res.json({result:"failure"});
    }
}
);


eventRoutes.route('/attendance').post(auth,function(req, res) {
    console.log("attendance",req.body);
    let atten = new Attendance(req.body);
    atten.save()
        .then(() => {
            res.json({result:"success"});
        })
        .catch(() => {
            res.json({result:"failure"});
        });
});


eventRoutes.route('/leave').post(function(req, res) {
    console.log("leave",req.body);
    let leave = new Leave(req.body);
    leave.save()
        .then(() => {
            res.json({result:"success"});
        })
        .catch(() => {
            res.json({result:"failure"});
        });
});


eventRoutes.route('/leaveList').post(function(req, res) {
        Leave.find({username:req.body.username})
        .then(list=> res.json(list))
        .catch(() => {
            res.json({result:"failure"});
        });
});

eventRoutes.route('/leaveList').get(function(req, res) {
    Leave.find({leavestatus:"pending"})
    .then(list=> res.json(list))
    .catch(() => {
        res.json({result:"failure"});
    });
});




eventRoutes.route('/getAdminattendence').post(function(req, res) {
  
    if(req.body.timeperiod==="daily")
    {
        Attendance.find({attendate:req.body.date}, function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.json(err);
            }
         }).sort({attendate:-1});
    }   
    else if(req.body.timeperiod==="weekly")
    {
        const todate=new Date(req.body.date);
        const fromdate=new Date();
        fromdate.setDate(todate.getDate() - 7);
        Attendance.find({$and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]}, function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.json(err);
            }
         }).sort({attendate:-1});
    }
    else if(req.body.timeperiod==="monthly")
    {
        const todate=new Date(req.body.date);
        const fromdate=new Date();
        fromdate.setDate(todate.getDate() - 30);
        Attendance.find({$and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]}, function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.json(err);
            }
         }).sort({attendate:-1});
    }
   
    });





eventRoutes.route('/updateleavestatus').post(function(req, res) {
    console.log(req.body)
    
    Leave.update({username:req.body.username,typeOfLeave:req.body.typeOfLeave,fromDate:req.body.fromDate,toDate:req.body.toDate},{$set:{leavestatus:""+req.body.buttonStatus}})
        .then(emp => {
            res.json({result:"success"});
        })
        .catch(err => {
            res.status(400).send('adding login data failed');
        });
        if(req.body.typeOfLeave=='Earn Leave')
       { 
       UserLogin.update({username:req.body.username},{$inc:{EarnedLeave:-1}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('Marrage leave deduction failed');
        });
    }
        else if(req.body.typeOfLeave=='Casual Leave')
        {
            UserLogin.update({username:req.body.username},{$inc:{CasualLeave:-1}})
            .then(emp => {
                res.status(200).json(emp);
            })
            .catch(err => {
                res.status(400).send('casual leave deduction failed');
            });
         }
      else if(req.body.typeOfLeave=='Wedding Leave')
      {
        UserLogin.update({username:req.body.username},{$inc:{MarrigeLeave:-1}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('marrageleave leave deduction failed');
        });
      }

    }   
 
);


eventRoutes.route('/getUserLeave').post(auth,function(req, res) {
    UserLogin.find({username:req.body.username})
    .then(list=> {
        res.json({
            MarrigeLeave:list[0].MarrigeLeave,
            EarnedLeave:list[0].EarnedLeave,
            CasualLeave:list[0].CasualLeave
        })
    })
    .catch(() => {
        res.json({result:"failure"});
    });
});




eventRoutes.route('/getAvgEmpHrs').post(function(req, res) {
    if(req.body.timeperiod==="weekly")
     {
         const todate=new Date(req.body.date);
         const fromdate=new Date();
         fromdate.setDate(todate.getDate() - 7);
         Attendance.aggregate([
               {	
                   $match:  {
                      $and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]
                  }
              },
                {
                     $group : {
                     _id : "$username"  ,
                     
                     workinghours: { $avg:"$workingHours"},
                     
                  }
                },
              {
              $sort :{
                      workinghours:1
                  }	
              }],function(err,emps) {
                 res.json(emps);
             }
                
            )
     }
     else if(req.body.timeperiod==="monthly")
     {
         const todate=new Date(req.body.date);
         const fromdate=new Date();
         fromdate.setDate(todate.getDate() - 30);
         Attendance.aggregate([
             {	
                 $match:  {
                    $and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]
                }
            },
              {
                   $group : {
                   _id : "$username"  ,
                   
                   workinghours: { $avg:"$workingHours"},
                   
                }
              },
            {
            $sort :{
                    workinghours:1
                }	
            }],function(err,emps) {
               res.json(emps);
           }
              
          )
     }
    
   
     
     });


//api for fetching employees with zero leaves

eventRoutes.route('/fetchzeroleaves').get(function(req, res) {   
        UserLogin.aggregate([
            {
              $project: {
             userName:"$username",
             firstName:"$firstName",
             lastName:"$lastName",
             CasualLeave:"$CasualLeave",
             MarrigeLeave:"$MarrigeLeave",
             EarnedLeave:"$EarnedLeave",
              totalleaves: { $sum: [ "$CasualLeave", "$EarnedLeave","$MarrigeLeave"] }
              }
            },
         {
             $sort :{
                     totalleaves:1
                 }	
             }
               
         ],function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.send({status:"no record found"});
            }
         });

    })





    //api for updating leaves of perticular user by admin
    eventRoutes.route('/adminapitoupdateleaves').post(function(req,res) {     
        if(req.body.typeOfLeave==='Earned Leave')
       { 
       UserLogin.updateOne({username:req.body.username},{$inc:{EarnedLeave:req.body.noOfDays}})
        .then(emp => {
            console.log("errroro");
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('Earned leave deduction failed');
        });
    }
        else if(req.body.typeOfLeave==='Casual Leave')
        {
            UserLogin.update({username:req.body.username},{$inc:{CasualLeave:req.body.noOfDays}})
            .then(emp => {
                res.status(200).json(emp);
            })
            .catch(err => {
                res.status(400).send('casual leave deduction failed');
            });
         }
      else if(req.body.typeOfLeave==='Marrige Leave')
      {
        UserLogin.update({username:req.body.username},{$inc:{MarrigeLeave:req.body.noOfDays}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('marrageleave leave deduction failed');
        });
      }
      else
      {
          res.status(400).send("Nothing match");
      }

    }   
 
);


// get attendance of specific employee

eventRoutes.route('/getEmployeeAttendence').post(auth ,function(req, res) {
 Attendance.find({username:req.body.username})
 .then(emp=>{
     res.json(emp);
 })
 .catch(emp=>{
     res.json(emp);
 })
});  


//---------------------------------------------------------------------------------------
/*eventRoutes.route('/updateleavestatus').post(function(req, res) {
    Leave.update({username:req.body.username,typeOfLeave:req.body.typeOfLeave,fromDate:req.body.fromDate,toDate:req.body.toDate},{$set:{leavestatus:"Reject"}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('adding login data failed');
        });
        if(req.body.typeOfLeave=='EarnedLeave')
       { 
       UserLogin.update({username:req.body.username},{$inc:{EarnedLeave:-1}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('Marrage leave deduction failed');
        });
    }
        else if(req.body.typeOfLeave=='CasualLeave')
        {
            UserLogin.update({username:req.body.username},{$inc:{CasualLeave:-1}})
            .then(emp => {
                res.status(200).json(emp);
            })
            .catch(err => {
                res.status(400).send('casual leave deduction failed');
            });
         }
      else if(req.body.typeOfLeave=='MarrigeLeave')
      {
        UserLogin.update({username:req.body.username},{$inc:{MarrigeLeave:-1}})
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('marrageleave leave deduction failed');
        });
      }

    }   
 
);
*/




/*


    else if(req.body.timeperiod==="weekly")
    {
        const todate=new Date(req.body.date);
        const fromdate=new Date();
        fromdate.setDate(todate.getDate() - 7);
        console.log('kedar ',fromdate);
        Attendance.find({$and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]}, function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.json(err);
            }
         });
    }
    else if(req.body.timeperiod==="monthly")
    {
        const todate=new Date(req.body.date);
        const fromdate=new Date();
        fromdate.setDate(todate.getDate() - 30);
        console.log('kedar monthly ',fromdate);
        Attendance.find({$and:[{attendate:{$gte:fromdate}},{attendate:{$lte:todate}}]}, function (err, user) { 
            if(user)
            {
                    res.json(user);
            }
            else
            {
                    res.json(err);
            }
         });
    }
   
    });


*/






/*

eventRoutes.route('/adminLeaveList').get(function(req, res) {
        Leave.find()
        .then(list=> res.json(list))
        .catch(() => {
            res.json({result:"failure"});
        });
});

*/




eventRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Register.findById(id, function(err, emp) {
        res.json(emp);
    });
}); 

eventRoutes.route('/register').post(function(req, res) {
    console.log("register",req.body);
    let emp = new UserLogin(req.body);
    emp.save()
    const token = emp.generateAuthToken()
        .then(emp => {
            res.json({emp,token});
        })
        .catch(err => {
            res.json({result:"failure"});
        });
});

eventRoutes.route('/update/:id').post(function(req, res) {
    Register.findById(req.params.id, function(err, emp) {
        if (!emp)
            res.status(404).send('data is not found');
        else
            emp.first_name = req.body.first_name;
            emp.last_name = req.body.last_name;
            emp.empid = req.body.empid;
            emp.email = req.body.email;

            emp.save().then(emp => {
                res.json('emp updated');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

/*

eventRoutes.route('/register').post(function(req, res) {
    let userlogin = new UserLogin(req.body);
    //let adminlogin=new AdminLogin(req.body);
    // if(req.body.type==="user")
    // {
    userlogin.save()
        .then(emp => {
            res.status(200).json(emp);
        })
        .catch(err => {
            res.status(400).send('adding login data failed');
        });
    }   
    // else if(req.body.type==="admin")
    // {
    //     adminlogin.save()
    //     .then(emp => {
    //         res.status(200).json(emp);
    //     })
    //     .catch(err => {
    //         res.status(400).send('adding login data failed');
    //     });
    // }
    // else{
    //     console.log('unble to save data');
    // }
//}
);*/

app.use('/', eventRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});

