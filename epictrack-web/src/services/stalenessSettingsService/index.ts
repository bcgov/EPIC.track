import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { StalenessSettings, StalenessSettingTypeEnum } from "models/settings";
import { MasterBase } from "models/type";

class StalenessSettingsService {
  async getAll() {
    return http.GetRequest<StalenessSettings[]>(
      Endpoints.StalenessSettings.STALENESS
    );
  }

  async getIssueStaleness() {
    return this._getByType(StalenessSettingTypeEnum.ISSUES);
  }

  async getStatusStaleness() {
    return this._getByType(StalenessSettingTypeEnum.STATUS);
  }

  async updateStatusStaleness(data: MasterBase) {
    return this._updateStalenessByType(data, StalenessSettingTypeEnum.STATUS);
  }

  async updateIssueStaleness(data: MasterBase) {
    return this._updateStalenessByType(data, StalenessSettingTypeEnum.ISSUES);
  }

  private async _updateStalenessByType(
    data: MasterBase,
    type: StalenessSettingTypeEnum
  ) {
    return http.PutRequest(
      Endpoints.StalenessSettings.UPDATE_STALENESS_BY_TYPE.replace(
        ":staleness_type",
        type
      ),
      JSON.stringify(data)
    );
  }

  private async _getByType(type: StalenessSettingTypeEnum) {
    return http.GetRequest<StalenessSettings>(
      Endpoints.StalenessSettings.STALENESS_BY_TYPE.replace(
        ":staleness_type",
        type
      )
    );
  }
}

const stalenessSettingsService = new StalenessSettingsService();
export default stalenessSettingsService;
