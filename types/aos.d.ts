declare module "aos" {
  type AOSOptions = {
    delay?: number;
    disable?: boolean | "mobile" | "phone" | "tablet" | (() => boolean);
    duration?: number;
    easing?: string;
    offset?: number;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
    startEvent?: string;
  };

  const AOS: {
    init(options?: AOSOptions): void;
    refresh(): void;
    refreshHard(): void;
  };

  export default AOS;
}
