import Endpoints from "../../constants/api-endpoint";
import http from "../../apiManager/http-request-handler";
import { SpecialFieldEntityEnum } from "../../constants/application-constant";
import { SpecialField } from "../../components/shared/specialField/type";

class SpecialFieldService {
  getEntries = async (
    entity: SpecialFieldEntityEnum,
    entity_id: number,
    field_name: string
  ) => {
    return await http.GetRequest(Endpoints.SpecialFields.SPECIAL_FIELDS, {
      entity,
      entity_id,
      field_name,
    });
  };

  createSpecialFieldEntry = async (payload: SpecialField) => {
    return await http.PostRequest(
      Endpoints.SpecialFields.SPECIAL_FIELDS,
      payload
    );
  };

  updateSpecialFieldEntry = async (payload: SpecialField, objectId: number) => {
    return await http.PutRequest(
      Endpoints.SpecialFields.UPDATE.replace(
        ":specialFieldId",
        objectId.toString()
      ),
      payload
    );
  };
}

export default new SpecialFieldService();
