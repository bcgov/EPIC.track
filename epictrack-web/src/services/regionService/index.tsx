import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { ListType } from "../../models/code";
import { REGIONS } from "../../components/shared/constants";

const getRegions = async (type: keyof typeof REGIONS = REGIONS.ENV) => {
  return await http.GetRequest<ListType[]>(Endpoints.REGION.GET_ALL, {
    type,
  });
};

const RegionService = {
  getRegions,
};

export default RegionService;
