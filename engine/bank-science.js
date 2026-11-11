// Science · Stretch, Untangle and Pivot (Grade 8, mostly Friction, per spec v2 section 8.1).
// Two questions per level, levels 1-6. Every item is self-contained (spec 7.2).
// Status: drafted for the booth, pending the Science reviewer's sign-off (spec 10.2).

const item = (skill) => (id, level, q) => ({ id: `SCI-${skill}-${id}`, subject: 'SCI', skill, level, review: 'pending', ...q });

// ---------- Stretch: can they use it somewhere new? ----------
const str = item('STR');
const STRETCH = [
  // L1 · Near
  str('1a', 1, {
    stem: 'You rub your palms together quickly on a cold morning and they feel warm. Why?',
    options: ['Friction between the palms turns motion into heat', 'Your blood moves to your hands to help them', 'The air between your palms gets trapped', 'Rubbing removes the cold air from your skin'],
    answer: 0,
    hint: 'Two surfaces are sliding against each other.',
    explanation: 'Friction opposes the sliding of your palms, and the work done against it turns into heat.',
  }),
  str('1b', 1, {
    stem: 'Why is it easy to slip on a freshly mopped, polished floor?',
    options: ['The floor becomes heavier when wet', 'Water fills the tiny bumps, so there is less friction between shoe and floor', 'Wet floors push your feet forward', 'Polish makes shoes lighter'],
    answer: 1,
    hint: 'Grip depends on how well the two surfaces catch on each other.',
    explanation: 'A smooth, wet surface reduces friction between your shoe and the floor, so your foot can slide.',
  }),
  // L2 · Near, modified
  str('2a', 2, {
    stem: 'Why do the soles of sports shoes have deep grooves and patterns?',
    options: ['To make the shoes look attractive', 'To make the shoes lighter', 'To increase friction and give a better grip on the ground', 'To let air cool the feet'],
    answer: 2,
    hint: 'Players need to start and stop suddenly without slipping.',
    explanation: 'Grooves increase grip (friction) between sole and ground, so the player does not slip when running or turning.',
  }),
  str('2b', 2, {
    stem: 'Carrom players sprinkle fine powder on the board. What does the powder do?',
    options: ['Reduces friction so the striker and coins slide smoothly', 'Increases friction so the coins stop quickly', 'Makes the coins heavier', 'Keeps the board dry from sweat only'],
    answer: 0,
    hint: 'The game needs the coins to glide.',
    explanation: 'The powder fills tiny bumps on the board and reduces friction, so the striker and coins slide easily.',
  }),
  // L3 · Adjacent
  str('3a', 3, {
    stem: 'Bicycle wheels turn on ball bearings. How do the bearings help?',
    options: ['They make the wheel heavier and more stable', 'They replace sliding with rolling, and rolling friction is much smaller', 'They increase friction so the cycle does not roll away', 'They store energy like a spring'],
    answer: 1,
    hint: 'Compare pushing a box with pushing the same box on rollers.',
    explanation: 'Rolling friction is much less than sliding friction, so the axle turns smoothly on the balls.',
  }),
  str('3b', 3, {
    stem: 'Boats and ships are built with a narrow, pointed front. Why?',
    options: ['So they can carry more goods', 'A pointed front looks faster', 'The shape reduces the drag (fluid friction) of the water', 'It stops water entering the boat'],
    answer: 2,
    hint: 'Water also resists things moving through it.',
    explanation: 'Fluids exert friction (drag) too. A streamlined shape lets water flow past with less resistance.',
  }),
  // L4 · Cross-context
  str('4a', 4, {
    stem: 'Gymnasts rub chalk powder on their hands before holding the bars. Why?',
    options: ['Chalk makes the hands slide faster on the bar', 'Chalk absorbs sweat, which keeps friction high for a firm grip', 'Chalk makes the hands stronger', 'Chalk keeps the bar cool'],
    answer: 1,
    hint: 'What does sweat do between two surfaces?',
    explanation: 'Sweat acts like a lubricant and reduces grip. Chalk soaks it up, so friction between hand and bar stays high.',
  }),
  str('4b', 4, {
    stem: 'A matchstick lights when struck on the rough side of the box but not on smooth glass. Why?',
    options: ['Glass is too cold for a match', 'The rough strip produces enough friction and heat to start burning', 'Glass absorbs the chemicals on the match head', 'The box contains extra oxygen'],
    answer: 1,
    hint: 'Burning needs the substance to reach a certain temperature first.',
    explanation: 'Friction on the rough strip heats the match head to its ignition temperature. Smooth glass gives too little friction.',
  }),
  // L5 · Cross-domain
  str('5a', 5, {
    stem: 'Birds and fish have smooth, tapered body shapes. What is the main advantage?',
    options: ['It makes them look bigger to enemies', 'It reduces drag from air or water, so they move using less energy', 'It helps them stay warm', 'It increases their weight'],
    answer: 1,
    hint: 'Air and water push back on anything moving through them.',
    explanation: 'A streamlined body reduces fluid friction (drag), so less energy is needed to move. Aeroplanes and boats copy this shape.',
  }),
  str('5b', 5, {
    stem: 'Two rock plates under the ground press against each other and stay stuck for years, then suddenly slip and cause an earthquake. Which friction idea explains this?',
    options: ['Friction only acts on moving objects', 'Friction holds the plates until the pushing force becomes larger than it, then they slip suddenly', 'Friction makes the rocks lighter over time', 'Friction pulls the plates apart'],
    answer: 1,
    hint: 'Think about pushing a heavy box that will not move, until it suddenly does.',
    explanation: 'Static friction holds surfaces together until the applied force exceeds it. The plates then slip suddenly, releasing stored energy.',
  }),
  // L6 · Far
  str('6a', 6, {
    stem: 'A town has many skidding accidents on a main road during the rains. Which plan uses friction best?',
    options: ['Paint the road a brighter colour', 'Give the road a rough, grooved surface that drains water and keeps tyres gripping', 'Make the road surface as smooth as possible', 'Raise the speed limit so cars cross faster'],
    answer: 1,
    hint: 'What reduces the grip between tyres and road when it rains?',
    explanation: 'Water reduces friction between tyre and road. A rough, grooved surface drains water and keeps friction high.',
  }),
  str('6b', 6, {
    stem: 'You are designing a playground slide for young children. It should be fun but not too fast at the bottom. Which design works best?',
    options: ['A very smooth slide that is waxed every week', 'A smooth slide with a rougher, flat section at the bottom to slow children down', 'A rough slide all the way down', 'A steeper slide with no landing area'],
    answer: 1,
    hint: 'You need low friction in one place and higher friction in another.',
    explanation: 'Low friction on the slope keeps it fun. A rougher, flatter run-out increases friction where children need to slow down safely.',
  }),
];

