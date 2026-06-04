/* data.jsx — categories + pre-authored compendium entries */

const RARITIES = {
  common:     { label:'Common',     accent:'#5c5040', bright:'#7a6a52' },
  uncommon:   { label:'Uncommon',   accent:'#2f6b34', bright:'#3f8c46' },
  rare:       { label:'Rare',       accent:'#1f4f8a', bright:'#2f6cb0' },
  'very rare':{ label:'Very Rare',  accent:'#5e2f8a', bright:'#7d44b0' },
  legendary:  { label:'Legendary',  accent:'#9c6a1e', bright:'#caa14a' },
  artifact:   { label:'Artifact',   accent:'#7a1f1f', bright:'#a83228' },
};

const CATEGORIES = [
  { id:'weapon',   label:'Weapon',   tagline:'Blades, bows & battle-gear',
    fields:[
      {name:'rarity', label:'Rarity', type:'select', options:['Common','Uncommon','Rare','Very Rare','Legendary']},
      {name:'type',   label:'Weapon Type', placeholder:'e.g. Shortbow, Longsword, Dagger'},
      {name:'theme',  label:'Theme', placeholder:'e.g. volcanic fire, frost, shadow'},
      {name:'origin', label:'Origin', placeholder:'e.g. the Smoking Mountains'},
    ]},
  { id:'npc',      label:'Character', tagline:'Allies, rivals & strangers',
    fields:[
      {name:'class',  label:'Calling', placeholder:'e.g. Bowyer, Wizard, Rogue'},
      {name:'rarity', label:'Renown', type:'select', options:['Common','Uncommon','Rare','Legendary']},
      {name:'theme',  label:'Disposition', placeholder:'e.g. mentor, schemer, recluse'},
      {name:'origin', label:'Home', placeholder:'e.g. Waterdeep'},
    ]},
  { id:'monster',  label:'Monster', tagline:'Beasts, horrors & dragons',
    fields:[
      {name:'cr',     label:'Challenge Rating', placeholder:'e.g. 1, 6, 12, 20'},
      {name:'type',   label:'Creature Type', placeholder:'e.g. dragon, undead, fiend'},
      {name:'theme',  label:'Theme', placeholder:'e.g. fire, decay, the deep'},
      {name:'origin', label:'Habitat', placeholder:'e.g. volcanic caverns'},
    ]},
  { id:'artifact', label:'Artifact', tagline:'Relics of lost ages',
    fields:[
      {name:'rarity', label:'Rarity', type:'select', options:['Very Rare','Legendary','Artifact']},
      {name:'type',   label:'Form', placeholder:'e.g. crown, mirror, tome'},
      {name:'theme',  label:'Theme', placeholder:'e.g. divine, undeath, flame'},
      {name:'origin', label:'Bound to', placeholder:'e.g. Candlekeep'},
    ]},
  { id:'location', label:'Location', tagline:'Realms, ruins & strongholds',
    fields:[
      {name:'type',   label:'Kind', placeholder:'e.g. city, dungeon, range'},
      {name:'terrain',label:'Terrain', placeholder:'e.g. volcanic, coastal'},
      {name:'theme',  label:'Atmosphere', placeholder:'e.g. restless, sacred'},
      {name:'scale',  label:'Scale', type:'select', options:['Landmark','Village','Town','City','Region']},
    ]},
];

