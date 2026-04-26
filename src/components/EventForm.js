import { useState, useEffect } from "react";

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
  isEditable,
}) {
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow";

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (poster) {
      const objectUrl = URL.createObjectURL(poster);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(posterUrl);
    }
  }, [poster, posterUrl]);

  return (
    <div className="grid gap-8">
      {/* Basic Information Section */}
      <section>
        <h2 className="text-base font-semibold text-brand-text mb-4">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Poster */}
          <div className="md:col-span-1">
            <div className="max-w-[240px] mx-auto md:mx-0">
              <label className="block text-sm font-medium text-brand-text mb-2">
                Event Poster
              </label>
              <div className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm transition-all hover:border-brand-accent">
                {preview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={preview}
                      alt="Poster preview"
                      className="h-full w-full object-cover"
                    />
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          setPoster(null);
                          setPreview(posterUrl);
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
                    <span className="text-xs font-bold">Upload Flyer</span>
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
              <label className="text-sm font-medium text-brand-text">Event Name</label>
              <input
                disabled={!isEditable}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g., Annual Tech Fest 2026"
              />
            </div>

            {/* Event Timing Row - Directly Below Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-brand-text">Event Start (Date & Time)</label>
                <input disabled={!isEditable} type="datetime-local" value={eventStartDate || ""} onChange={(e) => setEventStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-text">Event End (Date & Time)</label>
                <input disabled={!isEditable} type="datetime-local" value={eventEndDate || ""} onChange={(e) => setEventEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="text-sm font-medium text-brand-text">Venue</label>
              <input disabled={!isEditable} value={venue || ""} onChange={(e) => setVenue(e.target.value)} className={inputClass} placeholder="e.g., Auditorium, Block B" />
            </div>
          </div>
        </div>

        {/* Description Row (Full Width Below) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-brand-text">
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
      </section>

      {/* Feedback Window - REVERTED TO ORIGINAL STYLE */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-brand-text">
          Feedback Window
        </h2>
        <p className="text-sm text-brand-muted mt-1">
          Set when feedback collection opens and closes. (Stored in UTC;
          you&apos;ll enter in local time.)
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text">
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
            <label className="block text-sm font-medium text-brand-text">
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
      </div>
    </div>
  );
}