// ---------- Untangle: can they make sense of a messy problem? ----------
const unt = item('UNT');
const UNTANGLE = [
  // L1 · Structured
  unt('1a', 1, {
    context: 'Pushing the same box: 20 N is needed to slide it on a wooden floor and 35 N on a carpet.',
    stem: 'On which surface is the friction greater?',
    options: ['Wooden floor', 'Carpet', 'Both are the same', 'You cannot tell'],
    answer: 1,
    hint: 'More friction means more force is needed to slide the box.',
    explanation: 'A larger force was needed on the carpet, so friction there is greater.',
  }),
  unt('1b', 1, {
    context: 'Riya rolled the same toy car down the same ramp onto three surfaces. It travelled 2.4 m on glass, 1.6 m on wood and 0.5 m on sandpaper.',
    stem: 'Which surface has the least friction?',
    options: ['Sandpaper', 'Wood', 'Glass', 'All the same'],
    answer: 2,
    hint: 'Less friction lets the car travel further.',
    explanation: 'The car went furthest on glass, so glass offered the least friction.',
  }),
  // L2 · Select the relevant facts
  unt('2a', 2, {
    context: 'A sliding door at school is hard to push. Facts: it is painted blue; it was fitted in 2015; the track has dust and small stones in it; it is 2 metres tall; its rollers are rusty.',
    stem: 'Which two facts best explain why the door is hard to push?',
    options: ['It is painted blue and is 2 metres tall', 'The track is dusty with stones, and the rollers are rusty', 'It was fitted in 2015 and is painted blue', 'It is 2 metres tall and was fitted in 2015'],
    answer: 1,
    hint: 'Look for facts about the surfaces that rub against each other.',
    explanation: 'Dust, stones and rust all increase friction where the door moves. Colour, height and year do not affect it.',
  }),
  unt('2b', 2, {
    context: 'A bicycle is harder to pedal than last week. Facts: a new bell was fitted; the tyres look flat; the chain is dry and squeaky; the rider wore a red shirt.',
    stem: 'Which facts matter most?',
    options: ['The new bell and the red shirt', 'The flat tyres and the dry, squeaky chain', 'The red shirt and the flat tyres', 'Only the new bell'],
    answer: 1,
    hint: 'Which facts change how much the moving parts resist motion?',
    explanation: 'Flat tyres increase rolling resistance and a dry chain increases friction. The bell and shirt are distractions.',
  }),
  // L3 · Diagnose
  unt('3a', 3, {
    context: 'Aman pulled a block across three surfaces with a spring balance. Readings: 4 N, 6 N and 4 N. For the second surface he used a heavier block.',
    stem: 'What is wrong with concluding that the second surface has the most friction?',
    options: ['Nothing, 6 N is clearly the highest', 'He changed the block, so it was not a fair test', 'Spring balances cannot measure friction', 'He should have used four surfaces'],
    answer: 1,
    hint: 'How many things changed between the second test and the others?',
    explanation: 'A heavier block presses harder on the surface and needs more force. With two changes at once, the result cannot be blamed on the surface.',
  }),
  unt('3b', 3, {
    context: 'A ceiling fan squeaks and turns slower than before. The blades are clean, the switch is new, and the bearing in the motor has not been oiled for two years.',
    stem: 'What is the most likely cause?',
    options: ['The new switch', 'The clean blades', 'The dry bearing is causing extra friction', 'The fan is too old to turn'],
    answer: 2,
    hint: 'Squeaking is a clue about two parts rubbing.',
    explanation: 'Without oil, friction in the bearing rises. That causes both the squeak and the slower turning.',
  }),
  // L4 · Define
  unt('4a', 4, {
    context: 'A shopkeeper says: “Customers keep slipping at my entrance in the rainy season.” The entrance has smooth marble tiles. The shop sells clothes. The awning above the door has a hole.',
    stem: 'Which is the real problem to solve?',
    options: ['How to sell more clothes in the rains', 'How to make the wet entrance floor less slippery', 'How to stop the rain', 'How to choose a new colour for the tiles'],
    answer: 1,
    hint: 'Strip the story down to what actually causes the slipping.',
    explanation: 'Water on smooth marble lowers friction. The problem to solve is keeping grip high when the entrance is wet (for example by fixing the awning or adding a rough mat).',
  }),
  unt('4b', 4, {
    context: 'A school says the playground slide is “not good”. Younger children say it is too fast. Older children say it is fine. The slide was waxed last week.',
    stem: 'How should the problem be stated?',
    options: ['The slide is old and must be replaced', 'Older children are using the slide too much', 'Since the waxing, the slide has too little friction for younger children', 'Children should not use slides'],
    answer: 2,
    hint: 'What changed, and for whom is it a problem?',
    explanation: 'Waxing reduced friction, so the slide became too fast for younger children. A clear problem statement points to the fix.',
  }),
  // L5 · Reframe
  unt('5a', 5, {
    context: 'A team keeps adding oil to a squeaky outdoor gate hinge, but it squeaks again within two days. The gate is next to a dusty road.',
    stem: 'What is a better way to think about the problem?',
    options: ['Use even more oil each time', 'Ask why the oil stops working so fast: dust may stick to it and turn into grit', 'Replace the gate with a bigger one', 'Stop using the gate'],
    answer: 1,
    hint: 'If a fix keeps failing, question the fix, not just the amount.',
    explanation: 'Oil catches dust and forms a gritty paste that increases friction. Reframing points to a sealed hinge or a dust cover.',
  }),
  unt('5b', 5, {
    context: 'A workshop says: “Our machine wears out because it is old.” Records show the parts wore fastest in the month the lubricant ran out, and a new machine run without oil wore out just as fast.',
    stem: 'How should the problem be reframed?',
    options: ['The machine is simply too old', 'The real issue is friction from missing lubrication, not the machine’s age', 'New machines are badly made', 'The workers use the machine too much'],
    answer: 1,
    hint: 'What do the old and the new machine have in common when they wear out fast?',
    explanation: 'Both machines wore fast when there was no lubricant. The evidence points to friction, not age.',
  }),
  // L6 · Problem finding
  unt('6a', 6, {
    context: 'On a village road, accidents doubled in the year it was resurfaced with smooth new asphalt. Most accidents happen in the monsoon. Traffic stayed the same.',
    stem: 'Which question is most worth investigating first?',
    options: ['Are drivers in this village worse than elsewhere?', 'Does the new smooth surface give tyres less grip when it is wet?', 'Should the road be painted?', 'Are there too many cars?'],
    answer: 1,
    hint: 'Look at what changed and when the accidents happen.',
    explanation: 'The new surface and the wet season both point to grip. Testing friction on the wet surface is the most useful question.',
  }),
  unt('6b', 6, {
    context: 'On sports day, runners in lane 1 were slower all day. Lane 1 is next to a leaking tap. The same runners were faster in other lanes earlier in the day.',
    stem: 'What should the organisers investigate?',
    options: ['Whether lane 1 runners are weaker', 'Whether the leaking tap makes lane 1 wet and slippery', 'Whether lane 1 is shorter', 'Whether runners prefer other lanes'],
    answer: 1,
    hint: 'The runners were fine elsewhere, so look at the lane.',
    explanation: 'The same runners were faster in other lanes, so the lane is the likely cause. A wet track reduces grip and slows runners.',
  }),
];

