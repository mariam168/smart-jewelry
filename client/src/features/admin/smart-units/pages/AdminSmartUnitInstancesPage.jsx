import {
  useEffect,
  useState,
} from "react";


import {
  Link,
  useParams,
} from "react-router-dom";


import {

getSmartUnit,

getSmartUnitInstances,

updateSmartUnitInstance,

deleteSmartUnitInstance,

}
from "../services/smartUnitApi";





const AdminSmartUnitInstancesPage =
()=>{


const {
smartUnitId
}
=
useParams();




const [
smartUnit,
setSmartUnit
]
=
useState(null);



const [
instances,
setInstances
]
=
useState([]);




const [
loading,
setLoading
]
=
useState(true);



const [
error,
setError
]
=
useState("");




const [
savingId,
setSavingId
]
=
useState(null);




useEffect(()=>{


loadData();


},[smartUnitId]);







const loadData =
async()=>{


try{


setLoading(true);


const [
unitResponse,
instancesResponse
]
=
await Promise.all([

getSmartUnit(
smartUnitId
),

getSmartUnitInstances(
smartUnitId
)

]);



setSmartUnit(

unitResponse
?.data
?.smartUnit ||
unitResponse
?.smartUnit

);



setInstances(

instancesResponse
?.data
?.instances ||
instancesResponse
?.instances ||
[]

);



}

catch(err){


console.log(err);


setError(
err?.response?.data?.message ||
"Failed to load instances"
);


}

finally{

setLoading(false);

}

};









const changeStatus =
async(
instance,
status
)=>{


try{


setSavingId(
instance._id
);



let payload={
status
};



if(
status==="damaged"
){

const reason =
window.prompt(
"Enter damage reason"
);


payload.damagedReason =
reason || "";

}



const response =
await updateSmartUnitInstance(
instance._id,
payload
);



setInstances(
previous=>

previous.map(item=>

item._id===instance._id

?

response.data.instance

:

item

)

);



}

catch(error){

alert(
error?.response?.data?.message ||
"Failed to update"
);

}

finally{

setSavingId(null);

}

};









const removeInstance =
async(
id
)=>{


const confirmed =
window.confirm(
"Delete this physical unit?"
);



if(!confirmed)
return;



try{


await deleteSmartUnitInstance(
id
);



setInstances(
previous=>

previous.filter(
item=>item._id!==id
)

);



}

catch(error){

alert(
error?.response?.data?.message ||
"Delete failed"
);

}


};







const formatDate =
(date)=>{


if(!date)
return "-";


return new Date(date)
.toLocaleDateString();

};









if(loading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-warm-ivory
">

Loading...

</div>

);


}









return (

<div className="
min-h-screen
bg-warm-ivory
text-midnight-navy
">


<header className="
border-b
border-light-champagne
bg-soft-white
">


<div className="
max-w-7xl
mx-auto
px-6
py-7
">


<Link

to="/admin/smart-units"

className="
text-sm
text-antique-gold
"

>

← Back

</Link>



<h1 className="
mt-4
font-serif
text-4xl
">

Physical Units

</h1>



<p className="
mt-2
text-sm
text-slate-gray
">

{
smartUnit?.name
}

</p>


</div>


</header>







<main className="
max-w-7xl
mx-auto
px-6
py-10
">





{
error &&

<div className="
mb-5
rounded-xl
bg-red-50
p-4
text-red-600
">

{error}

</div>

}







<div className="
overflow-x-auto
rounded-3xl
border
border-light-champagne
bg-soft-white
">


<table className="
w-full
min-w-[1300px]
">


<thead>

<tr className="
border-b
bg-warm-ivory
">


<th className="p-5 text-left">
#
</th>


<th className="p-5 text-left">
Serial
</th>


<th className="p-5 text-left">
Code
</th>


<th className="p-5 text-left">
Status
</th>


<th className="p-5 text-left">
Firmware
</th>


<th className="p-5 text-left">
Purchase
</th>


<th className="p-5 text-left">
Activated
</th>


<th className="p-5 text-left">
Warranty
</th>


<th className="p-5">
Actions
</th>


</tr>

</thead>






<tbody>


{
instances.map(
(instance,index)=>(


<tr

key={
instance._id
}

className="
border-b
hover:bg-warm-ivory/50
"

>


<td className="p-5">

{
index+1
}

</td>





<td className="p-5">

<div className="
font-mono
font-semibold
">

{
instance.serialNumber
}

</div>


</td>





<td className="p-5">


<span className="
rounded-lg
bg-warm-ivory
px-3
py-2
font-mono
text-xs
">

{
instance.uniqueCode
}

</span>


</td>








<td className="p-5">


<select

disabled={
savingId===instance._id
}

value={
instance.status
}

onChange={
(e)=>
changeStatus(
instance,
e.target.value
)
}


className="
rounded-lg
border
px-3
py-2
text-xs
"


>


<option value="available">
Available
</option>


<option value="reserved">
Reserved
</option>


<option value="assigned">
Assigned
</option>


<option value="activated">
Activated
</option>


<option value="inactive">
Inactive
</option>


<option value="damaged">
Damaged
</option>


</select>



{
instance.status==="damaged"
&&

<p className="
mt-2
max-w-[150px]
text-xs
text-red-600
">

{
instance.damagedReason ||
"No reason"
}

</p>

}



</td>








<td className="p-5">

{
instance.firmwareVersion ||
"-"
}

</td>








<td className="p-5">

{
formatDate(
instance.purchaseDate
)
}

</td>







<td className="p-5">

{
formatDate(
instance.activationDate
)
}

</td>







<td className="p-5">

{
formatDate(
instance.warrantyExpiry
)
}

</td>









<td className="p-5">


<button

onClick={()=>
removeInstance(
instance._id
)
}

className="
rounded-lg
bg-red-50
px-4
py-2
text-xs
font-semibold
text-red-600
hover:bg-red-100
"

>

Delete

</button>


</td>






</tr>


)

)

}



</tbody>



</table>


</div>






</main>


</div>


);


};


export default AdminSmartUnitInstancesPage;