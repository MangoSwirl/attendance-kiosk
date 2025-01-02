import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useReaderConnected from "@/lib/readerConnected";
import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function WelcomeText() {
  return (
    <motion.div className="w-[366px] space-y-4" exit={{ opacity: 0, x: -100 }}>
      <div className="space-y-2">
        <p className="text-xl">Welcome</p>
        <h1 className="font-medium text-4xl">Tap your badge to check in.</h1>
      </div>
      <Button variant="secondary">I don't have a badge</Button>
    </motion.div>
  );
}

function ReaderDisconnected() {
  return (
    <div className="bg-background h-screen w-screen flex justify-center items-center gap-2">
      <LoaderCircle className="animate-spin" />
      <p>Connecting to reader...</p>
    </div>
  );
}

function HomeComponent() {
  const { cardPayload, user } = useUser();
  const isReaderConnected = useReaderConnected((state) => state.readerConnected);

  if (!isReaderConnected) {
    return <ReaderDisconnected />;
  }

  return (
    <div className="bg-background w-screen h-screen flex justify-center items-center">
      <div className="flex gap-11 items-center">
        <motion.div
          className={cn(
            "w-[233px] h-[366px] relative shadow-md rounded-md overflow-hidden"
          )}
          layout
          transition={{
            type: "spring",
            damping: 7,
            stiffness: 100,
          }}
        >
          {cardPayload !== null && user === null && (
            <Skeleton className="absolute inset-0" />
          )}
          <AnimatePresence>
            {cardPayload === null && (
              <motion.img
                src="/assets/card-placeholder.png"
                className="absolute inset-0"
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* <AnimatePresence> */}
        {cardPayload === null && <WelcomeText />}
        {/* </AnimatePresence> */}
      </div>
    </div>
  );
}
