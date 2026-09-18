import type { BlogPost } from "@/features/blog/types";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { endpoints } from "@/lib/api/endpoints";

export async function getBlogs() {
  const response = await apiClient.get<BlogPost[] | PaginatedResponse<BlogPost>>(endpoints.blogs.list);
  return unwrapCollection(response.data);
}

export async function getBlog(id: number | string) {
  const response = await apiClient.get<BlogPost>(endpoints.blogs.detail(id));
  return response.data;
}
