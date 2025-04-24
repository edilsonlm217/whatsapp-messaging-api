import { DeviceInfo } from 'src/common/interfaces/device-info.interface';
import { ConnectionStatusEnum, DisconnectionReasonEnum } from 'src/common/interfaces/connection.status.interface';

export class EventPayloadHelper {
  // Cria o payload para o evento de reconexão
  static createReconnectPayload(deviceInfo: DeviceInfo) {
    return {
      session: {
        phone: deviceInfo.phone,
        phonePlatform: deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.RECONNECTING
        }
      },
      timestamp: new Date().toISOString()
    }
  };

  // Cria o payload para o evento QR Code
  static createQRCodePayload(qrCode: string) {
    return {
      session: {
        connection: {
          status: ConnectionStatusEnum.QR_CODE
        },
        qr: qrCode
      },
      timestamp: new Date().toISOString()
    }
  }

  // Cria o payload para o evento de conexão aberta
  static createConnectedPayload(deviceInfo: DeviceInfo) {
    return {
      session: {
        phone: deviceInfo.phone,
        phonePlatform: deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.CONNECTED
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  // Cria o payload para desconexão inesperada
  static createUnexpectedDisconnectionPayload(deviceInfo: DeviceInfo) {
    return {
      session: {
        phone: deviceInfo.phone,
        phonePlatform: deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.DISCONNECTED,
          reason: DisconnectionReasonEnum.UNEXPECTED
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  // Cria o payload para desconexão por logout
  static createLogoutDisconnectionPayload(deviceInfo: DeviceInfo) {
    return {
      session: {
        phone: deviceInfo.phone,
        phonePlatform: deviceInfo.phonePlatform,
        connection: {
          status: ConnectionStatusEnum.DISCONNECTED,
          reason: DisconnectionReasonEnum.LOGOUT
        }
      },
      timestamp: new Date().toISOString()
    };
  }
}
