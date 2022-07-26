const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Must use a valid email address'], // regex from: https://bobbyhadz.com/blog/react-check-if-email-is-valid
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    ambitions: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Ambitions',
        },
      ],
});

// set up pre-save middleware to create password
userSchema.pre('save', async function(next) { // this line is the reason why findOneAndUpdate will not hash a changed password! source: https://mongoosejs.com/docs/middleware.html#pre
    if (this.isNew || this.isModified('password')) {
      const saltRounds = 10; // enough salt?
      this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});
  
  // compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

module.exports = User;