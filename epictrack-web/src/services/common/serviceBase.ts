import { AxiosResponse } from "axios";
import { MasterBase } from "../../models/type";

interface ServiceBase {
  getAll(): Promise<AxiosResponse<any>>;
  getById(id: string): Promise<AxiosResponse<any>>;
  create(data: MasterBase): Promise<AxiosResponse<any>>;
  update(data: MasterBase, id: any): Promise<AxiosResponse<any>>;
  delete(id: string | undefined): Promise<AxiosResponse<any>>;
}

export default ServiceBase;
