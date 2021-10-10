import ReportService from "../../services/report.js";

const reportComment = async (postId, commentId, reporter, reportType, userFeedback) => {
	await ReportService.reportComment(postId, commentId, reporter, reportType, userFeedback);
};

export default reportComment;
