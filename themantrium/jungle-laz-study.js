const media = 'public/jungle-laz/';
const arrow = '<svg class="ui-arrow" width="1em" height="1em" aria-hidden="true" focusable="false"><use href="public/ui-arrows.svg#out"></use></svg>';

function link(url, label) {
  return `<a class="jungle-link" href="${url}" target="_blank" rel="noopener noreferrer">${label} ${arrow}</a>`;
}

function artwork(file, label, width, height, small = false) {
  return `<a class="study-image jungle-art jungle-${file}" href="${media}${file}.webp" aria-label="Enlarge ${label}">
    <img src="${media}${file}${small ? '-small' : ''}.webp" width="${width}" height="${height}" alt="${label}" loading="lazy" decoding="async">
    <span><b class="orb-image-action">View in the orb</b><b class="lightbox-image-action">View full image</b> ${arrow}</span>
  </a>`;
}

function videoThumbnail(file, title, height, width = 1280, youtubeId) {
  const href = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : `${media}${file}.mp4`;
  const poster = `${media}${file}${youtubeId ? '' : '-poster'}.webp`;
  const embed = youtubeId ? ` data-youtube-id="${youtubeId}"` : '';
  return `<a class="jungle-tour study-video" href="${href}"${embed} aria-label="Play ${title} in the orb">
    <img src="${poster}" width="${width}" height="${height}" alt="" loading="lazy" decoding="async">
    <span aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" focusable="false"><path d="M7 4v16l13-8z" fill="currentColor"/></svg></span>
  </a>`;
}

function fullVideo(title, id) {
  return link('https://www.youtube.com/watch?v=' + id, 'Watch the full ' + title + ' music video on YouTube');
}

