import fs from 'fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&amp;family=Outfit:wght@500;600;700&amp;display=swap');
      .meo-serif {
        font-family: 'Cormorant Garamond', 'Playfair Display', Didot, 'Bodoni MT', 'Times New Roman', serif;
        font-weight: 700;
      }
      .meo-sans {
        font-family: 'Outfit', 'Plus Jakarta Sans', 'Montserrat', 'Century Gothic', sans-serif;
        font-weight: 600;
      }
    </style>
  </defs>

  <!-- Background Canvas: Clean White -->
  <rect width="1000" height="1000" fill="#FFFFFF" rx="0"/>

  <!-- 1. LEFT ORGANIC BLOB (Mauve / Dusty Rose) -->
  <path
    d="M 285 288
       C 330 280, 395 315, 410 365
       C 425 410, 390 470, 450 515
       C 480 540, 460 585, 410 592
       C 340 602, 280 600, 210 575
       C 155 555, 140 495, 155 440
       C 170 380, 240 405, 245 350
       C 248 315, 255 292, 285 288 Z"
    fill="#C797AB"
  />

  <!-- 2. RIGHT ORGANIC BLOB (Slate Grey) -->
  <path
    d="M 545 555
       C 610 535, 735 525, 805 570
       C 870 610, 865 670, 845 715
       C 815 780, 715 775, 630 765
       C 560 755, 520 720, 528 660
       C 532 620, 500 570, 545 555 Z"
    fill="#A7A8AF"
  />

  <!-- 3. RECLINING WOMAN LINE-ART (Delicate black continuous contour) -->
  <g stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    
    <!-- Outstretched left leg & foot -->
    <path d="M 230 428
             C 245 427, 270 420, 305 410
             C 345 398, 368 375, 385 355
             C 410 325, 428 298, 442 288" />
    
    <!-- Foot contour on the left (toes pointing down-left) -->
    <path d="M 230 428
             C 238 435, 250 432, 265 425
             C 290 415, 335 408, 370 395" />
             
    <!-- Upper knee apex & outer thigh to hip -->
    <path d="M 442 288
             C 458 295, 475 330, 488 368
             C 498 398, 505 420, 510 432" />

    <!-- Second bent leg (resting with foot on top of M) -->
    <!-- Foot resting on M -->
    <path d="M 345 432
             C 350 428, 360 426, 372 432" />
    <path d="M 345 432
             C 348 420, 358 412, 370 410
             C 385 408, 395 385, 408 362
             C 420 340, 432 318, 440 292" />
             
    <!-- Inner thigh crease / shadow lines -->
    <path d="M 400 375 C 412 365, 435 348, 452 355" />
    <path d="M 470 380 C 478 395, 485 415, 492 428" />

    <!-- Torso: Buttocks, waist and arched back -->
    <path d="M 510 432
             C 525 432, 545 426, 575 426
             C 610 426, 635 425, 655 422" />

    <!-- Belly line & ribcage -->
    <path d="M 495 428
             C 508 424, 528 422, 545 423
             C 565 424, 578 422, 595 415
             C 615 408, 630 395, 642 380" />

    <!-- Breast contour & décolleté -->
    <path d="M 642 380
             C 650 372, 660 372, 668 378
             C 675 385, 680 398, 690 405" />
             
    <!-- Second breast swell -->
    <path d="M 662 372
             C 670 368, 682 372, 690 380" />

    <!-- Relaxed arm along the torso -->
    <path d="M 645 418
             C 630 422, 595 426, 560 426
             C 545 426, 535 428, 525 432" />

    <!-- Shoulder, nape and back of neck -->
    <path d="M 655 422
             C 672 420, 690 415, 708 412
             C 722 410, 735 412, 745 418" />

    <!-- Clavicle / throat line -->
    <path d="M 690 405
             C 705 406, 720 402, 732 396" />

    <!-- Profile: Throat to chin, lips, nose, forehead -->
    <path d="M 732 396
             C 738 392, 744 390, 748 388
             C 752 385, 755 385, 758 388
             C 760 390, 762 395, 760 400" />

    <!-- Hair flowing back and down over the letter O -->
    <path d="M 758 388
             C 768 398, 782 410, 800 422
             C 815 432, 828 440, 835 448" />

    <!-- Under-curve of hair -->
    <path d="M 745 418
             C 760 422, 780 430, 805 438
             C 820 442, 830 446, 835 448" />

    <!-- Internal hair strands for texture -->
    <path d="M 765 408 C 785 420, 810 432, 825 442" />
    <path d="M 750 415 C 770 424, 795 434, 818 444" />
  </g>

  <!-- 4. "MEO" SERIF HEADLINE -->
  <g fill="#000000">
    <!-- M -->
    <path d="
      M 202 432 L 254 432 L 254 438 L 238 438 L 238 614 L 256 614 L 256 620 L 202 620 L 202 614 L 220 614 L 220 438 L 202 438 Z
      M 220 438 L 325 618 L 332 618 L 436 438 L 418 438 L 418 432 L 452 432 L 452 438 L 436 438 L 436 614 L 452 614 L 452 620 L 398 620 L 398 614 L 416 614 L 416 450 L 334 620 L 322 620 L 238 450 L 238 438 Z
    " />
    <!-- E -->
    <path d="
      M 472 432 L 576 432 L 576 466 L 568 466 L 565 444 L 508 444 L 508 518 L 558 518 L 558 530 L 508 530 L 508 608 L 572 608 L 576 584 L 584 584 L 584 620 L 472 620 L 472 614 L 490 614 L 490 438 L 472 438 Z
    " />
    <!-- O -->
    <path d="
      M 716 430
      C 778 430, 816 476, 816 526
      C 816 576, 778 622, 716 622
      C 654 622, 616 576, 616 526
      C 616 476, 654 430, 716 430 Z
      M 716 436
      C 674 436, 648 476, 648 526
      C 648 576, 674 616, 716 616
      C 758 616, 784 576, 784 526
      C 784 476, 758 436, 716 436 Z
    " />
  </g>

  <!-- 5. SUBTITLE TEXT (Centered uppercase sans-serif) -->
  <text
    x="500"
    y="682"
    text-anchor="middle"
    class="meo-sans"
    font-size="34"
    font-weight="600"
    letter-spacing="0.04em"
    fill="#000000"
  >СТУДИЯ КОРРЕКЦИИ ФИГУРЫ И</text>

  <text
    x="500"
    y="728"
    text-anchor="middle"
    class="meo-sans"
    font-size="34"
    font-weight="600"
    letter-spacing="0.04em"
    fill="#000000"
  >ЭСТЕТИЧЕСКОЙ КОСМЕТОЛОГИИ</text>
</svg>`;

fs.writeFileSync('/tmp/test_logo.svg', svg);
console.log('SVG written successfully');
