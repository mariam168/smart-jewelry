import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  getSmartUnitInstance,
  updateSmartUnitInstance,
} from "../services/smartUnitApi";



const AdminEditSmartUnitInstancePage =
()=>{


const {
  id
}
=
useParams();



const navigate =
useNavigate();



const [
  instance,
  setInstance
]
=
useState(null);



const [
  formData,
  setFormData
]
=
useState({

status:"available",

firmwareVersion:"",

notes:"",

damagedReason:""

});



const [
 loading,
 setLoading
]
=
useState(true);



const [
 saving,
 setSaving
]
=
useState(false);



const [
 error,
 setError
]
=
useState("");





useEffect(()=>{

loadInstance();

},[id]);





const loadInstance =
async()=>{


try{


setLoading(true);

setError("");



const response =
await getSmartUnitInstance(id);



const data =
response?.data?.instance ||
response?.instance;



setInstance(data);



setFormData({

status:
data?.status ||
"available",


firmwareVersion:
data?.firmwareVersion ||
"",


notes:
data?.notes ||
"",


damagedReason:
data?.damagedReason ||
"",


});




}

catch(error){


console.error(error);


setError(

error?.response?.data?.message ||

"Failed to load physical unit."

);


}

finally{


setLoading(false);


}


};







const handleChange =
(e)=>{


const {
name,
value
}
=
e.target;



setFormData(
previous=>({

...previous,

[name]:value

})
);



};







const handleSubmit =
async(e)=>{


e.preventDefault();



try{


setSaving(true);

setError("");



await updateSmartUnitInstance(

id,

formData

);



navigate(
"/admin/smart-units"
);



}

catch(error){


console.error(error);



setError(

error?.response?.data?.message ||

"Failed to update physical unit."

);


}

finally{


setSaving(false);


}



};







const inputClass =
`
w-full
rounded-[14px]
border
border-light-champagne
bg-warm-ivory/50
px-4
py-3
text-[13px]
text-midnight-navy
outline-none
focus:border-classic-gold
`;




const labelClass =
`
mb-2
block
text-[11px]
font-semibold
text-slate-gray
`;






if(loading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-warm-ivory
">


<p className="
text-slate-gray
text-sm
">

Loading Physical Unit...

</p>


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
mx-auto
max-w-5xl
px-6
py-7
">


<Link

to="/admin/smart-units"

className="
text-[12px]
text-antique-gold
"

>

← Back to Smart Units

</Link>



<h1 className="
mt-5
font-serif
text-[2.5rem]
tracking-tight
">

Edit Physical Unit

</h1>



<p className="
mt-2
text-[13px]
text-slate-gray
">

Manage serial number status and configuration

</p>



</div>


</header>






<main className="
mx-auto
max-w-5xl
px-6
py-10
">



{error && (

<div className="
mb-6
rounded-xl
border
border-red-200
bg-red-50
px-5
py-4
text-sm
text-red-600
">

{error}

</div>

)}







<section className="
rounded-[24px]
border
border-light-champagne
bg-soft-white
overflow-hidden
">



<div className="
border-b
border-light-champagne
px-6
py-5
bg-warm-ivory/40
">


<h2 className="
font-serif
text-xl
">

Physical Information

</h2>


</div>







<div className="
p-6
space-y-6
">





<div>

<label className={labelClass}>

Serial Number

</label>



<input

value={
instance?.serialNumber || ""
}

disabled

className={
inputClass
}

/>


<p className="
mt-2
text-[11px]
text-steel-gray
">

Serial number cannot be changed because it identifies the hardware.

</p>


</div>







<div>


<label className={labelClass}>

Unique Code

</label>



<input

value={
instance?.uniqueCode || ""
}

disabled

className={
inputClass
}

/>


</div>









<div>


<label className={labelClass}>

Status

</label>



<select

name="status"

value={
formData.status
}

onChange={
handleChange
}

className={
inputClass
}

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


</div>









{
formData.status === "damaged" && (

<div>


<label className={labelClass}>

Damage Reason

</label>



<textarea

rows="4"

name="damagedReason"

value={
formData.damagedReason
}

onChange={
handleChange
}

placeholder="
Example: Broken sensor, water damage...
"

className={
inputClass
}

/>


</div>

)

}









<div>


<label className={labelClass}>

Firmware Version

</label>



<input

name="firmwareVersion"

value={
formData.firmwareVersion
}

onChange={
handleChange
}

placeholder="1.0.0"

className={
inputClass
}

/>



</div>









<div>


<label className={labelClass}>

Internal Notes

</label>



<textarea

rows="5"

name="notes"

value={
formData.notes
}

onChange={
handleChange
}

placeholder="
Add internal notes...
"

className={
inputClass
}

/>


</div>







</div>





</section>







<div className="
mt-6
flex
justify-end
gap-3
">



<Link

to="/admin/smart-units"

className="
rounded-xl
border
border-light-champagne
px-6
py-3
text-[11px]
font-semibold
text-slate-gray
"

>

Cancel

</Link>






<button

onClick={handleSubmit}

disabled={saving}

className="
rounded-xl
bg-midnight-navy
px-8
py-3
text-[11px]
font-semibold
text-white
disabled:opacity-50
"

>


{
saving
?
"Saving..."
:
"Save Changes"
}


</button>



</div>






</main>





</div>


);


};



export default AdminEditSmartUnitInstancePage;