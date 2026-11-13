// Civics · Class 8, Indian Constitution unit (secularism). Source: DIDAC Civics Pool v2 (all 24 items).
//
// One question per level per skill. Every Civics hand follows a fixed ladder (SUBJECT_PLANS in
// engine/index.js): Easy plays questions 1 → 2 → 3, Tough plays questions 4 → 5 → 6.
//
// Rules carried over from the pool:
//   - Language is easy; the challenge comes from confusable concepts, not hard words.
//   - Distractors are misconception-based near-misses (see `distractorLogic` on each item).
//   - Facts trace only to the pool's SOURCE_FACTS; `sourceFacts` records the SF# used.
//   - Competencies are proposed by us, not CBSE.
// Changes from the pool (the booth only scores single-answer multiple choice):
//   - yes_no_grid items: the four statements are listed in the stimulus (re-ordered so the key is not
//     always "1 and 3") and the visitor picks the right set. The grid's trap statement is built into
//     the wrong options.
//   - one_line items: rebuilt as four options. The rubric's green answer is the key; the amber and grey
//     rubric bands became the distractors.
// Status: reviewed and approved by the Social Science reviewer (spec 10.2).

const item = (skill) => (level, q) => ({
  id: `CIV-${skill}-L${level}`,
  poolId: `CIV-${skill}-L${level}-v2`,
  subject: 'CIV',
  skill,
  level,
  answer: 0, // the right option is listed first here; options are shuffled every time they are served
  review: 'approved',
  ...q,
});
const list = (intro, statements) => `${intro}\n${statements.map((t, i) => `(${i + 1}) ${t}`).join('\n')}`;

