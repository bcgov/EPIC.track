import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

const fetchReportData = async (reportType: string, reportParams: any) => {
  return await http.PostRequest(
    Endpoints.Reports.GET_REPORT + `/${reportType}`,
    reportParams
  );
};
const downloadPDF = async (reportType: string, reportParams: any) => {
  return await http.PostRequest(
    Endpoints.Reports.GET_PDF_REPORT + `/${reportType}`,
    reportParams,
    {},
    {
      responseType: "blob",
    }
  );
};

const getEventCalendar = async () => {
  return await http.GetRequest(Endpoints.Reports.GET_EVENT_CALENDAR);
};

const ReportService = {
  fetchReportData,
  downloadPDF,
  getEventCalendar,
};
export default ReportService;
