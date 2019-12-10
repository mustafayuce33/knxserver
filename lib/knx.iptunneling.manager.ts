import { Connection, Datapoint } from "knx";
import { mqttService, MqttListener } from "./mqtt.broker";
const DPTLib = require('knx/src/dptlib');

enum ConnectionState {
    Connecting,
    Connected,
    Disconnecting,
    Disconnected
}

class KnxIPManager implements MqttListener {

    private knxConnection: Connection;
    private connectionState: ConnectionState;
    private groupAddressDptType = new Map<string, string>();

    constructor() {
        mqttService.addListener(this);
    }

    start(knxIp: string, knxPort: number) {
        
        this.knxConnection = new Connection({
            ipAddr: knxIp,
            handlers: {
                connected: this.onConnected.bind(this),
                event: this.onEvent.bind(this),
                error: this.onError.bind(this)
            },
            ipPort: knxPort
        });

        this.knxConnection.on("disconnected", this.onDisconnected);
    }

    async onError(connstatus: any) {
        console.log(`Knx error : ${connstatus}`);

        this.connectionState = ConnectionState.Disconnected;

        mqttService.publishAll("mqtt/connectionState", {
            state: this.connectionState
        });
    }

    async onDisconnected() {
        console.log(`Knx disconnected`);
        this.connectionState = ConnectionState.Disconnected;

        mqttService.publishAll("mqtt/connectionState", {
            state: this.connectionState
        });
    }

    addDataPointMatch(dptType: string, groupAddress: string) {
        this.groupAddressDptType.set(groupAddress, dptType);
    }

    async onEvent(evt, src, dest, buf) {
        
        console.log("%s **** KNX EVENT: %j, src: %j, dest: %j, rawData: %j",
            new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            evt, src, dest, buf);

        let jsValue = "";

        switch (evt) {
            case "GroupValue_Write":
            case "GroupValue_Response":
                if (buf && this.groupAddressDptType.has(dest)) {
                    const dpt = DPTLib.resolve(this.groupAddressDptType.get(dest));
                    const unit = dpt!.subtype!.unit!;
                    jsValue = DPTLib.fromBuffer(buf, dpt) + ((typeof unit !== "undefined" && unit !== null) ? unit : "");
                }
                break;
            default:
        }

        mqttService.publishAll("mqtt/event", {
            evt: evt,
            src: src,
            dest: dest,
            "raw Data": buf,
            "decoded Value": jsValue
        });
    }

    async onConnected() {
        console.log('Knx Connected');

        this.connectionState = ConnectionState.Connected;

        mqttService.publishAll("mqtt/connectionState", {
            state: this.connectionState
        });
    }

    publishedEvent(packet: any, client: any): void {
        if (packet.topic === "mqtt/refresh") {
            mqttService.publishAll("mqtt/connectionState", {
                state: this.connectionState
            });

            setTimeout(() => {
                mqttService.publishAll("mqtt/event", {
                    evt: "Test",
                    src: "Test",
                    dest: "Test",
                    "raw Data": "Test",
                    "decoded Value": "Test"
                });

                setTimeout(() => {
                    mqttService.publishAll("mqtt/event", {
                        evt: "Test",
                        src: "Test",
                        dest: "Test",
                        "raw Data": "Test",
                        "decoded Value": "Test"
                    });

                    setTimeout(() => {
                        mqttService.publishAll("mqtt/event", {
                            evt: "Test",
                            src: "Test",
                            dest: "Test",
                            "raw Data": "Test",
                            "decoded Value": "Test"
                        });
                    }, 1000);

                }, 1000);

            }, 1000);
        }
    }

}

export const knxManagerService = new KnxIPManager();