// ---------- Depth: how deep can they think about secularism? ----------
const dep = item('DEP');
const DEPTH = [
  dep(1, {
    competency: 'Recalling the meaning of secularism',
    context: 'This unit uses the word secularism.',
    stem: 'What does secularism mean?',
    options: [
      'The State stays separate from religion and treats all religions equally',
      'The State rejects all religions and discourages people from following any',
      'The State follows the religion of the majority and protects it',
      'Religion decides what the State may and may not do',
    ],
    hint: 'It is about the State’s relationship with ALL religions, not for or against any one.',
    explanation: 'Secularism means the State is separate from religion and treats all religions equally. It is not anti-religion, not a majority religion, and not religion controlling the State.',
    distractorLogic: 'B = "secularism means anti-religion" misconception. C = majority/official-religion state. D = reverses the direction (theocracy).',
    sourceFacts: ['SF4', 'SF7'],
  }),
  dep(2, {
    competency: 'Understanding within- vs between-religion domination',
    format: 'yes_no_grid → pick the set',
    context: list('Secularism opposes two kinds of domination: BETWEEN religions and WITHIN a religion.', [
      'One religious group stops another religious group from building its place of worship',
      'Within a religion, some members are treated as “lower” and kept out of certain practices',
      'Two religions jointly celebrate a shared festival',
      'A rule inside a religion forces some of its members to stay silent',
    ]),
    stem: 'Which TWO are domination WITHIN one religion?',
    options: ['2 and 4', '1 and 2', '1 and 4', '2 and 3'],
    hint: 'Within = inside one religion. Domination between two religions is a different kind.',
    explanation: '(2) and (4) happen inside one religion. (1) is domination too, but between two religions. (3) is not domination at all.',
    distractorLogic: 'Statement 1 is the key trap: it IS domination, but between religions. Options B and C include it. D includes the festival.',
    sourceFacts: ['SF5', 'SF6'],
  }),
  dep(3, {
    competency: 'Applying separation vs intervention vs principled distance',
    context: 'A State decides that no government office will favour or fund any one religion over the others.',
    stem: 'This decision is an example of which idea?',
    options: [
      'Separation: the State staying neutral between religions',
      'Intervention: the State stepping in to change a religion',
      'Principled distance: the State stepping in to protect a constitutional ideal',
      'Making one religion the official religion of the State',
    ],
    hint: 'Is the State staying out, or stepping in?',
    explanation: 'Not favouring any religion means the State is staying out and staying neutral. That is separation. Intervention and principled distance are about the State stepping in, which does not happen here.',
    distractorLogic: 'B and C are real unit terms about the State ACTING, but here the State does not step in at all.',
    sourceFacts: ['SF4', 'SF5'],
  }),
  dep(4, {
    competency: 'Analysing separation vs intervention',
    format: 'yes_no_grid → pick the set',
    context: list('The Indian secular State both stays separate from religion AND sometimes steps in (intervenes) to protect equality.', [
      'Banning the practice of untouchability',
      'Refusing to favour any one religion in government offices',
      'Staying out of how a community conducts its private prayer',
      'Giving assistance to a religious minority to run its school',
    ]),
    stem: 'Which of these are the State INTERVENING in religion?',
    options: ['1 and 4', 'Only 1', '1 and 2', '3 and 4'],
    hint: 'Intervening = actively stepping in, by a ban or by giving assistance. Separation = staying out.',
    explanation: 'Banning untouchability (1) and giving assistance (4) are both ways of stepping in. Not favouring a religion (2) and staying out of private prayer (3) are separation.',
    distractorLogic: '"Only 1" is the trap: assistance feels soft or neutral, but it IS intervention (SF11). C and D each mix in a separation action.',
    sourceFacts: ['SF8', 'SF10', 'SF11'],
  }),
  dep(5, {
    competency: 'Judging an action against principled distance',
    format: 'one_line → tap_options',
    context: '“Principled distance” means the State should step into religion only when it protects the ideals in the Constitution, such as equality and freedom.',
    stem: 'A State bans untouchability. Does this fit “principled distance”, and why?',
    options: [
      'Yes, because the ban protects equality, an ideal in the Constitution',
      'No, because a secular State must never step into religious matters',
      'Yes, because the State may change any religious practice it dislikes',
      'No, because the ban favours one group of people over another group',
    ],
    hint: 'Does the ban protect equality? Is equality a constitutional ideal?',
    explanation: 'Untouchability let some people dominate others. Banning it protects equality, an ideal in the Constitution, so the State stepping in fits principled distance.',
    distractorLogic: 'B = "separation only, never intervene". C = right verdict, wrong reason (unlimited interference). D = misreads protection of the weaker as favouritism.',
    sourceFacts: ['SF6', 'SF9', 'SF12'],
  }),
  dep(6, {
    competency: 'Explaining why separation protects equality',
    format: 'one_line → tap_options',
    stem: 'Which is the best way to explain to a younger student why separating religion and the State helps everyone be treated equally?',
    options: [
      'No religion can use the State to push others around, so all get fair treatment',
      'Nobody is allowed to follow a religion, so everyone ends up exactly the same',
      'The biggest religion makes the rules, so there is less arguing between groups',
      'Religion is kept out of people’s lives, so they have nothing to disagree about',
    ],
    hint: 'Use the idea of stopping one group from dominating another.',
    explanation: 'Separation stops any one religion from using the State to dominate the others, and that is what lets everyone be treated equally and freely.',
    distractorLogic: 'B = anti-religion misconception. C = majority rule, the opposite of equality. D = confuses State separation with removing religion from private life.',
    sourceFacts: ['SF5', 'SF7'],
  }),
];

