const { Schema, model } = require('mongoose');

const eventsSchema = require("./Events"); // importing subdocument schema

const ambitionsSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    identity: { 
        type: String,
        required: true,
        trim: true
    },
    timeLimit: {
        type: Number,
        required: true,
        max: 365, //days...
        min: 7 //days
    },
    category: { // every ambition belongs to a category
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    user: { // every ambition belongs to a user
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    public: { // if true = public, false = private
        type: Boolean,
        default: false,
    },
    calendar: [eventsSchema],
  },
  {
    toJSON: {
        virtuals: true,        
    },
    id: false, // forgot what this is for but it's always used after toJSON
  }
);

ambitionsSchema.virtual("daysCount").get(function () {
    return this.calendar.length;
})

const Ambitions = model("Ambitions", ambitionsSchema);
// do i create sideEffects as a submodel or just put it in with the schema?...

module.exports = Ambitions;