import { Aperture } from "lucide-react";
import { Button } from "./ui/Button";

export function EmptyState({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: string;
}) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-charcoal/10 bg-bone/70 p-10 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-grain-wash text-olive shadow-soft">
          <Aperture className="h-9 w-9" />
        </div>
        <h2 className="font-serif text-4xl font-semibold text-charcoal">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-charcoal/65">{body}</p>
        {action ? <Button className="mt-8">{action}</Button> : null}
      </div>
    </div>
  );
}
