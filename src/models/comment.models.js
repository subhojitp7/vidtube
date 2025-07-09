import mongoose, { Schema } from "mongoose";
import { aggregatePaginate } from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

commentSchema.plugin(aggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
