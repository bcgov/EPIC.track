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

  getEntriesBasedOnFieldValue = async (
    entity: SpecialFieldEntityEnum,
    field_name: string,
    field_value: string
  ) => {
    return await http.GetRequest(Endpoints.SpecialFields.SPECIAL_FIELDS, {
      entity,
      field_name,
      field_value,
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

  deleteSpecialFieldEntry = async (objectId: number) => {
    return await http.DeleteRequest(
      Endpoints.SpecialFields.DELETE.replace(
        ":specialFieldId",
        objectId.toString()
      )
    );
  };
}

const specialFieldService = new SpecialFieldService();
export default specialFieldService;
