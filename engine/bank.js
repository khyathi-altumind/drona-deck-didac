// Science x Depth question bank, levels 1-6 (general Grade 8 science).
// Depth ladder: 1 Remember, 2 Understand, 3 Apply, 4 Analyse, 5 Evaluate, 6 Create.
// `answer` is the index into `options`. Optional `context` is shown above the stem.
// The other Science skills and all History items live in bank-science.js and bank-history.js.

const SCIENCE_DEPTH = [
  // ---- Level 1 · Recall ----
  {
    id: 'SCI-DEP-1a', subject: 'SCI', skill: 'DEP', level: 1,
    stem: 'Which gas do green plants take in from the air to make their food?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
    answer: 1,
    hint: 'It is the gas we breathe out.',
    explanation: 'Plants take in carbon dioxide and, using sunlight and water, turn it into glucose during photosynthesis.',
  },
  {
    id: 'SCI-DEP-1b', subject: 'SCI', skill: 'DEP', level: 1,
    stem: 'What is the SI unit of force?',
    options: ['Joule', 'Newton', 'Watt', 'Pascal'],
    answer: 1,
    hint: 'It is named after the scientist who described gravity.',
    explanation: 'Force is measured in newtons (N). One newton accelerates 1 kg at 1 m/s².',
  },
  {
    id: 'SCI-DEP-1c', subject: 'SCI', skill: 'DEP', level: 1,
    stem: 'Which organ pumps blood around the human body?',
    options: ['Lungs', 'Liver', 'Heart', 'Kidney'],
    answer: 2,
    hint: 'You can feel it beating in your chest.',
    explanation: 'The heart is a muscular pump that pushes blood through the arteries to the whole body.',
  },
  {
    id: 'SCI-DEP-1d', subject: 'SCI', skill: 'DEP', level: 1,
    stem: 'What is the chemical formula of water?',
    options: ['CO₂', 'H₂O', 'O₂', 'NaCl'],
    answer: 1,
    hint: 'Two atoms of the lightest element, one of the gas we breathe in.',
    explanation: 'A water molecule has two hydrogen atoms bonded to one oxygen atom: H₂O.',
  },

  // ---- Level 2 · Explain ----
  {
    id: 'SCI-DEP-2a', subject: 'SCI', skill: 'DEP', level: 2,
    stem: 'Why do we see lightning before we hear thunder?',
    options: [
      'Light travels much faster than sound',
      'Thunder is produced after the lightning ends',
      'Clouds slow down light more than sound',
      'Our eyes react faster than our ears',
    ],
    answer: 0,
    hint: 'Both are produced at the same moment. What differs on the way to you?',
    explanation: 'Light travels at about 300,000 km/s; sound at about 343 m/s, so the light reaches you almost instantly and the sound arrives later.',
  },
  {
    id: 'SCI-DEP-2b', subject: 'SCI', skill: 'DEP', level: 2,
    stem: 'Why does ice float on water?',
    options: [
      'Ice has air bubbles trapped in it',
      'Ice is less dense than liquid water',
      'Cold things always rise',
      'Water pushes up harder on solids',
    ],
    answer: 1,
    hint: 'Think about mass per unit volume.',
    explanation: 'When water freezes its molecules lock into an open structure, so ice takes up more space for the same mass. Lower density means it floats.',
  },
  {
    id: 'SCI-DEP-2c', subject: 'SCI', skill: 'DEP', level: 2,
    stem: 'Why do most leaves look green?',
    options: [
      'They absorb green light',
      'They reflect green light and absorb red and blue light',
      'They produce green light',
      'They contain green water',
    ],
    answer: 1,
    hint: 'The colour you see is the light that comes back to your eye.',
    explanation: 'Chlorophyll absorbs red and blue light for photosynthesis and reflects green, which is the colour we see.',
  },
  {
    id: 'SCI-DEP-2d', subject: 'SCI', skill: 'DEP', level: 2,
    stem: 'A metal spoon in hot tea gets hot faster than a wooden spoon. Why?',
    options: [
      'Metal is a better conductor of heat',
      'Wood is heavier than metal',
      'Metal absorbs more tea',
      'Wood reflects heat back into the tea',
    ],
    answer: 0,
    hint: 'This is about how easily heat moves through a material.',
    explanation: 'Metals conduct heat well because free electrons carry energy quickly. Wood is an insulator, so heat moves through it slowly.',
  },

  // ---- Level 3 · Apply ----
  {
    id: 'SCI-DEP-3a', subject: 'SCI', skill: 'DEP', level: 3,
    stem: 'A car travels 120 km in 2 hours. What is its average speed?',
    options: ['240 km/h', '60 km/h', '120 km/h', '30 km/h'],
    answer: 1,
    hint: 'Average speed = total distance ÷ total time.',
    explanation: '120 km ÷ 2 h = 60 km/h.',
  },
  {
    id: 'SCI-DEP-3b', subject: 'SCI', skill: 'DEP', level: 3,
    stem: 'You dissolve salt in water and want the salt back. Which method works best?',
    options: ['Filtration', 'Evaporation', 'Using a magnet', 'Sieving'],
    answer: 1,
    hint: 'Dissolved salt passes straight through filter paper.',
    explanation: 'Heating the solution evaporates the water and leaves the salt behind. Filtration cannot separate a dissolved solid.',
  },
  {
    id: 'SCI-DEP-3c', subject: 'SCI', skill: 'DEP', level: 3,
    stem: 'A net force acts on a 2 kg object and it accelerates at 3 m/s². What is the force?',
    options: ['1.5 N', '5 N', '6 N', '9 N'],
    answer: 2,
    hint: "Newton's second law: F = m × a.",
    explanation: 'F = 2 kg × 3 m/s² = 6 N.',
  },
  {
    id: 'SCI-DEP-3d', subject: 'SCI', skill: 'DEP', level: 3,
    stem: 'A potted plant kept in a dark cupboard for a week turns pale yellow. What is the most likely reason?',
    options: [
      'It got too much water',
      'Without light it stops making chlorophyll',
      'The cupboard was too cold',
      'It absorbed too much carbon dioxide',
    ],
    answer: 1,
    hint: 'What gives leaves their green colour, and what does the plant need to keep making it?',
    explanation: 'Plants need light to make chlorophyll. Kept in the dark, the chlorophyll breaks down and is not replaced, so leaves turn yellow.',
  },

  // ---- Level 4 · Analyse ----
  {
    id: 'SCI-DEP-4a', subject: 'SCI', skill: 'DEP', level: 4,
    stem: 'Two identical plants are watered daily: A with salty water, B with tap water. Plant A wilts. What best explains this?',
    options: [
      'Salt blocks sunlight from reaching the leaves',
      'Water moves out of the root cells into the salty soil by osmosis',
      'Plant A received more water than it needed',
      'Salt makes the soil too warm',
    ],
    answer: 1,
    hint: 'Water moves from where it is more concentrated to where it is less concentrated.',
    explanation: 'Salty soil water is more concentrated than the cell sap, so water leaves the root cells by osmosis. The plant loses water and wilts.',
  },
  {
    id: 'SCI-DEP-4b', subject: 'SCI', skill: 'DEP', level: 4,
    stem: 'A ball is thrown straight up. At its highest point, which statement is true?',
    options: [
      'Velocity and acceleration are both zero',
      'Velocity is zero, acceleration is still 9.8 m/s² downward',
      'Velocity is at its maximum',
      'Acceleration is zero, velocity is downward',
    ],
    answer: 1,
    hint: 'Gravity does not switch off at the top.',
    explanation: 'For an instant the ball stops (velocity = 0), but gravity still pulls it down, so acceleration stays 9.8 m/s² downward.',
  },
  {
    id: 'SCI-DEP-4c', subject: 'SCI', skill: 'DEP', level: 4,
    stem: 'Iron nails sit in three tubes: (1) dry air with calcium chloride, (2) boiled water under a layer of oil, (3) tap water open to air. Which nails rust?',
    options: ['Only tube 1', 'Only tube 2', 'Only tube 3', 'Tubes 2 and 3'],
    answer: 2,
    hint: 'Rusting needs two things at once. Which tubes remove one of them?',
    explanation: 'Rusting needs both oxygen and water. Tube 1 has no water; tube 2 has no dissolved air (boiled, sealed by oil). Only tube 3 has both.',
  },
  {
    id: 'SCI-DEP-4d', subject: 'SCI', skill: 'DEP', level: 4,
    stem: 'In the food chain grass → grasshopper → frog → snake, frogs suddenly disappear. What happens first?',
    options: [
      'Grass increases',
      'Grasshoppers increase',
      'Snakes increase',
      'Nothing changes',
    ],
    answer: 1,
    hint: 'Who was the frog eating?',
    explanation: 'With no frogs eating them, grasshoppers multiply first. Later the grass decreases and snakes lose their food source.',
  },

  // ---- Level 5 · Evaluate ----
  {
    id: 'SCI-DEP-5a', subject: 'SCI', skill: 'DEP', level: 5,
    stem: 'A student claims heavier objects always fall faster. Which observation is the best test of this claim?',
    options: [
      'Dropping a feather and a coin in a classroom',
      'Dropping a hammer and a feather where there is no air, as on the Moon',
      'Weighing both objects on a balance',
      'Throwing both objects sideways',
    ],
    answer: 1,
    hint: 'A fair test removes the thing that is really slowing the feather down.',
    explanation: 'Without air resistance, all objects fall with the same acceleration. On the Moon the hammer and feather land together, so the claim is false.',
  },
  {
    id: 'SCI-DEP-5b', subject: 'SCI', skill: 'DEP', level: 5,
    stem: '"Taking antibiotics will cure a common cold faster." How good is this advice?',
    options: [
      'Good. Antibiotics kill all germs',
      'Poor. Colds are caused by viruses, and antibiotics only act on bacteria',
      'Good, but only for children',
      'Poor, because colds cure themselves in one day',
    ],
    answer: 1,
    hint: 'What kind of microbe causes a cold?',
    explanation: 'Colds are viral. Antibiotics target bacteria, so they do not help. Overusing them also breeds antibiotic-resistant bacteria.',
  },
  {
    id: 'SCI-DEP-5c', subject: 'SCI', skill: 'DEP', level: 5,
    stem: 'You want to know whether a fertilizer makes plants grow taller. Which experiment design is best?',
    options: [
      'Give one plant fertilizer and more sunlight, compare with another',
      'Use two groups of identical plants with the same light, water and soil, and add fertilizer to only one group',
      'Add fertilizer to every plant and measure them all',
      'Test one plant with fertilizer this month and another next month',
    ],
    answer: 1,
    hint: 'Change only one thing at a time.',
    explanation: 'A fair test changes one variable (fertilizer) and keeps everything else the same, with a control group to compare against.',
  },
  {
    id: 'SCI-DEP-5d', subject: 'SCI', skill: 'DEP', level: 5,
    stem: 'On a winter morning a metal bench feels colder than a wooden bench. A friend says the metal must be at a lower temperature. Evaluate this.',
    options: [
      'Correct, metal always cools faster at night',
      'Incorrect. Both are at the same temperature, but metal conducts heat away from your hand faster',
      'Correct, wood produces its own heat',
      'Incorrect. The wooden bench is actually colder',
    ],
    answer: 1,
    hint: 'Your hand senses how fast it loses heat, not the temperature directly.',
    explanation: 'Left outside, both benches reach the same temperature. Metal is a good conductor, so it draws heat from your skin faster and feels colder.',
  },

  // ---- Level 6 · Create ----
  {
    id: 'SCI-DEP-6a', subject: 'SCI', skill: 'DEP', level: 6,
    stem: 'You must design a box that keeps ice from melting for as long as possible in direct sun. Which design is best?',
    options: [
      'Black outer surface with thin metal walls',
      'Shiny outer surface, thick thermocol walls and a tight lid',
      'Open top so warm air can escape',
      'Thin glass walls so you can see the ice',
    ],
    answer: 1,
    hint: 'Block all three ways heat gets in: radiation, conduction and convection.',
    explanation: 'A shiny surface reflects radiation, thermocol stops conduction, and a tight lid stops convection currents carrying warm air in.',
  },
  {
    id: 'SCI-DEP-6b', subject: 'SCI', skill: 'DEP', level: 6,
    stem: 'A lake fills with algae after nearby farms start using more fertilizer. Which plan tackles the root cause?',
    options: [
      'Add more fish to eat the algae',
      'Scoop out the algae every week',
      'Plant strips of vegetation along farm edges and cut fertilizer run-off',
      'Add chlorine to the lake',
    ],
    answer: 2,
    hint: 'Where are the extra nutrients coming from?',
    explanation: 'Fertilizer run-off feeds the algae (eutrophication). Buffer strips and less run-off stop the nutrients reaching the lake. The other options only treat the symptoms.',
  },
  {
    id: 'SCI-DEP-6c', subject: 'SCI', skill: 'DEP', level: 6,
    stem: 'Design a circuit with one battery and two bulbs so that if one bulb fuses, the other stays lit.',
    options: [
      'Connect the bulbs in series',
      'Connect the bulbs in parallel, each on its own branch',
      'Use two batteries in series',
      'Put a switch between the bulbs',
    ],
    answer: 1,
    hint: 'Each bulb needs its own complete path back to the battery.',
    explanation: 'In parallel, each bulb has a separate loop, so a broken filament in one does not break the circuit for the other.',
  },
  {
    id: 'SCI-DEP-6d', subject: 'SCI', skill: 'DEP', level: 6,
    stem: 'You want to show that plants release oxygen during photosynthesis. Which set-up works?',
    options: [
      'Put a potted plant in a sealed dark box overnight',
      'Place a water plant in sunlight under an inverted water-filled test tube, collect the gas, and test it with a glowing splint',
      'Measure the plant’s height every day',
      'Burn a leaf and observe the flame',
    ],
    answer: 1,
    hint: 'You need to collect the gas the plant gives off and then identify it.',
    explanation: 'An aquatic plant like Hydrilla releases bubbles in light. The collected gas relights a glowing splint, which is the test for oxygen.',
  },
];

module.exports = [...SCIENCE_DEPTH, ...require('./bank-science'), ...require('./bank-history')];
