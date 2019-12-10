import { parseArgs } from "./lib/app.args.helper";
import { knxManagerService } from "./lib/knx.iptunneling.manager";
import { mqttService } from "./lib/mqtt.broker";
import { httpServer } from './lib/app.http.server';
import { initSwagger } from "./lib/swagger/app.swagger";

export interface IArgs {
  knxIp: string,
  knxPort: string
}

let processArgs: IArgs = parseArgs({
  knxIp: {
    type: 'string'
  },
  knxPort: {
    type: 'string'
  }
}) as IArgs;

console.log(`Args : KnxIp ${processArgs.knxIp}  --  KnxPort ${processArgs.knxPort}!`);

initSwagger(httpServer.app, async (err: any) => {
  await httpServer.startApiServer();
  await mqttService.start();

  knxManagerService.start(processArgs.knxIp, parseInt(processArgs.knxPort));
});