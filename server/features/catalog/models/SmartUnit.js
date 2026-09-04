import mongoose from "mongoose";


const smartUnitSchema = new mongoose.Schema(
  {

    name: {

      type: String,

      required: true,

      trim: true,

      // removed unique:true
      // same Smart Unit name is allowed now

      index: true,

    },


    description: {

      type: String,

      default: "",

      trim: true,

    },


    image: {

      type: String,

      default: "",

    },


    technologyModel: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "TechnologyModel",

      required: true,

      index: true,

    },


    costPrice: {

      type: Number,

      default: 0,

      min: 0,

    },


    stock: {

      type: Number,

      default: 0,

      min: 0,

    },

productionDate: {

  type: Date,

  default: null,

},


    manufacturer: {

      type: String,

      default: "",

      trim: true,

    },


    notes: {

      type: String,

      default: "",

      trim: true,

    },


    status: {

      type: String,

      enum: [

        "available",

        "reserved",

        "assigned",

        "activated",

        "inactive",

        "damaged",

      ],

      default: "available",

    },

  },


  {

    timestamps:true,

  }

);



export default mongoose.model(
  "SmartUnit",
  smartUnitSchema
);