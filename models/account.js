const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer_id: {
      type: String,
      unique: true,
    },
    depositAccount: {
      id: { type: String, unique: true }, // The deposit account ID
      type: { type: String, default: "DepositAccount" }, // Default to "DepositAccount"
      attributes: {
        createdAt: { type: Date }, // Account creation date
        bank: {
          id: { type: String },
          name: { type: String },
          cbnCode: { type: String },
          nipCode: { type: String },
        },
        accountName: { type: String },
        frozen: { type: Boolean, default: false },
        currency: { type: String, default: "NGN" },
        accountNumber: { type: String }, // Use masked account number if needed
        type: { type: String },
        status: { type: String },
      },
      relationships: {
        accountNumbers: [
          {
            id: { type: String },
            type: { type: String },
          },
        ],
        subAccounts: [
          {
            id: { type: String },
            type: { type: String },
          },
        ],
        virtualNubans: [
          {
            id: { type: String },
            type: { type: String },
          },
        ],
        customer: {
          id: { type: String },
          type: { type: String },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", AccountSchema);
