import ReportService from "../../services/report.js";

const reportPost = async (postId, reporter, reportType, userFeedback) => {
	await ReportService.reportPost(postId, reporter, reportType, userFeedback);
};

export default reportPost;
