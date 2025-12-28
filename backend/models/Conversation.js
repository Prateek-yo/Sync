import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Method to find conversation between two users
conversationSchema.statics.findConversationBetween = async function (userId1, userId2) {
    return await this.findOne({
        participants: { $all: [userId1, userId2] }
    });
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
