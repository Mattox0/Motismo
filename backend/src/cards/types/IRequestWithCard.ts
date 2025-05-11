import { Card } from "@/cards/card.entity";

export interface IRequestWithCard extends Request {
  card?: Card;
}
