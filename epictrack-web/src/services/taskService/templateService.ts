import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { Template, TemplateApprove } from "../../models/template";

class TemplateService {
  getTemplates = async () => {
    return await http.GetRequest(Endpoints.Templates.TEMPLATES);
  };

  getTemplatesByParams = async (
    eaActId: number,
    workTypeId: number,
    phaseId: number
  ) => {
    return await http.GetRequest(
      `${Endpoints.Templates.TEMPLATES}?work_type_id=${workTypeId}&ea_act_id=${eaActId}&phase_id=${phaseId}`
    );
  };

  getTemplate = async (templateId: number) => {
    return await http.GetRequest(
      Endpoints.Templates.TEMPLATES + `/${templateId}`
    );
  };

  getTemplateTasks = async (templateId: number) => {
    return await http.GetRequest(
      Endpoints.Templates.TEMPLATES + `/${templateId}/tasks`
    );
  };

  createTemplate = async (data: Template) => {
    return await http.MultipartFormPostRequest(
      Endpoints.Templates.TEMPLATES,
      data
    );
  };

  patchTemplate = async (templateId: number, data: TemplateApprove) => {
    return await http.PatchRequest(
      Endpoints.Templates.TEMPLATES + `/${templateId}`,
      data
    );
  };

  deleteTemplate = async (templateId?: number) => {
    return await http.DeleteRequest(
      Endpoints.Templates.TEMPLATES + `/${templateId}`
    );
  };
}

export default new TemplateService();
