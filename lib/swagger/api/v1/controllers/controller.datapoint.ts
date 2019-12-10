import { DataPointGroupAddressMatch } from "../models/api.models";
import { knxManagerService } from "../../../../knx.iptunneling.manager";

export function matchDataPoint(req, res, next) {
    let data: DataPointGroupAddressMatch = req.swagger.params.matchValue.value.data;
    knxManagerService.addDataPointMatch(data.dptType, data.groupAddress);
    res.json({});
}
