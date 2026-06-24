import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/d62ce3d2-69c5-434a-be68-17344a688bb3/files/a4fbd3bb-0d42-4e6c-97a0-9fe8ccf698a9.jpg';

const STREAM_URL = 'https://pool.anison.fm/AniSonFM(320)';

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'player', label: 'Плеер' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'streams', label: 'Трансляции' },
  { id: 'about', label: 'О проекте' },
  { id: 'contacts', label: 'Контакты' },
];

const SCHEDULE = [
  { time: '08:00', title: 'Утренний OST', host: 'DJ Sakura', tag: 'OST' },
  { time: '12:00', title: 'J-Pop Lunch', host: 'DJ Hikari', tag: 'J-POP' },
  { time: '16:00', title: 'Vocaloid Hour', host: 'DJ Miku', tag: 'VOCALOID' },
  { time: '20:00', title: 'Night Anime Mix', host: 'DJ Kuro', tag: 'MIX' },
  { time: '23:00', title: 'Lo-Fi Sleep', host: 'DJ Yume', tag: 'LO-FI' },
];

const STREAMS = [
  { title: 'Эфир с косплеерами', viewers: '1.2K', live: true, emoji: '🎤' },
  { title: 'Разбор новинок сезона', viewers: '870', live: true, emoji: '📺' },
  { title: 'Караоке-ночь', viewers: '640', live: false, emoji: '🎶' },
];

const ARCHIVE = [
  { title: 'Unravel', artist: 'TK from Ling tosite sigure', anime: 'Tokyo Ghoul' },
  { title: 'Gurenge', artist: 'LiSA', anime: 'Demon Slayer' },
  { title: 'Cruel Angel’s Thesis', artist: 'Yoko Takahashi', anime: 'Evangelion' },
  { title: 'Silhouette', artist: 'KANA-BOON', anime: 'Naruto' },
  { title: 'Again', artist: 'YUI', anime: 'Fullmetal Alchemist' },
  { title: 'Departure!', artist: 'Masatoshi Ono', anime: 'Hunter x Hunter' },
];

const PLAYLISTS = [
  { name: 'Энергия боя', count: 24, color: 'from-neon-pink to-neon-purple', emoji: '⚔️' },
  { name: 'Грустные финалы', count: 18, color: 'from-neon-cyan to-neon-purple', emoji: '🌧️' },
  { name: 'Утро в Токио', count: 31, color: 'from-neon-purple to-neon-pink', emoji: '🌅' },
];

const Equalizer = ({ active }: { active: boolean }) => (
  <div className="flex items-end gap-1 h-10">
    {[0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.15].map((d, i) => (
      <span
        key={i}
        className={`w-1.5 rounded-full bg-neon-cyan ${active ? 'animate-eq' : ''}`}
        style={{ height: '100%', animationDelay: `${d}s` }}
      />
    ))}
  </div>
);

interface NowPlaying {
  anime: string;
  track: string;
  listeners: string;
  duration: number;
  fullDuration: number;
}

function parseOnAir(html: string): { anime: string; track: string } {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || '';
  const clean = text.replace('В эфире:', '').trim();
  const parts = clean.split('—').map((s) => s.trim());
  return { anime: parts[0] || '', track: parts[1] || '' };
}

