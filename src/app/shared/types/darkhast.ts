import { MoamelehType } from "./moameleh";

export interface DarkhastType {
  _id?: string;
  username?: string;
  fullName?: string;
  tedadSahm?: number;
  tedadMoamelehShodeh?: number;
  tedadBaghiMandeh?: number;
  arzeshSahm?: number;
  tarikhDarkhast?: Date;
  vazeiat?: string;
  tozihat?: string;
  noeDarkhst?: string;
  moamelat?: MoamelehType[]
}