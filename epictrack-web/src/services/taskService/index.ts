import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { Template, TemplateApprove } from "../../models/template";

const getTemplates = async () => {
  return await http.GetRequest(Endpoints.Templates.TEMPLATES);
};

const getTemplate = async (templateId: number) => {
  return await http.GetRequest(
    Endpoints.Templates.TEMPLATES + `/${templateId}`
  );
};

const getTemplateTasks = async (templateId: number) => {
  return await http.GetRequest(
    Endpoints.Templates.TEMPLATES + `/${templateId}/tasks`
  );
};

const createTemplate = async (data: Template) => {
  return await http.MultipartFormPostRequest(
    Endpoints.Templates.TEMPLATES,
    data
  );
};

const patchTemplate = async (templateId: number, data: TemplateApprove) => {
  return await http.PatchRequest(
    Endpoints.Templates.TEMPLATES + `/${templateId}`,
    data
  );
};

const deleteTemplate = async (templateId?: number) => {
  return await http.DeleteRequest(
    Endpoints.Templates.TEMPLATES + `/${templateId}`
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
