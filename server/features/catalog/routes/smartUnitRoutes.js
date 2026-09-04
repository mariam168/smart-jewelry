import express from "express";


import {

createSmartUnitController,
getSmartUnitsController,
getSmartUnitController,
updateSmartUnitController,
deleteSmartUnitController

}
from "../controllers/smartUnitController.js";



import {

getSmartUnitInstancesController,
getSmartUnitInstanceController,
updateSmartUnitInstanceController,
deleteSmartUnitInstanceController

}
from "../controllers/smartUnitInstanceController.js";



const router =
express.Router();





// ============================
// Physical Units
// ============================


router.get(

"/instances/:id",

getSmartUnitInstanceController

);



router.put(

"/instances/:id",

updateSmartUnitInstanceController

);



router.delete(

"/instances/:id",

deleteSmartUnitInstanceController

);



router.get(

"/:smartUnitId/instances",

getSmartUnitInstancesController

);






// ============================
// Smart Units CRUD
// ============================


router.post(

"/",

createSmartUnitController

);



router.get(

"/",

getSmartUnitsController

);



router.get(

"/:id",

getSmartUnitController

);



router.put(

"/:id",

updateSmartUnitController

);



router.delete(

"/:id",

deleteSmartUnitController

);



export default router;