export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: Category;
  tags: string[];
  imageUrl?: string;
  affiliateLinks?: AffiliateLink[];
  publishedAt: Date;
  updatedAt?: Date;
  readingTime?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AffiliateLink {
  id: string;
  productName: string;
  url: string;
  price?: string;
  description?: string;
}

export interface Keyword {
  keyword: string;
  category: string;
  tags: string[];
  searchVolume?: number;
}

export interface EmagCategory {
  id: string;
  name: string;
  url: string;
  hasArticle: boolean;
  articleSlug?: string;
}

export interface EmagArticle extends Omit<Article, 'category'> {
  category: string;
  categoryId: string;
  emagUrl: string;
  featured: boolean;
}
