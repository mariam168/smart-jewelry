import {
  getSmartUnitInstances,
  getSmartUnitInstance,
  updateSmartUnitInstance,
  deleteSmartUnitInstance
} from "../services/smartUnitInstanceService.js";




// GET ALL INSTANCES OF SMART UNIT

export const getSmartUnitInstancesController =
async(req,res,next)=>{

try{


const instances =
await getSmartUnitInstances(
  req.params.smartUnitId
);



return res.json({

success:true,

data:{
instances
}

});


}
catch(error){

next(error);

}

};






// GET SINGLE INSTANCE

export const getSmartUnitInstanceController =
async(req,res,next)=>{

try{


const instance =
await getSmartUnitInstance(
  req.params.id
);



if(!instance){

return res.status(404).json({

success:false,

message:"Smart unit instance not found."

});

}



return res.json({

success:true,

data:{
instance
}

});


}
catch(error){

next(error);

}

};







// UPDATE INSTANCE

export const updateSmartUnitInstanceController =
async(req,res,next)=>{

try{


const instance =
await updateSmartUnitInstance(

req.params.id,

req.body

);




if(!instance){

return res.status(404).json({

success:false,

message:"Smart unit instance not found."

});

}



return res.json({

success:true,

message:"Physical unit updated successfully.",

data:{
instance
}

});


}
catch(error){

next(error);

}

};








// DELETE INSTANCE

export const deleteSmartUnitInstanceController =
async(req,res,next)=>{

try{


const instance =
await deleteSmartUnitInstance(

req.params.id

);



if(!instance){

return res.status(404).json({

success:false,

message:"Smart unit instance not found."

});

}



return res.json({

success:true,

message:"Physical unit deleted successfully."

});


}
catch(error){

next(error);

}

};