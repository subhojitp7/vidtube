import mongoose, { Schema } from "mongoose";
import { aggregatePaginate } from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    video: {
      type: String, // Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: {
      type: Schema.Types.ObjectId,
      ref: "Like",
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
