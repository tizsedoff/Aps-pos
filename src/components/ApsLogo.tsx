import React from 'react';

interface ApsLogoProps {
  className?: string;
  size?: number | string;
  showShadow?: boolean;
}

export function ApsLogo({ className = 'w-10 h-10', size, showShadow = true }: ApsLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sombra suave exterior del squircle */}
        <filter id="apsSquircleShadow" x="-20%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor="#050a18" floodOpacity="0.45" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0b1733" floodOpacity="0.25" />
        </filter>

        {/* Fondo del icono: gradiente azul marino profundo */}
        <linearGradient id="apsSquircleBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#192e59" />
          <stop offset="50%" stopColor="#101d3b" />
          <stop offset="100%" stopColor="#091226" />
        </linearGradient>

        {/* Borde interior con sutil brillo superior */}
        <linearGradient id="apsSquircleBorder" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#70a6ff" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
        </linearGradient>

        {/* Gradiente de texto APS: Blanco hielo brillante arriba a Azul Eléctrico abajo */}
        <linearGradient id="apsLetterGradReact" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="16%" stopColor="#EDF6FF" />
          <stop offset="48%" stopColor="#93C5FD" />
          <stop offset="78%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Resplandor sutil en las letras */}
        <filter id="apsLetterGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Squircle Base */}
      <g filter={showShadow ? 'url(#apsSquircleShadow)' : undefined}>
        <rect
          x="44"
          y="44"
          width="424"
          height="424"
          rx="110"
          ry="110"
          fill="url(#apsSquircleBg)"
        />
        <rect
          x="45"
          y="45"
          width="422"
          height="422"
          rx="109"
          ry="109"
          fill="none"
          stroke="url(#apsSquircleBorder)"
          strokeWidth="2"
        />
      </g>

      {/* Letras APS con fidelidad vectorial exacta */}
      <g fill="url(#apsLetterGradReact)" filter="url(#apsLetterGlow)">
        {/* LETRA A: Galón / Chevron estilizado con vértice suavizado y base plana */}
        <path d="
          M 118 288 
          L 142 288 
          L 170 231 
          L 198 288 
          L 222 288 
          L 177 210 
          C 174 205 166 205 163 210 
          Z
        " />

        {/* LETRA P: Voladizo superior a la izquierda, bucle redondeado y asta vertical */}
        <path d="
          M 211 208 
          L 278 208 
          C 294 208 304 218 304 233 
          C 304 247 294 257 278 257 
          L 255 257 
          L 255 288 
          L 235 288 
          L 235 254 
          C 235 244 242 238 252 238 
          L 276 238 
          C 283 238 286 236 286 233 
          C 286 229 283 227 276 227 
          L 211 227 
          Z
        " />

        {/* LETRA S: Curvas suaves estilizadas y cortes limpios */}
        <path d="
          M 396 208 
          L 396 227 
          L 347 227 
          C 340 227 337 230 337 233 
          C 337 237 340 240 347 240 
          L 383 240 
          C 396 240 404 248 404 261 
          C 404 274 395 288 381 288 
          L 320 288 
          L 320 269 
          L 373 269 
          C 380 269 384 266 384 262 
          C 384 258 380 255 373 255 
          L 338 255 
          C 325 255 316 247 316 234 
          C 316 221 325 208 341 208 
          Z
        " />
      </g>
    </svg>
  );
}
