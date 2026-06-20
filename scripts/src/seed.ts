import { db, topicsTable, type InsertTopic } from "@workspace/db";

const topics: InsertTopic[] = [
  // ---------------- Mysteries ----------------
  {
    slug: "antikythera-mechanism",
    title: "The Antikythera Mechanism",
    category: "Mysteries",
    summary:
      "An ancient Greek geared device recovered from a shipwreck, often called the world's first analog computer.",
    controversy:
      "Debate rages over how a civilization 2,000 years ago built clockwork astronomy this sophisticated, and whether the knowledge was truly lost.",
    tags: ["ancient tech", "astronomy", "greece", "lost knowledge"],
    era: "c. 100 BCE",
    origin: "YouTube, Reddit",
    featured: true,
  },
  {
    slug: "voynich-manuscript",
    title: "The Voynich Manuscript",
    category: "Mysteries",
    summary:
      "A 15th-century book written in an unknown script with bizarre botanical and astronomical illustrations.",
    controversy:
      "No one has decoded it. Theories range from a lost language to an elaborate medieval hoax.",
    tags: ["cipher", "manuscript", "undeciphered", "medieval"],
    era: "Early 15th century",
    origin: "Reddit, YouTube",
    featured: true,
  },
  {
    slug: "dyatlov-pass-incident",
    title: "The Dyatlov Pass Incident",
    category: "Mysteries",
    summary:
      "Nine experienced hikers died mysteriously in the Ural Mountains in 1959 after fleeing their tent in the night.",
    controversy:
      "Official explanations clash with reports of radiation, strange injuries, and orange skies.",
    tags: ["unexplained death", "soviet", "mountains", "1959"],
    era: "1959",
    origin: "Reddit, YouTube",
    featured: true,
  },
  {
    slug: "bermuda-triangle",
    title: "The Bermuda Triangle",
    category: "Mysteries",
    summary:
      "A region of the Atlantic linked to the disappearance of ships and aircraft.",
    controversy:
      "Skeptics say the disappearance rate is normal; believers cite magnetic anomalies and stranger forces.",
    tags: ["disappearances", "ocean", "aviation", "anomaly"],
    era: "20th century",
    origin: "YouTube, TikTok",
    featured: false,
  },
  {
    slug: "tunguska-event",
    title: "The Tunguska Event",
    category: "Mysteries",
    summary:
      "A massive 1908 explosion flattened 800 square miles of Siberian forest with no clear crater.",
    controversy:
      "Was it an air-bursting meteor, a comet fragment, or something far stranger?",
    tags: ["explosion", "siberia", "meteor", "1908"],
    era: "1908",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "wow-signal",
    title: "The Wow! Signal",
    category: "Mysteries",
    summary:
      "A strong, 72-second narrowband radio signal detected in 1977 that has never repeated.",
    controversy:
      "It remains the best candidate for an extraterrestrial transmission and has never been explained.",
    tags: ["seti", "radio", "aliens", "1977"],
    era: "1977",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "taos-hum",
    title: "The Taos Hum",
    category: "Mysteries",
    summary:
      "A persistent low-frequency humming heard by some residents of Taos, New Mexico.",
    controversy:
      "Only a fraction of people hear it, and no acoustic source has ever been confirmed.",
    tags: ["sound", "anomaly", "new mexico"],
    era: "1990s-present",
    origin: "Reddit",
    featured: false,
  },
  {
    slug: "mary-celeste",
    title: "The Mary Celeste",
    category: "Mysteries",
    summary:
      "A merchant ship found adrift in 1872, seaworthy and stocked, but with its entire crew vanished.",
    controversy:
      "From mutiny to waterspouts to alcohol fumes, no theory fully fits the evidence.",
    tags: ["ghost ship", "ocean", "1872", "disappearance"],
    era: "1872",
    origin: "YouTube",
    featured: false,
  },

  // ---------------- Places ----------------
  {
    slug: "great-pyramid-construction",
    title: "Who Built the Great Pyramid",
    category: "Places",
    summary:
      "The Great Pyramid of Giza was built with astonishing precision around 2560 BCE.",
    controversy:
      "Mainstream archaeology credits Egyptian labor, while popular theories invoke lost civilizations or impossible technology.",
    tags: ["egypt", "ancient", "engineering", "pyramids"],
    era: "c. 2560 BCE",
    origin: "YouTube, TikTok",
    featured: true,
  },
  {
    slug: "gobekli-tepe",
    title: "Göbekli Tepe",
    category: "Places",
    summary:
      "An 11,000-year-old megalithic site in Turkey that predates agriculture and pottery.",
    controversy:
      "It upended the timeline of civilization and fuels debate about a forgotten advanced culture.",
    tags: ["megalith", "turkey", "neolithic", "archaeology"],
    era: "c. 9500 BCE",
    origin: "Reddit, YouTube",
    featured: true,
  },
  {
    slug: "atlantis",
    title: "Atlantis",
    category: "Places",
    summary:
      "Plato's account of an advanced island civilization that sank beneath the sea.",
    controversy:
      "Scholars call it allegory; enthusiasts hunt for it from the Mediterranean to Antarctica.",
    tags: ["lost city", "plato", "ocean", "legend"],
    era: "Antiquity (legend)",
    origin: "YouTube, TikTok",
    featured: true,
  },
  {
    slug: "tartarian-empire",
    title: "The Tartarian Empire Theory",
    category: "Places",
    summary:
      "An online theory claiming a vast advanced empire was erased from history and its architecture rebranded.",
    controversy:
      "It reinterprets world's fairs and grand buildings as relics of a hidden civilization — widely debunked but viral.",
    tags: ["alt history", "architecture", "internet theory"],
    era: "Alleged 1800s",
    origin: "TikTok, YouTube",
    featured: false,
  },
  {
    slug: "nazca-lines",
    title: "The Nazca Lines",
    category: "Places",
    summary:
      "Enormous geoglyphs etched into the Peruvian desert, only fully visible from the air.",
    controversy:
      "Why create art no one on the ground could see? Explanations span ritual, astronomy, and ancient aliens.",
    tags: ["geoglyphs", "peru", "ancient", "aerial"],
    era: "500 BCE - 500 CE",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "area-51",
    title: "Area 51",
    category: "Places",
    summary:
      "A highly classified U.S. Air Force facility in the Nevada desert.",
    controversy:
      "Officially a flight-test site, it is the epicenter of UFO and reverse-engineering conspiracy lore.",
    tags: ["military", "ufo", "secret base", "nevada"],
    era: "1955-present",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "bermuda-bimini-road",
    title: "The Bimini Road",
    category: "Places",
    summary:
      "An underwater rock formation near the Bahamas arranged in a strikingly linear pattern.",
    controversy:
      "Geologists call it natural beachrock; others see a man-made road from a sunken civilization.",
    tags: ["underwater", "bahamas", "atlantis", "geology"],
    era: "Discovered 1968",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "denver-airport",
    title: "Denver International Airport",
    category: "Places",
    summary:
      "A sprawling airport filled with unusual murals, a blue horse statue, and odd dedication markers.",
    controversy:
      "Its art and symbolism have spawned theories about secret bunkers and shadowy organizations.",
    tags: ["conspiracy", "architecture", "symbolism", "usa"],
    era: "Opened 1995",
    origin: "TikTok, Reddit",
    featured: false,
  },
  {
    slug: "skinwalker-ranch",
    title: "Skinwalker Ranch",
    category: "Places",
    summary:
      "A Utah ranch reported as a hotspot for UFOs, cattle mutilations, and paranormal events.",
    controversy:
      "Featured in TV series and government-adjacent studies, yet hard evidence remains elusive.",
    tags: ["paranormal", "ufo", "utah", "ranch"],
    era: "1990s-present",
    origin: "YouTube, Reddit",
    featured: false,
  },

  // ---------------- People ----------------
  {
    slug: "nikola-tesla",
    title: "Nikola Tesla's Lost Inventions",
    category: "People",
    summary:
      "The visionary inventor whose papers were seized by the U.S. government after his death in 1943.",
    controversy:
      "Claims persist of suppressed free-energy devices, death rays, and wireless power.",
    tags: ["inventor", "free energy", "suppressed tech", "electricity"],
    era: "1856-1943",
    origin: "YouTube, Reddit",
    featured: true,
  },
  {
    slug: "shakespeare-authorship",
    title: "The Shakespeare Authorship Question",
    category: "People",
    summary:
      "The debate over whether William Shakespeare actually wrote the works attributed to him.",
    controversy:
      "Candidates from Francis Bacon to the Earl of Oxford are proposed as the 'real' author.",
    tags: ["literature", "authorship", "history", "theatre"],
    era: "16th-17th century",
    origin: "Reddit",
    featured: false,
  },
  {
    slug: "dorothy-kilgallen",
    title: "The Death of Dorothy Kilgallen",
    category: "People",
    summary:
      "A famous journalist who died in 1965 while investigating the JFK assassination.",
    controversy:
      "Her notes vanished and her death was ruled accidental, fueling claims she was silenced.",
    tags: ["journalist", "jfk", "mysterious death", "1965"],
    era: "1965",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "rasputin",
    title: "Grigori Rasputin",
    category: "People",
    summary:
      "The mystic who held sway over the Russian royal family and was famously hard to kill.",
    controversy:
      "Accounts of poisoning, shooting, and drowning blur the line between history and legend.",
    tags: ["russia", "mystic", "royalty", "assassination"],
    era: "1869-1916",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "db-cooper",
    title: "D.B. Cooper",
    category: "People",
    summary:
      "A hijacker who parachuted from a plane in 1971 with $200,000 and was never found.",
    controversy:
      "Decades of suspects and a partial money recovery have never cracked America's only unsolved skyjacking.",
    tags: ["hijacking", "unsolved", "fbi", "1971"],
    era: "1971",
    origin: "Reddit, YouTube",
    featured: true,
  },
  {
    slug: "zodiac-killer",
    title: "The Zodiac Killer",
    category: "People",
    summary:
      "A serial killer who taunted Bay Area police with cryptic ciphers in the late 1960s.",
    controversy:
      "The identity remains officially unknown despite one cipher being cracked decades later.",
    tags: ["serial killer", "cipher", "unsolved", "california"],
    era: "1960s-70s",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "anastasia-romanov",
    title: "The Survival of Anastasia Romanov",
    category: "People",
    summary:
      "Rumors that the youngest Romanov daughter survived the 1918 execution of the Russian royal family.",
    controversy:
      "Impostors like Anna Anderson kept the legend alive until DNA finally settled it — or did it?",
    tags: ["russia", "royalty", "identity", "1918"],
    era: "1918",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "kaspar-hauser",
    title: "Kaspar Hauser",
    category: "People",
    summary:
      "A teenage boy who appeared in 1828 Germany claiming to have grown up in total isolation.",
    controversy:
      "His origins and violent death remain unexplained, with theories of royal lineage and conspiracy.",
    tags: ["mystery", "germany", "identity", "1828"],
    era: "1828-1833",
    origin: "Reddit",
    featured: false,
  },

  // ---------------- Inventions ----------------
  {
    slug: "free-energy-suppression",
    title: "Suppressed Free-Energy Devices",
    category: "Inventions",
    summary:
      "The recurring claim that working perpetual-motion or zero-point energy machines have been hidden.",
    controversy:
      "Physics says they're impossible; a vibrant subculture insists inventors are silenced by industry.",
    tags: ["free energy", "physics", "suppressed tech"],
    era: "20th-21st century",
    origin: "YouTube, TikTok",
    featured: false,
  },
  {
    slug: "phoebus-cartel",
    title: "The Phoebus Cartel & Planned Obsolescence",
    category: "Inventions",
    summary:
      "A 1920s cartel of lightbulb makers that allegedly agreed to shorten bulb lifespans.",
    controversy:
      "It's cited as proof products are deliberately designed to fail — how far does the practice really go?",
    tags: ["planned obsolescence", "lightbulbs", "cartel", "economics"],
    era: "1924-1939",
    origin: "YouTube, Reddit",
    featured: false,
  },
  {
    slug: "greek-fire",
    title: "Greek Fire",
    category: "Inventions",
    summary:
      "A Byzantine incendiary weapon that burned even on water and terrified enemies.",
    controversy:
      "Its exact formula was such a guarded secret that it was lost entirely and never reconstructed.",
    tags: ["weapon", "byzantine", "lost recipe", "fire"],
    era: "7th century CE",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "roman-concrete",
    title: "Roman Concrete",
    category: "Inventions",
    summary:
      "Ancient Roman concrete that has outlasted modern mixes for two millennia, especially in seawater.",
    controversy:
      "How did Romans make self-healing concrete we only recently began to understand?",
    tags: ["materials", "rome", "engineering", "lost knowledge"],
    era: "Ancient Rome",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "damascus-steel",
    title: "Damascus Steel",
    category: "Inventions",
    summary:
      "Legendary patterned blades renowned for sharpness and strength, made from wootz steel.",
    controversy:
      "The original production technique was lost around the 18th century and is still debated.",
    tags: ["metallurgy", "blades", "lost recipe", "history"],
    era: "Pre-18th century",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "starlite-material",
    title: "Starlite",
    category: "Inventions",
    summary:
      "A material invented by an amateur chemist said to withstand extreme heat, even a blowtorch.",
    controversy:
      "Its inventor died without revealing the formula, leaving its true capabilities disputed.",
    tags: ["material", "heat resistant", "secret formula"],
    era: "1980s-90s",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "baghdad-battery",
    title: "The Baghdad Battery",
    category: "Inventions",
    summary:
      "Clay jars with copper and iron components some believe could generate a small electric current.",
    controversy:
      "Were ancient people producing electricity, or are these simply storage vessels?",
    tags: ["ancient tech", "electricity", "archaeology", "mesopotamia"],
    era: "c. 250 BCE - 250 CE",
    origin: "YouTube",
    featured: false,
  },

  // ---------------- Events ----------------
  {
    slug: "jfk-assassination",
    title: "The JFK Assassination",
    category: "Events",
    summary:
      "President John F. Kennedy was shot in Dallas in 1963 — officially by a lone gunman.",
    controversy:
      "The 'magic bullet,' grassy knoll, and sealed files keep alternative theories alive 60 years later.",
    tags: ["assassination", "politics", "1963", "conspiracy"],
    era: "1963",
    origin: "YouTube, Reddit",
    featured: true,
  },
  {
    slug: "roswell-incident",
    title: "The Roswell Incident",
    category: "Events",
    summary:
      "A 1947 crash near Roswell, New Mexico, first reported as a 'flying disc' then called a weather balloon.",
    controversy:
      "The military's shifting explanations made it the cornerstone of modern UFO belief.",
    tags: ["ufo", "military", "1947", "cover-up"],
    era: "1947",
    origin: "YouTube, TikTok",
    featured: true,
  },
  {
    slug: "moon-landing-debate",
    title: "The Moon Landing Debate",
    category: "Events",
    summary:
      "The 1969 Apollo 11 mission that put humans on the Moon for the first time.",
    controversy:
      "Despite overwhelming evidence, a persistent minority claims the landings were staged.",
    tags: ["space", "apollo", "1969", "conspiracy"],
    era: "1969",
    origin: "YouTube, TikTok",
    featured: false,
  },
  {
    slug: "philadelphia-experiment",
    title: "The Philadelphia Experiment",
    category: "Events",
    summary:
      "An alleged 1943 Navy experiment that supposedly made a warship invisible — and teleported it.",
    controversy:
      "The Navy denies it ever happened, but the story endures as a tale of secret physics.",
    tags: ["navy", "teleportation", "1943", "conspiracy"],
    era: "1943",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "mandela-effect",
    title: "The Mandela Effect",
    category: "Events",
    summary:
      "Large groups of people sharing the same false memory, like a misremembered logo or quote.",
    controversy:
      "Psychologists cite memory errors; others suggest parallel realities or timeline shifts.",
    tags: ["memory", "psychology", "internet phenomenon"],
    era: "2010s-present",
    origin: "TikTok, Reddit",
    featured: true,
  },
  {
    slug: "tunguska-vs-meteor",
    title: "The Battle of Los Angeles",
    category: "Events",
    summary:
      "A 1942 anti-aircraft barrage over Los Angeles fired at an unidentified object during wartime panic.",
    controversy:
      "No enemy aircraft were confirmed, leaving the target's identity famously unresolved.",
    tags: ["wwii", "ufo", "1942", "military"],
    era: "1942",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "phoenix-lights",
    title: "The Phoenix Lights",
    category: "Events",
    summary:
      "A 1997 mass sighting of lights forming a giant V over Arizona, seen by thousands.",
    controversy:
      "Officials attributed it to flares, but witnesses describe a single silent craft.",
    tags: ["ufo", "arizona", "1997", "mass sighting"],
    era: "1997",
    origin: "YouTube, Reddit",
    featured: false,
  },

  // ---------------- Conspiracies ----------------
  {
    slug: "mk-ultra",
    title: "Project MK-Ultra",
    category: "Conspiracies",
    summary:
      "A real CIA mind-control program that conducted experiments on unwitting subjects.",
    controversy:
      "Most records were destroyed, leaving the program's true scope and victims unknown.",
    tags: ["cia", "mind control", "declassified", "ethics"],
    era: "1950s-1970s",
    origin: "Reddit, YouTube",
    featured: true,
  },
  {
    slug: "operation-paperclip",
    title: "Operation Paperclip",
    category: "Conspiracies",
    summary:
      "The secret U.S. program that recruited Nazi scientists after World War II.",
    controversy:
      "It raises hard questions about whitewashed war crimes traded for rocket and weapons expertise.",
    tags: ["wwii", "scientists", "government", "ethics"],
    era: "1945-1959",
    origin: "Reddit",
    featured: false,
  },
  {
    slug: "haarp",
    title: "HAARP",
    category: "Conspiracies",
    summary:
      "A real ionospheric research facility in Alaska studying the upper atmosphere.",
    controversy:
      "It's accused — without evidence — of weather control, mind control, and triggering disasters.",
    tags: ["weather", "alaska", "research", "conspiracy"],
    era: "1993-present",
    origin: "TikTok, YouTube",
    featured: false,
  },
  {
    slug: "denver-bohemian-grove",
    title: "Bohemian Grove",
    category: "Conspiracies",
    summary:
      "A secretive California retreat where powerful men gather for rituals and relaxation.",
    controversy:
      "Its private ceremonies fuel theories about elite decision-making behind closed doors.",
    tags: ["elites", "secret society", "california", "ritual"],
    era: "1872-present",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "georgia-guidestones",
    title: "The Georgia Guidestones",
    category: "Conspiracies",
    summary:
      "A granite monument inscribed with 'guidelines' for humanity, erected by an anonymous sponsor in 1980.",
    controversy:
      "Its depopulation-themed messages drew global theories; it was bombed and demolished in 2022.",
    tags: ["monument", "anonymous", "georgia", "depopulation"],
    era: "1980-2022",
    origin: "TikTok, YouTube",
    featured: false,
  },
  {
    slug: "dancing-plague",
    title: "The Dancing Plague of 1518",
    category: "Conspiracies",
    summary:
      "A documented outbreak in Strasbourg where people danced uncontrollably for days, some to death.",
    controversy:
      "Explanations range from ergot poisoning to mass psychogenic illness — none fully convince.",
    tags: ["mass hysteria", "1518", "medicine", "history"],
    era: "1518",
    origin: "Reddit, YouTube",
    featured: false,
  },

  // ---------------- Artifacts ----------------
  {
    slug: "shroud-of-turin",
    title: "The Shroud of Turin",
    category: "Artifacts",
    summary:
      "A linen cloth bearing the faint image of a man, venerated as the burial shroud of Jesus.",
    controversy:
      "Radiocarbon dating suggests medieval origin, but image-formation analysis keeps the debate open.",
    tags: ["religion", "relic", "dating", "imaging"],
    era: "Disputed",
    origin: "YouTube, Reddit",
    featured: true,
  },
  {
    slug: "ark-of-the-covenant",
    title: "The Ark of the Covenant",
    category: "Artifacts",
    summary:
      "The biblical gold-covered chest said to hold the tablets of the Ten Commandments.",
    controversy:
      "Its fate is unknown, with claimed locations from Ethiopia to hidden Vatican vaults.",
    tags: ["religion", "lost artifact", "biblical", "treasure"],
    era: "Antiquity",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "crystal-skulls",
    title: "The Crystal Skulls",
    category: "Artifacts",
    summary:
      "Carved quartz skulls once claimed to be ancient Mesoamerican artifacts with mystical powers.",
    controversy:
      "Microscopy shows modern tool marks, yet belief in their origins persists.",
    tags: ["mesoamerica", "hoax", "mysticism", "quartz"],
    era: "Disputed",
    origin: "TikTok, YouTube",
    featured: false,
  },
  {
    slug: "piri-reis-map",
    title: "The Piri Reis Map",
    category: "Artifacts",
    summary:
      "A 1513 Ottoman map that some claim shows the coastline of Antarctica before it was iced over.",
    controversy:
      "Mainstream scholars dispute the Antarctica claim, but the map's accuracy still fascinates.",
    tags: ["cartography", "ottoman", "antarctica", "1513"],
    era: "1513",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "phaistos-disc",
    title: "The Phaistos Disc",
    category: "Artifacts",
    summary:
      "A Minoan clay disc stamped with 241 symbols in a spiral, found on Crete.",
    controversy:
      "Its undeciphered script and unique stamping make even its authenticity occasionally questioned.",
    tags: ["minoan", "undeciphered", "crete", "script"],
    era: "c. 1700 BCE",
    origin: "Reddit",
    featured: false,
  },
  {
    slug: "saqqara-bird",
    title: "The Saqqara Bird",
    category: "Artifacts",
    summary:
      "An ancient Egyptian wooden artifact shaped strikingly like a modern glider.",
    controversy:
      "Was it a toy, a weathervane, or evidence ancient Egyptians understood aerodynamics?",
    tags: ["egypt", "aviation", "ancient tech", "artifact"],
    era: "c. 200 BCE",
    origin: "YouTube",
    featured: false,
  },
  {
    slug: "london-hammer",
    title: "The London Hammer",
    category: "Artifacts",
    summary:
      "A hammer found encased in rock formations claimed by some to be hundreds of millions of years old.",
    controversy:
      "Geologists explain it as recent mineral concretion; out-of-place-artifact believers disagree.",
    tags: ["ooparts", "geology", "anomaly", "texas"],
    era: "Disputed",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "codex-gigas",
    title: "The Codex Gigas (Devil's Bible)",
    category: "Artifacts",
    summary:
      "The largest surviving medieval manuscript, containing a famous full-page portrait of the devil.",
    controversy:
      "Legend says a monk wrote it in a single night with the devil's help to escape punishment.",
    tags: ["manuscript", "medieval", "legend", "religion"],
    era: "Early 13th century",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "oak-island-money-pit",
    title: "The Oak Island Money Pit",
    category: "Places",
    summary:
      "A Nova Scotia site where treasure hunters have dug for over 200 years chasing buried riches.",
    controversy:
      "Booby-trapped flood tunnels and tantalizing finds keep the legend — and the digging — alive.",
    tags: ["treasure", "nova scotia", "excavation", "mystery"],
    era: "1795-present",
    origin: "YouTube, Reddit",
    featured: false,
  },
  {
    slug: "fermi-paradox",
    title: "The Fermi Paradox",
    category: "Mysteries",
    summary:
      "The stark contradiction between high estimates for alien life and the total lack of contact.",
    controversy:
      "From the 'Great Filter' to the 'Dark Forest,' the proposed answers are as unsettling as the silence.",
    tags: ["aliens", "space", "philosophy", "seti"],
    era: "1950-present",
    origin: "Reddit, YouTube",
    featured: false,
  },
  {
    slug: "ball-lightning",
    title: "Ball Lightning",
    category: "Mysteries",
    summary:
      "Glowing, floating orbs of light reported during thunderstorms for centuries.",
    controversy:
      "Long dismissed as folklore, it's only recently been captured, and its physics is still debated.",
    tags: ["weather", "physics", "anomaly", "lightning"],
    era: "Centuries",
    origin: "Reddit",
    featured: false,
  },
  {
    slug: "cicada-3301",
    title: "Cicada 3301",
    category: "Mysteries",
    summary:
      "An anonymous organization that posted elaborate cryptographic puzzles online starting in 2012.",
    controversy:
      "Its purpose — recruitment, art, or something darker — was never confirmed before it went silent.",
    tags: ["cryptography", "internet", "puzzle", "anonymous"],
    era: "2012-2014",
    origin: "Reddit, YouTube",
    featured: true,
  },
];

async function seed() {
  console.log(`Seeding ${topics.length} topics...`);
  for (const topic of topics) {
    await db
      .insert(topicsTable)
      .values(topic)
      .onConflictDoUpdate({
        target: topicsTable.slug,
        set: {
          title: topic.title,
          category: topic.category,
          summary: topic.summary,
          controversy: topic.controversy,
          tags: topic.tags ?? [],
          era: topic.era ?? null,
          origin: topic.origin ?? null,
          featured: topic.featured ?? false,
        },
      });
  }
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
