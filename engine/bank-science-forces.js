// Science · Class 8, "Exploring Forces". Source: DIDAC Science Pool (all 24 items).
//
// The only Science questions in play, one per level per skill. Science keeps the adaptive ladder
// (Easy = levels 1-3, Tough = levels 4-6); when the target level is already used in the hand, the engine
// serves the nearest unused level in the band.
//
// Pillars follow the pool's Appendix B crosswalk: Depth = Explaining Phenomena, Stretch = same
// principle in a new context, Untangle = Interpreting Data & Evidence, Pivot = Evaluating & Designing
// Enquiry. Facts trace only to the pool's SOURCE_FACTS; `sourceFacts` records the SF# used.
// Changes from the pool (the booth only scores single-answer multiple choice):
//   - yes_no_grid items: the statements are listed in the stimulus and the visitor picks the right set.
//   - one_line items: rebuilt as four options. The rubric's green answer is the key; the amber and grey
//     rubric bands became the distractors.
// Status: reviewed and approved by the Science reviewer (spec 10.2).

const item = (skill) => (level, q) => ({
  id: `SCI-${skill}-L${level}`,
  poolId: `SCI-${skill}-L${level}-v1`,
  subject: 'SCI',
  skill,
  level,
  answer: 0, // the right option is listed first here; options are shuffled every time they are served
  review: 'approved',
  ...q,
});
const list = (intro, statements) => `${intro}\n${statements.map((t, i) => `(${i + 1}) ${t}`).join('\n')}`;

const TUB = list('Four objects are placed one by one in the SAME tub of water:', [
  'an iron nail (heavy for its size): SINKS',
  'a large wooden log (very heavy): FLOATS',
  'a small plastic bead (very light): FLOATS',
  'a steel pin (very light): SINKS',
]) + '\nA student concludes: “Heavier things sink; lighter things float.”';

