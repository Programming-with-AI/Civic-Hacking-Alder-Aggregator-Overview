export interface Alder {
  district: number;
  name: string;
  blogUrl: string;
  photoUrl: string;
}

export interface AlderPost {
  alderDistrict: number;
  alderName: string;
  title: string;
  url: string;
  publishedAt: string; // ISO string
}

