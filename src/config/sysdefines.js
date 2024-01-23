export default class SysDefines {

    getWebProtocol() {
        // Replace to return "https://" for HTTPS Support
        return `http://`;
    }

    getWebsocketUrl(host, port) {
        // Replace to return "wss://SONIC_SERVER_HOST:SONIC_SERVER_PORT/server/websockets/hub/${host}/${port}" for HTTPS Support
        return `ws://${host}:${port}/websockets`;
    }
}