export type ProjectRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  technologies: string[];
  year: string;
  isPublished: boolean;
  sortOrder: number;
};
