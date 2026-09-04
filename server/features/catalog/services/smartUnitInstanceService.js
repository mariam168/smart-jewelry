import SmartUnitInstance from "../models/SmartUnitInstance.js";



export const getSmartUnitInstance =
async(id)=>{


return SmartUnitInstance.findById(id)

.populate({

path:"smartUnit",

populate:{

path:"technologyModel"

}

});


};





export const getSmartUnitInstances =
async(smartUnitId)=>{


return SmartUnitInstance.find({

smartUnit:smartUnitId

})

.populate({

path:"smartUnit",

populate:{

path:"technologyModel"

}

})

.sort({

createdAt:1

});


};






export const updateSmartUnitInstance =
async(id,data)=>{


const allowedFields={


status:data.status,


firmwareVersion:
data.firmwareVersion,


notes:
data.notes,


damagedReason:
data.damagedReason,


};




if(data.status==="damaged"){


allowedFields.damagedAt =
new Date();


}


else{


allowedFields.damagedAt =
null;


}





return SmartUnitInstance.findByIdAndUpdate(

id,

allowedFields,

{

new:true,

runValidators:true

}

);



};







export const deleteSmartUnitInstance =
async(id)=>{


return SmartUnitInstance.findByIdAndDelete(id);


};