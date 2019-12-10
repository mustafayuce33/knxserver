import * as mosca from 'mosca';

export interface MqttListener {
    publishedEvent(packet, client): void;
}

class EmbeddedMqttBrokerService {

    private mqttWsPort: number = 8000;

    private server: mosca.Server;
    private listeners: Array<MqttListener> = new Array<MqttListener>();

    public async start() {

        let settings = {
            http: {
                port: this.mqttWsPort,
                bundle: true,
                static: './'
            },
        };

        this.server = new mosca.Server(settings);

        this.attachEvents();
    }

    public addListener(listener : MqttListener) {
        this.listeners.push(listener);
    }

    private async stop() {
        this.server.close(() => {

        });
    }

    private attachEvents() {

        this.server.on('ready', this.setup.bind(this));

        this.server.on('clientConnected', (client) => {
            console.log('client connected', client.id);
        });

        // fired when a message is received
        this.server.on('published', this.publishedEvent.bind(this));

        // fired when a client subscribes to a topicIChannelTypeJson
        this.server.on('subscribed', this.subscribedEvent.bind(this));

        // fired when a client subscribes to a topic
        this.server.on('unsubscribed', this.unsubscribedEvent.bind(this));

        // fired when a client is disconnecting
        this.server.on('clientDisconnecting', this.clientDisconnectingEvent.bind(this));

        // fired when a client is disconnected
        this.server.on('clientDisconnected', this.clientDisconnectedEvent.bind(this));
    }

    publishAll(topic: string, payload: any): void {
        if (this.server) {
            this.server.publish({
                topic: topic,
                payload: JSON.stringify(payload)
            } as any, (obj: any, packet: mosca.Packet) => {

            });
        }
    }

    private clientDisconnectedEvent(client) {
        console.log('clientDisconnected : ', client.id);
    }

    private clientDisconnectingEvent(client) {
        console.log('clientDisconnecting : ', client.id);
    }

    private unsubscribedEvent(topic, client) {
        console.log('unsubscribed : ', topic);
    }

    private subscribedEvent(topic, client) {
        console.log('subscribed : ', topic);
    }

    private publishedEvent(packet, client) {
        console.log('published : topic : %s , payload : %s', packet.topic, packet.payload.toString());

        this.listeners.forEach(listener => {
            listener.publishedEvent(packet, client);
        });
    }

    private setup() {
        this.server.authenticate = this.authenticate.bind(this);
        console.log('Mosca server is up and running')
    }

    private authenticate(client, username, password, callback) {
        callback(null, true);
    }

    // In this case the client authorized as alice can publish to /users/alice taking
    // the username from the topic and verifing it is the same of the authorized user
    private authorizePublish(client, topic, payload, callback) {
        callback(null, client.user == topic.split('/')[1]);
    }

    // In this case the client authorized as alice can subscribe to /users/alice taking
    // the username from the topic and verifing it is the same of the authorized user
    private authorizeSubscribe(client, topic, callback) {
        callback(null, client.user == topic.split('/')[1]);
    }
}

export const mqttService = new EmbeddedMqttBrokerService();