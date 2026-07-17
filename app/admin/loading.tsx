import { CandleLoader } from "@/app/components/candle-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <CandleLoader size="md" />
    </div>
  );
}