const Index = () => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNowPlaying = async () => {
    try {
      const res = await fetch('https://anison.fm/status.php?widget');
      const data = await res.json();
      const { anime, track } = parseOnAir(data.on_air || '');
      setNowPlaying({
        anime,
        track,
        listeners: data.listeners || '',
        duration: data.duration || 0,
        fullDuration: data.full_duration || 0,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNowPlaying();
    const id = setInterval(fetchNowPlaying, 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.src = STREAM_URL;
      setLoading(true);
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setLoading(false);
        })
        .catch(() => {
          setPlaying(false);
          setLoading(false);
        });
    }
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg overflow-x-hidden">
      <audio ref={audioRef} preload="none" />
      {/* glow blobs */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full bg-neon-pink/20 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-neon-cyan/20 blur-[120px]" />

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple glow-pink">
              <Icon name="Radio" size={20} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold tracking-wide">
              CLUB <span className="text-neon-pink">ANICOKE</span>
            </span>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                {n.label}
              </button>
            ))}
          </nav>
          <Button
            onClick={() => {
              if (!playing) togglePlay();
              scrollTo('player');
            }}
            className="bg-neon-pink text-white hover:bg-neon-pink/90 font-display tracking-wider glow-pink"
          >
            <Icon name={playing ? 'Volume2' : 'Play'} size={16} className="mr-1" />
            {playing ? 'В ЭФИРЕ' : 'СЛУШАТЬ'}
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="relative container py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 px-4 py-1.5 text-sm text-neon-cyan mb-6">
              <span className="h-2 w-2 rounded-full bg-neon-pink animate-pulse" /> В эфире 24/7
            </span>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[0.95] mb-6">
              ТВОЯ ВОЛНА<br />
              <span className="text-neon-pink">АНИМЕ</span>{' '}
              <span className="text-neon-cyan">ЗВУКА</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Club Anicoke — неоновое радио с лучшими OST, J-Pop и vocaloid.
              Слушай, собирай плейлисты и погружайся в атмосферу аниме.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => {
                  togglePlay();
                  scrollTo('player');
                }}
                className="bg-neon-pink text-white hover:bg-neon-pink/90 font-display text-base tracking-wider glow-pink"
              >
                <Icon name="Headphones" size={18} className="mr-2" />
                {playing ? 'ОСТАНОВИТЬ' : 'ВКЛЮЧИТЬ ЭФИР'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo('archive')}
                className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-display text-base tracking-wider"
              >
                <Icon name="Library" size={18} className="mr-2" /> АРХИВ ПЕСЕН
              </Button>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-pink/40 to-neon-cyan/40 blur-2xl" />
            <img
              src={HERO_IMG}
              alt="Club Anicoke DJ"
              className="relative rounded-3xl glow-border w-full object-cover aspect-square"
            />
          </div>
        </div>
      </section>

      {/* PLAYER */}
      <section id="player" className="container py-16">
        <div className="rounded-3xl glow-border bg-card/60 backdrop-blur-xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <div className="h-40 w-40 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink p-1 animate-spin-slow">
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-neon-cyan/30 border border-neon-cyan" />
                </div>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <p className="text-neon-cyan text-sm font-medium mb-1 flex items-center justify-center lg:justify-start gap-2">
                <span className={`h-2 w-2 rounded-full ${playing ? 'bg-neon-pink animate-pulse' : 'bg-muted-foreground'}`} />
                {playing ? 'В ЭФИРЕ' : loading ? 'ПОДКЛЮЧЕНИЕ…' : 'ЭФИР НА ПАУЗЕ'}
                {nowPlaying?.listeners && (
                  <span className="ml-2 text-muted-foreground font-normal flex items-center gap-1">
                    <Icon name="Users" size={12} /> {nowPlaying.listeners}
                  </span>
                )}
              </p>

              {nowPlaying ? (
                <>
                  <h3 className="font-display text-2xl lg:text-3xl font-bold mb-0.5 truncate">
                    {nowPlaying.track || 'AniSon.FM'}
                  </h3>
                  <p className="text-neon-purple text-sm mb-1 truncate">{nowPlaying.anime}</p>
                  <p className="text-muted-foreground text-xs mb-4">Аниме радио · 320 kbps · live-поток</p>
                  {nowPlaying.fullDuration > 0 && (
                    <div className="mb-5">
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan transition-all duration-1000"
                          style={{ width: `${(nowPlaying.duration / nowPlaying.fullDuration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{Math.floor(nowPlaying.duration / 60)}:{String(nowPlaying.duration % 60).padStart(2, '0')}</span>
                        <span>{Math.floor(nowPlaying.fullDuration / 60)}:{String(nowPlaying.fullDuration % 60).padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-display text-3xl font-bold mb-1">AniSon.FM</h3>
                  <p className="text-muted-foreground mb-6">Аниме радио · 320 kbps · live-поток</p>
                </>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-6">
                <button
                  onClick={togglePlay}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink text-white glow-pink hover:scale-105 transition"
                >
                  <Icon name={loading ? 'Loader' : playing ? 'Pause' : 'Play'} size={28} className={loading ? 'animate-spin' : ''} />
                </button>
                <Equalizer active={playing} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Icon name={volume === 0 ? 'VolumeX' : 'Volume2'} size={22} className="text-neon-cyan" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-32 w-2 cursor-pointer appearance-none rounded-full bg-muted accent-neon-pink"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PLAYLISTS */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-4xl font-bold">
            ТВОИ <span className="text-neon-cyan">ПЛЕЙЛИСТЫ</span>
          </h2>
          <Button variant="ghost" className="text-neon-pink hover:text-neon-pink hover:bg-neon-pink/10">
            <Icon name="Plus" size={18} className="mr-1" /> Создать
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {PLAYLISTS.map((p) => (
            <div
              key={p.name}
              className="group relative rounded-2xl glow-border bg-card/50 p-6 overflow-hidden hover:-translate-y-1 transition cursor-pointer"
            >
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${p.color} opacity-30 blur-2xl group-hover:opacity-60 transition`} />
              <div className="text-4xl mb-4">{p.emoji}</div>
              <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
              <p className="text-muted-foreground text-sm">{p.count} треков</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className="container py-16">
        <h2 className="font-display text-4xl font-bold mb-8">
          РАСПИСАНИЕ <span className="text-neon-pink">ЭФИРОВ</span>
        </h2>
        <div className="space-y-3">
          {SCHEDULE.map((s) => (
            <div
              key={s.time}
              className="flex items-center gap-5 rounded-2xl border border-border bg-card/40 p-5 hover:glow-border transition"
            >
              <div className="font-display text-2xl font-bold text-neon-cyan w-20">{s.time}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.host}</p>
              </div>
              <span className="rounded-full bg-neon-purple/20 border border-neon-purple/40 px-3 py-1 text-xs font-medium text-neon-purple">
                {s.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* STREAMS */}
      <section id="streams" className="container py-16">
        <h2 className="font-display text-4xl font-bold mb-8">
          ТРАНСЛЯЦИИ <span className="text-neon-cyan">LIVE</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {STREAMS.map((s) => (
            <div key={s.title} className="rounded-2xl glow-border bg-card/50 p-6 hover:-translate-y-1 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{s.emoji}</span>
                {s.live ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-neon-pink/20 px-3 py-1 text-xs font-bold text-neon-pink">
                    <span className="h-2 w-2 rounded-full bg-neon-pink animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">скоро</span>
                )}
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                <Icon name="Eye" size={14} /> {s.viewers} зрителей
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHIVE */}
      <section id="archive" className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-4xl font-bold">
            АРХИВ <span className="text-neon-pink">ПЕСЕН</span>
          </h2>
          <span className="text-muted-foreground text-sm">{ARCHIVE.length}+ треков</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ARCHIVE.map((t, i) => (
            <div
              key={t.title}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4 hover:glow-border transition cursor-pointer"
            >
              <span className="font-display text-lg text-muted-foreground w-6">{i + 1}</span>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan/15 text-neon-cyan group-hover:bg-neon-cyan group-hover:text-background transition">
                <Icon name="Play" size={16} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{t.title}</h3>
                <p className="text-muted-foreground text-sm truncate">{t.artist}</p>
              </div>
              <span className="hidden sm:block text-xs text-neon-purple truncate max-w-[120px]">{t.anime}</span>
              <Icon name="Heart" size={18} className="text-muted-foreground hover:text-neon-pink transition" />
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="container py-16">
        <div className="rounded-3xl glow-border bg-card/50 p-8 lg:p-14 grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h2 className="font-display text-4xl font-bold mb-4">
              О <span className="text-neon-cyan">ПРОЕКТЕ</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Club Anicoke — это онлайн-радио, созданное фанатами аниме для фанатов.
              Мы крутим саундтреки, J-Pop и vocaloid круглосуточно, проводим
              живые эфиры с гостями и собираем сообщество вокруг любимой музыки.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { n: '24/7', l: 'эфир' },
              { n: '5K+', l: 'треков' },
              { n: '12K', l: 'слушателей' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background/40 p-4">
                <div className="font-display text-3xl font-bold text-neon-pink">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS / FOOTER */}
      <section id="contacts" className="container py-16">
        <div className="rounded-3xl bg-gradient-to-br from-neon-pink/15 to-neon-cyan/15 border border-border p-8 lg:p-14 text-center">
          <h2 className="font-display text-4xl font-bold mb-4">ОСТАВАЙСЯ НА ВОЛНЕ</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Пиши нам, предлагай треки и присоединяйся к сообществу Club Anicoke.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-neon-pink text-white hover:bg-neon-pink/90 glow-pink font-display tracking-wider">
              <Icon name="Send" size={18} className="mr-2" /> TELEGRAM
            </Button>
            <Button variant="outline" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 font-display tracking-wider">
              <Icon name="Mail" size={18} className="mr-2" /> ПОЧТА
            </Button>
            <Button variant="outline" className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 font-display tracking-wider">
              <Icon name="MessageCircle" size={18} className="mr-2" /> DISCORD
            </Button>
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-10">
          © 2026 Club Anicoke · аниме радио онлайн
        </p>
      </section>
    </div>
  );
};

export default Index;