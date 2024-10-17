import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";

const getSubTypeByType = async (typeId?: number) => {
  return await http.GetRequest(
    Endpoints.SubTypes.SUB_TYPES + `?type_id=${typeId}`
  );
};

const subTypeService = {
  getSubTypeByType,
};

export default subTypeService;