// ---------- Pivot: can they change approach when it isn't working? ----------
const piv = item('PIV');
const PIVOT = [
  // L1 · Select
  piv('1a', 1, {
    stem: 'You need to move a heavy cupboard across the floor. Which way needs the least force?',
    options: ['Push it directly on the floor', 'Put round rollers under it and push', 'Drag it with a rope on the floor', 'Lift one end and drag the other'],
    answer: 1,
    hint: 'Rolling or sliding: which one has less friction?',
    explanation: 'Rollers change sliding friction into rolling friction, which is much smaller.',
  }),
  piv('1b', 1, {
    stem: 'A wooden drawer keeps sticking. What is the most sensible first step?',
    options: ['Pull it harder every time', 'Rub wax or soap on the runners', 'Paint the drawer', 'Fill the drawer with more things'],
    answer: 1,
    hint: 'You want the surfaces to slide more easily.',
    explanation: 'Wax or soap acts as a lubricant and reduces friction between the drawer and its runners.',
  }),
  // L2 · Compare
  piv('2a', 2, {
    stem: 'A door creaks loudly. Plan A: oil the hinges. Plan B: replace the whole door. Which is better?',
    options: ['Plan B, a new door never creaks', 'Plan A, it fixes the cause (friction in the hinges) cheaply', 'Both are equally good', 'Neither, creaking cannot be fixed'],
    answer: 1,
    hint: 'Where does the creak actually come from?',
    explanation: 'The creak comes from friction in the hinges. Oiling them fixes the cause at a fraction of the cost.',
  }),
  piv('2b', 2, {
    stem: 'A cricket bat handle slips in sweaty hands. Option A: smooth plastic tape. Option B: a textured rubber grip. Which is better?',
    options: ['Option A, smooth tape', 'Option B, textured rubber grip', 'Neither makes any difference', 'Remove the handle cover'],
    answer: 1,
    hint: 'Which surface gives more friction against the hand?',
    explanation: 'Textured rubber gives more friction than smooth plastic, so the hands slip less.',
  }),
  // L3 · Respond to evidence
  piv('3a', 3, {
    context: 'You oiled a squeaky bicycle chain. It still squeaks, and now you notice that one link is bent.',
    stem: 'What should you do next?',
    options: ['Add more oil', 'Fix or replace the bent link', 'Ride faster', 'Pump the tyres'],
    answer: 1,
    hint: 'The first fix did not work. What does the new clue tell you?',
    explanation: 'Oil did not solve it, and the bent link is new evidence. A bent link rubs and catches, so it needs fixing.',
  }),
  piv('3b', 3, {
    context: 'To help a box slide down a ramp, you made the ramp smoother. Now the box slides, but it moves so fast that it falls off the end.',
    stem: 'What is the best next change?',
    options: ['Make the ramp even smoother', 'Add a rougher strip near the bottom to slow the box', 'Use a heavier box', 'Remove the ramp'],
    answer: 1,
    hint: 'You need low friction at the top and more friction at the end.',
    explanation: 'A rough strip at the bottom adds friction exactly where the box must slow down, keeping the smooth top.',
  }),
  // L4 · Revise
  piv('4a', 4, {
    context: 'Your plan was to make a toy car roll further by polishing its wheels. After testing, it still slows down quickly. You notice the axles rub against the car body.',
    stem: 'How should you revise the plan?',
    options: ['Polish the wheels more', 'Reduce friction at the axles, for example with washers or a drop of oil', 'Make the car heavier', 'Paint the wheels'],
    answer: 1,
    hint: 'Where is most of the friction really happening?',
    explanation: 'The main friction is at the axles, not on the wheel surface. Fixing that spot is what will help.',
  }),
  piv('4b', 4, {
    context: 'You thought a box of books was hard to slide because the floor was rough. On a smooth floor it was still hard to slide. Then you saw the box has rubber feet underneath.',
    stem: 'What is the better explanation now?',
    options: ['The floor is still the main problem', 'The rubber feet grip the floor and cause high friction', 'Books are too heavy to ever slide', 'Smooth floors increase friction'],
    answer: 1,
    hint: 'Your first idea was tested and did not hold.',
    explanation: 'The smooth-floor test ruled out the floor. Rubber feet create high friction, so placing a cloth or cardboard under the box would help.',
  }),
  // L5 · Trade-off
  piv('5a', 5, {
    context: 'A school is choosing sports shoes for a dusty ground. Very grippy soles are safest but wear out fast and cost more. Smooth soles last long and are cheap but slip easily.',
    stem: 'Which choice balances safety and cost best?',
    options: ['Smooth soles, because they last longest', 'Medium-grip rubber soles with grooves', 'The grippiest soles, whatever the cost', 'No shoes, to save money'],
    answer: 1,
    hint: 'Safety cannot be dropped, but cost still matters.',
    explanation: 'Medium-grip grooved soles keep enough friction to be safe while lasting longer and costing less than the grippiest option.',
  }),
  piv('5b', 5, {
    context: 'A machine in a cold store needs lubricating. Thick grease lasts longer but becomes stiff in the cold and makes the motor work harder. Thin oil runs easily in the cold but must be topped up every week. Staff check the machine weekly.',
    stem: 'Which lubricant is the better choice?',
    options: ['Thick grease, because it lasts longer', 'Thin oil, topped up during the weekly check', 'No lubricant at all', 'Water'],
    answer: 1,
    hint: 'Which drawback can the team actually manage?',
    explanation: 'The weekly check makes topping up easy, while stiff grease would make the motor work harder every day. Thin oil is the better trade-off here.',
  }),
  // L6 · Adapt to change
  piv('6a', 6, {
    context: 'Your team built a ramp with rough rubber strips to slow down parcels. Now the factory has switched to heavier parcels wrapped in slippery plastic.',
    stem: 'How should you adapt the ramp?',
    options: ['Keep it exactly the same', 'Lower the ramp angle or add a longer rough section', 'Make the ramp steeper', 'Remove the rubber strips'],
    answer: 1,
    hint: 'The parcels now slide more easily and carry more momentum.',
    explanation: 'Slippery wrap lowers friction and heavier parcels gain more momentum. A gentler slope or a longer rough section brings friction and speed back under control.',
  }),
  piv('6b', 6, {
    context: 'You fitted ball bearings to a school gate so it opens easily. When the monsoon arrives, the bearings rust and the gate jams.',
    stem: 'What is the best way to adapt?',
    options: ['Remove the bearings', 'Use sealed or rust-proof bearings and grease them before the monsoon', 'Leave the gate open all monsoon', 'Paint over the bearings'],
    answer: 1,
    hint: 'The idea was good. The conditions changed.',
    explanation: 'Bearings still reduce friction well. Sealed, rust-proof bearings and timely greasing keep them working in wet weather.',
  }),
];

module.exports = [...STRETCH, ...UNTANGLE, ...PIVOT];