export function jungleLazStudy() {
  const chapters = [
    ['Artist identity', 'The eye of the lion.',
      `<p>The Ajna Lion looks straight back at you. A single blue eye sits at the centre of its face, framed by a mane picked out in flashes of red, yellow and green. The gold LASZLO wordmark gives that intricate emblem a quieter companion. The two can sit together or work independently, even on opposite sides of a garment.</p>
       <div class="jungle-identity">${artwork('ajna-lion', 'Ajna Lion emblem with a single blue eye and a multicoloured mane', 651, 909, true)}
       ${artwork('laszlo-wordmark', 'LASZLO gold wordmark', 2048, 350, true)}</div>
       <p class="jungle-render-note">In the 3D studies, the emblem takes on a body and a habitat. The same blue eye catches the light in a moonlit jungle and beneath a sunlit canopy.</p>
       <div class="jungle-renders">
         <figure><figcaption>Moonlight</figcaption>${artwork('ajna-night', '3D Ajna Lion walking through a moonlit jungle', 1536, 1024, true)}</figure>
         <figure><figcaption>Daylight</figcaption>${artwork('ajna-day', '3D Ajna Lion walking beneath a sunlit jungle canopy', 1536, 1024, true)}</figure>
       </div>`],
    ['The artist website', 'Enter the jungle.',
      `<p>JungleLaz.net gives a first-time listener several ways into Laszlo’s work. Enter the 3D jungle, play a record, watch a film or read <em>The Lion’s Origins</em>, his story in twelve chapters. The Inner Circle gives people who want to return a direct connection to the artist.</p>
       <div class="jungle-devices">
         <figure><figcaption>Desktop walkthrough</figcaption>${videoThumbnail('desktop-tour', 'Desktop walkthrough of JungleLaz.net', 706)}</figure>
         <figure><figcaption>Mobile walkthrough</figcaption>${videoThumbnail('mobile-tour', 'Mobile walkthrough of JungleLaz.net', 1214, 720)}</figure>
       </div>
       ${link('https://junglelaz.net/', 'Visit JungleLaz.net')}`],
    ['Merchandise & store', 'Two sides of the same hoodie.',
      `<p>On the Desert Dust hoodie, the gold name runs across the chest. Turn it around and the Ajna Lion fills the back. Black and white tees give the same emblem a different canvas. The artist’s own store brings the clothing and digital music care packages together.</p>
       <div class="jungle-garments">${artwork('hoodie-front', 'Desert Dust hoodie, front with gold LASZLO wordmark', 768, 768)}
       ${artwork('hoodie-back', 'Desert Dust hoodie, back with Ajna Lion emblem', 768, 768)}</div>
       ${videoThumbnail('store-tour', 'Desktop walkthrough of the Jungle Laz merchandise store', 702)}
       ${link('https://junglelaz.net/store/', 'Explore the store')}`],
    ['A–Z Digital Presence Dashboard', 'Where a release travels.',
      `<p>A song can find its audience on a social feed, on a streaming service, in a store or through a music NFT. The A–Z Digital Presence Dashboard brings each of those channels into one view so Laszlo can follow a release beyond its launch day.</p>
       <figure class="jungle-dashboard">${artwork('dashboard', 'Jungle Laz creator overview showing followers, video views, music streams and individual platform cards', 1359, 863, true)}</figure>
       <dl class="jungle-channels"><div><dt>Social media</dt><dd>Reach and engagement across the artist’s channels.</dd></div>
       <div><dt>Streaming</dt><dd>Listening activity across the platforms carrying the catalogue.</dd></div>
       <div><dt>Stores</dt><dd>Sales activity across music and merchandise outlets.</dd></div>
       <div><dt>NFT platforms</dt><dd>Activity around the artist’s digital music editions.</dd></div></dl>`],
    ['AI-updatable press kit', 'An introduction that stays current.',
      `<p>A booker needs a quick introduction. A journalist may want the story behind a record. The press kit brings the biography, discography, visuals and social links into one place. AI-assisted updates let the team refresh a release or a milestone without rebuilding the presentation.</p>
       ${artwork('press-kit', 'Jungle Laz press-kit mockup showing the cover, biography, discography, social media and endorsements', 1980, 1080, true)}`],
    ['AI-assisted outreach', 'A different pitch for each listener.',
      `<p>A producer considering a <em>Jungle Boy</em> remix needs stems. A music editor needs the track, its story and a press kit. The outreach workflows help identify relevant contacts, prepare a pitch for each recipient and track replies and follow-ups.</p>
       <p>Jungle Laz estimates that his AI personal assistant handles 70% of his regular work outside music production, giving him more time in the studio.</p>`],
    ['Music video · Jungle Boy', 'Costa Rica, on camera.',
      `<p>Laszlo filmed <em>Jungle Boy</em> while living in Costa Rica. The landscape and live performance anchor the video. AI-enhanced special effects add a second visual layer to the original footage.</p>
       ${videoThumbnail('jungle-boy', 'Jungle Boy · official music video', 720, 1280, 'itAmJ9AsN18')}
       ${fullVideo('Jungle Boy', 'itAmJ9AsN18')}`],
    ['Music video · Aura', 'An unlikely cast.',
      `<p><em>Aura</em> pairs cinematography with AI to bring Laszlo into a world populated by familiar faces. Stylised cameos depict Eminem, Tyla, Aura Boy, Cheech &amp; Chong and Pepe, among others. In this effects preview, Laszlo sits on a sports car in one shot and hangs upside down among floating islands in the next.</p>
       ${videoThumbnail('aura-fx', 'Aura music video · AI special effects preview', 720)}
       ${fullVideo('Aura', 'f9fQukuxny4')}`],
    ['Music video · Messiah', 'A touch changes the water.',
      `<p>A fingertip meets the surface of a pond. Colour spreads from the point of contact. The camera cuts wide, and the same red now runs through the landscape. This short excerpt shows how the AI-enhanced effect carries from a close-up into a wide shot.</p>
       ${videoThumbnail('messiah-fx', 'Messiah music video · AI special effects preview', 720)}
       ${fullVideo('Messiah', 'S0KqcCM_MhU')}`],
    ['The first month', 'What followed.',
      `<p>In the first month after the assistant launched, Jungle Laz secured an international artist management contract and separate sync licensing representation for his catalogue. <em>Jungle Boy</em> reached 100,000 streams, and three producers delivered remixes of the single.</p>`]
  ];

  return chapters.map(([label, title, body], i) => {
    const side = i % 2 === 0 ? 'right' : 'left';
    return `<section class="chapter comparison-chapter jungle-chapter copy-${side}" data-orb-side="${side === 'right' ? 'left' : 'right'}">
      <div class="chapter-copy"><div class="chapter-meta"><span class="section-number">${String(i + 1).padStart(2, '0')}</span><span>${label}</span></div>
      <h2>${title}</h2>${body}</div></section>`;
  }).join('');
}