// ---------- Depth: Explaining Phenomena ----------
const dep = item('DEP');
const DEPTH = [
  dep(1, {
    competency: 'Explaining Phenomena Scientifically (recall)',
    stem: 'The force of gravity acting on an object is called its:',
    options: ['weight', 'mass', 'upthrust', 'friction'],
    hint: 'It is a force, so it is measured in newtons.',
    explanation: 'Weight is the force of gravity on an object, measured in newtons. Mass is the amount of matter, which is not a force.',
    distractorLogic: '"mass" = the classic mass/weight confusion. "upthrust" and "friction" are other forces from the chapter, tempting if the student pattern-matches a force word.',
    sourceFacts: ['SF6'],
  }),
  dep(2, {
    competency: 'Explaining Phenomena (classifying forces)',
    format: 'yes_no_grid → pick the set',
    context: list('Forces are either contact forces or non-contact forces.', ['Friction', 'Magnetic force', 'Muscular force', 'Gravitational force']),
    stem: 'Which of these are NON-CONTACT forces?',
    options: ['2 and 4', 'Only 4', '1 and 2', '3 and 4'],
    hint: 'Non-contact forces act even without the objects touching.',
    explanation: 'Magnetic (2) and gravitational (4) forces act without touching. Friction and muscular force need contact.',
    distractorLogic: '"Only 4" catches the "forces need touching" misconception about magnets. C and D each mix in a contact force.',
    sourceFacts: ['SF3', 'SF5'],
  }),
  dep(3, {
    competency: 'Explaining Phenomena (apply to a case)',
    context: 'A ball is thrown straight up. It slows down, stops for an instant, then falls back.',
    stem: 'Which force best explains why it slows, stops and returns?',
    options: [
      'Gravitational force pulling it towards Earth',
      'The ball using up the force given to it',
      'Air pressure pushing it back down',
      'A magnetic force from the ground',
    ],
    hint: 'Which force always acts downward, towards Earth?',
    explanation: 'Gravity pulls the ball towards Earth the whole time. It slows the ball on the way up, stops it, and brings it back down.',
    distractorLogic: '"using up its force" = the impetus misconception. "air pushing down" misassigns the cause. Magnetic is an irrelevant non-contact force.',
    sourceFacts: ['SF2', 'SF5'],
  }),
  dep(4, {
    competency: 'Explaining Phenomena (analyse an observation)',
    context: 'The same ball is rolled with the same push. It travels 120 cm on glass but only 15 cm on sand before stopping.',
    stem: 'What does this best show?',
    options: [
      'Sand is rougher, so it gives more friction against the motion',
      'Glass has more gravity than sand does',
      'The ball becomes heavier when it is on sand',
      'Sand has no friction at all, unlike glass',
    ],
    hint: 'Rougher surface: more of which force?',
    explanation: 'Sand is rougher than glass, so it produces more friction. Friction opposes motion, so the ball stops sooner on sand.',
    distractorLogic: '"more gravity on glass" and "heavier on sand" are nonsense-but-sciencey traps. "sand has no friction" reverses the relationship.',
    sourceFacts: ['SF4'],
  }),
  dep(5, {
    competency: 'Explaining Phenomena (evaluate a claim)',
    format: 'one_line → tap_options',
    context: 'A student claims: “Heavier objects always sink and lighter objects always float.”',
    stem: 'Is this claim correct, and why?',
    options: [
      'No. A heavy ship floats: it depends on weight against the water’s push',
      'Yes. Heavy things are pulled down harder, so they always sink',
      'Yes, but only in fresh water, because sea water holds things up',
      'No. In fact light things always sink and heavy things always float',
    ],
    hint: 'Think of a heavy ship, and of light pumice stone.',
    explanation: 'The claim is wrong. Floating depends on the balance between weight and the upward buoyant force (or on density), not weight alone. A heavy ship floats; a small pebble sinks.',
    distractorLogic: 'B accepts the claim with a sciencey reason. C accepts it with a made-up exception. D rejects it but replaces it with the reversed rule.',
    sourceFacts: ['SF10', 'SF11'],
  }),
  dep(6, {
    competency: 'Explaining Phenomena (construct an explanation)',
    format: 'one_line → tap_options',
    context: 'A closed, empty bottle is pushed underwater and let go. It rises back to the surface.',
    stem: 'Why does the bottle rise?',
    options: [
      'The water’s upward push (upthrust) is greater than its weight',
      'The water’s upthrust is equal to its weight, so it rises',
      'The air inside the bottle is pulling it up towards the sky',
      'The bottle has no weight at all while it is underwater',
    ],
    hint: 'Name the upward force from the water, and compare it with the bottle’s weight.',
    explanation: 'Water pushes up on the bottle (upthrust). That push is bigger than the bottle’s weight, so the bottle rises.',
    distractorLogic: 'B names upthrust but gets the comparison wrong (equal means it floats, not rises). C gives an incorrect cause. D = "no weight underwater" misconception.',
    sourceFacts: ['SF9', 'SF10'],
  }),
];

