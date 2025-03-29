import Ingredient from "@/interfaces/Ingredient";
import { useState, type CSSProperties, type DragEvent, type ReactNode } from "react";

interface FridgeProps {
  children?: ReactNode;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  insideIngredients: Ingredient[];
  ingredientOnClick: (ingredient: Ingredient) => void;
}

function Fridge({ children, handleDrop, insideIngredients, ingredientOnClick }: FridgeProps) {
  const [leftDoorOpen, setLeftDoorOpen] = useState(false);

  // Grid layout constants
  const GRID_COLUMNS = 3;
  const GRID_CELL_WIDTH = 100;
  const GRID_CELL_HEIGHT = 100;

  const toggleDoor = () => {
    setLeftDoorOpen(!leftDoorOpen);
  };

  const leftDoorStyle: CSSProperties = {
    transition: "opacity 0.5s ease",
    opacity: leftDoorOpen ? 0 : 1,
  };

  return (
    // 클릭하면 좌측 문이 토글됩니다.
    <div className="relative w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 988 1038"
        style={{ overflow: "visible" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_191_1501)">
          <rect width="984" height="1828" rx="5" fill="#333333" />
          <rect x="0.5" y="0.5" width="983" height="1827" rx="4.5" stroke="black" />
        </g>
        {/* 왼쪽 도어 (애니메이션 적용) */}
        <g
          id="left-door"
          style={leftDoorStyle}
          filter="url(#filter1_d_191_1501)"
          onClick={toggleDoor}
        >
          <mask id="path-3-inside-1_191_1501" fill="white">
            <path d="M408 952H486V958H408V952Z" />
          </mask>
          <path d="M408 952H486V958H408V952Z" fill="#222222" />
          <path
            d="M408 952H486V958H408V952Z"
            fill="url(#paint0_linear_191_1501)"
            fillOpacity="0.35"
          />
          <path
            d="M486 958V959H487V958H486ZM408 958H407V959H408V958ZM485 952V958H487V952H485ZM486 957H408V959H486V957ZM409 958V952H407V958H409Z"
            fill="black"
            mask="url(#path-3-inside-1_191_1501)"
          />
        </g>
        <g
          id="left-door"
          style={leftDoorStyle}
          filter="url(#filter2_d_191_1501)"
          onClick={toggleDoor}
        >
          <mask id="path-5-inside-2_191_1501" fill="white">
            <path d="M418 952H435V955H418V952Z" />
          </mask>
          <path d="M418 952H435V955H418V952Z" fill="#222222" />
          <path
            d="M435 955V956H436V955H435ZM418 955H417V956H418V955ZM434 952V955H436V952H434ZM435 954H418V956H435V954ZM419 955V952H417V955H419Z"
            fill="black"
            mask="url(#path-5-inside-2_191_1501)"
          />
        </g>
        <g
          id="left-door"
          style={leftDoorStyle}
          filter="url(#filter3_d_191_1501)"
          onClick={toggleDoor}
        >
          <mask id="path-7-inside-3_191_1501" fill="white">
            <path d="M458 952H475V955H458V952Z" />
          </mask>
          <path d="M458 952H475V955H458V952Z" fill="#222222" />
          <path
            d="M475 955V956H476V955H475ZM458 955H457V956H458V955ZM474 952V955H476V952H474ZM475 954H458V956H475V954ZM459 955V952H457V955H459Z"
            fill="black"
            mask="url(#path-7-inside-3_191_1501)"
          />
        </g>
        <g id="left-door" style={leftDoorStyle} filter="url(#filter4_di_191_1501)">
          <rect x="7" y="7" width="482" height="945" fill="white" />
          <rect x="7" y="7" width="482" height="945" fill="url(#paint1_linear_191_1501)" />
          <rect x="7.5" y="7.5" width="481" height="944" stroke="black" />
        </g>
        <g
          id="open-door"
          style={{
            transition: "opacity 0.5s ease",
            opacity: leftDoorOpen ? 1 : 0,
            pointerEvents: "none",
          }}
          transform="translate(489,952)"
        >
          <image
            href="/src/assets/bespoke-opened-crop.png"
            width="100%"
            height="100%"
            transform="translate(-870, -1040)"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
        {leftDoorOpen && (
          <foreignObject
            x="280"
            y="300"
            width="400"
            height="500"
            transform="translate(-100, -100)"
            style={{ pointerEvents: "all" }}
          >
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${GRID_CELL_WIDTH}px)`,
                gap: "10px",
                padding: "20px",
              }}
            >
              {insideIngredients.map((item) => (
                <div
                  key={`${item.ingredient_id}`}
                  onClick={() => ingredientOnClick(item)}
                  style={{
                    width: `${GRID_CELL_WIDTH}px`,
                    height: `${GRID_CELL_HEIGHT}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  className="hover:bg-blue-400"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </foreignObject>
        )}
        {/* 왼쪽 도어 끝 */}
        <g filter="url(#filter5_d_191_1501)">
          <mask id="path-11-inside-4_191_1501" fill="white">
            <path d="M7 959.039H489V984.554H7V959.039Z" />
          </mask>
          <path d="M7 959.039H489V984.554H7V959.039Z" fill="#333333" />
          <path
            d="M7 959.039H489V984.554H7V959.039Z"
            fill="url(#paint2_linear_191_1501)"
            fillOpacity="0.2"
          />
          <path
            d="M489 959.039H490V958.039H489V959.039ZM7 960.039H489V958.039H7V960.039ZM488 959.039V984.554H490V959.039H488Z"
            fill="black"
            mask="url(#path-11-inside-4_191_1501)"
          />
        </g>
        <g filter="url(#filter6_d_191_1501)">
          <mask id="path-13-inside-5_191_1501" fill="white">
            <path d="M7 952H94V984.554H7V952Z" />
          </mask>
          <path d="M7 952H94V984.554H7V952Z" fill="#222222" />
          <path
            d="M7 952H94V984.554H7V952Z"
            fill="url(#paint3_linear_191_1501)"
            fillOpacity="0.35"
          />
          <path
            d="M8 984.554V952H6V984.554H8Z"
            fill="black"
            mask="url(#path-13-inside-5_191_1501)"
          />
        </g>
        <g filter="url(#filter7_i_191_1501)">
          <rect x="7" y="984.554" width="482" height="831.446" fill="white" />
          <rect
            x="7"
            y="984.554"
            width="482"
            height="831.446"
            fill="url(#paint4_linear_191_1501)"
          />
        </g>
        <rect x="7.5" y="985.054" width="481" height="830.446" stroke="black" />
        <g filter="url(#filter8_d_191_1501)">
          <mask id="path-17-inside-6_191_1501" fill="white">
            <path d="M492 959.919H974V985.434H492V959.919Z" />
          </mask>
          <path d="M492 959.919H974V985.434H492V959.919Z" fill="#333333" />
          <path
            d="M492 959.919H974V985.434H492V959.919Z"
            fill="url(#paint5_linear_191_1501)"
            fillOpacity="0.2"
          />
          <path
            d="M492 959.919V958.919H491V959.919H492ZM492 960.919H974V958.919H492V960.919ZM493 985.434V959.919H491V985.434H493Z"
            fill="black"
            mask="url(#path-17-inside-6_191_1501)"
          />
        </g>
        <g filter="url(#filter9_d_191_1501)">
          <mask id="path-19-inside-7_191_1501" fill="white">
            <path d="M887 952H974V984.554H887V952Z" />
          </mask>
          <path d="M887 952H974V984.554H887V952Z" fill="#222222" />
          <path
            d="M887 952H974V984.554H887V952Z"
            fill="url(#paint6_linear_191_1501)"
            fillOpacity="0.35"
          />
          <path
            d="M973 952V984.554H975V952H973Z"
            fill="black"
            mask="url(#path-19-inside-7_191_1501)"
          />
        </g>
        <g filter="url(#filter10_i_191_1501)">
          <rect x="492" y="984.554" width="482" height="831.446" fill="white" />
          <rect
            x="492"
            y="984.554"
            width="482"
            height="831.446"
            fill="url(#paint7_linear_191_1501)"
          />
        </g>
        <rect x="492.5" y="985.054" width="481" height="830.446" stroke="black" />
        <g filter="url(#filter11_d_191_1501)">
          <mask id="path-23-inside-8_191_1501" fill="white">
            <path d="M495 952H573V958H495V952Z" />
          </mask>
          <path d="M495 952H573V958H495V952Z" fill="#222222" />
          <path
            d="M495 952H573V958H495V952Z"
            fill="url(#paint8_linear_191_1501)"
            fillOpacity="0.35"
          />
          <path
            d="M573 958V959H574V958H573ZM495 958H494V959H495V958ZM572 952V958H574V952H572ZM573 957H495V959H573V957ZM496 958V952H494V958H496Z"
            fill="black"
            mask="url(#path-23-inside-8_191_1501)"
          />
        </g>
        <g filter="url(#filter12_d_191_1501)">
          <mask id="path-25-inside-9_191_1501" fill="white">
            <path d="M506 952H523V955H506V952Z" />
          </mask>
          <path d="M506 952H523V955H506V952Z" fill="#222222" />
          <path
            d="M523 955V956H524V955H523ZM506 955H505V956H506V955ZM522 952V955H524V952H522ZM523 954H506V956H523V954ZM507 955V952H505V955H507Z"
            fill="black"
            mask="url(#path-25-inside-9_191_1501)"
          />
        </g>
        <g filter="url(#filter13_d_191_1501)">
          <mask id="path-27-inside-10_191_1501" fill="white">
            <path d="M546 952H563V955H546V952Z" />
          </mask>
          <path d="M546 952H563V955H546V952Z" fill="#222222" />
          <path
            d="M563 955V956H564V955H563ZM546 955H545V956H546V955ZM562 952V955H564V952H562ZM563 954H546V956H563V954ZM547 955V952H545V955H547Z"
            fill="black"
            mask="url(#path-27-inside-10_191_1501)"
          />
        </g>
        <g filter="url(#filter14_di_191_1501)">
          <rect x="492" y="7" width="482" height="945" fill="white" />
          <rect x="492" y="7" width="482" height="945" fill="url(#paint9_linear_191_1501)" />
          <rect x="492.5" y="7.5" width="481" height="944" stroke="black" />
        </g>
        {/* 오른쪽 도어에 children 렌더링 */}
        <foreignObject
          x="492"
          y="7"
          width="482"
          height="945"
          style={{ background: "none", fill: "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              background: "none",
              backgroundColor: "transparent",
            }}
          >
            {children}
          </div>
        </foreignObject>
        <defs>
          <filter
            id="filter0_d_191_1501"
            x="-4"
            y="0"
            width="992"
            height="1836"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_d_191_1501"
            x="404"
            y="952"
            width="86"
            height="14"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter2_d_191_1501"
            x="414"
            y="952"
            width="25"
            height="11"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter3_d_191_1501"
            x="454"
            y="952"
            width="25"
            height="11"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter4_di_191_1501"
            x="3"
            y="7"
            width="490"
            height="953"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_191_1501" />
          </filter>
          <filter
            id="filter5_d_191_1501"
            x="3"
            y="959.039"
            width="490"
            height="33.5153"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter6_d_191_1501"
            x="3"
            y="952"
            width="95"
            height="40.554"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter7_i_191_1501"
            x="7"
            y="984.554"
            width="482"
            height="835.446"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_191_1501" />
          </filter>
          <filter
            id="filter8_d_191_1501"
            x="488"
            y="959.919"
            width="490"
            height="33.5153"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter9_d_191_1501"
            x="883"
            y="952"
            width="95"
            height="40.554"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter10_i_191_1501"
            x="492"
            y="984.554"
            width="482"
            height="835.446"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_191_1501" />
          </filter>
          <filter
            id="filter11_d_191_1501"
            x="491"
            y="952"
            width="86"
            height="14"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter12_d_191_1501"
            x="502"
            y="952"
            width="25"
            height="11"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter13_d_191_1501"
            x="542"
            y="952"
            width="25"
            height="11"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
          </filter>
          <filter
            id="filter14_di_191_1501"
            x="488"
            y="7"
            width="490"
            height="953"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_191_1501" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_191_1501"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_191_1501" />
          </filter>
          <linearGradient
            id="paint0_linear_191_1501"
            x1="486"
            y1="955"
            x2="408"
            y2="955"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#AAAAAA" />
            <stop offset="0.2" stopColor="#222222" />
            <stop offset="0.5" stopColor="#AAAAAA" />
            <stop offset="0.8" stopColor="#222222" />
            <stop offset="1" stopColor="#AAAAAA" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_191_1501"
            x1="451"
            y1="911"
            x2="60.0001"
            y2="181.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C9C9C9" stopOpacity="0.5" />
            <stop offset="0.361068" stopColor="#EEEEEE" stopOpacity="0.866667" />
            <stop offset="0.968094" stopColor="#F9F9F9" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_191_1501"
            x1="489"
            y1="971.796"
            x2="7"
            y2="971.796"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_191_1501"
            x1="94"
            y1="968.277"
            x2="7"
            y2="968.277"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#555555" />
            <stop offset="0.25" stopColor="white" />
            <stop offset="0.5" stopColor="#555555" />
            <stop offset="0.75" />
            <stop offset="1" stopColor="#222222" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_191_1501"
            x1="207"
            y1="1097"
            x2="371"
            y2="1770.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C9C9C9" stopOpacity="0.5" />
            <stop offset="0.435" stopColor="#E8E8E8" stopOpacity="0.820716" />
            <stop offset="0.785" stopColor="#F9F9F9" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_191_1501"
            x1="974"
            y1="972.676"
            x2="492"
            y2="972.676"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient
            id="paint6_linear_191_1501"
            x1="974"
            y1="968.277"
            x2="887"
            y2="968.277"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#222222" />
            <stop offset="0.255" />
            <stop offset="0.5" stopColor="#555555" />
            <stop offset="0.75" stopColor="white" />
            <stop offset="1" stopColor="#555555" />
          </linearGradient>
          <linearGradient
            id="paint7_linear_191_1501"
            x1="605.606"
            y1="1113.61"
            x2="713.893"
            y2="1742.89"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C9C9C9" stopOpacity="0.5" />
            <stop offset="0.52" stopColor="#E8E8E8" stopOpacity="0.820831" />
            <stop offset="0.87" stopColor="#F9F9F9" />
          </linearGradient>
          <linearGradient
            id="paint8_linear_191_1501"
            x1="573"
            y1="955"
            x2="495"
            y2="955"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#AAAAAA" />
            <stop offset="0.2" stopColor="#222222" />
            <stop offset="0.5" stopColor="#AAAAAA" />
            <stop offset="0.8" stopColor="#222222" />
            <stop offset="1" stopColor="#AAAAAA" />
          </linearGradient>
          <linearGradient
            id="paint9_linear_191_1501"
            x1="562.5"
            y1="123"
            x2="908.5"
            y2="795.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0187653" stopColor="#F9F9F9" stopOpacity="0.5" />
            <stop offset="0.239958" stopColor="#EEEEEE" stopOpacity="0.5" />
            <stop offset="0.767467" stopColor="#C9C9C9" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default Fridge;
