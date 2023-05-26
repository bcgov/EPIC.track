import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { AppConfig } from "../../config";

const getSubTypeByType = async (typeId: number) => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.SubTypes.GET_SUB_TYPES + `?type_id=${typeId}`
  );
};

const subTypeService = {
  getSubTypeByType,
};

export default subTypeService;
