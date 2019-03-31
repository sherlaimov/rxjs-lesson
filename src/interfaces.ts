export interface ICharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: object;
  location: object;
  image: string;
  episode: string[];
  url: string;
  created: string;
}
export interface IInfo {
  count?: number;
  next?: string;
  pages?: number;
  prev?: string;
}
export interface IServerResp {
  info: IInfo;
  results: Array<ICharacter>;
}

export interface IAppState extends IInfo {
  step: number;
  currPage: number;
  range: { min: number; max: number };
  results?: Array<ICharacter>;
  cache?: Array<ICharacter>;
  statusMap: {
    [key: string]: boolean;
  };
}
