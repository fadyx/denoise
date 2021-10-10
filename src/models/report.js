import mongoose from "mongoose";

import { reportTypes } from "../constants/ReportType.js";
import { entityTypes } from "../constants/EntityType.js";

const { Schema } = mongoose;

const reportSchema = new Schema(
	{
		reporterUsername: {
			type: String,
			required: [true, "username is required."],
		},

		reportType: {
			type: String,
			required: [true, "report type is required."],
			enum: {
				values: reportTypes,
				message: "invalid report input.",
			},
			index: true,
		},

		entityType: {
			type: String,
			required: [true, "entity type is required."],
			enum: {
				values: entityTypes,
				message: "invalid entity type input.",
			},
			index: true,
		},

		entityId: {
			type: Schema.Types.ObjectId,
		},

		userFeedback: {
			type: String,
			trim: true,
		},

		reviewed: {
			type: Boolean,
			default: false,
		},

		reviewedBy: {
			type: String,
		},
	},
	{ timestamps: true },
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
