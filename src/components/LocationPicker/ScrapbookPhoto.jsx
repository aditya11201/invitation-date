import React, { useState } from 'react';
import { resolveAssetUrl } from '../../utils/assets';

// One taped-on polaroid. Decorative only: parent layer is aria-hidden +
// pointer-events:none, so alt="" and no focusables here are correct.
export default function ScrapbookPhoto({ slot }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(slot.src) && !broken;

  return (
    <figure
      className={`scrapbook-photo scrapbook-photo--${slot.variant}`}
      style={{ '--tilt': `${slot.tilt}deg` }}
      aria-hidden="true"
    >
      <span className="scrapbook-photo__tape" />
      {showImage ? (
        <img
          src={resolveAssetUrl(slot.src)}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="scrapbook-photo__ph">{slot.emoji}</span>
      )}
      <figcaption className="scrapbook-photo__caption">{slot.caption}</figcaption>
    </figure>
  );
}
