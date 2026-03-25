import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role:     { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
    avatar:   { type: String, default: '' },
    phone:    { type: String, default: '' },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (this.isModified('password') === false) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}
export default mongoose.model('User', userSchema)
