export enum ConnectionStatusEnum {
  QR_CODE = 'qr_code',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  CONNECTED = 'connected',
}

export enum DisconnectionReasonEnum {
  UNEXPECTED = 'unexpected disconnection',
  LOGOUT = 'logout',
}

export interface ConnectionStatus {
  status: ConnectionStatusEnum;
  reason?: DisconnectionReasonEnum;
}