// ---------- Stretch: same principle, new context ----------
const str = item('STR');
const STRETCH = [
  str(1, {
    competency: 'Explaining in a new context (near)',
    context: 'Water exerts friction on objects moving through it; streamlined shapes reduce this.',
    stem: 'A boat is built with a pointed, streamlined front. Why?',
    options: [
      'To reduce the water’s resistance so it moves more easily',
      'To make the boat heavier',
      'To increase the water’s friction on the boat',
      'To attract the water magnetically',
    ],
    hint: 'Streamlined shapes do what to fluid resistance?',
    explanation: 'A streamlined front cuts through water with less friction, so the boat moves more easily.',
    distractorLogic: '"increase friction" is the reversed principle. "heavier" and "magnetic" are irrelevant-force traps.',
    sourceFacts: ['SF4'],
  }),
  str(2, {
    competency: 'Explaining in a new context: air (near-modified)',
    context: 'Air also exerts friction on moving objects.',
    stem: 'Two cars drive equally fast: one is boxy, one is smooth and streamlined. Which faces MORE air resistance?',
    options: ['The boxy car', 'The streamlined car', 'Both face exactly the same', 'Neither, since air has no friction'],
    hint: 'Which shape pushes through the air more easily?',
    explanation: 'The streamlined car slips through the air more easily, so the boxy car meets more air resistance.',
    distractorLogic: '"streamlined faces more" reverses it. "both equal" ignores shape. "air has no friction" denies SF4.',
    sourceFacts: ['SF4'],
  }),
  str(3, {
    competency: 'Explaining in a new context: a living thing (adjacent)',
    stem: 'A fish-shaped object and a flat brick are pulled through water at the same speed. Which meets more water resistance?',
    options: [
      'The flat brick, because it is not streamlined',
      'The fish shape, because it is longer',
      'Both meet the same resistance',
      'Neither, because water has no friction',
    ],
    hint: 'A streamlined shape slips through water more easily.',
    explanation: 'The fish shape is streamlined, so water flows past it easily. The flat brick pushes against more water and meets more resistance.',
    distractorLogic: '"fish shape because longer" sounds plausible but length is not the point. "both equal" ignores shape. The last option denies water friction.',
    sourceFacts: ['SF4'],
  }),
  str(4, {
    competency: 'Explaining in a new context: reversed application (cross-context)',
    format: 'one_line → tap_options',
    context: 'A parachute is made large and open, NOT streamlined.',
    stem: 'Using the idea of air resistance, why is a parachute shaped this way?',
    options: [
      'It catches more air, so resistance is bigger and the fall is slower',
      'It reduces air resistance, so the person can land more quickly',
      'It uses air resistance, which is the same for every shape',
      'It makes the person lighter while they are falling',
    ],
    hint: 'Here you WANT more resistance, not less.',
    explanation: 'A large, open shape catches more air. That increases air resistance and slows the fall: the streamlining idea used in reverse.',
    distractorLogic: 'B reverses the purpose. C mentions air resistance but not that the shape increases it (rubric amber). D is an unrelated weight misconception.',
    sourceFacts: ['SF4'],
  }),
  str(5, {
    competency: 'Explaining in a new context: water to air (cross-domain)',
    context: 'In water, an upward buoyant force acts on objects, and a thing rises when that force is greater than its weight.',
    stem: 'A helium balloon rises in air. Which idea best explains it?',
    options: [
      'Air pushes up on it (upthrust), and this is greater than its weight',
      'The balloon has no weight',
      'There is no gravity high above the ground',
      'Helium is attracted upward by magnetism',
    ],
    hint: 'Air can act like a fluid and push up, just as water does.',
    explanation: 'Air pushes up on the balloon just as water pushes up on a floating object. That upthrust is bigger than the balloon’s weight, so it rises.',
    distractorLogic: '"no weight" and "no gravity up high" are common misconceptions. "magnetism" is an irrelevant-force trap. Reviewer-approved transfer edge.',
    sourceFacts: ['SF9', 'SF10'],
  }),
  str(6, {
    competency: 'Explaining in a new context: density control (far)',
    format: 'one_line → tap_options',
    context: 'A fish can take in or release gas inside its body, changing how much space it takes up for its weight.',
    stem: 'How does taking in more gas help the fish rise?',
    options: [
      'It is lighter for its size, so the water’s push beats its weight',
      'It is heavier, so it can push off the bottom more strongly',
      'Gas has no weight, so the fish’s weight drops to zero',
      'It can swim faster, so it reaches the surface sooner',
    ],
    hint: 'Changing gas changes the fish’s density (its weight for its size).',
    explanation: 'More gas makes the fish less dense (lighter for its size), so the buoyant force can beat its weight and it rises. Less gas makes it denser and it sinks.',
    distractorLogic: 'B reverses the effect. C = "gas has no weight" misconception. D gives an unrelated mechanism. Reviewer-approved transfer edge.',
    sourceFacts: ['SF10'],
  }),
];

