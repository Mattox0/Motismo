export interface ICard {
  id: string;
  rectoText: string;
  rectoImage?: string;
  versoText?: string;
  versoImage?: string;
  creationDate: Date;
  order: number;
}
