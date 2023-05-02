import Endpoints from '../../constants/api-endpoint';
import http from '../../apiManager/http-request-handler'
import { AppConfig } from '../../config';
const fetchReportData = async (reportType: string, reportParams: any) => {
  return await http.PostRequest(AppConfig.apiUrl +
    Endpoints.Reports.GET_REPORT + `/${reportType}`, reportParams)
}
const downloadPDF = async (reportType: string, reportParams: any) => {
  return await http.PostRequest(AppConfig.apiUrl +
    Endpoints.Reports.GET_PDF_REPORT + `/${reportType}`, reportParams, {}, {
    responseType: 'blob'
  });
}
const ReportService = {
  fetchReportData,
  downloadPDF
}
export default ReportService;