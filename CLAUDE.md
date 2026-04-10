# NB Tower — Website Project Brief for Claude Code

## პროექტის მიზანი
NB Tower სამშენებლო კომპანიისთვის პრემიუმ კორპორატიული ვებსაიტი.
საიტი demo-სთვის არის — კომპანიის მფლობელებს საიტის ნახვის შემდეგ უნდა ჰქონდეთ სურვილი შეიძინონ.
ვიზუალური ხარისხი უნდა იყოს საერთაშორისო სამშენებლო ბრენდების დონეზე.

---

## ტექნოლოგია
- **Stack:** HTML5 + CSS3 + Vanilla JS — სტატიკური, build tool არ სჭირდება
- **ფაილები:** index.html, style.css, script.js
- **Fonts (Google Fonts CDN):**
  - Display: Bebas Neue (EN headings) + Noto Sans Georgian (KA)
  - Body: DM Sans (EN) + Noto Sans Georgian (KA)
- **Icons:** Font Awesome 6 CDN
- No frameworks. No dependencies beyond CDN links.

---

## ბრენდი

### ლოგო
- ლოგო ფაილი: assets/logo.png
- თეთრი NB სიმბოლო (skyline) მწვანე კვადრატულ ფონზე — flat design, არა gradient
- Header-ში: ლოგო პირდაპირ გამოჩნდეს (მუქ ფონზე კარგად ჩანს მწვანე ფონით)

### ბრენდის ფერები
```css
:root {
  /* Primary Brand Color */
  --green: #3DBE6C;
  --green-dark: #2EA055;
  --green-light: #4FD47E;
  --white: #FFFFFF;

  /* Backgrounds — მუქი თიმი, მწვანე accent-ებით */
  --bg-base: #0A0A0A;
  --bg-section: #0F0F0F;
  --bg-card: #141414;
  --bg-card-hover: #1A1A1A;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #9A9A9A;
  --text-muted: #555555;

  /* Borders & Glow */
  --border: rgba(61, 190, 108, 0.15);
  --border-hover: rgba(61, 190, 108, 0.5);
  --glow: 0 0 40px rgba(61, 190, 108, 0.2);
  --glow-strong: 0 0 60px rgba(61, 190, 108, 0.35);

  /* Utility */
  --gradient-green: linear-gradient(135deg, #3DBE6C 0%, #2EA055 100%);
  --gradient-dark: linear-gradient(180deg, #0A0A0A 0%, #111111 100%);
}
```

