import { useMemo, useState } from "react";
import { Plus, Check, CalendarX2 } from "lucide-react";
import { motion } from "motion/react";
import { useCart, slotId } from "../../context/CartContext.jsx";
import { useShowcase } from "../../context/ShowcaseContext.jsx";
import { getDay, getSport, priceFor, isPeak } from "../../data/availability.js";
import { formatLongDate, formatRange, pad, peso } from "../../utils/date.js";
import { Housing, Seg, Stencil } from "../board/Board.jsx";

const EASE = [0.22, 1, 0.36, 1];

/*
  Booking table for both tiers. Court tabs across the top (only courts with
  open hours that day), open time slots as rows.
  Basic: rows switch colour instantly, no motion.
  Intermediate: hover swipes colour into the right edge, adding sweeps it
  across the whole row, rows and tabs animate.
*/
function SlotRow({ fx, hour, price, peak, inCart, onClick, index }) {
  const Item = fx ? motion.li : "li";
  const itemProps = fx
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay: Math.min(index, 10) * 0.03, ease: EASE },
      }
    : {};

  const Icon = inCart ? Check : Plus;

  return (
    <Item {...itemProps}>
      <button
        type="button"
        aria-pressed={inCart}
        onClick={onClick}
        className={`group relative grid w-full grid-cols-[1fr_auto_3.5rem] items-center overflow-hidden rounded-xl border text-left ${
          fx ? "transition-colors duration-200" : ""
        } ${inCart ? "border-primary" : fx ? "border-line hover:border-primary" : "border-line hover:border-ink/40 hover:bg-ink/5"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 right-0 bg-primary ${
            fx
              ? `transition-[width] ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  inCart ? "w-full duration-[650ms]" : "w-0 duration-[325ms] group-hover:w-14"
                }`
              : inCart
                ? "w-full"
                : "w-0"
          }`}
        />
        <span
          className={`relative z-10 px-4 py-3.5 font-semibold tabular-nums ${
            fx ? (inCart ? "transition-colors delay-300 duration-300" : "transition-colors duration-200") : ""
          } ${inCart ? "text-on-primary" : "text-ink"}`}
        >
          <span className="whitespace-nowrap">{formatRange(hour)}</span>
          {peak && <span className="block text-xs font-medium opacity-60 sm:ml-2 sm:inline">Peak</span>}
        </span>
        <span
          className={`relative z-10 pr-4 text-sm tabular-nums ${
            fx ? (inCart ? "transition-colors delay-200 duration-300" : "transition-colors duration-200") : ""
          } ${inCart ? "text-on-primary" : "text-ink/70"}`}
        >
          {peso(price)}
        </span>
        <span
          className={`relative z-10 flex justify-center ${fx ? "transition-colors duration-200" : ""} ${
            inCart ? "text-on-primary" : fx ? "text-ink group-hover:text-on-primary" : "text-ink"
          }`}
        >
          {fx ? (
            <motion.span
              key={inCart ? "check" : "plus"}
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex"
            >
              <Icon size={17} aria-hidden="true" />
            </motion.span>
          ) : (
            <Icon size={17} aria-hidden="true" />
          )}
        </span>
        <span className="sr-only">{inCart ? ", in cart. Select to remove" : ", add to cart"}</span>
      </button>
    </Item>
  );
}

export default function SlotTable({ sportId, dateKey }) {
  const { has, toggle } = useCart();
  const fx = useShowcase().tier !== "basic";
  const sport = getSport(sportId);
  const day = getDay(sportId, dateKey);

  // Courts with at least one open hour on this date
  const courts = useMemo(
    () =>
      sport.courts
        .map((c) => ({ ...c, hours: day.slots.filter((s) => s.free.includes(c.id)).map((s) => s.hour) }))
        .filter((c) => c.hours.length > 0),
    [sport, day]
  );

  // Keeps the chosen court when switching dates, if it's still open
  const [courtId, setCourtId] = useState(null);
  const active = courts.find((c) => c.id === courtId) ?? courts[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Housing screws={false} className="flex items-end justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <Stencil className="block text-xs text-on-stage/65">{sport.name}</Stencil>
          <h2 className="display mt-2 text-3xl">{formatLongDate(dateKey)}</h2>
          <p className="mt-2 text-sm text-on-stage/70">
            Across {courts.length} {courts.length === 1 ? "court" : "courts"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <Stencil className="block text-[0.7rem] text-on-stage/65">Open hours</Stencil>
          <span className="readout mt-2 inline-flex rounded-lg px-3 py-2 text-3xl">
            <Seg value={pad(day.freeCount)} label={`${day.freeCount} open court hours`} />
          </span>
        </div>
      </Housing>

      {!active ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
          <CalendarX2 size={32} className="text-accent" aria-hidden="true" />
          <p className="mt-4 font-semibold">No open times on this date</p>
          <p className="mt-2 text-sm text-ink/65">Pick another date on the calendar.</p>
        </div>
      ) : (
        <>
          {/* Court tabs */}
          <div className="px-6 pt-5">
            <div role="tablist" aria-label="Court" className="flex gap-1 overflow-x-auto rounded-full bg-ink/5 p-1">
              {courts.map((c) => {
                const selected = c.id === active.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setCourtId(c.id)}
                    className={`relative flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                      fx ? "transition-colors duration-300" : ""
                    } ${selected ? "text-on-primary" : "text-ink/70 hover:text-ink"} ${
                      selected && !fx ? "bg-primary" : ""
                    }`}
                  >
                    {selected && fx && (
                      <motion.span
                        layoutId="court-tab-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ duration: 0.4, ease: EASE }}
                      />
                    )}
                    <span className="relative">
                      {c.name}
                      <span className="ml-1.5 text-xs font-medium opacity-70">{c.hours.length}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-ink/60">{active.detail}</p>
          </div>

          {/* Table */}
          <div className="grid grid-cols-[1fr_auto_3.5rem] px-6 pb-2 pt-5 text-xs font-medium text-ink/55">
            <span className="pl-4">Time</span>
            <span className="pr-4">Rate</span>
            <span className="text-center">Add</span>
          </div>
          <ul key={`${sportId}-${dateKey}-${active.id}`} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-6 pb-6">
            {active.hours.map((hour, i) => {
              const id = slotId({ sportId, dateKey, hour, courtId: active.id });
              const price = priceFor(sport, dateKey, hour);
              return (
                <SlotRow
                  key={hour}
                  fx={fx}
                  index={i}
                  hour={hour}
                  price={price}
                  peak={isPeak(dateKey, hour)}
                  inCart={has(id)}
                  onClick={() =>
                    toggle({ id, sportId, dateKey, hour, courtId: active.id, courtName: active.name, price })
                  }
                />
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
