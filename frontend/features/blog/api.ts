import type { BlogPost } from "@/features/blog/types";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { endpoints } from "@/lib/api/endpoints";

export async function getBlogs(locale?: string) {
  const response = await apiClient.get<BlogPost[] | PaginatedResponse<BlogPost>>(endpoints.blogs.list, { headers: { "X-Demo-Locale": locale } });
  return unwrapCollection(response.data);
}

export async function getBlog(id: number | string, locale?: string) {
  const response = await apiClient.get<BlogPost>(endpoints.blogs.detail(id), { headers: { "X-Demo-Locale": locale } });
  return response.data;
}