### ბრენდის ხასიათი
- მუქი ფონი + მწვანე (#3DBE6C) accent — სუფთა, პრემიუმ
- არა gradient logo/brand — solid მწვანე
- სერიოზული, სანდო, ამბიციური
- ანიმაციები: smooth, მიზანმიმართული

### ღილაკების სტილი
```css
/* Primary CTA */
.btn-primary {
  background: #3DBE6C;
  color: #000000;
  font-weight: 700;
}
.btn-primary:hover {
  background: #4FD47E;
  box-shadow: 0 0 30px rgba(61, 190, 108, 0.4);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  border: 1.5px solid #3DBE6C;
  color: #3DBE6C;
}
.btn-secondary:hover {
  background: rgba(61, 190, 108, 0.08);
}
```

---

## ენა
ორენოვანი: ქართული (default) + ინგლისური

### იმპლემენტაცია
```html
<button id="lang-toggle">GE | EN</button>
<span data-ka="ქართული ტექსტი" data-en="English text"></span>
```

```js
const setLang = (lang) => {
  document.querySelectorAll('[data-ka]').forEach(el => {
    el.textContent = lang === 'ka' ? el.dataset.ka : el.dataset.en;
  });
  localStorage.setItem('lang', lang);
};
```

---

## სექციები

### 1. HEADER / NAV
- Fixed, transparent → scrollზე rgba(10,10,10,0.96) + backdrop-filter: blur(12px)
- მარცხნივ: ლოგო (assets/logo.png), height: 44px
- შუაში: nav links (smooth scroll)
- მარჯვნივ: ენის toggle + primary CTA ღილაკი ("დაგვიკავშირდით" / "Contact Us")
- Mobile: hamburger menu (animated → X), მწვანე accent

Nav links: ჩვენს შესახებ/About | პროექტები/Projects | სერვისები/Services | გუნდი/Team | კონტაქტი/Contact

---

### 2. HERO SECTION
- 100vh
- Background: მუქი (#0A0A0A) + მარჯვნივ CSS geometric skyline სილუეტი მწვანე stroke-ებით
- მარცხნივ gradient overlay ტექსტისთვის

Content:
- KA სათაური: "ვაშენებთ მომავალს დღეს"
- EN სათაური: "Building Tomorrow, Today"
- KA subline: "საქართველოს წამყვანი სამშენებლო კომპანია — საცხოვრებელი და კომერციული პროექტები უმაღლესი ხარისხით"
- EN subline: "Georgia's premier construction company delivering residential and commercial excellence"

CTA:
- Primary (#3DBE6C bg, შავი ტექსტი): "პროექტების ნახვა" / "View Projects"
- Secondary (outline მწვანე): "დაგვიკავშირდით" / "Get in Touch"

Animations:
- Text: staggered fade-in + slide-up on load
- Background: subtle animated geometric lines (CSS keyframes, მწვანე opacity 0.08)
- Scrolling indicator arrow (bouncing, მწვანე)

---

### 3. STATS SECTION
- bg-section ფონი, 4 stat ბარათი horizontal
- count-up animation on scroll (Intersection Observer)

- 50+ | დასრულებული პროექტი / Completed Projects
- 200+ | კმაყოფილი კლიენტი / Happy Clients
- 10+ | გამოცდილების წელი / Years of Experience
- 150,000+ | აშენებული ფართი კვ.მ / sqm Built

ციფრები: color #3DBE6C
Dividers: 1px solid rgba(61,190,108,0.2) ბარათებს შორის

---

### 4. ABOUT SECTION
- 2-column: მარცხნივ ტექსტი, მარჯვნივ CSS abstract building visual
- სათაურის მარცხნივ: 3px solid #3DBE6C accent line

- KA სათაური: "ვინ ვართ ჩვენ"
- EN სათაური: "Who We Are"
- KA: "NB Tower არის საქართველოში დაფუძნებული სამშენებლო კომპანია, რომელიც სპეციალიზირებულია საცხოვრებელი კომპლექსებისა და კომერციული სივრცეების განვითარებაში. ჩვენი გუნდი აერთიანებს ინჟინრებს, არქიტექტორებს და მენეჯერებს."
- EN: "NB Tower is a Tbilisi-based construction and development company specializing in residential complexes and commercial real estate. Our team of engineers, architects and managers delivers exceptional quality."

---

### 5. SERVICES SECTION
- KA: "ჩვენი სერვისები" | EN: "Our Services"
- 3-column card grid
- hover: border 1px solid #3DBE6C + glow + translateY(-6px)

6 ბარათი (FA icon მწვანე + სათაური + მოკლე აღწერა):
- fa-building | საცხოვრებელი კომპლექსები / Residential Complexes
- fa-city | კომერციული სივრცეები / Commercial Spaces
- fa-hard-hat | გენერალური კონტრაქტინგი / General Contracting
- fa-drafting-compass | არქიტექტურული დიზაინი / Architectural Design
- fa-tasks | პროექტის მენეჯმენტი / Project Management
- fa-leaf | მდგრადი მშენებლობა / Sustainable Building

---

### 6. PROJECTS SECTION
- KA: "ჩვენი პროექტები" | EN: "Our Projects"
- Filter tabs: ყველა/All | საცხოვრებელი/Residential | კომერციული/Commercial
  - Active tab: #3DBE6C bg, შავი ტექსტი
- 3-column grid
- Card: მუქი placeholder (CSS gradient) + hover: overlay slides up

6 demo პროექტი:
- NB Residence I | Residential | თბილისი | დასრულებული/Completed
- NB Business Center | Commercial | თბილისი | დასრულებული/Completed
- NB Residence II | Residential | ბათუმი | მიმდინარე/Ongoing
- NB Plaza | Commercial | თბილისი | დასრულებული/Completed
- NB Garden Towers | Residential | მცხეთა | მიმდინარე/Ongoing
- NB Logistics Hub | Commercial | რუსთავი | დასრულებული/Completed

Badge: "დასრულებული" — #3DBE6C | "მიმდინარე" — outline მწვანე

---

### 7. WHY US SECTION
- KA: "რატომ NB Tower" | EN: "Why Choose NB Tower"
- 2-column icon list
- Icon: მწვანე checkmark circle

- 10+ წლის გამოცდილება / 10+ Years of Experience
- ევროპული ხარისხის სტანდარტები / European Quality Standards
- პროექტის ვადებში ჩაბარება / On-Time Delivery Guarantee
- გამჭვირვალე ფასწარმოება / Transparent Pricing
- სრული გარანტია ყველა პროექტზე / Full Project Warranty
- გამოცდილი საინჟინრო გუნდი / Expert Engineering Team

---

### 8. TEAM SECTION
- KA: "ჩვენი გუნდი" | EN: "Our Team"
- 4-column cards
- Avatar: #3DBE6C circle + თეთრი ინიციალები
- hover: border 1px solid #3DBE6C

- ნიკა ბ. | აღმასრულებელი დირექტორი / CEO & Founder
- გიორგი მ. | მთავარი ინჟინერი / Chief Engineer
- ანა კ. | არქიტექტურის ხელმძღვანელი / Architecture Lead
- დავით ს. | პროექტის მენეჯერი / Project Manager

---

### 9. TESTIMONIALS SECTION
- KA: "კლიენტების შეფასება" | EN: "What Our Clients Say"
- Auto-sliding carousel (3s interval), dot navigation
- 5 მწვანე ვარსკვლავი თითოეულ ბარათზე

3 testimonial:
1. "NB Tower-მა ჩვენი ბინა ვადაში ჩაგვაბარა. ხარისხი მოლოდინს სცდებოდა." — მარიამ გ., NB Residence I
2. "პროფესიონალური გუნდი, გამჭვირვალე პროცესი. ყველაფერი ზუსტად ისე გამოვიდა, როგორც შევთანხმდით." — ლევან ა., NB Business Center
3. "საუკეთესო სამშენებლო კომპანია, ვისთანაც მიმუშავია." — ნინო ბ., NB Garden Towers

---

### 10. CONTACT SECTION
- KA: "დაგვიკავშირდით" | EN: "Get in Touch"
- 2-column: info მარცხნივ, form მარჯვნივ

Info:
- 📍 თბილისი, საქართველო / Tbilisi, Georgia
- 📞 +995 XXX XXX XXX
- ✉️ info@nbtower.ge
- 🕐 ორშ–პარ, 10:00–18:00 / Mon–Fri, 10:00–18:00

Form fields: სახელი | ელ-ფოსტა | ტელეფონი (optional) | შეტყობინება
Submit: #3DBE6C button, შავი ტექსტი | preventDefault() + success animation (demo)
Input focus: border-color #3DBE6C + glow

---

### 11. FOOTER
- 3 columns: ლოგო + აღწერა | nav links | სოც. მედია
- სოც. მედია icons (Facebook, Instagram, LinkedIn) — hover: #3DBE6C
- "© 2025 NB Tower. ყველა უფლება დაცულია. / All rights reserved."

---

## ანიმაციები

### Page Load
- Hero: staggered fade-in + translateY(30px→0), 0.1s delay between elements

### Scroll (Intersection Observer, threshold: 0.15)
- სექციები: fade-in + slide-up
- Stats: count-up (2s, ease-out)
- Cards: staggered appear (0.08s delay each)

### Hover
- Nav links: #3DBE6C underline slides from left
- Buttons: brightness(1.1) + scale(1.02)
- Cards: translateY(-6px) + green border glow
- Project cards: overlay slides up

### Header
- Smooth bg transition on scroll (0.3s)
- Active nav link: color #3DBE6C

---

## JS მოდულები (script.js)
1. Language Toggle + localStorage persist
2. Mobile Menu (hamburger → X)
3. Header Scroll Behavior
4. Smooth Scroll
5. Intersection Observer → section animations
6. Stats Count-up
7. Project Filter (show/hide by category)
8. Testimonials Carousel (auto + dots)
9. Contact Form Handler (demo success state)

---

## CSS სტრუქტურა (style.css)
1. CSS Variables
2. Reset & Base
3. Typography
4. Utility Classes (.btn-primary, .btn-secondary, .section-title, .accent-line)
5. Header & Nav
6. Hero
7. Stats
8. About
9. Services
10. Projects
11. Why Us
12. Team
13. Testimonials
14. Contact
15. Footer
16. Animations & Keyframes
17. Media Queries (768px, 1024px)

---

## Responsive
- Mobile (< 768px): 1 column, hamburger nav, hero centered
- Tablet (768–1024px): 2-column grids
- Desktop (> 1024px): full layout

---

## Claude Code-ის ინსტრუქცია

1. შექმენი 3 ფაილი: index.html, style.css, script.js
2. დაიწყე style.css — variables + base + utilities
3. შემდეგ index.html — სრული სტრუქტურა, data-ka/data-en ყველა ტექსტზე
4. ბოლოს script.js — ყველა მოდული
5. ხარისხი პრიორიტეტია — $5,000+ პროდუქტის შთაბეჭდილება
6. Placeholder content: რეალისტური (არა Lorem ipsum)
7. CSS geometric visuals სადაც სურათები არ არის
8. Brand color: #3DBE6C (მწვანე) — ყველგან consistent
