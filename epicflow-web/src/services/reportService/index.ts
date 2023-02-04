import Endpoints from '../../apiManager/endpoints';
import http from '../../apiManager/http-request-handler'
import { AppConfig } from '../../config';
const fetchReportData = async(apiUrl: string, reportType: string, reportParams: any) => {
    return await http.PostRequest((AppConfig.apiUrl|| apiUrl)+Endpoints.Reports.GET_REPORT+`/${reportType}`,reportParams)
}
const ReportService = {
    fetchReportData
}
export default ReportService;