// ---------- Stretch: can they use the idea somewhere new? ----------
const str = item('STR');
const STRETCH = [
  str(1, {
    competency: 'Recognising neutrality/separation in a near case',
    context: 'In the unit, keeping the State separate from religion stops one religion controlling others.',
    stem: 'A town office decides it will not take the side of any one religion when settling a dispute between two religious groups. Which idea does this show?',
    options: [
      'Separation and neutrality, so neither group can dominate the other',
      'Principled distance: the office is stepping in to reform both groups',
      'Treating the groups equally by favouring the smaller one a little',
      'Staying neutral because the office does not care about either group',
    ],
    hint: 'Staying neutral so no side can dominate: which idea is that?',
    explanation: 'The office stays neutral so that neither group can dominate the other. That is the same separation idea as the State staying apart from religion.',
    distractorLogic: 'B misuses "principled distance" (no stepping in here). C contradicts itself (favouring is not equal). D = right action, wrong reason.',
    sourceFacts: ['SF4', 'SF5'],
  }),
  str(2, {
    competency: 'Telling real transfer from surface similarity',
    format: 'yes_no_grid → pick the set',
    context: list('Unit idea: domination within a group should be opposed; fairness protects the weaker from the stronger.', [
      'In a club, long-time members shut new members out of every decision',
      'Two shops sell the same sweets at the same price',
      'In a family, the oldest members never let the younger ones speak, treating them as lesser',
      'Friends take turns choosing which game to play',
    ]),
    stem: 'In which situations does this SAME idea apply?',
    options: ['1 and 3', '1 and 4', '2 and 3', 'Only 3'],
    hint: 'The idea is about one group dominating or excluding another unfairly, not just any situation with a group in it.',
    explanation: 'In (1) and (3) a stronger group keeps a weaker one down, which is the domination the unit opposes. (2) and (4) are ordinary, fair situations.',
    distractorLogic: 'Situations 2 and 4 are fair situations dressed in group language, to catch matching on surface ("a group!") instead of on domination.',
    sourceFacts: ['SF5'],
  }),
  str(3, {
    competency: 'Recognising separation of power in a classroom',
    stem: 'A teacher rules that the class monitor cannot also be the one who decides punishments, so the monitor cannot bully classmates. Which idea is this closest to?',
    options: [
      'Keeping powers separate so one person cannot dominate others',
      'Giving one trusted person all the power so decisions are quicker',
      'Making sure every student gets an equal turn as monitor',
      'Removing the monitor role so there are no rules at all',
    ],
    hint: 'Why split the powers up? To stop what?',
    explanation: 'Splitting the powers stops one person from dominating the rest. It is the same principle as keeping religion and the State separate.',
    distractorLogic: 'B = the opposite principle (concentration for efficiency). C = rotation, not separation. D misreads "separate" as "remove". Reviewer-approved transfer edge.',
    sourceFacts: ['SF5'],
  }),
  str(4, {
    competency: 'Recognising domination-protection in a new rule',
    format: 'one_line → tap_options',
    context: 'A housing committee rules that even a small group of residents can block a decision that would unfairly harm them, so the majority cannot always force its will.',
    stem: 'Which unit idea does this rule protect?',
    options: [
      'Protecting a smaller group from being dominated by the majority',
      'Letting the majority decide everything so that things move quickly',
      'Treating every resident in exactly the same way in every case',
      'Keeping the housing committee separate from religion',
    ],
    hint: 'What does it stop the majority from doing to the minority?',
    explanation: 'The rule stops the bigger group from forcing its will on a smaller one. That is the unit’s idea of protecting the weaker from domination.',
    distractorLogic: 'B = the opposite (majority rule). C = mentions fairness but misses domination (rubric amber). D matches the unit word "separate" on the surface only.',
    sourceFacts: ['SF5', 'SF7'],
  }),
  str(5, {
    competency: 'Selecting a true vs look-alike analogy',
    context: 'A secular State stays separate from all religions so no religion can dominate.',
    stem: 'Which situation works the SAME way? Careful: some choices only look similar.',
    options: [
      'A neutral referee who belongs to neither team enforces the rules fairly',
      'An umpire who is also the captain of one of the teams',
      'A referee who quietly lets the home team bend the rules',
      'Two teams agree to play with no referee at all',
    ],
    hint: 'Separate AND neutral: belonging to no side, and favouring no side.',
    explanation: 'Like the secular State, the referee belongs to no side and favours no side. The others either are not separate, are not neutral, or remove the referee altogether.',
    distractorLogic: 'B = authority but not separate. C = authority but not neutral. D removes the separating authority.',
    sourceFacts: ['SF4', 'SF5'],
  }),
  str(6, {
    competency: 'Transferring constitution-as-prior-agreement',
    format: 'one_line → tap_options',
    context: 'A constitution is a set of basic rules a country agrees on in advance.',
    stem: 'Before a long trip, friends agree in writing on how decisions will be made, so that later the most forceful friend cannot change the plan to suit only themselves. Which unit idea is this most like, and why?',
    options: [
      'A constitution: rules agreed early stop the strongest from dominating later',
      'Principled distance: the group steps in only to protect equality',
      'A constitution: writing rules down makes the trip more organised',
      'Separation: each friend keeps their own plans apart from the others',
    ],
    hint: 'Why does a country write down its basic rules in advance?',
    explanation: 'Like a constitution, a shared agreement made in advance stops the most forceful person from bending the rules later to suit only themselves.',
    distractorLogic: 'C = right idea, weak reason (rubric amber). B = a real unit term, wrong idea. D matches "separate" on the surface. Reviewer-approved transfer edge.',
    sourceFacts: ['SF1', 'SF2', 'SF3'],
  }),
];

