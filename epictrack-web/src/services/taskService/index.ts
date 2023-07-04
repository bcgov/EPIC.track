import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";
import { Template, TemplateApprove } from "../../models/template";

const getTemplates = async () => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES
  );
};

const getTemplate = async (templateId: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES + `/${templateId}`
  );
};

const getTemplateTasks = async (templateId: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES + `/${templateId}/tasks`
  );
};

const createTemplate = async (data: Template) => {
  return await http.MultipartFormPostRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES,
    data
  );
};

const patchTemplate = async (templateId: number, data: TemplateApprove) => {
  return await http.PatchRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES + `/${templateId}`,
    data
  );
};

const deleteTemplate = async (templateId?: number) => {
  return await http.DeleteRequest(
    AppConfig.apiUrl + Endpoints.Templates.TEMPLATES + `/${templateId}`
  );
};

const taskService = {
  getTemplates,
  deleteTemplate,
  getTemplateTasks,
  createTemplate,
  patchTemplate,
  getTemplate,
};

export default taskService;
