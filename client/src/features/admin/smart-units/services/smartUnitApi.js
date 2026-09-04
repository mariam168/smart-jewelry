import api from "../../../../lib/axios";


// ===============================
// Smart Units
// ===============================


export const getSmartUnits =
async () => {

  const response =
    await api.get(
      "/smart-units"
    );

  return response.data;

};




export const getSmartUnit =
async (
  smartUnitId
) => {

  const response =
    await api.get(
      `/smart-units/${smartUnitId}`
    );

  return response.data;

};




export const createSmartUnit =
async (
  smartUnitData
) => {

  const response =
    await api.post(
      "/smart-units",
      smartUnitData
    );

  return response.data;

};




export const updateSmartUnit =
async (
  smartUnitId,
  smartUnitData
) => {

  const response =
    await api.put(
      `/smart-units/${smartUnitId}`,
      smartUnitData
    );

  return response.data;

};




export const deleteSmartUnit =
async (
  smartUnitId
) => {

  const response =
    await api.delete(
      `/smart-units/${smartUnitId}`
    );

  return response.data;

};

// ===============================
// Smart Unit Instances
// ===============================


export const getSmartUnitInstances =
async(smartUnitId)=>{


const response =
await api.get(

`/smart-units/${smartUnitId}/instances`

);


return response.data;

};





export const getSmartUnitInstance =
async(instanceId)=>{


const response =
await api.get(

`/smart-units/instances/${instanceId}`

);


return response.data;

};







export const updateSmartUnitInstance =
async(
instanceId,
instanceData
)=>{


const response =
await api.put(

`/smart-units/instances/${instanceId}`,

instanceData

);


return response.data;

};







export const deleteSmartUnitInstance =
async(instanceId)=>{


const response =
await api.delete(

`/smart-units/instances/${instanceId}`

);


return response.data;

};








