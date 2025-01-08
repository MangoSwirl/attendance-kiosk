import { useQuery } from "@tanstack/react-query";
import useCardPayload from "./useCardPayload";
import getPersonFromBadge from "./api/getPersonFromBadge";

const useUser = () => {
  const cardPayload = useCardPayload((state) => state.cardPayload);

  return useQuery({
    queryKey: ["user", { cardPayload }],
    queryFn: () => getPersonFromBadge(cardPayload!),
    enabled: !!cardPayload,
  });
};

export default useUser;
