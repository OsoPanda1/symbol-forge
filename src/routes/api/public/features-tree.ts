import { createFileRoute } from "@tanstack/react-router";
import { featuresTree } from "@/config/features-tree";

export const Route = createFileRoute("/api/public/features-tree")({
  server: {
    handlers: {
      GET: async () => Response.json(featuresTree),
    },
  },
});
