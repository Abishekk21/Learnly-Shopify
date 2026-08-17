import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true // Add index for faster lookups
  },
  shopName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true,
    select: false // Don't include in queries by default for security
  },
  scope: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true // Add index for filtering active stores
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Method to safely get store without exposing access token
storeSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.accessToken;
  return obj;
};

const Store = mongoose.model('Store', storeSchema);

export default Store;
