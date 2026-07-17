import { CandleLoader } from "@/app/components/candle-loader";

export default function Loading() {
  return (
    <div className="mt-12 flex items-center justify-center">
      <CandleLoader size="md" />
    </div>
  );
}
