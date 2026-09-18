export type BlogDifficulty = "Easy" | "Intermediate" | "Advanced";

export interface BlogPost {
  id: number;
  title: string;
  author: string;
  description: string;
  content: string;
  category: number | null;
  difficulty_level: BlogDifficulty;
  featured: boolean;
  created_at: string;
  updated_at: string;
  picture: string | null;
}
