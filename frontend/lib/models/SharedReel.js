import mongoose from 'mongoose';

const sharedReelSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Reel URL is required'],
    trim: true
  },
  shortcode: {
    type: String,
    required: true,
    index: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reelData: {
    type: {
      type: String,
      enum: ['video', 'image', 'embed']
    },
    videoUrl: String,
    imageUrl: String,
    thumbnail: String,
    caption: String,
    likes: Number,
    comments: Number,
    views: Number,
    owner: {
      username: String,
      profilePic: String
    },
    dimensions: {
      width: Number,
      height: Number
    },
    scrapedAt: Date,
    warning: String,
    sourceUrl: String,
    embedHtml: String,
    author: String,
    title: String
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  error: {
    message: String,
    type: String
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
sharedReelSchema.index({ sharedBy: 1, createdAt: -1 });
sharedReelSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.SharedReel || mongoose.model('SharedReel', sharedReelSchema);
