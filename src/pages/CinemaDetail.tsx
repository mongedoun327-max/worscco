import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play,
  ArrowLeft,
  Bookmark,
  Share2,
  Star,
  Clock,
  Film,
  Tv,
  Sparkles,
  ChevronRight,
  Check,
  Volume2,
  Shield,
  Layers,
  ExternalLink,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  getCinemaById,
  CINEMA_CATALOG,
  toggleCinemaWatchlist,
  isCinemaInWatchlist,
  CinemaItem,
  CinemaEpisode,
} from "@/lib/cinema";
import { CinemaPlayerModal } from "@/components/cinema/CinemaPlayerModal";
import { CinemaCard } from "@/components/cinema/CinemaCard";
import { useContentProtection } from "@/hooks/useContentProtection";
import { toast } from "sonner";

export default function CinemaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useContentProtection();

  const [item, setItem] = useState<CinemaItem | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const found = getCinemaById(id);
    if (found) {
      setItem(found);
      setInWatchlist(isCinemaInWatchlist(found.id));
      if (found.seasons && found.seasons.length > 0) {
        setSelectedSeasonNumber(found.seasons[0].seasonNumber);
        if (found.seasons[0].episodes.length > 0) {
          setSelectedEpisodeNumber(found.seasons[0].episodes[0].episodeNumber);
        }
      } else {
        setSelectedEpisodeNumber(undefined);
      }
      document.title = `${found.title} (${found.year}) — Cinema Worsco`;
      window.scrollTo(0, 0);
    } else {
      setItem(null);
    }
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col">
        <Navigation variant="dark" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Film className="w-16 h-16 text-zinc-600 mb-4 animate-pulse" />
          <h1 className="text-2xl font-serif text-zinc-100 mb-2">Título não encontrado</h1>
          <p className="text-zinc-400 text-sm max-w-md mb-6">
            O filme ou série que você está procurando pode ter sido removido ou o link está incorreto.
          </p>
          <button
            onClick={() => navigate("/cinema")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-semibold text-sm rounded hover:bg-amber-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Cinema
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleToggleWatchlist = () => {
    const nextState = toggleCinemaWatchlist(item.id);
    setInWatchlist(nextState);
    toast.success(
      nextState
        ? `"${item.title}" foi adicionado à sua lista`
        : `"${item.title}" foi removido da sua lista`
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `${item.title} — Cinema Worsco`,
      text: item.synopsis,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handlePlayEpisode = (ep: CinemaEpisode) => {
    setSelectedEpisodeNumber(ep.episodeNumber);
    setIsPlayerOpen(true);
  };

  const currentSeason = item.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber) || item.seasons?.[0];
  const episodesList = currentSeason?.episodes || [];

  // Related recommendations from same genre or same type
  const relatedItems = CINEMA_CATALOG.filter(
    (other) => other.id !== item.id && (other.type === item.type || other.genres.some((g) => item.genres.includes(g)))
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-amber-500/30">
      <Navigation variant="dark" />

      <main className="flex-1 pb-20">
        {/* Backdrop Hero Section */}
        <section className="relative w-full h-[60vh] sm:h-[72vh] max-h-[820px] overflow-hidden">
          <img
            src={item.backdropUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] transition-transform duration-700"
          />

          {/* Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/40 to-transparent" />

          {/* Top Return Breadcrumb */}
          <div className="absolute top-20 left-4 sm:left-8 z-10">
            <Link
              to="/cinema"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Cinema</span>
            </Link>
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-12 max-w-7xl mx-auto flex flex-col justify-end">
            <div className="max-w-3xl space-y-4">
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tracking-wide text-zinc-300">
                <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  {item.type === "filme" ? (
                    <>
                      <Film className="w-3.5 h-3.5" /> Filme
                    </>
                  ) : (
                    <>
                      <Tv className="w-3.5 h-3.5" /> Série
                    </>
                  )}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="font-medium text-white">{item.year}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {item.duration}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {item.rating.toFixed(1)}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400 uppercase text-[11px] font-mono tracking-wider">
                  {item.quality}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px] text-zinc-300 font-mono">
                  {item.ageRating}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
                  {item.title}
                </h1>
                {item.originalTitle && item.originalTitle !== item.title && (
                  <p className="mt-1 text-xs text-zinc-400 font-mono">
                    Título original: {item.originalTitle}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlayerOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Assistir Agora
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded border text-sm font-medium transition cursor-pointer backdrop-blur-md ${
                    inWatchlist
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  }`}
                  aria-label={inWatchlist ? "Remover da Minha Lista" : "Salvar na Minha Lista"}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-4 h-4 text-amber-400" />
                      Na Minha Lista
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Salvar na Lista
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3.5 py-3 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-sm font-medium transition cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-10">
              {/* Sinopse */}
              <section className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 sm:p-8 backdrop-blur-sm">
                <h2 className="text-lg font-serif font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Sinopse Oficial
                </h2>
                <p className="text-zinc-300 leading-relaxed text-base sm:text-lg font-sans">
                  {item.synopsis}
                </p>

                {/* Genres list - unboxed elegant tags */}
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono mr-2">
                    Gêneros:
                  </span>
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 text-xs text-zinc-300 bg-white/5 border border-white/10 rounded font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </section>

              {/* Series Episodes List (if series) */}
              {item.type === "serie" && item.seasons && item.seasons.length > 0 && (
                <section className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-400" />
                        Episódios Disponíveis
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Selecione um episódio para carregar na central de reprodução cinema.
                      </p>
                    </div>

                    {/* Season Selector Tabs */}
                    {item.seasons.length > 1 && (
                      <div className="flex items-center gap-2">
                        {item.seasons.map((s) => (
                          <button
                            key={s.seasonNumber}
                            onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer ${
                              selectedSeasonNumber === s.seasonNumber
                                ? "bg-amber-500 text-black shadow-sm"
                                : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5"
                            }`}
                          >
                            Temporada {s.seasonNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Episode cards */}
                  <div className="space-y-3">
                    {episodesList.map((ep) => {
                      const isCurrent = selectedEpisodeNumber === ep.episodeNumber;
                      return (
                        <div
                          key={ep.episodeNumber}
                          onClick={() => handlePlayEpisode(ep)}
                          className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border transition cursor-pointer ${
                            isCurrent
                              ? "bg-amber-500/10 border-amber-500/40 text-white"
                              : "bg-black/30 border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-4 flex-1">
                            <div className="relative w-12 h-12 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-amber-400/50 transition">
                              <Play
                                className={`w-5 h-5 ${
                                  isCurrent
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-300 group-hover:text-amber-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-amber-400/90 font-medium">
                                  Episódio {ep.episodeNumber}
                                </span>
                                <span className="text-zinc-600">·</span>
                                <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition">
                                  {ep.title}
                                </h3>
                              </div>
                              {ep.synopsis && (
                                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                                  {ep.synopsis}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs text-zinc-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              {ep.duration}
                            </span>
                            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold group-hover:bg-amber-500 group-hover:text-black transition">
                              Assistir
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Streaming Guarantee & Platform Standards */}
              <section className="bg-gradient-to-r from-amber-500/5 via-zinc-900/20 to-transparent border border-amber-500/15 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Experiência Cinematográfica Worsco
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Todas as reproduções incluem masterização com controle anti-interrupção, proteção DRM contra cópias indevidas e integração inteligente com o histórico pessoal de visualização.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Details Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Technical Sheet */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-serif font-semibold text-white uppercase tracking-wider text-amber-400">
                  Ficha Técnica
                </h3>

                <dl className="space-y-3.5 text-xs">
                  {item.director && (
                    <div>
                      <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                        Direção
                      </dt>
                      <dd className="text-zinc-200 font-medium mt-0.5">{item.director}</dd>
                    </div>
                  )}

                  {item.cast && item.cast.length > 0 && (
                    <div>
                      <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                        Elenco Principal
                      </dt>
                      <dd className="text-zinc-200 font-medium mt-0.5 leading-relaxed">
                        {item.cast.join(", ")}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                      Áudio & Idioma
                    </dt>
                    <dd className="text-zinc-200 font-medium mt-0.5 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                      {item.audio}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                      Qualidade Máxima
                    </dt>
                    <dd className="text-amber-300 font-mono font-medium mt-0.5">
                      {item.quality}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                      Classificação Indicativa
                    </dt>
                    <dd className="text-zinc-200 font-medium mt-0.5">{item.ageRating}</dd>
                  </div>

                  {item.seasons && item.seasons.length > 0 && (
                    <div>
                      <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                        Temporadas
                      </dt>
                      <dd className="text-zinc-200 font-medium mt-0.5">
                        {item.seasons.length} {item.seasons.length === 1 ? "Temporada" : "Temporadas"} ({item.seasons.reduce((acc, s) => acc + s.episodes.length, 0)} episódios)
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-zinc-500 uppercase tracking-wider font-mono text-[11px]">
                      Identificador IMDb
                    </dt>
                    <dd className="mt-0.5">
                      <a
                        href={`https://www.imdb.com/title/${item.imdbId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 font-mono text-xs inline-flex items-center gap-1.5 transition underline-offset-4 hover:underline"
                      >
                        {item.imdbId}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Poster Preview Card */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-center">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow-xl shadow-black/80"
                />
                <p className="mt-3 text-xs text-zinc-400 font-mono">
                  Poster promocional oficial
                </p>
              </div>
            </aside>
          </div>

          {/* Related / Recommendations Section */}
          {relatedItems.length > 0 && (
            <section className="mt-16 pt-10 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    Quem assistiu também gostou
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sugestões selecionadas baseadas em gêneros e crítica.
                  </p>
                </div>
                <Link
                  to="/cinema"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition"
                >
                  Ver todo o catálogo
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedItems.map((rel) => (
                  <CinemaCard
                    key={rel.id}
                    item={rel}
                    onPlay={(played) => {
                      setItem(played);
                      setIsPlayerOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Player Modal */}
      <CinemaPlayerModal
        item={item}
        initialSeasonNumber={selectedSeasonNumber}
        initialEpisodeNumber={selectedEpisodeNumber}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

      <Footer />
    </div>
  );
}
