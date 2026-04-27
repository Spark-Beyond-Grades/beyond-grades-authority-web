import { useState, useEffect, useCallback } from "react";
import { getSuggestions } from "@/lib/api";

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => {
    // If word is all uppercase and > 1 char (like IET), keep it
    if (txt.length > 1 && txt === txt.toUpperCase()) return txt;
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Core event form fields: name, poster, description, event start/end date, venue.
 */
export default function EventForm({
  name,
  setName,
  description,
  setDescription,
  eventStartDate,
  setEventStartDate,
  eventEndDate,
  setEventEndDate,
  venue,
  setVenue,
  openAt,
  setOpenAt,
  closeAtTentative,
  setCloseAtTentative,
  poster,
  setPoster,
  posterUrl,
  logo,
  setLogo,
  logoUrl,
  isEditable,
  getToken,
  universityName,
}) {
  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-brand-text outline-none focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-transparent disabled:opacity-60 disabled:bg-slate-100 transition-all duration-200 ease-in-out shadow-sm hover:shadow";

  const [posterPreview, setPosterPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (poster) {
      const objectUrl = URL.createObjectURL(poster);
      setPosterPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPosterPreview(posterUrl);
    }
  }, [poster, posterUrl]);

  useEffect(() => {
    if (logo) {
      const objectUrl = URL.createObjectURL(logo);
      setLogoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLogoPreview(logoUrl);
    }
  }, [logo, logoUrl]);
  
  const [venueSuggestions, setVenueSuggestions] = useState([]);

  const loadSuggestions = useCallback(async () => {
    if (!getToken) return;
    try {
      const token = await getToken();
      const data = await getSuggestions(token);
      setVenueSuggestions(data.venues || []);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    }
  }, [getToken]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return (
    <div className="grid gap-8">
      {/* Basic Information Section */}
      <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-brand-primary rounded-full inline-block"></span>
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Logo & Poster */}
          <div className="md:col-span-1 space-y-8">
            {/* Event Logo */}
            <div className="max-w-[240px] mx-auto md:mx-0">
              <label className="block text-sm font-semibold text-brand-text mb-2">
                Event Logo (Optional)
              </label>
              <div className="relative group aspect-square rounded-3xl overflow-hidden bg-slate-50/80 border-2 border-dashed border-slate-200 transition-all duration-300 hover:border-brand-primary hover:bg-slate-100/80 hover:shadow-lg hover:-translate-y-1">
                {logoPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain p-4"
                    />
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview(logoUrl);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-300">
                    <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-xs font-bold">Upload Logo</span>
                  </label>
                )}
                {isEditable && <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="hidden" id="logo-upload" />}
              </div>
            </div>

            {/* Event Poster */}
            <div className="max-w-[240px] mx-auto md:mx-0">
              <label className="block text-sm font-semibold text-brand-text mb-2">
                Event Poster (Optional)
              </label>
              <div className="relative group aspect-square rounded-3xl overflow-hidden bg-slate-50/80 border-2 border-dashed border-slate-200 transition-all duration-300 hover:border-brand-primary hover:bg-slate-100/80 hover:shadow-lg hover:-translate-y-1">
                {posterPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="h-full w-full object-cover"
                    />
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          setPoster(null);
                          setPosterPreview(posterUrl);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <label htmlFor="poster-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-300">
                    <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 012 2v-14a2 2 0 01-2-2H6a2 2 0 01-2 2v14a2 2 0 012 2z" /></svg>
                    <span className="text-xs font-bold">Upload Poster</span>
                  </label>
                )}
                {isEditable && <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0])} className="hidden" id="poster-upload" />}
              </div>
            </div>
          </div>

          {/* Right Column Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Name */}
            <div>
              <label className="text-sm font-semibold text-brand-text">Event Name</label>
              <input
                disabled={!isEditable}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g., Annual Tech Fest 2026"
              />
            </div>

            {/* Event Timing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-brand-text">Event Start (Date & Time)</label>
                <input
                  disabled={!isEditable}
                  type="datetime-local"
                  value={eventStartDate || ""}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-text">Event End (Date & Time)</label>
                <input
                  disabled={!isEditable}
                  type="datetime-local"
                  value={eventEndDate || ""}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="text-sm font-semibold text-brand-text">Venue</label>
              <div className="relative mt-2">
                <input
                  disabled={!isEditable}
                  value={venue || ""}
                  onChange={(e) => setVenue(e.target.value)}
                  className={inputClass + " pr-10 mt-0"}
                  placeholder="e.g., Auditorium, Block B"
                  autoComplete="off"
                  list="venue-suggestions"
                />
                <datalist id="venue-suggestions">
                  {venueSuggestions.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => {
                    const searchQuery = venue 
                      ? `${universityName || "JK Lakshmipat University"} ${venue}`
                      : (universityName || "JK Lakshmipat University");
                    window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, "_blank");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary hover:scale-110 transition-transform"
                  title="Search on Google Maps"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Description (Now on the side of the poster) */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-brand-text">
                Description (optional)
              </label>
              <textarea
                disabled={!isEditable}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={inputClass}
                placeholder="Tell us more about the event in detail..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Window */}
      <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-400 rounded-full inline-block"></span>
          Feedback Window
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Set when feedback collection opens and closes. (Stored in UTC;
          you&apos;ll enter in local time.)
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-text">
              Feedback Opening Date &amp; Time
            </label>
            <input
              disabled={!isEditable}
              type="datetime-local"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-text">
              Feedback Closing Date &amp; Time
            </label>
            <input
              disabled={!isEditable}
              type="datetime-local"
              value={closeAtTentative}
              onChange={(e) => setCloseAtTentative(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