// ---------- Untangle: Interpreting Data & Evidence ----------
const unt = item('UNT');
const UNTANGLE = [
  unt(1, {
    competency: 'Interpreting Data (identify the question)',
    context: TUB,
    stem: 'What question is this experiment really trying to answer?',
    options: [
      'Whether an object’s weight decides if it floats or sinks',
      'Whether water is heavier than the objects',
      'Whether the tub is big enough',
      'Which object is the most useful',
    ],
    hint: 'Look at what the student’s conclusion is about.',
    explanation: 'The student’s conclusion is about weight, so the experiment is testing whether weight decides floating and sinking.',
    distractorLogic: 'The distractors sound on-topic (water, tub, objects) but none matches the hypothesis being tested.',
    sourceFacts: ['SF10'],
  }),
  unt(2, {
    competency: 'Interpreting Data (select the key evidence)',
    context: TUB,
    stem: 'Which single observation most strongly shows that weight alone does NOT decide floating?',
    options: [
      'The heavy log floats while the light pin sinks',
      'The iron nail sinks',
      'The plastic bead floats',
      'All four objects were tested in the same water',
    ],
    hint: 'Find the pair that contradicts “heavy sinks, light floats”.',
    explanation: 'A very heavy log floating and a very light pin sinking is the exact opposite of the weight rule, so it disproves it.',
    distractorLogic: '"nail sinks" and "bead floats" both FIT the weight rule. "same water" is a good control but not evidence against the hypothesis.',
    sourceFacts: ['SF10'],
  }),
  unt(3, {
    competency: 'Interpreting Data (diagnose the real variable)',
    context: TUB,
    stem: 'If weight does not decide the result, which property best explains the pattern?',
    options: [
      'The material (density) of the object compared with water',
      'The weight of the object',
      'The size of the object',
      'The colour of the object',
    ],
    hint: 'What do wood and plastic share that iron and steel do not?',
    explanation: 'Wood and plastic are less dense than water and float; iron and steel are denser and sink. Material, or density, explains the pattern.',
    distractorLogic: '"weight" is the just-refuted hypothesis. Size and colour are plausible-but-wrong surface features.',
    sourceFacts: ['SF10'],
  }),
  unt(4, {
    competency: 'Interpreting Data (state the finding precisely)',
    format: 'one_line → tap_options',
    context: TUB,
    stem: 'What do the results actually show about floating and sinking?',
    options: [
      'Weight alone doesn’t decide it; the material (density) does',
      'Heavier objects sink and lighter objects float, as the student said',
      'Weight is not the cause, but nothing else can be said from this',
      'Big objects float and small objects sink, whatever they are made of',
    ],
    hint: 'Say what decides it, and what does not.',
    explanation: 'The heavy log floats and the light pin sinks, so weight is not what decides it. The material, meaning its density compared with water, does.',
    distractorLogic: 'B restates the refuted rule. C rejects weight but is vague about what does decide it (rubric amber). D is not supported by the data.',
    sourceFacts: ['SF10'],
  }),
  unt(5, {
    competency: 'Interpreting Data (reframe the conclusion)',
    context: `${TUB}\nNote: in this test, both metal objects sank and both non-metal objects floated.`,
    stem: 'Which is the best conclusion from these results?',
    options: [
      'Floating depends on material (density), not on weight',
      'Heavier things sink and lighter things float',
      'Only metal objects sink; everything else floats',
      'Bigger objects always float',
    ],
    hint: 'Be careful of a pattern that fits these four objects but fails in general.',
    explanation: 'Density explains every result. “Only metal sinks” fits these four objects but fails in general: a steel ship floats.',
    distractorLogic: '"only metal sinks" fits all four data points but over-generalises from a tiny sample, the key reasoning trap. "heavier sinks" is the refuted rule. "bigger floats" is unsupported.',
    sourceFacts: ['SF10'],
  }),
  unt(6, {
    competency: 'Interpreting Data (find an unstated problem)',
    format: 'one_line → tap_options',
    context: TUB,
    stem: 'Which is a real weakness of this investigation that the student has not mentioned?',
    options: [
      'Only four objects were tested, too few to make a general rule',
      'The heavy log floated, so the student’s rule was right after all',
      'The objects should have been dropped in from a greater height',
      'The tub of water may have been the wrong colour for the test',
    ],
    hint: 'Think about how many objects, what was changed, and what was measured.',
    explanation: 'Four objects are far too few to make a general rule. Other weaknesses: material and size changed together, only water was tested, and density was never measured.',
    distractorLogic: 'B misreads the result. C is irrelevant to floating. D invents an irrelevant factor.',
    sourceFacts: ['SF10'],
  }),
];

