import { Socket } from "socket.io";

export interface ISocketData {
  user: {
    userId: string;
    socketId: string;
    name: string;
    avatar: string;
    externalId: string;
  };
  code: string;
}

export interface IAuthenticatedSocket extends Socket {
  data: ISocketData;
}
