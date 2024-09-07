export interface IBook {
  _id?: string;
  id?: string; 
  title: string;
  description?: string;
  category?: string;
  date?: number;
  author?: string;
  edition?: string;
  price?: number;
  imageUrl?: string;
}