/* ---------- pre-authored entries (one per category for the demo) ---------- */
const ENTRIES = {
  weapon: {
    id:'weapon', layout:'item', page:47, rarity:'common',
    name:'Ashwood Bow', subtitle:'of the Smoking Peak',
    typeLabel:'Weapon (Shortbow)', attunement:'No',
    image:'assets/bow.png', imageAlt:'A charcoal-grey shortbow veined with ember-orange light',
    physical:[
      'This shortbow is crafted from ashwood harvested near the volcanic peaks of the Smoking Mountains east of Waterdeep. The wood is naturally darkened by volcanic heat and ash, giving it a charcoal-grey appearance streaked with subtle, ember-like veins beneath the surface.',
      'The bowstring is made of heat-treated leather cord, tough and resilient under extreme temperatures. Shards of obsidian are embedded along the grip, their jagged edges polished smooth by skilled hands. The bow feels faintly warm to the touch, as if it remembers the mountain\u2019s fire.',
    ],
    properties:'The Ashwood Bow of the Smoking Peak functions as a normal shortbow. It provides no bonus to attack rolls or damage rolls. The bow is naturally resistant to fire and heat and does not warp or crack under extreme temperatures.',
    abilities:[
      {name:'Heat Resistance.', desc:'The bow cannot be damaged by fire or heat-based effects. A wielder holding it gains resistance to fire damage from environmental sources such as lava, volcanic vents, or extreme heat.'},
      {name:'Ash Arrows.', desc:'Arrows fired from the bow leave faint trails of ash in the air, a cosmetic effect that makes their flight easier to follow visually.'},
    ],
    flavor:'A trusted companion wherever flame and stone remake the land.',
    lore:[
      'The Smoking Mountains, east of Waterdeep, are a range of restless volcanoes whose soil is rich with mineral and fire. From their slopes grows ashwood, a rare timber that endures heat that would consume lesser trees. For generations, local hunters and survivalists shaped this wood into bows suited for the harsh lands.',
      'After the Spellplague\u2019s aftermath, volcanic activity across the region increased, making the mountains more perilous \u2014 but also more productive of ashwood. These bows gained renown among rangers, scouts, and explorers who venture into fire-touched places.',
      'Today, many of these bows are crafted by the Ashworkers\u2019 Guild in Waterdeep, who honor old mountain techniques while supplying those who brave the world\u2019s most dangerous frontiers.',
    ],
    conditions:'The bow performs best in hot or volcanic environments, where its natural heat-resistance keeps the wood flexible and strong. In extreme cold, the wood becomes slightly brittle and loses some of its heat-resistant properties, though it remains fully functional.',
  },

  monster: {
    id:'monster', layout:'monster', page:112, rarity:'rare',
    name:'Cinderwake Drake', subtitle:'Terror of the Smoking Peak',
    meta:'Large dragon, chaotic neutral', cr:'6', xp:'2,300',
    image:'assets/slot-monster', imageAlt:'A lean ash-grey drake',
    ac:'17 (natural armor)', hp:'127 (15d10 + 45)',
    speed:'40 ft., climb 30 ft., fly 80 ft.',
    abilities:{ str:19, dex:14, con:17, int:6, wis:13, cha:11 },
    saves:'Dex +5, Con +6, Wis +4',
    skills:'Perception +7, Stealth +5',
    resist:'fire; bludgeoning, piercing, slashing from nonmagical attacks',
    senses:'darkvision 120 ft., passive Perception 17',
    langs:'Draconic (understands but rarely speaks)',
    traits:[
      {name:'Heat Veins.', desc:'When the drake takes cold damage, its speed is halved until the end of its next turn as the ash in its hide stiffens.'},
      {name:'Ash Cloud.', desc:'When the drake is hit by a melee attack, it sheds a puff of stinging ash. The attacker must succeed on a DC 14 Constitution save or be blinded until the end of their next turn.'},
    ],
    actions:[
      {name:'Multiattack.', desc:'The drake makes one Bite attack and two Claw attacks.'},
      {name:'Bite.', desc:'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage plus 4 (1d8) fire damage.'},
      {name:'Claw.', desc:'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage.'},
      {name:'Ember Breath (Recharge 5\u20136).', desc:'The drake exhales a 30-foot cone of cinders. Each creature in that area makes a DC 14 Dexterity save, taking 35 (10d6) fire damage on a failure, or half as much on a success. Flammable objects ignite.'},
    ],
    lore:[
      'Cinderwake drakes nest in the vent-shafts of the Smoking Mountains, where the air shimmers with heat and few creatures dare to tread. They are territorial but not malicious \u2014 most attacks are warnings against those who stray too near a clutch of eggs.',
      'Rangers prize the drake\u2019s shed scales, which retain warmth for days and are woven into cold-weather gear. The Ashworkers\u2019 Guild pays handsomely for an intact hide.',
    ],
  },

  npc: {
    id:'npc', layout:'npc', page:88, rarity:'uncommon',
    name:'Maelra Ashweaver', subtitle:'Master Bowyer of the Ashworkers\u2019 Guild',
    meta:'Human (Chondathan), lawful neutral \u00b7 Notable',
    image:'assets/slot-npc', imageAlt:'A weathered artisan with soot-streaked hands',
    description:[
      'Maelra is a broad-shouldered woman in her fifties, hands permanently darkened by soot and resin, eyes the pale grey of cooled ash. She speaks little and measures twice. In the Ashworkers\u2019 Guild she is the final word on whether a bow leaves the workshop \u2014 a single flaw and the wood goes back into the fire.',
    ],
    backstory:[
      'Born on the lower slopes of the Smoking Mountains, Maelra lost her family\u2019s steading to a vent collapse as a child and was taken in by guild artisans in Waterdeep. She has spent forty years learning which timber sings under heat and which shatters, and now trains a stubborn handful of apprentices in the old mountain methods.',
      'She harbors a quiet grief for the mountain that took her family and a fierce pride in the craft it gave her. She will not sell to those she suspects mean harm with her work.',
    ],
    traits:[
      {name:'Ideal.', desc:'\u201cThe fire judges everything. So do I.\u201d Mastery is earned, never granted.'},
      {name:'Bond.', desc:'The Ashworkers\u2019 Guild is the only family she has left.'},
      {name:'Flaw.', desc:'Distrusts charm and flattery; warms only to demonstrated skill.'},
    ],
    hooks:[
      'A rival workshop is undercutting the guild with brittle counterfeits stamped with Maelra\u2019s mark. She needs proof \u2014 and discretion.',
      'She will craft a masterwork bow for the party, but only if they retrieve heartwood from a grove guarded by a cinderwake drake.',
      'An old apprentice has vanished into the mountains chasing a vein of \u201csinging ash.\u201d Maelra cannot go herself.',
    ],
  },
};

