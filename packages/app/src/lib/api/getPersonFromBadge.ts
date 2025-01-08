import { z } from "zod";

export default async function getPersonFromBadge(badgePayload: string) {
  console.log(badgePayload);
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL +
      "/api/people/badge?" +
      new URLSearchParams({ payload: badgePayload }),
    {
      headers: {
        Authorization: "Bearer " + import.meta.env.VITE_SERVER_KEY,
      },
    }
  );

  console.log(import.meta.env.VITE_SERVER_URL);

  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error("Failed to fetch person from badge");
  }

  const responseSchema = z.object({
    person: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(["STUDENT", "MENTOR", "SUPERVISOR", "OTHER"]),
      teamAffiliated: z.boolean(),
      profileImageUrl: z.union([z.string(), z.null()]),
    }),
  });

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return responseSchema.parse(await response.json());
}
