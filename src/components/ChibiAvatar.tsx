import React, { forwardRef, useId } from 'react';
import { AvatarConfig } from '../types/evora';

interface ChibiAvatarProps {
  config: AvatarConfig;
  mode?: 'full' | 'head' | 'torso' | 'shoes';
  softShadow?: boolean;
  animateIdle?: boolean;
  isExpressing?: boolean;
  holdingCamera?: boolean;
  cameraFlashActive?: boolean;
  emptyProfile?: boolean;
  className?: string;
  title?: string;
}

function shadeHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const ChibiAvatar = forwardRef<SVGSVGElement, ChibiAvatarProps>(
  (
    {
      config,
      mode = 'full',
      softShadow = true,
      animateIdle = false,
      isExpressing = false,
      holdingCamera = false,
      cameraFlashActive = false,
      emptyProfile = false,
      className = 'w-40 h-52',
      title,
    },
    ref
  ) => {
    const uid = useId().replace(/:/g, '');
    const shadowFilterId = `evora-chibi-shadow-${uid}`;

    const hairShade = shadeHex(config.hairColor, -30);
    const hairLight = shadeHex(config.hairColor, 30);
    const skinShade = shadeHex(config.skinColor, -22);
    const shirtShade = shadeHex(config.shirtColor, -20);
    const jacketShade = shadeHex(config.jacketColor, -24);
    const shoeShade = shadeHex(config.shoeColor, -26);

    const viewBox =
      mode === 'head'
        ? '18 6 204 192'
        : mode === 'torso'
        ? '38 152 164 114'
        : mode === 'shoes'
        ? '64 246 112 56'
        : '8 2 224 306';

    const renderFaceShape = () => {
      switch (config.faceShape) {
        case 'oval':
          return (
            <path
              d="M66 98 C66 56, 174 56, 174 98 C174 148, 152 174, 120 174 C88 174, 66 148, 66 98 Z"
              fill={config.skinColor}
              stroke={skinShade}
              strokeWidth="2.2"
            />
          );
        case 'square':
          return (
            <rect
              x="64"
              y="62"
              width="112"
              height="108"
              rx="38"
              fill={config.skinColor}
              stroke={skinShade}
              strokeWidth="2.2"
            />
          );
        case 'heart':
          return (
            <path
              d="M63 96 C63 58, 177 58, 177 96 C177 134, 146 172, 120 174 C94 172, 63 134, 63 96 Z"
              fill={config.skinColor}
              stroke={skinShade}
              strokeWidth="2.2"
            />
          );
        case 'round':
        default:
          return (
            <ellipse
              cx="120"
              cy="116"
              rx="58"
              ry="55"
              fill={config.skinColor}
              stroke={skinShade}
              strokeWidth="2.2"
            />
          );
      }
    };

    const renderHairBack = () => {
      switch (config.hairStyle) {
        case 'poni':
          return (
            <path
              d="M55 104 C52 50, 188 50, 185 104 L188 174 C188 184, 168 186, 160 172 L80 172 C72 186, 52 184, 52 174 Z"
              fill={hairShade}
            />
          );
        case 'bob':
          return (
            <path
              d="M54 106 C52 46, 188 46, 186 106 L190 160 C186 174, 164 172, 158 158 L82 158 C76 172, 54 174, 50 160 Z"
              fill={hairShade}
            />
          );
        case 'pigtails':
          return (
            <g>
              <path
                d="M56 84 C24 84, 22 140, 40 152 C54 156, 60 128, 64 106 Z"
                fill={config.hairColor}
                stroke={hairShade}
                strokeWidth="2"
              />
              <path
                d="M184 84 C216 84, 218 140, 200 152 C186 156, 180 128, 176 106 Z"
                fill={config.hairColor}
                stroke={hairShade}
                strokeWidth="2"
              />
              <circle cx="57" cy="92" r="7" fill="#F04F52" />
              <circle cx="183" cy="92" r="7" fill="#F04F52" />
            </g>
          );
        case 'twintails-low':
          return (
            <g>
              <path
                d="M58 120 C34 128, 30 174, 48 182 C62 184, 68 158, 70 138 Z"
                fill={config.hairColor}
                stroke={hairShade}
                strokeWidth="2"
              />
              <path
                d="M182 120 C206 128, 210 174, 192 182 C178 184, 172 158, 170 138 Z"
                fill={config.hairColor}
                stroke={hairShade}
                strokeWidth="2"
              />
              <circle cx="62" cy="128" r="6" fill="#FBDF54" />
              <circle cx="178" cy="128" r="6" fill="#FBDF54" />
            </g>
          );
        case 'bun':
          return (
            <g>
              <circle
                cx="120"
                cy="42"
                r="24"
                fill={config.hairColor}
                stroke={hairShade}
                strokeWidth="2.5"
              />
              <path d="M104 38 Q120 26 136 38" stroke={hairLight} strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          );
        case 'parted':
        case 'wavy-long':
          return (
            <path
              d="M52 110 C48 44, 192 44, 188 110 C194 150, 198 176, 184 188 C168 194, 160 172, 156 158 L84 158 C80 172, 72 194, 56 188 C42 176, 46 150, 52 110 Z"
              fill={hairShade}
            />
          );
        case 'curly-afro':
          return (
            <g fill={config.hairColor}>
              <circle cx="72" cy="70" r="24" />
              <circle cx="102" cy="54" r="26" />
              <circle cx="138" cy="54" r="26" />
              <circle cx="168" cy="70" r="24" />
              <circle cx="62" cy="100" r="20" />
              <circle cx="178" cy="100" r="20" />
            </g>
          );
        case 'side-swept':
          return (
            <path
              d="M56 106 C54 46, 186 46, 184 106 C188 122, 182 140, 170 144 L70 144 C58 140, 52 122, 56 106 Z"
              fill={hairShade}
            />
          );
        case 'short':
        default:
          return <ellipse cx="120" cy="94" rx="64" ry="48" fill={hairShade} />;
      }
    };

    const renderHairFront = () => {
      switch (config.hairStyle) {
        case 'poni':
          return (
            <g>
              <path
                d="M56 104 C56 44, 184 44, 184 104 C178 96, 166 92, 162 92 L162 104 L144 104 L140 94 L136 104 L104 104 L100 94 L96 104 L78 104 C74 92, 62 96, 56 104 Z"
                fill={config.hairColor}
              />
              <path d="M84 64 Q120 52 156 64" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.65" />
            </g>
          );
        case 'bob':
          return (
            <g>
              <path
                d="M56 112 C56 44, 184 44, 184 112 L182 156 C174 156, 168 134, 166 104 C150 96, 134 94, 120 100 C106 94, 90 96, 74 104 C72 134, 66 156, 58 156 Z"
                fill={config.hairColor}
              />
              <path d="M84 62 Q120 50 156 62" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          );
        case 'pigtails':
        case 'twintails-low':
          return (
            <g>
              <path
                d="M58 106 C58 46, 182 46, 182 106 C168 90, 146 88, 126 102 C110 86, 76 88, 58 106 Z"
                fill={config.hairColor}
              />
              <path d="M88 64 Q120 54 152 64" stroke={hairLight} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          );
        case 'bun':
          return (
            <g>
              <path
                d="M58 106 C58 48, 182 48, 182 106 C170 98, 152 96, 146 102 L146 92 L134 102 L106 102 L94 92 L94 102 C88 96, 70 98, 58 106 Z"
                fill={config.hairColor}
              />
            </g>
          );
        case 'parted':
        case 'wavy-long':
          return (
            <g>
              <path
                d="M54 112 C54 44, 186 44, 186 112 C188 138, 182 156, 174 160 C172 134, 168 108, 148 94 C132 106, 104 108, 92 94 C72 108, 68 134, 66 160 C58 156, 52 138, 54 112 Z"
                fill={config.hairColor}
              />
              <path d="M82 64 Q118 50 154 64" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          );
        case 'side-swept':
          return (
            <g>
              <path
                d="M56 108 C54 44, 186 44, 184 108 C184 116, 178 124, 170 120 C166 104, 152 92, 134 94 C112 108, 86 108, 62 112 C52 112, 44 104, 56 108 Z"
                fill={config.hairColor}
              />
              <path d="M46 102 Q58 112 68 104" stroke={config.hairColor} strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M84 64 Q120 52 158 66" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          );
        case 'curly-afro':
          return (
            <g fill={config.hairColor}>
              <circle cx="76" cy="84" r="14" />
              <circle cx="98" cy="76" r="15" />
              <circle cx="120" cy="73" r="16" />
              <circle cx="142" cy="76" r="15" />
              <circle cx="164" cy="84" r="14" />
              <circle cx="104" cy="54" r="8" fill={hairLight} opacity="0.45" />
              <circle cx="136" cy="54" r="7" fill={hairLight} opacity="0.4" />
            </g>
          );
        case 'short':
        default:
          return (
            <g>
              <path
                d="M58 106 C56 46, 184 46, 182 106 L172 94 L164 108 L142 88 L124 106 L104 86 L86 108 L72 92 Z"
                fill={config.hairColor}
              />
              <path d="M86 64 Q120 52 154 64" stroke={hairLight} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.6" />
            </g>
          );
      }
    };

    const renderEyebrows = () => {
      const sw = config.eyebrowStyle === 'thick' ? 4.8 : 2.8;
      switch (config.eyebrowStyle) {
        case 'raised':
          return (
            <g stroke={config.eyebrowColor} strokeWidth={sw} strokeLinecap="round" fill="none">
              <path d="M80 100 Q92 91 104 97" />
              <path d="M136 97 Q148 91 160 100" />
            </g>
          );
        case 'flat':
          return (
            <g stroke={config.eyebrowColor} strokeWidth={sw} strokeLinecap="round" fill="none">
              <path d="M81 101 L104 101" />
              <path d="M136 101 L159 101" />
            </g>
          );
        case 'thick':
          return (
            <g stroke={config.eyebrowColor} strokeWidth={sw} strokeLinecap="round" fill="none">
              <path d="M80 101 Q92 96 104 100" />
              <path d="M136 100 Q148 96 160 101" />
            </g>
          );
        case 'soft':
        default:
          return (
            <g stroke={config.eyebrowColor} strokeWidth={sw} strokeLinecap="round" fill="none">
              <path d="M81 102 Q92 96 103 101" />
              <path d="M137 101 Q148 96 159 102" />
            </g>
          );
      }
    };

    const renderEyePair = () => {
      const leftX = 92;
      const rightX = 148;
      const eyeY = 120;

      if (config.eyeStyle === 'happy') {
        return (
          <g stroke="#232329" strokeWidth="3.8" strokeLinecap="round" fill="none">
            <path d="M80 123 Q92 110 104 123" />
            <path d="M136 123 Q148 110 160 123" />
          </g>
        );
      }

      if (config.eyeStyle === 'wink') {
        return (
          <g>
            <g>
              <ellipse cx={leftX} cy={eyeY} rx="11.5" ry="13.5" fill="#FFFFFF" stroke="#232329" strokeWidth="2.2" />
              <ellipse cx={leftX} cy={eyeY + 1} rx="8.2" ry="10.2" fill={config.eyeColor} />
              <circle cx={leftX} cy={eyeY + 1.5} r="4.2" fill="#1E1E24" />
              <circle cx={leftX - 3.4} cy={eyeY - 4} r="3.2" fill="#FFFFFF" />
              <circle cx={leftX + 3.2} cy={eyeY + 4.5} r="1.7" fill="#FFFFFF" />
            </g>
            <path
              d={`M${rightX - 12} ${eyeY + 2} Q${rightX} ${eyeY - 10} ${rightX + 12} ${eyeY + 2}`}
              stroke="#232329"
              strokeWidth="3.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      }

      if (config.eyeStyle === 'chill' || config.eyeStyle === 'sleepy') {
        const lidDrop = config.eyeStyle === 'sleepy' ? 2 : -1;
        return (
          <g>
            {[leftX, rightX].map((cx, i) => (
              <g key={i}>
                <ellipse cx={cx} cy={eyeY + 2} rx="11.5" ry="11" fill="#FFFFFF" stroke="#232329" strokeWidth="2" />
                <circle cx={cx} cy={eyeY + 3} r="7.5" fill={config.eyeColor} />
                <circle cx={cx} cy={eyeY + 3} r="3.8" fill="#1F2937" />
                <circle cx={cx - 2.5} cy={eyeY + 0.5} r="2" fill="#FFFFFF" />
                <path
                  d={`M${cx - 12} ${eyeY + lidDrop} L${cx + 12} ${eyeY + lidDrop} C${cx + 12} ${eyeY - 12}, ${cx - 12} ${eyeY - 12}, ${cx - 12} ${eyeY + lidDrop} Z`}
                  fill={skinShade}
                />
                <line x1={cx - 12} y1={eyeY + lidDrop} x2={cx + 12} y2={eyeY + lidDrop} stroke="#232329" strokeWidth="2.6" strokeLinecap="round" />
              </g>
            ))}
          </g>
        );
      }

      const ry = config.eyeStyle === 'big' || config.eyeStyle === 'starry' ? 14.5 : 13;
      const rx = config.eyeStyle === 'big' || config.eyeStyle === 'starry' ? 12.5 : 11;

      return (
        <g>
          {[leftX, rightX].map((cx, idx) => (
            <g key={idx}>
              {config.makeupStyle === 'pastel-shadow' && (
                <ellipse cx={cx} cy={eyeY - 6} rx="14" ry="8" fill="#D8B4FE" opacity="0.55" />
              )}
              <ellipse cx={cx} cy={eyeY} rx={rx} ry={ry} fill="#FFFFFF" stroke="#232329" strokeWidth="2.2" />
              <ellipse cx={cx} cy={eyeY + 1} rx={rx - 3.2} ry={ry - 3.2} fill={config.eyeColor} />
              <circle cx={cx} cy={eyeY + 1.5} r="4.2" fill="#1E1E24" />
              <circle cx={cx - 3.4} cy={eyeY - 4} r="3.1" fill="#FFFFFF" />
              {(config.eyeStyle === 'sparkle' || config.eyeStyle === 'lashes') && (
                <circle cx={cx + 3.4} cy={eyeY + 4.5} r="1.7" fill="#FFFFFF" />
              )}
              {config.eyeStyle === 'starry' && (
                <path
                  d={`M${cx} ${eyeY - 7} L${cx + 2} ${eyeY - 2} L${cx + 7} ${eyeY} L${cx + 2} ${eyeY + 2} L${cx} ${eyeY + 7} L${cx - 2} ${eyeY + 2} L${cx - 7} ${eyeY} L${cx - 2} ${eyeY - 2} Z`}
                  fill="#FFFBEB"
                  opacity="0.9"
                />
              )}
              {(config.eyeStyle === 'lashes' || config.eyeStyle === 'cat') && (
                <path
                  d={
                    idx === 0
                      ? `M${cx - rx - 1} ${eyeY - 5} L${cx - rx - 6} ${eyeY - 10}`
                      : `M${cx + rx + 1} ${eyeY - 5} L${cx + rx + 6} ${eyeY - 10}`
                  }
                  stroke="#232329"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              )}
              {config.eyeStyle === 'cat' && (
                <path
                  d={
                    idx === 0
                      ? `M${cx - rx} ${eyeY - 7} Q${cx} ${eyeY - 16} ${cx + rx} ${eyeY - 4}`
                      : `M${cx - rx} ${eyeY - 4} Q${cx} ${eyeY - 16} ${cx + rx} ${eyeY - 7}`
                  }
                  stroke="#232329"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </g>
      );
    };

    const renderMakeup = () => {
      switch (config.makeupStyle) {
        case 'blush-pink':
          return (
            <g opacity="0.68">
              <ellipse cx="81" cy="139" rx="11.5" ry="6.5" fill="#F472B6" />
              <ellipse cx="159" cy="139" rx="11.5" ry="6.5" fill="#F472B6" />
            </g>
          );
        case 'blush-peach':
          return (
            <g opacity="0.72">
              <ellipse cx="81" cy="139" rx="11.5" ry="6.5" fill="#FB923C" />
              <ellipse cx="159" cy="139" rx="11.5" ry="6.5" fill="#FB923C" />
            </g>
          );
        case 'freckles':
          return (
            <g fill="#B45309" opacity="0.65">
              <circle cx="77" cy="138" r="1.6" />
              <circle cx="83" cy="141" r="1.6" />
              <circle cx="87" cy="137" r="1.6" />
              <circle cx="153" cy="137" r="1.6" />
              <circle cx="157" cy="141" r="1.6" />
              <circle cx="163" cy="138" r="1.6" />
            </g>
          );
        case 'pastel-shadow':
          return (
            <g opacity="0.58">
              <ellipse cx="81" cy="139" rx="10" ry="5.5" fill="#F472B6" />
              <ellipse cx="159" cy="139" rx="10" ry="5.5" fill="#F472B6" />
            </g>
          );
        case 'none':
        default:
          return null;
      }
    };

    const renderNose = () => {
      switch (config.noseStyle) {
        case 'button':
          return <ellipse cx="120" cy="133" rx="4.8" ry="3.6" fill="#E07A5F" />;
        case 'tiny':
          return <circle cx="120" cy="133" r="2.5" fill="#C46D53" />;
        case 'triangle':
        default:
          return <path d="M120 127 L125.5 135.5 Q120 137.5 114.5 135.5 Z" fill="#E76F51" />;
      }
    };

    const renderMouth = () => {
      switch (config.mouthStyle) {
        case 'grin':
          return (
            <g>
              <path d="M110 146 Q120 158 130 146 Z" fill="#F04F52" stroke="#4B2B2B" strokeWidth="1.8" />
              <path d="M112 146.5 L128 146.5" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          );
        case 'cheer':
          return (
            <g>
              <path d="M108 144 Q120 160 132 144 Z" fill="#FB7185" stroke="#4B2B2B" strokeWidth="2" />
              <path d="M114 152 Q120 149 126 152" stroke="#F04F52" strokeWidth="2" fill="none" />
            </g>
          );
        case 'tongue':
          return (
            <g>
              <path d="M111 146 Q120 154 129 146" stroke="#4B2B2B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M116 149 C116 157, 124 157, 124 149 Z" fill="#FB7185" stroke="#4B2B2B" strokeWidth="1.5" />
            </g>
          );
        case 'pout':
          return (
            <path d="M114 150 Q120 145 126 150" stroke="#4B2B2B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          );
        case 'surprised':
          return <ellipse cx="120" cy="149" rx="4.5" ry="5.5" fill="#F04F52" stroke="#4B2B2B" strokeWidth="1.8" />;
        case 'cat':
          return (
            <path
              d="M110 148 Q115 153 120 147 Q125 153 130 148"
              stroke="#4B2B2B"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          );
        case 'cool':
          return (
            <path
              d="M113 149 Q121 151 128 146"
              stroke="#4B2B2B"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          );
        case 'smile':
        default:
          return (
            <path
              d="M110 146 Q120 156 130 146"
              stroke="#4B2B2B"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          );
      }
    };

    const renderAccessory = () => {
      switch (config.accessory) {
        case 'flower-crown':
          return (
            <g>
              <path d="M74 62 Q120 48 166 62" stroke="#2E9D67" strokeWidth="7" strokeLinecap="round" fill="none" />
              {[
                { x: 84, y: 58, c: '#F04F52' },
                { x: 102, y: 53, c: '#FBDF54' },
                { x: 120, y: 50, c: '#FFFFFF' },
                { x: 138, y: 53, c: '#F7891F' },
                { x: 156, y: 58, c: '#9FD2D6' },
              ].map((fl, i) => (
                <g key={i}>
                  <circle cx={fl.x} cy={fl.y} r="7.5" fill={fl.c} stroke="#2E9D67" strokeWidth="1.2" />
                  <circle cx={fl.x} cy={fl.y} r="2.6" fill="#FBDF54" />
                </g>
              ))}
            </g>
          );
        case 'glasses':
          return (
            <g stroke="#1E293B" strokeWidth="2.8" fill="rgba(255,255,255,0.2)">
              <circle cx="92" cy="120" r="16" />
              <circle cx="148" cy="120" r="16" />
              <line x1="108" y1="120" x2="132" y2="120" />
            </g>
          );
        case 'sunglasses':
          return (
            <g stroke="#1E293B" strokeWidth="2.6">
              <rect x="74" y="108" width="36" height="22" rx="8" fill="#1E293B" fillOpacity="0.88" />
              <rect x="130" y="108" width="36" height="22" rx="8" fill="#1E293B" fillOpacity="0.88" />
              <line x1="110" y1="118" x2="130" y2="118" />
              <line x1="80" y1="113" x2="90" y2="123" stroke="#9FD2D6" strokeWidth="2" />
              <line x1="136" y1="113" x2="146" y2="123" stroke="#9FD2D6" strokeWidth="2" />
            </g>
          );
        case 'cap':
          return (
            <g>
              <path d="M62 84 C64 42, 176 42, 178 84 Z" fill="#377EC0" stroke="#1E40AF" strokeWidth="2" />
              <path d="M60 84 Q120 74 190 88 Q154 96 60 84 Z" fill="#FBDF54" stroke="#D97706" strokeWidth="1.8" />
              <circle cx="120" cy="48" r="4" fill="#FBDF54" />
            </g>
          );
        case 'beret':
          return (
            <g>
              <path d="M64 76 C64 42, 174 36, 178 68 C178 82, 72 86, 64 76 Z" fill="#F04F52" stroke="#B91C1C" strokeWidth="2" />
              <path d="M122 44 L126 36" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" />
            </g>
          );
        case 'cat-ears':
          return (
            <g>
              <path d="M74 68 L66 36 L98 56 Z" fill="#FFFFFF" stroke="#377EC0" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M166 68 L174 36 L142 56 Z" fill="#FFFFFF" stroke="#377EC0" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M76 62 L72 44 L90 56 Z" fill="#F48FB1" />
              <path d="M164 62 L168 44 L150 56 Z" fill="#F48FB1" />
            </g>
          );
        case 'star-clip':
          return (
            <polygon
              points="158,72 162,80 171,81 164,87 166,96 158,91 150,96 152,87 145,81 154,80"
              fill="#FBDF54"
              stroke="#F7891F"
              strokeWidth="1.6"
            />
          );
        case 'headphones':
          return (
            <g>
              <path d="M56 108 C56 38, 184 38, 184 108" stroke="#377EC0" strokeWidth="9" strokeLinecap="round" fill="none" />
              <rect x="44" y="96" width="16" height="32" rx="8" fill="#12BAAA" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="180" y="96" width="16" height="32" rx="8" fill="#12BAAA" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          );
        case 'ribbon-bow':
          return (
            <g transform="translate(148, 56)">
              <path d="M0 10 L-16 -4 L-14 18 Z" fill="#F04F52" />
              <path d="M0 10 L16 -4 L14 18 Z" fill="#F04F52" />
              <circle cx="0" cy="9" r="5" fill="#FBDF54" />
            </g>
          );
        case 'none':
        default:
          return null;
      }
    };

    const renderBodyAndOutfit = () => {
      const isJasPr = config.jacketStyle === 'jas-pr';
      const isAlmetUnj = config.jacketStyle === 'almet-unj';
      const isDress = !isJasPr && config.shirtStyle === 'dress';
      const isSkirt = config.gender === 'cewek' || isDress;

      const activeJacketFill = isJasPr
        ? '#1B1E26'
        : isAlmetUnj
        ? config.jacketColor === '#FFFFFF' || config.jacketColor === '#377EC0'
          ? '#0B5E4F'
          : config.jacketColor
        : config.jacketColor;
      const activeJacketShade = shadeHex(activeJacketFill, -22);
      const sleeveFill = config.jacketStyle !== 'none' ? activeJacketFill : config.shirtColor;

      return (
        <g>
          {/* Legs */}
          <rect x="94" y="232" width="16" height="44" rx="8" fill={config.skinColor} />
          <rect x="130" y="232" width="16" height="44" rx="8" fill={config.skinColor} />
          {/* Socks */}
          <rect x="94" y="252" width="16" height="22" rx="4" fill={isJasPr ? '#1E293B' : '#FFFFFF'} />
          <rect x="130" y="252" width="16" height="22" rx="4" fill={isJasPr ? '#1E293B' : '#FFFFFF'} />

          {/* Shoes */}
          {config.shoeStyle === 'boots' ? (
            <g>
              <rect x="88" y="260" width="26" height="30" rx="8" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <rect x="126" y="260" width="26" height="30" rx="8" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <rect x="86" y="284" width="28" height="7" rx="3" fill="#1E293B" />
              <rect x="126" y="284" width="28" height="7" rx="3" fill="#1E293B" />
            </g>
          ) : config.shoeStyle === 'maryjane' ? (
            <g>
              <ellipse cx="101" cy="283" rx="15" ry="9" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <ellipse cx="139" cy="283" rx="15" ry="9" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <line x1="92" y1="276" x2="110" y2="276" stroke={shoeShade} strokeWidth="2.5" />
              <line x1="130" y1="276" x2="148" y2="276" stroke={shoeShade} strokeWidth="2.5" />
            </g>
          ) : config.shoeStyle === 'loafers' ? (
            <g>
              <rect x="87" y="274" width="27" height="16" rx="7" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <rect x="126" y="274" width="27" height="16" rx="7" fill={config.shoeColor} stroke={shoeShade} strokeWidth="2" />
              <rect x="95" y="277" width="11" height="3.5" rx="1.5" fill="#FDE68A" />
              <rect x="134" y="277" width="11" height="3.5" rx="1.5" fill="#FDE68A" />
            </g>
          ) : (
            <g>
              <rect x="86" y="272" width="28" height="18" rx="8" fill={config.shoeColor} stroke={shoeShade} strokeWidth="1.5" />
              <rect x="126" y="272" width="28" height="18" rx="8" fill={config.shoeColor} stroke={shoeShade} strokeWidth="1.5" />
              <rect x="86" y="283" width="28" height="7" rx="3.5" fill="#FFFFFF" />
              <rect x="126" y="283" width="28" height="7" rx="3.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Bottoms (Bawahan Hitam otomatis untuk Jas PR, atau Rok/Celana reguler) */}
          {isSkirt ? (
            <g>
              <path
                d="M84 218 L156 218 L168 256 Q120 264 72 256 Z"
                fill={isJasPr ? '#181A20' : isDress ? config.shirtColor : '#CBD5E1'}
                stroke={isJasPr ? '#090A0F' : isDress ? shirtShade : '#94A3B8'}
                strokeWidth="2"
              />
              <line x1="98" y1="222" x2="92" y2="256" stroke={isJasPr ? '#2D313D' : isDress ? shirtShade : '#94A3B8'} strokeWidth="1.6" />
              <line x1="120" y1="222" x2="120" y2="258" stroke={isJasPr ? '#2D313D' : isDress ? shirtShade : '#94A3B8'} strokeWidth="1.6" />
              <line x1="142" y1="222" x2="148" y2="256" stroke={isJasPr ? '#2D313D' : isDress ? shirtShade : '#94A3B8'} strokeWidth="1.6" />
            </g>
          ) : (
            <g>
              <path
                d="M84 218 L156 218 L156 256 L126 256 L120 236 L114 256 L84 256 Z"
                fill={isJasPr ? '#181A20' : config.gender === 'cowok' ? '#334155' : '#475569'}
                stroke={isJasPr ? '#090A0F' : '#1E293B'}
                strokeWidth="1.8"
              />
              {isJasPr && (
                <g stroke="#2D313D" strokeWidth="1.2">
                  <line x1="99" y1="225" x2="99" y2="252" />
                  <line x1="141" y1="225" x2="141" y2="252" />
                </g>
              )}
            </g>
          )}

          {/* Arms & Cute Round Hands */}
          {!holdingCamera && (
            <g>
              <path d="M84 176 L58 214" stroke={sleeveFill} strokeWidth="18" strokeLinecap="round" />
              {isJasPr && (
                <path d="M62 208 L57 215" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
              )}
              <circle cx="55" cy="218" r="10" fill={config.skinColor} stroke={skinShade} strokeWidth="1.5" />
              {isExpressing ? (
                <g>
                  <path d="M156 176 L190 150" stroke={sleeveFill} strokeWidth="18" strokeLinecap="round" />
                  {isJasPr && (
                    <path d="M184 154 L191 149" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
                  )}
                  <circle cx="195" cy="146" r="10" fill={config.skinColor} stroke={skinShade} strokeWidth="1.5" />
                </g>
              ) : (
                <g>
                  <path d="M156 176 L182 214" stroke={sleeveFill} strokeWidth="18" strokeLinecap="round" />
                  {isJasPr && (
                    <path d="M178 208 L183 215" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
                  )}
                  <circle cx="185" cy="218" r="10" fill={config.skinColor} stroke={skinShade} strokeWidth="1.5" />
                </g>
              )}
            </g>
          )}

          {/* Torso / Shirt (Jas PR always wears crisp white dress shirt inner) */}
          <path
            d="M84 170 Q120 162 156 170 L160 226 Q120 232 80 226 Z"
            fill={isJasPr ? '#FFFFFF' : config.shirtColor}
            stroke={isJasPr ? '#CBD5E1' : shirtShade}
            strokeWidth="2"
          />

          {/* White Formal Inner Shirt Details for Jas PR */}
          {isJasPr ? (
            <g>
              {/* Crisp White Dress Collar */}
              <polygon points="103,167 120,183 111,185 98,171" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.4" />
              <polygon points="137,167 120,183 129,185 142,171" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.4" />
              {/* Subtle Placket & Collar Buttons */}
              <line x1="120" y1="183" x2="120" y2="225" stroke="#CBD5E1" strokeWidth="1.4" />
              <circle cx="120" cy="192" r="1.8" fill="#64748B" />
              <circle cx="120" cy="204" r="1.8" fill="#64748B" />
              <circle cx="120" cy="216" r="1.8" fill="#64748B" />
            </g>
          ) : (
            <>
              {/* Shirt Details */}
              {config.shirtStyle === 'ribbon-uniform' && (
                <g>
                  <path d="M92 169 L120 194 L148 169 L140 165 L120 182 L100 165 Z" fill="#9FD2D6" stroke="#377EC0" strokeWidth="1.5" />
                  <path d="M120 184 L108 196 L112 182 Z" fill="#F04F52" />
                  <path d="M120 184 L132 196 L128 182 Z" fill="#F04F52" />
                  <circle cx="120" cy="185" r="4" fill="#FBDF54" />
                </g>
              )}
              {config.shirtStyle === 'collar' && (
                <g>
                  <path d="M102 167 L120 182 L138 167" fill="none" stroke={shirtShade} strokeWidth="2.5" />
                  <circle cx="120" cy="190" r="2" fill={shirtShade} />
                  <circle cx="120" cy="202" r="2" fill={shirtShade} />
                </g>
              )}
              {config.shirtStyle === 'aloha' && (
                <g>
                  <path d="M102 167 L120 180 L138 167" fill="none" stroke="#12BAAA" strokeWidth="2.4" />
                  <circle cx="96" cy="192" r="5" fill="#12BAAA" opacity="0.85" />
                  <circle cx="140" cy="198" r="5.5" fill="#377EC0" opacity="0.85" />
                  <circle cx="114" cy="212" r="4.5" fill="#12BAAA" opacity="0.85" />
                  <circle cx="128" cy="184" r="4" fill="#F7891F" opacity="0.85" />
                </g>
              )}
              {config.shirtStyle === 'hoodie' && (
                <g>
                  <path d="M96 168 Q120 184 144 168" fill="none" stroke={shirtShade} strokeWidth="4" strokeLinecap="round" />
                  <line x1="112" y1="178" x2="110" y2="196" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="128" y1="178" x2="130" y2="196" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="96" y="204" width="48" height="18" rx="6" fill={shirtShade} opacity="0.45" />
                </g>
              )}
              {config.shirtStyle === 'overall' && (
                <g>
                  <rect x="94" y="170" width="9" height="32" fill="#377EC0" />
                  <rect x="137" y="170" width="9" height="32" fill="#377EC0" />
                  <rect x="90" y="192" width="60" height="34" rx="6" fill="#377EC0" stroke="#1E40AF" strokeWidth="1.5" />
                  <circle cx="99" cy="197" r="2.6" fill="#FBDF54" />
                  <circle cx="141" cy="197" r="2.6" fill="#FBDF54" />
                  <rect x="108" y="202" width="24" height="14" rx="4" fill="#5460AC" />
                </g>
              )}
            </>
          )}

          {/* Jacket Layer */}
          {config.jacketStyle !== 'none' && (
            <g>
              {config.jacketStyle === 'almet-unj' ? (
                <g>
                  {/* Tailored Almet UNJ Panels (Hijau Emerald UNJ) */}
                  <path
                    d="M82 170 L108 170 L114 202 L114 227 L78 225 Z"
                    fill={activeJacketFill}
                    stroke={activeJacketShade}
                    strokeWidth="2"
                  />
                  <path
                    d="M158 170 L132 170 L126 202 L126 227 L162 225 Z"
                    fill={activeJacketFill}
                    stroke={activeJacketShade}
                    strokeWidth="2"
                  />
                  {/* Almet Center Overlap */}
                  <path
                    d="M111 196 L129 196 L128 227 L112 227 Z"
                    fill={activeJacketFill}
                    stroke={activeJacketShade}
                    strokeWidth="1.5"
                  />
                  {/* Classic Almamater Notched Lapels */}
                  <polygon
                    points="106,170 116,196 101,192 98,176"
                    fill={shadeHex(activeJacketFill, 14)}
                    stroke={activeJacketShade}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="134,170 124,196 139,192 142,176"
                    fill={shadeHex(activeJacketFill, 14)}
                    stroke={activeJacketShade}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  {/* Brass UNJ Buttons */}
                  <circle cx="120" cy="203" r="2.2" fill="#FBDF54" stroke="#B45309" strokeWidth="0.7" />
                  <circle cx="120" cy="214" r="2.2" fill="#FBDF54" stroke="#B45309" strokeWidth="0.7" />
                  {/* Pocket Trim */}
                  <line x1="84" y1="210" x2="102" y2="210" stroke={activeJacketShade} strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="138" y1="210" x2="156" y2="210" stroke={activeJacketShade} strokeWidth="1.8" strokeLinecap="round" />
                  {/* Official UNJ Logo Crest on Left Chest */}
                  <circle cx="145" cy="190" r="9.5" fill="#FFFFFF" fillOpacity="0.18" />
                  <image
                    href="/unj-logo.png"
                    x="136.5"
                    y="181.5"
                    width="17"
                    height="17"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              ) : config.jacketStyle === 'jas-pr' ? (
                <g>
                  {/* Tailored Black PRDC Blazer */}
                  <path
                    d="M81 170 L106 170 L115 204 L115 227 L77 225 Z"
                    fill="#1B1E26"
                    stroke="#0B0D12"
                    strokeWidth="2"
                  />
                  <path
                    d="M159 170 L134 170 L125 204 L125 227 L163 225 Z"
                    fill="#1B1E26"
                    stroke="#0B0D12"
                    strokeWidth="2"
                  />
                  {/* Center Button Closure */}
                  <path
                    d="M113 200 L127 200 L126 227 L114 227 Z"
                    fill="#1B1E26"
                    stroke="#0B0D12"
                    strokeWidth="1.4"
                  />
                  {/* Sharp Formal Suit Lapels */}
                  <polygon
                    points="105,170 116,200 100,192 97,175"
                    fill="#262A35"
                    stroke="#0B0D12"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="135,170 124,200 140,192 143,175"
                    fill="#262A35"
                    stroke="#0B0D12"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Subtle Pocket Square + Suit Buttons */}
                  <polygon points="86,193 96,193 94,188 88,189" fill="#377EC0" />
                  <line x1="84" y1="194" x2="100" y2="194" stroke="#475569" strokeWidth="1.4" />
                  <circle cx="120" cy="206" r="2.2" fill="#334155" stroke="#94A3B8" strokeWidth="0.7" />
                  <circle cx="120" cy="217" r="2.2" fill="#334155" stroke="#94A3B8" strokeWidth="0.7" />
                  {/* Official PRDC Logo Crest on Left Chest */}
                  <image
                    href="/prdc-logo.png"
                    x="136"
                    y="181"
                    width="18"
                    height="18"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              ) : config.jacketStyle === 'sweater-vest' ? (
                <path
                  d="M84 170 L108 170 L120 190 L132 170 L156 170 L160 226 Q120 232 80 226 Z"
                  fill={config.jacketColor}
                  stroke={jacketShade}
                  strokeWidth="2"
                />
              ) : (
                <>
                  <path
                    d="M82 170 L106 170 L106 226 L78 225 Z"
                    fill={config.jacketColor}
                    stroke={jacketShade}
                    strokeWidth="2"
                  />
                  <path
                    d="M158 170 L134 170 L134 226 L162 225 Z"
                    fill={config.jacketColor}
                    stroke={jacketShade}
                    strokeWidth="2"
                  />
                </>
              )}
              {config.jacketStyle === 'blazer' && (
                <g fill="#FBDF54">
                  <circle cx="101" cy="196" r="2.6" />
                  <circle cx="101" cy="210" r="2.6" />
                  <circle cx="139" cy="196" r="2.6" />
                  <circle cx="139" cy="210" r="2.6" />
                </g>
              )}
              {config.jacketStyle === 'varsity' && (
                <g>
                  <rect x="78" y="219" width="28" height="6" rx="2" fill="#FFFFFF" />
                  <rect x="134" y="219" width="28" height="6" rx="2" fill="#FFFFFF" />
                </g>
              )}
              {(config.jacketStyle === 'denim' || config.jacketStyle === 'parka') && (
                <g stroke={jacketShade} strokeWidth="1.5" fill="none">
                  <rect x="84" y="192" width="14" height="12" rx="2" />
                  <rect x="142" y="192" width="14" height="12" rx="2" />
                </g>
              )}
            </g>
          )}

          {/* Neck */}
          <rect x="109" y="156" width="22" height="18" rx="8" fill={skinShade} />

          {/* Bent Arms & Cute Retro EVORA Camera (rendered over torso when holdingCamera is true) */}
          {holdingCamera && (
            <g>
              {/* Bent arms gripping camera sides */}
              <path
                d="M84 176 Q66 196 86 202"
                fill="none"
                stroke={sleeveFill}
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M156 176 Q174 196 154 202"
                fill="none"
                stroke={sleeveFill}
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Cute Camera Body */}
              <g transform="translate(0, -2)">
                {/* Top Viewfinder & Shutter */}
                <rect x="108" y="176" width="24" height="8" rx="3" fill="#5460AC" stroke="#1E3A8A" strokeWidth="1.6" />
                <rect x="139" y="177" width="9" height="5" rx="2" fill="#F04F52" />

                {/* Main Camera Body */}
                <rect x="90" y="182" width="60" height="36" rx="9" fill="#377EC0" stroke="#1E3A8A" strokeWidth="2" />
                <rect x="92" y="196" width="56" height="8" fill="#9FD2D6" opacity="0.9" />

                {/* Flash Lamp */}
                <rect
                  x="96"
                  y="186"
                  width="12"
                  height="8"
                  rx="2.5"
                  fill={cameraFlashActive ? '#FFFFFF' : '#FBDF54'}
                  stroke="#F7891F"
                  strokeWidth="1.2"
                />

                {/* Camera Lens */}
                <circle cx="122" cy="200" r="14" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
                <circle cx="122" cy="200" r="10.5" fill="#1E293B" />
                <circle cx="122" cy="200" r="6" fill="#377EC0" />
                <circle cx="119" cy="197" r="2.6" fill="#FFFFFF" opacity="0.9" />
                <circle cx="125" cy="203" r="1.4" fill="#9FD2D6" opacity="0.85" />
              </g>

              {/* Chibi Hands gripping left & right of camera */}
              <circle cx="88" cy="201" r="9.5" fill={config.skinColor} stroke={skinShade} strokeWidth="1.6" />
              <circle cx="152" cy="201" r="9.5" fill={config.skinColor} stroke={skinShade} strokeWidth="1.6" />
            </g>
          )}
        </g>
      );
    };

    const emptyBlankArtwork = (
      <g>
        {/* Simple neutral shoes, pants, arms & tee */}
        <g>
          <rect x="86" y="272" width="28" height="18" rx="8" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="126" y="272" width="28" height="18" rx="8" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M84 218 L156 218 L156 254 L126 254 L120 236 L114 254 L84 254 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.8" />
          <path d="M84 176 L58 214" stroke="#E2E8F0" strokeWidth="18" strokeLinecap="round" />
          <circle cx="55" cy="218" r="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M156 176 L182 214" stroke="#E2E8F0" strokeWidth="18" strokeLinecap="round" />
          <circle cx="185" cy="218" r="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M84 170 Q120 162 156 170 L160 226 Q120 232 80 226 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <rect x="109" y="156" width="22" height="18" rx="8" fill="#CBD5E1" />
        </g>
        {/* Ears */}
        <circle cx="62" cy="118" r="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="178" cy="118" r="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="62" cy="118" r="6" fill="#CBD5E1" opacity="0.55" />
        <circle cx="178" cy="118" r="6" fill="#CBD5E1" opacity="0.55" />
        {/* Bald Head Without Face */}
        <path
          d="M64 114 C64 72 86 58 120 58 C154 58 176 72 176 114 C176 150 154 166 120 166 C86 166 64 150 64 114 Z"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="2.4"
        />
        {/* Subtle bald head shine highlight */}
        <ellipse cx="100" cy="78" rx="14" ry="6" transform="rotate(-18 100 78)" fill="#FFFFFF" opacity="0.9" />
      </g>
    );

    const characterArtwork = emptyProfile ? (
      emptyBlankArtwork
    ) : (
      <g>
        {renderHairBack()}
        {renderBodyAndOutfit()}
        {/* Ears */}
        <circle cx="62" cy="118" r="12" fill={config.skinColor} stroke={skinShade} strokeWidth="2" />
        <circle cx="178" cy="118" r="12" fill={config.skinColor} stroke={skinShade} strokeWidth="2" />
        <circle cx="62" cy="118" r="6" fill={skinShade} opacity="0.55" />
        <circle cx="178" cy="118" r="6" fill={skinShade} opacity="0.55" />
        {/* Head */}
        {renderFaceShape()}
        {renderMakeup()}
        {renderEyebrows()}
        {renderEyePair()}
        {renderNose()}
        {renderMouth()}
        {/* Hair Front & Accessory */}
        {renderHairFront()}
        {renderAccessory()}
      </g>
    );

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        className={className}
        role="img"
        aria-label={title || 'Avatar EVORA'}
      >
        {title && <title>{title}</title>}
        {softShadow && (
          <defs>
            <filter id={shadowFilterId} x="-15%" y="-15%" width="130%" height="135%">
              <feDropShadow
                dx="0"
                dy="5"
                stdDeviation="4"
                floodColor="#1E3A8A"
                floodOpacity="0.18"
              />
            </filter>
          </defs>
        )}

        {mode === 'full' && (
          <ellipse cx="120" cy="293" rx="44" ry="8" fill="#1E3A8A" opacity="0.15" />
        )}

        <g
          filter={softShadow ? `url(#${shadowFilterId})` : undefined}
          className={isExpressing ? 'avatar-express' : animateIdle ? 'avatar-sway' : undefined}
        >
          {characterArtwork}
          {isExpressing && mode === 'full' && (
            <g>
              <polygon points="36,78 40,86 48,88 40,91 36,99 32,91 24,88 32,86" fill="#FBDF54" />
              <polygon points="204,70 207,76 213,78 207,80 204,86 201,80 195,78 201,76" fill="#12BAAA" />
            </g>
          )}
          {/* Camera Flash Starburst */}
          {holdingCamera && cameraFlashActive && mode === 'full' && (
            <g className="camera-flash-burst" style={{ transformOrigin: '102px 188px' }}>
              <circle cx="102" cy="188" r="46" fill="#FFFFFF" opacity="0.72" />
              <circle cx="102" cy="188" r="28" fill="#FBDF54" opacity="0.85" />
              <polygon
                points="102,132 110,174 152,188 110,200 102,244 94,200 52,188 94,174"
                fill="#FFFFFF"
                stroke="#FBDF54"
                strokeWidth="2"
              />
              <circle cx="102" cy="188" r="10" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </svg>
    );
  }
);

ChibiAvatar.displayName = 'ChibiAvatar';