/* artifact + location reuse the item layout for the demo gallery */
ENTRIES.artifact = {
  ...ENTRIES.weapon, id:'artifact', layout:'item', page:201, rarity:'legendary',
  name:'The Cinder Crown', subtitle:'Diadem of the Ash King',
  typeLabel:'Wondrous Item (Crown)', attunement:'Yes (by a creature attuned to fire)',
  image:'assets/slot-artifact', imageAlt:'A blackened crown wreathed in embers',
  physical:[
    'A circlet of fused obsidian and meteoric iron, its peaks shaped like guttering flames. Embers drift perpetually from its surface yet never fall, and the metal is always warm \u2014 the warmth of a hearth, not a forge.',
    'Set at its brow is a single uncut ruby the size of a thumb, within which a mote of true fire is said to turn slowly, like an eye that never sleeps.',
  ],
  properties:'While wearing the Cinder Crown, you are immune to fire damage and the environmental effects of extreme heat. You can speak Ignan and command non-hostile fire creatures within 30 feet as an action.',
  abilities:[
    {name:'Crown of Embers.', desc:'As an action, you wreathe yourself in flame for 1 minute. Creatures that end their turn within 5 feet of you take 1d10 fire damage. You can use this once per long rest.'},
    {name:'Ashen Command.', desc:'You can cast wall of fire (DC 17) once per long rest without expending a spell slot.'},
  ],
  flavor:'The mountain crowns whom it pleases, and unmakes the rest.',
  lore: ENTRIES.weapon.lore,
  conditions:'Worn in water or deep cold, the crown\u2019s embers dim and its powers wane until it is returned to warmth.',
};
ENTRIES.location = {
  ...ENTRIES.weapon, id:'location', layout:'item', page:33, rarity:'uncommon',
  name:'The Smoking Peak', subtitle:'Restless Heart of the Mountains',
  typeLabel:'Location (Volcanic Range)', attunement:'\u2014',
  image:'assets/slot-location', imageAlt:'A range of smoldering volcanic peaks',
  physical:[
    'East of Waterdeep rises a range of restless volcanoes, their slopes cross-hatched with glowing fissures and veiled in drifting ash. The air tastes of sulfur and the ground is warm underfoot even in deep winter.',
    'Among the cinders grow groves of ashwood, the only timber that thrives in the heat, and it is for this rare wood that hunters, scouts, and guild artisans brave the peaks.',
  ],
  properties:'Travel through the Smoking Peak requires Constitution saves against exhaustion in the worst vents. Open flame and explosives are doubly dangerous near pockets of volcanic gas.',
  abilities:[
    {name:'Vent Shafts.', desc:'Hidden chimneys riddle the range, home to cinderwake drakes and stranger things. Some descend to caverns no map records.'},
    {name:'The Ash Groves.', desc:'Stands of living ashwood, fiercely protected by the creatures that den among them and prized by the Ashworkers\u2019 Guild.'},
  ],
  flavor:'Flame and stone remake the land, season upon season.',
  lore: ENTRIES.weapon.lore,
  conditions:'After major eruptions the lower passes close for months, and the price of ashwood in Waterdeep climbs accordingly.',
};

Object.assign(window,{ RARITIES, CATEGORIES, ENTRIES });
