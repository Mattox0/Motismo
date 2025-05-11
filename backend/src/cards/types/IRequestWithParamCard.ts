import { Request } from "express";
import { Card } from "../card.entity";

export interface IRequestWithParamCard extends Request {
  params: {
    cardId: string;
  };
  card?: Card;
}