// ---------- Untangle: can they make sense of a messy problem? ----------
const LIBRARY = 'A town opens a community library, paid for by the town for all residents. A notice says residents of certain streets may enter in the mornings. Residents of the other streets, mostly from one community, may enter only for one hour in the evening. The library has 2000 books and the building is painted blue. Some residents say the rules are unfair.';
const unt = item('UNT');
const UNTANGLE = [
  unt(1, {
    competency: 'Identifying the stated problem',
    context: LIBRARY,
    stem: 'Some residents are upset. What is the problem they are pointing to?',
    options: [
      'The rules give some residents much less access than others',
      'The library’s opening hours are too short for everyone',
      'There are not enough books for all the residents',
      'The evening time slot is inconvenient for some',
    ],
    hint: 'Look at who is allowed in, and when, and who gets the worse deal.',
    explanation: 'The core problem is unequal treatment: one group of residents gets far less access than the others. Short hours, book numbers and inconvenience are side issues.',
    distractorLogic: 'B, C, D are real-sounding but secondary (inconvenience or resources, not unequal treatment). D is the narrow misframe revisited at L5.',
    sourceFacts: ['SF5', 'SF7'],
  }),
  unt(2, {
    competency: 'Separating relevant from irrelevant facts',
    format: 'yes_no_grid → pick the set',
    context: list(`${LIBRARY} Facts:`, [
      'The library has 2000 books',
      'Some residents may enter only one evening hour while others get all morning',
      'The library is paid for by the town for ALL residents',
      'The building is painted blue',
    ]),
    stem: 'To decide whether the rules are fair, which facts are relevant?',
    options: ['2 and 3', 'Only 2', '1 and 2', '3 and 4'],
    hint: 'Relevant facts are the ones that affect who gets fair access.',
    explanation: 'The unequal hours (2) are the unfairness, and “paid for by ALL residents” (3) is what makes it unfair. The number of books and the paint colour do not matter.',
    distractorLogic: '"Only 2" is the trap: "funded for all" looks like background but is exactly what makes unequal access unfair.',
    sourceFacts: ['SF5', 'SF7'],
  }),
  unt(3, {
    competency: 'Diagnosing the cause of unfairness',
    context: LIBRARY,
    stem: 'What is most likely causing the unequal access?',
    options: [
      'A rule that treats residents of some streets, mostly one community, differently',
      'The library being too small to let everyone in at once',
      'Residents of some streets choosing not to come in the mornings',
      'There being equal morning and evening slots for everyone',
    ],
    hint: 'Is it a limit on space, a choice by residents, or a rule about people?',
    explanation: 'The notice itself sets different hours for different streets. The unequal access comes from a rule that treats some residents differently.',
    distractorLogic: 'B blames capacity, C blames the residents, D denies the inequality: three misdiagnoses that each dodge the rule.',
    sourceFacts: ['SF5'],
  }),
  unt(4, {
    competency: 'Defining the problem precisely',
    format: 'one_line → tap_options',
    context: LIBRARY,
    stem: 'Which statement defines the real problem most precisely: who is affected, and how the rule is unfair?',
    options: [
      'One community gets far worse access to a library paid for by all',
      'The rules seem unfair, and some residents in the town are unhappy about them',
      'The library should buy more books and stay open for longer every day',
      'Evening visitors get less time to choose their books than they would like',
    ],
    hint: 'Name the unequal treatment and who it affects.',
    explanation: 'The precise problem: residents of some streets, mostly one community, get much worse access than others, even though the town pays for the library for everyone.',
    distractorLogic: 'B = vague about who or how (rubric amber). C = irrelevant resources issue. D = narrow inconvenience framing.',
    sourceFacts: ['SF5', 'SF7'],
  }),
  unt(5, {
    competency: 'Reframing a narrow problem definition',
    context: `${LIBRARY} One resident says: “The problem is just that the evening hour is inconvenient.”`,
    stem: 'Is this a good way to define the problem? Choose the better definition.',
    options: [
      'No. The real problem is unequal access that treats one group worse',
      'Yes. The only real problem here is the inconvenient evening hour',
      'The real problem is that the library is funded by the whole town',
      'The real problem is that too many residents want to use it at once',
    ],
    hint: 'Does “inconvenient timing” capture the unfairness, or hide it?',
    explanation: 'Calling it “inconvenient” hides the unfairness. The real problem is that a library paid for by everyone gives one group much worse access.',
    distractorLogic: 'B = the narrow misframe. C turns a relevant fact into "the problem". D reframes it as a demand/capacity issue.',
    sourceFacts: ['SF5', 'SF7'],
  }),
  unt(6, {
    competency: 'Finding a meaningful unstated problem',
    format: 'one_line → tap_options',
    context: LIBRARY,
    stem: 'Which is a further problem that no one has mentioned yet, but that the facts support?',
    options: [
      'Rules that treat one community worse could deepen divisions in the town',
      'The blue paint on the building may put some readers off visiting',
      'The evening hour is inconvenient for some of the residents',
      'The library’s 2000 books may be old and out of date',
    ],
    hint: 'Think about what might happen next, or who gets to set the rules.',
    explanation: 'A rule that singles out one community, in a place paid for by everyone, could deepen division between communities. That follows from the facts and has not been raised yet.',
    distractorLogic: 'B builds on an irrelevant fact. C restates the problem already raised. D invents facts (nothing says the books are old).',
    sourceFacts: ['SF5', 'SF7'],
  }),
];