// ---------- Pivot: Evaluating & Designing Enquiry ----------
const piv = item('PIV');
const PIVOT = [
  piv(1, {
    competency: 'Designing Enquiry (select a method)',
    context: 'You want to find out which surface produces the most friction on a rolling ball.',
    stem: 'Which is the best way to investigate this?',
    options: [
      'Roll the SAME ball with the SAME push on each surface and measure the distance',
      'Use a different ball on each surface',
      'Give a different push on each surface',
      'Just look at the surfaces and decide which feels rough',
    ],
    hint: 'To compare surfaces fairly, what must stay the same?',
    explanation: 'Keep the ball and the push the same, change only the surface, and measure how far the ball goes. That is a fair test.',
    distractorLogic: 'Different ball or different push each add a second changing variable. "just look" is not a measurement.',
    sourceFacts: ['SF4'],
  }),
  piv(2, {
    competency: 'Designing Enquiry (compare two designs)',
    context: 'You want to test how an object’s weight affects how much a spring stretches.',
    stem: 'Which plan is the fairer test?',
    options: [
      'Hang different known weights on the SAME spring and measure each stretch',
      'Use a different spring for each weight',
      'Hang the same weight again and again',
      'Look at the spring without hanging anything',
    ],
    hint: 'Change only the weight; keep everything else the same.',
    explanation: 'Use one spring, change only the weight, and measure the stretch each time.',
    distractorLogic: '"different spring each time" changes two things at once. "same weight repeated" never varies the variable. "look only" takes no measurement.',
    sourceFacts: ['SF8'],
  }),
  piv(3, {
    competency: 'Evaluating Enquiry (respond to an anomaly)',
    context: 'In the surfaces experiment, the ball unexpectedly travels FURTHER on rough cloth than on smooth glass, the opposite of what was expected.',
    stem: 'What should the student do first?',
    options: [
      'Check the test was fair (same ball, same push, flat surfaces)',
      'Immediately conclude that cloth is smoother than glass',
      'Ignore the result because it is strange',
      'Stop the experiment',
    ],
    hint: 'One surprising result: jump to a conclusion, or check the method?',
    explanation: 'A single surprising result often comes from a mistake in the method. Check that the test was fair before trusting or rejecting it.',
    distractorLogic: 'Concluding from one odd result, or ignoring/discarding data, are the classic enquiry errors this item screens for.',
    sourceFacts: ['SF4'],
  }),
  piv(4, {
    competency: 'Designing Enquiry (revise a flawed test)',
    format: 'one_line → tap_options',
    context: 'A student compared surfaces but used a DIFFERENT ball and a DIFFERENT push for each surface.',
    stem: 'How should the experiment be revised so the comparison is fair?',
    options: [
      'Use the same ball and the same push, changing only the surface',
      'Use the same ball, but keep giving a different push on each surface',
      'Test more surfaces, still with different balls and different pushes',
      'Push every ball harder so that each one travels further than before',
    ],
    hint: 'Only one thing should change between the surfaces.',
    explanation: 'Keep the ball, the push and the starting point the same for every surface, so the only thing that changes is the surface.',
    distractorLogic: 'B fixes only one of the two changing variables (rubric amber). C and D do not fix the confound.',
    sourceFacts: ['SF4'],
  }),
  piv(5, {
    competency: 'Evaluating Enquiry (precision vs speed trade-off)',
    format: 'one_line → tap_options',
    context: 'To compare friction on surfaces you could: (A) just watch which ball seems to stop first, which is quick but rough; or (B) measure the stopping distance several times and take an average, which is accurate but slow.',
    stem: 'Which would you choose for a reliable result, and what do you give up?',
    options: [
      'B. It is more reliable, but it takes more time and effort',
      'A. It is quick, and it is also the most reliable way to compare',
      'B. It is reliable, and it costs nothing extra compared with A',
      'A. Measuring is not really needed when comparing friction',
    ],
    hint: 'Reliability usually costs time and effort.',
    explanation: 'Measuring several times and averaging (B) gives a reliable result, but it costs more time and effort. Good choices weigh both sides.',
    distractorLogic: 'B calls the rough method reliable. C picks the right method but sees no trade-off (rubric amber). D dismisses measurement.',
    sourceFacts: ['SF4'],
  }),
  piv(6, {
    competency: 'Designing Enquiry (adapt to new conditions)',
    context: 'The student now wants to study friction in WATER instead, for example how far a toy boat glides.',
    stem: 'How should the investigation be adapted?',
    options: [
      'Keep the fair test: vary the boat’s shape and use the SAME push each time',
      'Use the same dry surfaces but pour water on top of them',
      'Change the push every time to make it interesting',
      'Decide the answer without testing, since water is obvious',
    ],
    hint: 'Carry the fair-test logic into the new, fluid situation.',
    explanation: 'The fair-test idea carries over: change one thing (the boat’s shape), keep the push the same, and measure how far it glides.',
    distractorLogic: 'B is a muddled setup. C introduces a confound. D skips the test.',
    sourceFacts: ['SF4'],
  }),
];

module.exports = [...DEPTH, ...STRETCH, ...UNTANGLE, ...PIVOT];
