import React from 'react';

export default function MuseumLogo({ className = '', wall = '#7f5a26' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 1200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ikon museum klasik dengan atap segitiga dan tulisan MUSEUM"
    >
      <circle cx="600" cy="200" r="25" fill="#c87912" />
      <path d="M150 425 L600 225 L1050 425 L1050 475 L150 475 Z" fill="#ffb64d" />
      <path d="M250 425 L600 280 L950 425 Z" fill="#e89418" />
      <rect x="200" y="475" width="800" height="75" fill="#e89418" />
      <rect x="200" y="550" width="800" height="325" fill={wall} />
      <g fill="#ffb64d">
        <rect x="200" y="575" width="50" height="300" />
        <rect x="175" y="550" width="100" height="50" rx="25" ry="25" />
        <rect x="350" y="575" width="50" height="300" />
        <rect x="325" y="550" width="100" height="50" rx="25" ry="25" />
        <rect x="500" y="575" width="50" height="300" />
        <rect x="475" y="550" width="100" height="50" rx="25" ry="25" />
        <rect x="650" y="575" width="50" height="300" />
        <rect x="625" y="550" width="100" height="50" rx="25" ry="25" />
        <rect x="800" y="575" width="50" height="300" />
        <rect x="775" y="550" width="100" height="50" rx="25" ry="25" />
        <rect x="950" y="575" width="50" height="300" />
        <rect x="925" y="550" width="100" height="50" rx="25" ry="25" />
      </g>
      <rect x="175" y="875" width="100" height="50" fill="#c87912" />
      <rect x="275" y="875" width="650" height="50" fill="#e89418" />
      <rect x="925" y="875" width="100" height="50" fill="#c87912" />
      <rect x="125" y="925" width="125" height="50" fill="#c87912" />
      <rect x="250" y="925" width="700" height="50" fill="#ffb64d" />
      <rect x="950" y="925" width="125" height="50" fill="#c87912" />
      <rect x="75" y="975" width="150" height="50" fill="#c87912" />
      <rect x="225" y="975" width="750" height="50" fill="#e89418" />
      <rect x="975" y="975" width="150" height="50" fill="#c87912" />
    </svg>
  );
}
