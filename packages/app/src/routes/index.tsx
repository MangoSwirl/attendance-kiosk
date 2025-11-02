import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import useReaderConnected from "@/lib/readerConnected";
import useCardPayload from "@/lib/useCardPayload";
import useUser from "@/lib/useUser";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckIcon,
  CircleHelpIcon,
  LoaderCircle,
  TriangleAlertIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function RightTextWrapper(props: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0-0 translate-y-[-50%] space-y-4">
      {props.children}
    </div>
  );
}

function TimerBar() {
  const setPayload = useCardPayload((state) => state.setCardPayload);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 2,
        duration: 1,
      }}
    >
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 10, ease: "linear" }}
        className="bg-primary h-1"
        onAnimationComplete={() => setPayload(null)}
      />
    </motion.div>
  );
}

function WelcomeText() {
  return (
    <motion.div
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeIn" }}
    >
      <RightTextWrapper>
        <div className="space-y-2">
          <p className="text-xl">
            <TextEffect preset="fade-in-blur">Welcome</TextEffect>
          </p>
          <h1 className="font-medium text-4xl">
            <TextEffect
              per="word"
              preset="fade-in-blur"
              delay={0.2}
              segmentTransition={{
                ease: [0.25, 0.1, 0.25, 1],
                duration: 0.6,
              }}
            >
              Tap your badge to check in.
            </TextEffect>
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Button variant="secondary">I don't have a badge</Button>
        </motion.div>
      </RightTextWrapper>
    </motion.div>
  );
}

function AttendanceRecordedText(props: { name: string }) {
  const setCardPayload = useCardPayload((state) => state.setCardPayload);

  return (
    <RightTextWrapper>
      <div className="space-y-2">
        <p className="text-xl">
          <TextEffect
            per="word"
            preset="fade-in-blur"
          >{`Hi, ${props.name}`}</TextEffect>
        </p>
        <h1 className="font-medium text-4xl">
          <TextEffect
            per="word"
            preset="fade-in-blur"
            delay={0.2}
            segmentTransition={{
              ease: [0.25, 0.1, 0.25, 1],
              duration: 0.6,
            }}
          >
            Your attendance has been recorded.
          </TextEffect>
        </h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Button variant="secondary" onClick={() => setCardPayload(null)}>
          I'm done
        </Button>
      </motion.div>
    </RightTextWrapper>
  );
}

function LoadingText() {
  return (
    <RightTextWrapper>
      <div className="space-y-2">
        <h1 className="font-medium text-4xl">
          <TextEffect
            per="word"
            preset="fade-in-blur"
            delay={1.5}
            segmentTransition={{
              ease: [0.25, 0.1, 0.25, 1],
              duration: 0.6,
            }}
          >
            Loading your profile...
          </TextEffect>
        </h1>
      </div>
    </RightTextWrapper>
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

function UnknownUserText() {
  const setCardPayload = useCardPayload((state) => state.setCardPayload);

  return (
    <RightTextWrapper>
      <div className="space-y-2">
        <h1 className="font-medium text-4xl max-w-[300px]">
          <TextEffect preset="fade-in-blur" delay={0.4}>
            Badge not recognized.
          </TextEffect>
        </h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Button variant="secondary" onClick={() => setCardPayload(null)}>
          Go back
        </Button>
      </motion.div>
    </RightTextWrapper>
  );
}

function GenericErrorText() {
  const setCardPayload = useCardPayload((state) => state.setCardPayload);

  return (
    <RightTextWrapper>
      <div className="space-y-2">
        <h1 className="font-medium text-4xl max-w-[300px]">
          <TextEffect preset="fade-in-blur" delay={0.4}>
            An error occurred.
          </TextEffect>
        </h1>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Button variant="secondary" onClick={() => setCardPayload(null)}>
          Go back
        </Button>
      </motion.div>
    </RightTextWrapper>
  );
}

function BadgeGraphic(props: { icon?: React.ReactNode; loading?: boolean }) {
  const scaledDown = props.loading || props.icon;

  return (
    <div className="w-[233px] h-[366px] relative">
      <motion.div
        animate={{ scale: scaledDown ? 0.95 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={cn(
          "absolute inset-0 flex justify-center items-center rounded-md",
          {
            "animate-pulse": props.loading,
            "shadow-md": !props.icon,
          }
        )}
      >
        <img
          src="/assets/badge-placeholder.png"
          className={cn("absolute inset-0 transition-all duration-500", {
            "opacity-50 brightness-90 blur-md": props.icon,
          })}
        />

        <AnimatePresence>
          {props.icon && (
            <motion.div
              className="absolute"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {props.icon}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function HomeComponent() {
  const { data: user, isLoading, isError } = useUser();
  const cardPayload = useCardPayload((state) => state.cardPayload);
  const isReaderConnected = useReaderConnected(
    (state) => state.readerConnected
  );
  const userIsUnknown = cardPayload && !isLoading && !user && !isError;

  if (!isReaderConnected) {
    return <ReaderDisconnected />;
  }

  let icon;

  if (user) icon = <CheckIcon size={80} strokeWidth={1.7} />;
  if (userIsUnknown) icon = <CircleHelpIcon size={80} strokeWidth={1.7} />;
  if (isError) icon = <TriangleAlertIcon size={80} strokeWidth={1.7} />;

  return (
    <div className="bg-background w-screen h-screen flex justify-center items-center">
      <div className="flex gap-11 items-center">
        <BadgeGraphic loading={isLoading} icon={icon} />

        <div className="w-[310px] relative">
          <AnimatePresence>
            {cardPayload === null && <WelcomeText />}
          </AnimatePresence>
          {isLoading && <LoadingText />}
          {user && <AttendanceRecordedText name={user.person.name} />}
          {userIsUnknown && <UnknownUserText />}
          {isError && <GenericErrorText />}
        </div>
      </div>
      {(user || userIsUnknown || isError) && (
        <TimerBar key={`bar-payload-${cardPayload}`} />
      )}
    </div>
  );
}
