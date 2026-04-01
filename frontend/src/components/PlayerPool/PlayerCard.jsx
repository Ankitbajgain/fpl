import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../../features/squad/squadSlice";

export function PlayerCard({
  player,
  isSelected,
  onToggle,
  mode,
  homeCountry,
  creditsLeft,
  isLocked,
}) {
  const dispatch = useDispatch();
  const { favorites, selectedLeagueSeason } = useSelector(
    (state) => state.squad,
  );
  const leagueFavorites = selectedLeagueSeason
    ? favorites[selectedLeagueSeason] || []
    : [];
  const isFavorite = leagueFavorites.includes(player.id);
  const normalizedHomeCountry = String(homeCountry || "")
    .trim()
    .toLowerCase();
  const normalizedPlayerCountry = String(player.country || "")
    .trim()
    .toLowerCase();
  const isAwayPlayer =
    mode === "Classic" &&
    normalizedHomeCountry &&
    normalizedPlayerCountry !== normalizedHomeCountry;
  const isUnaffordable =
    !isSelected && Number(player.credits) > Number(creditsLeft);
  const isActionDisabled = isLocked || isUnaffordable;

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        isSelected
          ? "border-[#0e6f59] bg-[#eef9f5]"
          : isUnaffordable
            ? "border-[#e7d8cf] bg-[#f8f5f2]"
            : "border-[#dfe8f2] bg-white"
      } ${isLocked ? "opacity-60" : isUnaffordable ? "opacity-65" : ""}`}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-heading text-lg leading-tight">
              {player.name}
            </h3>
            <span className="rounded-lg bg-[#eaf0ff] px-2 py-1 text-xs font-semibold text-[#2f4d96]">
              {player.role}
            </span>
            {isAwayPlayer ? (
              <span className="rounded-lg bg-[#fff1e7] px-2 py-1 text-xs font-semibold text-[#b35c24]">
                Away
              </span>
            ) : (
              <span className="rounded-lg bg-[#eaf8f0] px-2 py-1 text-xs font-semibold text-[#2c6c48]">
                Home
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#5f7080]">
            <span className="font-semibold text-[#3f4d5b]">{player.team}</span>
            <span>{player.country || "Unknown"}</span>
            <span className="font-semibold text-[#0b2b57]">
              {player.credits.toFixed(1)} Cr
            </span>
            {typeof player.points === "number" ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {player.points.toFixed(1)} Pts
              </span>
            ) : null}
            {isUnaffordable ? (
              <span className="rounded-md bg-[#fbe9df] px-2 py-0.5 text-xs font-semibold text-[#a4572f]">
                Insufficient credits
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <button
            onClick={() => dispatch(toggleFavorite(player.id))}
            disabled={isLocked}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              isFavorite
                ? "bg-[#fca66e] text-white"
                : "bg-[#efe6d7] text-[#5c6570]"
            } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isFavorite ? "Fav" : "Mark"}
          </button>

          <button
            onClick={() => onToggle(player)}
            disabled={isActionDisabled}
            aria-label={isSelected ? "Remove player" : "Add player"}
            title={
              isUnaffordable && !isSelected
                ? "Not enough credits"
                : isSelected
                  ? "Remove player"
                  : "Add player"
            }
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold leading-none transition ${
              isSelected
                ? "bg-[#173f34] text-white hover:bg-[#0f2f26] disabled:opacity-60"
                : "bg-[#ec8456] text-white hover:bg-[#df7547] disabled:opacity-60"
            } ${isActionDisabled ? "cursor-not-allowed" : ""}`}
          >
            {isLocked ? "•" : isSelected ? "×" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
}
