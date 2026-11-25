/// <reference types="google.maps" />
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Users,
  Ticket,
  Route,
  Map as MapIcon,
  Flag,
  LocateFixed,
} from 'lucide-react';
import { EventItem } from '../types/evora';

interface InteractiveEventMapProps {
  events: EventItem[];
  onSelectEventToRegister: (event: EventItem) => void;
  onBecomeOrganizer: () => void;
}

const CATEGORIES = ['Semua', 'Kreatif', 'Teknologi', 'Musik', 'Bisnis', 'Komunitas'] as const;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function EventAdvancedMarker({
  event,
  isSelected,
  onSelect,
  onRegister,
}: {
  event: EventItem;
  isSelected: boolean;
  onSelect: () => void;
  onRegister: () => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: event.lat, lng: event.lng }}
        onClick={onSelect}
        title={event.title}
      >
        <Pin
          background={event.pinColor}
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.25 : 1}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={onSelect} maxWidth={230}>
          <div className="p-1 space-y-1.5 font-sans">
            <p className="text-[10px] font-extrabold uppercase text-[#377EC0]">
              {event.category} · {event.dateLabel}
            </p>
            <p className="text-xs font-extrabold text-slate-900 leading-snug">
              {event.title}
            </p>
            <p className="text-[11px] text-slate-600">{event.venue}</p>
            <button
              type="button"
              onClick={onRegister}
              className="mt-1 w-full py-1.5 px-2.5 rounded-lg bg-[#377EC0] text-white text-[11px] font-bold cursor-pointer"
            >
              Daftar & Beli Tiket
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function PlacesSearchControl({
  onSelectLocation,
}: {
  onSelectLocation: (lat: number, lng: number, label: string) => void;
}) {
  const placesLib = useMapsLibrary('places');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (!placesLib || !query.trim()) {
      setSuggestions([]);
      return;
    }
    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let cancelled = false;
    AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: ['id'],
    })
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.suggestions.slice(0, 4));
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, query]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      if (place.location) {
        onSelectLocation(
          place.location.lat(),
          place.location.lng(),
          place.displayName || suggestion.placePrediction.text.text
        );
      }
      setQuery('');
      setSuggestions([]);
      sessionTokenRef.current = null;
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <LocateFixed className="w-4 h-4 text-[#377EC0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari lokasi kota / venue di Google Maps..."
          aria-label="Cari lokasi di Google Maps"
          className="w-full pl-9 pr-3 py-2 text-xs bg-white/95 backdrop-blur-md border border-[#9FD2D6] rounded-xl shadow-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="mt-1.5 bg-white rounded-xl shadow-xl border border-[#9FD2D6] overflow-hidden divide-y divide-slate-100">
          {suggestions.map((s, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-[#E8F5FA] cursor-pointer"
              >
                {s.placePrediction?.text.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapCameraSync({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  return null;
}

function GoogleMapViewport({
  events,
  activeEvent,
  onSelectEvent,
  onRegisterEvent,
}: {
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (ev: EventItem) => void;
  onRegisterEvent: (ev: EventItem) => void;
}) {
  const status = useApiLoadingStatus();
  const [searchedLocation, setSearchedLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);

  const cameraTarget = useMemo(() => {
    if (searchedLocation) {
      return { center: { lat: searchedLocation.lat, lng: searchedLocation.lng }, zoom: 13 };
    }
    if (activeEvent) {
      return { center: { lat: activeEvent.lat, lng: activeEvent.lng }, zoom: 12 };
    }
    return { center: { lat: -6.2088, lng: 106.8456 }, zoom: 6 };
  }, [activeEvent, searchedLocation]);

  const handleSelectLocation = useCallback((lat: number, lng: number, label: string) => {
    setSearchedLocation({ lat, lng, label });
  }, []);

  if (
    !GOOGLE_MAPS_API_KEY ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="w-full h-[380px] sm:h-[460px] rounded-[24px] bg-[#E8F5FA] border border-[#9FD2D6] p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#377EC0] text-white flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="font-pixel text-xl text-slate-900">Peta Lokasi Event</h3>
        <p className="text-xs text-slate-600 max-w-sm">
          Pilih event dari daftar atau beralih ke tab <strong>Jalur Jadwal</strong> untuk melihat rute kronologis setiap acara.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => onSelectEvent(ev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                activeEvent?.id === ev.id
                  ? 'bg-[#377EC0] text-white border-[#377EC0]'
                  : 'bg-white text-slate-700 border-[#9FD2D6]'
              }`}
            >
              {ev.city}: {ev.venue}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] rounded-[24px] overflow-hidden border border-[#9FD2D6]">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={cameraTarget.center}
        defaultZoom={cameraTarget.zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapCameraSync center={cameraTarget.center} zoom={cameraTarget.zoom} />

        {events.map((ev) => (
          <EventAdvancedMarker
            key={ev.id}
            event={ev}
            isSelected={activeEvent?.id === ev.id}
            onSelect={() => {
              setSearchedLocation(null);
              onSelectEvent(ev);
            }}
            onRegister={() => onRegisterEvent(ev)}
          />
        ))}

        {searchedLocation && (
          <AdvancedMarker
            position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
            title={searchedLocation.label}
          >
            <Pin background="#FBDF54" borderColor="#0F172A" glyphColor="#0F172A" />
          </AdvancedMarker>
        )}
      </GoogleMap>

      {/* Google Places Search Bar Overlay */}
      <div className="absolute top-3 left-3 right-14 sm:right-auto sm:w-80 z-20">
        <PlacesSearchControl onSelectLocation={handleSelectLocation} />
      </div>
    </div>
  );
}

export const InteractiveEventMap: React.FC<InteractiveEventMapProps> = ({
  events,
  onSelectEventToRegister,
  onBecomeOrganizer,
}) => {
  const [mapMode, setMapMode] = useState<'city' | 'timeline'>('city');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const publishedEvents = useMemo(
    () =>
      events
        .filter((e) => e.status === 'published')
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );

  const cities = useMemo(() => {
    const unique = Array.from(new Set(publishedEvents.map((e) => e.city)));
    return ['Semua', ...unique];
  }, [publishedEvents]);

  const filteredEvents = useMemo(() => {
    return publishedEvents.filter((ev) => {
      const matchesCat = selectedCategory === 'Semua' || ev.category === selectedCategory;
      const matchesCity = selectedCity === 'Semua' || ev.city === selectedCity;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q);
      return matchesCat && matchesCity && matchesQuery;
    });
  }, [publishedEvents, selectedCategory, selectedCity, searchQuery]);

  const activeEvent = useMemo(() => {
    if (filteredEvents.length === 0) return null;
    return filteredEvents.find((e) => e.id === selectedEventId) ?? filteredEvents[0];
  }, [filteredEvents, selectedEventId]);

  const formatPrice = (price: number) =>
    price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`;

  const getMinPrice = (ev: EventItem) => {
    if (!ev.tiers.length) return 0;
    return Math.min(...ev.tiers.map((t) => t.price));
  };

  const getRemainingQuota = (ev: EventItem) =>
    ev.tiers.reduce((sum, t) => sum + Math.max(0, t.quota - t.sold), 0);

  return (
    <section id="peta-event" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-extrabold tracking-widest uppercase text-[#377EC0] mb-1.5">
              Google Maps & Jadwal Interaktif
            </p>
            <h2 className="font-pixel text-2xl sm:text-4xl text-slate-900 tracking-tight text-balance">
              Temukan lokasi event dan jadwalnya
            </h2>
          </div>

          {/* Segmented Mode Switcher: Google Maps vs Jalur Jadwal */}
          <div
            className="inline-flex items-center p-1 bg-white/90 rounded-2xl border border-[#9FD2D6] shadow-sm self-start md:self-auto"
            role="tablist"
            aria-label="Mode tampilan peta event"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mapMode === 'city'}
              onClick={() => setMapMode('city')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                mapMode === 'city'
                  ? 'bg-[#377EC0] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Google Maps
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mapMode === 'timeline'}
              onClick={() => setMapMode('timeline')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                mapMode === 'timeline'
                  ? 'bg-[#377EC0] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Jalur Jadwal
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-[#9FD2D6]/60 shadow-lg shadow-[#377EC0]/5 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nama event, venue, atau kota..."
                  aria-label="Filter event"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold bg-[#E8F5FA]/70 border border-transparent rounded-xl placeholder:text-slate-400 focus:bg-white focus:border-[#377EC0] focus:outline-none transition-all"
                />
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter kota"
                className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-[#E8F5FA]/70 rounded-xl border border-transparent focus:bg-white focus:border-[#377EC0] focus:outline-none cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Semua' ? 'Semua Kota' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#377EC0] text-white shadow-sm'
                      : 'bg-[#E8F5FA]/70 text-slate-700 hover:bg-[#9FD2D6]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map + Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Google Maps / Winding Timeline Canvas */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-3 sm:p-4 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/50 flex flex-col">
            {mapMode === 'city' ? (
              <APIProvider
                apiKey={GOOGLE_MAPS_API_KEY}
                language="id"
                region="ID"
                libraries={['marker', 'places']}
              >
                <GoogleMapViewport
                  events={filteredEvents}
                  activeEvent={activeEvent}
                  onSelectEvent={(ev) => setSelectedEventId(ev.id)}
                  onRegisterEvent={onSelectEventToRegister}
                />
              </APIProvider>
            ) : (
              /* TIMELINE PATH MODE */
              <div className="relative w-full h-[380px] sm:h-[460px] rounded-[24px] overflow-y-auto bg-gradient-to-b from-[#9FD2D6]/45 via-[#E8F5FA] to-[#12BAAA]/25 border border-[#9FD2D6] p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-pixel px-3 py-1 rounded-xl bg-white text-sm text-[#377EC0] shadow-sm">
                    Jalur Jadwal Event
                  </span>
                  <span className="text-xs font-extrabold text-slate-600 tabular-nums">
                    {filteredEvents.length} jadwal
                  </span>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-slate-600">
                    <p className="text-sm font-bold">Belum ada jadwal yang cocok.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('Semua');
                        setSelectedCity('Semua');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs font-bold text-[#377EC0] underline cursor-pointer"
                    >
                      Reset filter
                    </button>
                  </div>
                ) : (
                  <div className="relative max-w-md mx-auto py-4 space-y-6">
                    <div
                      className="absolute left-1/2 top-8 bottom-8 w-2 -translate-x-1/2 bg-[#FBDF54]/70 rounded-full border-2 border-dashed border-[#F7891F]"
                      aria-hidden="true"
                    />

                    {filteredEvents.map((ev, index) => {
                      const isSelected = activeEvent?.id === ev.id;
                      const alignLeft = index % 2 === 0;
                      return (
                        <div
                          key={ev.id}
                          className={`relative flex items-center ${
                            alignLeft ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedEventId(ev.id)}
                            className={`relative z-10 w-[84%] sm:w-[78%] text-left p-4 rounded-2xl transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-white border-[#377EC0] shadow-xl ring-4 ring-[#9FD2D6]/50 scale-[1.02]'
                                : 'bg-white/95 border-white shadow-md hover:scale-[1.01]'
                            }`}
                          >
                            {index === 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FBDF54] text-slate-900 text-[10px] font-extrabold mb-2">
                                <Flag className="w-3 h-3" /> Terdekat!
                              </span>
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-extrabold text-[#377EC0] tabular-nums">
                                  {ev.dateLabel} · {ev.timeLabel}
                                </p>
                                <h4 className="font-pixel text-base text-slate-900 mt-0.5">
                                  {ev.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#F04F52]" />
                                  {ev.venue}, {ev.city}
                                </p>
                              </div>
                              <div
                                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-pixel text-sm shadow-sm"
                                style={{ backgroundColor: ev.pinColor }}
                              >
                                {index + 1}
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Event Pin Selector Strip */}
            <div className="pt-3 flex items-center gap-2 overflow-x-auto">
              {filteredEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 border transition-all cursor-pointer ${
                    activeEvent?.id === ev.id
                      ? 'bg-[#377EC0] text-white border-[#377EC0]'
                      : 'bg-[#E8F5FA] text-slate-700 border-transparent hover:border-[#9FD2D6]'
                  }`}
                >
                  {ev.city} · {ev.dateLabel.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Active Event Detail & Schedule Card */}
          <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-7 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/50 flex flex-col justify-between">
            {activeEvent ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#377EC0]">
                      {activeEvent.category} · {activeEvent.city}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      {activeEvent.lat.toFixed(2)}, {activeEvent.lng.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="font-pixel text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                    {activeEvent.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                    {activeEvent.description}
                  </p>
                </div>

                {/* Location & Schedule Info */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#E8F5FA]/70 border border-[#9FD2D6]/50">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-[#F04F52] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-slate-900">{activeEvent.venue}</p>
                      <p className="text-slate-500">{activeEvent.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Calendar className="w-4 h-4 text-[#377EC0] shrink-0" />
                    <span className="font-bold tabular-nums">{activeEvent.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="tabular-nums">{activeEvent.timeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Users className="w-4 h-4 text-[#12BAAA] shrink-0" />
                    <span>
                      Panitia: <strong className="text-slate-900">{activeEvent.organizerName}</strong>
                    </span>
                  </div>
                </div>

                {/* Rundown / Jadwal Sesi */}
                <div id="jadwal">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                    Jadwal & Rundown Acara
                  </p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeEvent.rundown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-xs py-1.5 border-b border-slate-100 last:border-0"
                      >
                        <span className="font-pixel text-sm text-[#377EC0] tabular-nums shrink-0 w-12">
                          {item.time}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">{item.title}</p>
                          {item.speaker && (
                            <p className="text-[11px] text-slate-500">{item.speaker}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <p className="text-sm font-bold text-slate-700">
                  Tidak ada event yang sesuai filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('Semua');
                    setSelectedCity('Semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#E8F5FA] text-[#377EC0] text-xs font-extrabold rounded-xl cursor-pointer"
                >
                  Tampilkan Semua Event
                </button>
              </div>
            )}

            {/* Bottom Action Bar */}
            {activeEvent && (
              <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold">Mulai dari</p>
                  <p className="font-pixel text-xl text-slate-900 tabular-nums">
                    {formatPrice(getMinPrice(activeEvent))}
                    <span className="font-sans text-xs font-bold text-slate-400 ml-1.5">
                      · sisa {getRemainingQuota(activeEvent)}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectEventToRegister(activeEvent)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md shadow-[#377EC0]/25 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  Daftar & Beli Tiket
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtle CTA for Panitia right below map */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-white/85 border border-[#9FD2D6]/60">
          <p className="text-xs sm:text-sm font-bold text-slate-600 text-center sm:text-left">
            Punya acara komunitas, konser, atau workshop?{' '}
            <strong className="text-slate-900">Tandai titik lokasi acaramu di Google Maps EVORA.</strong>
          </p>
          <button
            type="button"
            onClick={onBecomeOrganizer}
            className="px-4 py-2 rounded-xl bg-[#F7891F]/15 hover:bg-[#F7891F]/25 text-[#F7891F] text-xs font-extrabold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Registrasi Jadi Panitia →
          </button>
        </div>
      </div>
    </section>
  );
};