// ---------- Pivot: can they change approach when conditions change? ----------
const piv = item('PIV');
const PIVOT = [
  piv(1, {
    competency: 'Selecting an appropriate State approach',
    context: 'Goal: the State wants to stop a harmful practice inside a religion (for example, untouchability) that treats some members as “lower”.',
    stem: 'Which approach best fits this goal?',
    options: [
      'Intervene with a ban on the harmful practice',
      'Stay separate and let the community settle the matter on its own',
      'Give the group assistance so it can carry on the practice more smoothly',
      'Publicly disapprove of the practice but take no actual action',
    ],
    hint: 'A harmful practice that dominates some members: should the State stay out, or step in?',
    explanation: 'To stop a practice that dominates some members, the State steps in with a ban, as India did with untouchability. Staying out would leave the domination in place.',
    distractorLogic: 'B is the strong trap: separation is a real unit idea, but principled distance says intervene to protect equality. C misapplies assistance. D is action that is not action.',
    sourceFacts: ['SF9', 'SF11'],
  }),
  piv(2, {
    competency: 'Comparing ban vs assistance vs staying out',
    context: 'The State can intervene by a ban or by giving assistance, or it can stay separate. A religious minority cannot afford to run its school.',
    stem: 'Which approach fits this situation best?',
    options: [
      'Assistance: the problem is a lack of resources, so help them run it',
      'A ban: stopping the school would remove the problem',
      'Separation: the State should stay out, even though the minority cannot manage',
      'Make the majority religion official so there is one common standard',
    ],
    hint: 'A ban stops a harmful practice; assistance helps when the problem is a lack of means. Which matches?',
    explanation: 'The problem here is a lack of resources, not a harmful practice, so assistance is the right kind of intervention.',
    distractorLogic: 'C is the near-miss: separation is legitimate in general, but here it ignores the equality goal. B misapplies a ban. D is an official-religion distractor.',
    sourceFacts: ['SF11'],
  }),
  piv(3, {
    competency: 'Interpreting evidence about an approach',
    context: 'The State banned a harmful practice. A year later, reports show it has mostly stopped in public, but a few places still carry it on secretly.',
    stem: 'What does this evidence tell the State about its approach?',
    options: [
      'The ban is largely working but needs follow-up where it is being ignored',
      'The ban has failed and should be withdrawn',
      'The ban is a complete success and nothing more needs doing',
      'The few secret cases prove the ban was a mistake',
    ],
    hint: 'Mostly stopped, but not everywhere: is that total failure, total success, or partial success?',
    explanation: 'Mostly stopped means the ban is working. The few places that still continue need follow-up, not a reversal of the ban.',
    distractorLogic: 'B over-reacts to the few failures, C ignores them, D misreads partial non-compliance as proof the policy was wrong.',
    sourceFacts: ['SF9', 'SF11'],
  }),
  piv(4, {
    competency: 'Revising a strategy without abandoning it',
    format: 'one_line → tap_options',
    context: 'Continuing: the ban mostly works, but a few places secretly continue the practice.',
    stem: 'How could the State REVISE (not abandon) its approach to reach those few places?',
    options: [
      'Keep the ban, and add awareness and checks where it is ignored',
      'Withdraw the ban, since it has not worked in every single place',
      'Keep the ban as it is and wait for those places to stop on their own',
      'Replace the ban with assistance for the people still following it',
    ],
    hint: 'Keep the ban, and add something (awareness, checking or support) where it is ignored.',
    explanation: 'The ban is working in most places, so keep it and add a further step, such as awareness or checking, aimed at the places still ignoring it.',
    distractorLogic: 'B abandons the ban. C keeps the ban but adds nothing (rubric amber). D drops the ban and misuses assistance.',
    sourceFacts: ['SF9', 'SF12'],
  }),
  piv(5, {
    competency: 'Balancing freedom vs equality (principled distance)',
    format: 'one_line → tap_options',
    context: 'Two good aims can clash: (A) protecting people’s freedom to follow their religion, and (B) stopping a practice inside a religion that dominates or harms some members. When they clash, “principled distance” gives the tie-breaker.',
    stem: 'What does principled distance tell the State to do?',
    options: [
      'Step in only where a practice goes against constitutional ideals like equality',
      'Never step in, because freedom of religion must always come first',
      'Step in whenever most people in the country dislike a practice',
      'Step in to every religious practice so all are controlled the same way',
    ],
    hint: 'The State may step in only to protect which kind of ideals?',
    explanation: 'Principled distance says any interference must rest on the Constitution’s ideals. So the State protects religious freedom, but steps in where a practice breaks equality.',
    distractorLogic: 'B = "never act". C = majority rule instead of constitutional ideals. D = "always act".',
    sourceFacts: ['SF11', 'SF12'],
  }),
  piv(6, {
    competency: 'Adapting when conditions change',
    context: 'Earlier, a religious minority needed State assistance to run its school. Conditions have changed: the community is now well-resourced and runs its schools well on its own, so continuing large assistance starts to look like the State favouring one group.',
    stem: 'Given the changed conditions, what should the State do to stay true to secularism?',
    options: [
      'Reduce or withdraw the assistance now that it is no longer needed',
      'Continue the same assistance, because the State should never change a decision',
      'Switch the assistance to a different religion instead, to keep things balanced',
      'Leave the community entirely and stop all contact with it',
    ],
    hint: 'The reason for the help has changed. Should the help stay exactly the same?',
    explanation: 'The assistance was for a need that no longer exists. Reducing it keeps the State neutral instead of favouring one group.',
    distractorLogic: 'B = a "consistency" misconception. C keeps favouring, just a different group. D over-corrects into hostility.',
    sourceFacts: ['SF8', 'SF11', 'SF12'],
  }),
];

module.exports = [...DEPTH, ...STRETCH, ...UNTANGLE, ...PIVOT];
