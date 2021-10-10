import ReportService from "../../services/report.js";

const reportReply = async (postId, commentId, replyId, reporter, reportType, userFeedback) => {
	await ReportService.reportReply(postId, commentId, replyId, reporter, reportType, userFeedback);
};

export default reportReply;
