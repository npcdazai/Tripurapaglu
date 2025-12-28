import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for user
pushSubscriptionSchema.index({ user: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

export default mongoose.models.PushSubscription || mongoose.model('PushSubscription', pushSubscriptionSchema);
