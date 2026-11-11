// History · The Revolt of 1857 (Grade 8), all four skills. Two questions per level, levels 1-6.
//
// Safeguards from spec v2 section 8.3:
//   - Only widely agreed textbook-level facts are used.
//   - Every quoted source is written by us and labelled "Practice source (written for this activity)".
//     No invented words are attributed to real people or documents.
//   - Where history has no single right cause, the correct option is the best-supported reasoning,
//     never "the one true cause".
//   - Contested readings are presented neutrally, and no community is blamed.
//   - No CBSE competency is claimed for History.
// Status: drafted for the booth, pending sign-off by a named Social Science teacher (spec 10.2).

const item = (skill) => (id, level, q) => ({ id: `HIS-${skill}-${id}`, subject: 'HIS', skill, level, review: 'pending', ...q });
const PRACTICE = 'Practice source (written for this activity): ';

// ---------- Depth: how deep can they think? ----------
const dep = item('DEP');
const DEPTH = [
  // L1 · Remember
  dep('1a', 1, {
    stem: 'In May 1857, sepoys in which town rose up and then marched to Delhi?',
    options: ['Meerut', 'Lucknow', 'Kanpur', 'Jhansi'],
    answer: 0,
    hint: 'It is a cantonment town close to Delhi.',
    explanation: 'On 10 May 1857 sepoys at Meerut rose up, freed their jailed comrades and marched to Delhi the next day.',
  }),
  dep('1b', 1, {
    stem: 'Which Mughal emperor did the rebels in Delhi declare as their leader in 1857?',
    options: ['Akbar', 'Aurangzeb', 'Bahadur Shah Zafar', 'Shah Jahan'],
    answer: 2,
    hint: 'He was the last Mughal emperor.',
    explanation: 'The sepoys who reached Delhi asked the elderly emperor Bahadur Shah Zafar to lead them, giving the revolt a recognised figurehead.',
  }),
  // L2 · Understand
  dep('2a', 2, {
    stem: 'Why were many sepoys angry about the cartridges for the new Enfield rifle?',
    options: ['The cartridges were too expensive', 'There was a rumour they were greased with cow and pig fat, which offended both Hindu and Muslim sepoys', 'The rifles were too heavy to carry', 'The cartridges often failed to fire'],
    answer: 1,
    hint: 'Sepoys had to bite the cartridge open before loading.',
    explanation: 'The cartridge had to be bitten open. The rumour about cow and pig fat touched the religious beliefs of both Hindus and Muslims.',
  }),
  dep('2b', 2, {
    stem: 'What was the Doctrine of Lapse?',
    options: ['A rule that sepoys must serve overseas', 'A tax on salt', 'A policy that if a ruler died without a natural son, the Company could take over the kingdom', 'A law that banned adoption everywhere in India'],
    answer: 2,
    hint: 'It was about what happened to a kingdom when its ruler died.',
    explanation: 'Under Lord Dalhousie, a kingdom whose ruler died without a natural male heir would “lapse” to the East India Company. Adopted sons were not accepted as heirs.',
  }),
  // L3 · Apply
  dep('3a', 3, {
    context: 'Three rulers die in the 1850s. Ruler A leaves a natural son. Ruler B leaves only an adopted son. Ruler C leaves a natural son and a brother.',
    stem: 'Under the Doctrine of Lapse, which kingdom would the Company most likely take over?',
    options: ['Kingdom A', 'Kingdom B', 'Kingdom C', 'None of them'],
    answer: 1,
    hint: 'Which heir did the Company refuse to accept?',
    explanation: 'The policy did not accept adopted sons as heirs, so Kingdom B would “lapse” to the Company.',
  }),
  dep('3b', 3, {
    stem: 'Peasants in 1857 complained that the Company took a very large share of their harvest as land revenue. What kind of grievance is this?',
    options: ['Religious', 'Economic', 'Military', 'Sporting'],
    answer: 1,
    hint: 'It is about money and livelihood.',
    explanation: 'Heavy land revenue took away the peasants’ income, so it is an economic grievance.',
  }),
  // L4 · Analyse
  dep('4a', 4, {
    context: PRACTICE + '“Our pay is less than it was before, and now they say we must be ready to cross the sea to fight wherever we are sent.”',
    stem: 'Which two grievances does this source show?',
    options: ['Heavy land tax and loss of a kingdom', 'Low pay and being made to serve overseas', 'Greased cartridges and new schools', 'Famine and floods'],
    answer: 1,
    hint: 'Read exactly what the writer complains about.',
    explanation: 'The source mentions lower pay and being sent overseas. For many sepoys, crossing the sea also raised fears of losing caste.',
  }),
  dep('4b', 4, {
    stem: 'The revolt spread strongly in Awadh. Which fact best helps explain this?',
    options: ['Awadh had no army at all', 'The Company had annexed Awadh in 1856, removing its Nawab, and many sepoys came from Awadh families', 'Awadh was far from the main areas of the revolt', 'Awadh had the lowest taxes in India'],
    answer: 1,
    hint: 'Think about who was affected there, both in the army and at home.',
    explanation: 'The recent annexation hurt nobles and many ordinary people, and many sepoys had family ties to Awadh, so grievances in the army and the villages joined up.',
  }),
  // L5 · Evaluate
  dep('5a', 5, {
    stem: 'A student says: “The revolt happened only because of the greased cartridges.” Which response is best supported by evidence?',
    options: ['Agree, nothing else mattered', 'The cartridges were a trigger, but deeper grievances such as annexations, heavy taxes and low pay had been building up', 'Disagree, the cartridges had nothing to do with it', 'Agree, because only sepoys took part'],
    answer: 1,
    hint: 'Was it only sepoys who joined, and were all their complaints about cartridges?',
    explanation: 'The cartridge issue sparked the rising, but peasants, rulers and townspeople also joined because of older economic and political grievances.',
  }),
  dep('5b', 5, {
    stem: 'Which evidence best supports the claim that 1857 was more than an army mutiny?',
    options: ['Sepoys refused to use the new cartridges', 'Rulers such as Rani Lakshmibai and Begum Hazrat Mahal, along with peasants and townspeople, joined the fighting', 'The revolt began in an army town', 'The British used the army to end it'],
    answer: 1,
    hint: 'Look for people who were not soldiers.',
    explanation: 'Participation by rulers, peasants and townspeople shows the revolt reached well beyond the army.',
  }),
  // L6 · Create
  dep('6a', 6, {
    stem: 'You are making a timeline poster about 1857 with only four events. Which set tells the clearest cause → events → result story?',
    options: [
      'Battles at Kanpur, Lucknow, Jhansi and Delhi',
      'Annexations under the Doctrine of Lapse → rising at Meerut (May 1857) → British retake Delhi (September 1857) → the British Crown takes over from the Company (1858)',
      'Mangal Pandey → Meerut → Delhi → Kanpur',
      'Four portraits of rebel leaders',
    ],
    answer: 1,
    hint: 'A good story needs a cause, what happened, and what changed afterwards.',
    explanation: 'This set moves from a cause, through the rising and its defeat, to a lasting consequence.',
  }),
  dep('6b', 6, {
    stem: 'You must write a one-line headline about 1857 for the school wall magazine. Which is the most balanced?',
    options: ['“1857: Traitors punished”', '“1857: Sepoys, peasants and rulers rise against Company rule”', '“1857: The day India won freedom”', '“1857: Nothing important happened”'],
    answer: 1,
    hint: 'A balanced headline describes what happened without taking a side.',
    explanation: 'It says who took part and against whom, without judging any group or overstating the result.',
  }),
];

// ---------- Stretch: can they use it somewhere new? ----------
const str = item('STR');
const STRETCH = [
  // L1 · Near
  str('1a', 1, {
    stem: 'Rani Lakshmibai resisted after the Company refused to accept her adopted son as heir to Jhansi. Which other leader had a similar complaint about an adopted son?',
    options: ['Nana Saheb, adopted son of the last Peshwa, whose pension was stopped', 'Lord Dalhousie', 'Mangal Pandey', 'Queen Victoria'],
    answer: 0,
    hint: 'Look for someone who was himself adopted.',
    explanation: 'Nana Saheb was the adopted son of Peshwa Baji Rao II. The Company refused to continue his father’s pension, a grievance much like Jhansi’s.',
  }),
  str('1b', 1, {
    stem: 'The cartridge rumour spread quickly from one army camp to another. What does this tell us?',
    options: ['Sepoys had telephones', 'News passed by word of mouth among people who already shared worries', 'The British spread the rumour on purpose', 'Nobody believed the rumour'],
    answer: 1,
    hint: 'How did news travel in 1857, and why would people believe it?',
    explanation: 'News moved through conversations between sepoys. A rumour spreads fast when it matches fears people already have.',
  }),
  // L2 · Near, modified
  str('2a', 2, {
    stem: 'After 1857, the British promised Indian rulers that their territories would not be annexed. Why?',
    options: ['They had no army left', 'To win the loyalty of rulers and avoid another revolt like the one annexations had helped cause', 'Because all rulers had been defeated', 'Because annexation was too cheap'],
    answer: 1,
    hint: 'Which earlier policy had angered rulers like those of Jhansi and Awadh?',
    explanation: 'Annexations had turned rulers against the Company. Promising to respect their territories was meant to keep them loyal.',
  }),
  str('2b', 2, {
    stem: 'After 1857 the British increased the share of European soldiers in the army in India. What lesson were they acting on?',
    options: ['European soldiers were cheaper', 'The revolt had started among Indian sepoys, so they wanted to rely on them less', 'Indian sepoys had asked to leave', 'They wanted a smaller army'],
    answer: 1,
    hint: 'Where did the revolt begin?',
    explanation: 'Because the revolt began in the army, the British reorganised it to reduce the risk of another rising.',
  }),
  // L3 · Adjacent
  str('3a', 3, {
    stem: 'A school suddenly bans a festival celebration without asking anyone, and students protest. Which pattern from 1857 is most similar?',
    options: ['Kingdoms being annexed', 'Rules that touched people’s beliefs, made without asking them, caused anger', 'Soldiers being paid less', 'The capture of Delhi'],
    answer: 1,
    hint: 'Look for a rule that affected beliefs and was imposed from above.',
    explanation: 'In 1857 decisions that seemed to interfere with religious practice, made without consultation, deepened distrust. The school case follows the same pattern.',
  }),
  str('3b', 3, {
    stem: 'A company cuts its workers’ pay and also orders them to move to a faraway city. The workers go on strike. Which 1857 grievance matches most closely?',
    options: ['Peasants paying heavy land revenue', 'Sepoys facing lower pay and orders to serve overseas', 'Rulers losing their kingdoms', 'Artisans losing work to factory goods'],
    answer: 1,
    hint: 'Find the group that faced both less pay and being sent far away.',
    explanation: 'Sepoys had both complaints: reduced pay and the requirement to serve wherever they were sent, including overseas.',
  }),
  // L4 · Cross-context
  str('4a', 4, {
    stem: 'A false rumour on a messaging app causes panic in a town. What does the cartridge story suggest a town leader should do first?',
    options: ['Ignore it, rumours always die out', 'Share clear, checked facts quickly and openly, because rumours grow where people already feel distrust', 'Punish everyone who shared it', 'Ban all phones'],
    answer: 1,
    hint: 'In 1857, why did people believe the rumour so easily?',
    explanation: 'The cartridge rumour spread because trust was already low. Quick, open, checked information is the best answer to a rumour.',
  }),
  str('4b', 4, {
    stem: 'In 1857 the revolt grew because different groups joined for different reasons. A town is protesting a new road toll. Which situation would most likely make the protest grow?',
    options: ['Only one shop owner is affected', 'Farmers, shop owners and transport drivers are all hurt by the toll, each in a different way', 'The toll is removed the next day', 'Nobody uses the road'],
    answer: 1,
    hint: 'What made 1857 bigger than an army protest?',
    explanation: 'When many groups have their own reasons to object, a protest gains wide support, just as sepoys, peasants and rulers joined in 1857.',
  }),
  // L5 · Cross-domain
  str('5a', 5, {
    stem: 'The same event is called the “Sepoy Mutiny” by some and the “First War of Independence” by others. A news report calls a strike a “riot”, while another calls it a “workers’ movement”. What does 1857 teach us about reading such reports?',
    options: ['Names never matter', 'Names often show the writer’s point of view, so check who is naming the event and why', 'The shorter name is always correct', 'Only official names are true'],
    answer: 1,
    hint: 'What does each name for 1857 emphasise?',
    explanation: 'A name can frame an event as disorder or as a struggle. Noticing who chose the name helps you read any report critically.',
  }),
  str('5b', 5, {
    stem: 'One reason the British regained control was that they could send messages by telegraph and move troops by rail, while rebel groups fought in different places without a single plan. What lesson does this offer a sports team?',
    options: ['The strongest player always wins', 'Good communication and coordination can matter as much as strength', 'Teams should never make plans', 'Only equipment matters'],
    answer: 1,
    hint: 'Look at what the rebels lacked, not how brave they were.',
    explanation: 'Coordination and fast communication gave the British an advantage. The same holds for any team working toward one goal.',
  }),
  // L6 · Far
  str('6a', 6, {
    stem: 'A new leader wants to bring in big changes without causing the kind of anger seen in 1857. Which approach uses the lesson best?',
    options: ['Make all changes quickly and quietly', 'Talk with affected groups, respect their beliefs and explain each change', 'Only change rules for the army', 'Ban all protests first'],
    answer: 1,
    hint: 'Which mistakes in the 1850s made people feel ignored?',
    explanation: 'Many grievances in 1857 came from changes imposed without consultation. Listening, respecting beliefs and explaining reduce that risk.',
  }),
  str('6b', 6, {
    stem: 'You are designing a museum exhibit on 1857 for visitors from both India and Britain. Which approach is best?',
    options: ['Show only the side your visitors prefer', 'Show several viewpoints, using sources from both sides that are clearly labelled', 'Show only weapons and uniforms', 'Avoid the topic because it is sensitive'],
    answer: 1,
    hint: 'A fair exhibit lets visitors weigh the evidence themselves.',
    explanation: 'Clearly labelled sources from several viewpoints help every visitor understand why people saw 1857 so differently.',
  }),
];

// ---------- Untangle: can they make sense of a messy problem? ----------
const unt = item('UNT');
const UNTANGLE = [
  // L1 · Structured
  unt('1a', 1, {
    context: 'Place and leader in 1857: Jhansi, Rani Lakshmibai · Lucknow, Begum Hazrat Mahal · Kanpur, Nana Saheb · Bihar, Kunwar Singh.',
    stem: 'Who led the resistance at Lucknow?',
    options: ['Rani Lakshmibai', 'Nana Saheb', 'Begum Hazrat Mahal', 'Kunwar Singh'],
    answer: 2,
    hint: 'Find Lucknow in the list.',
    explanation: 'Begum Hazrat Mahal led the resistance in Lucknow, the capital of Awadh.',
  }),
  unt('1b', 1, {
    context: 'Timeline: 1856, the Company annexes Awadh · March 1857, Mangal Pandey attacks officers at Barrackpore · May 1857, rising at Meerut · September 1857, the British retake Delhi · 1858, the British Crown takes over from the Company.',
    stem: 'Which event happened first?',
    options: ['The rising at Meerut', 'The British retake Delhi', 'The Company annexes Awadh', 'The Crown takes over'],
    answer: 2,
    hint: 'Look at the years and months.',
    explanation: 'The annexation of Awadh in 1856 came before all the events of 1857.',
  }),
  // L2 · Select the relevant facts
  unt('2a', 2, {
    context: 'Facts about one sepoy in 1857: he comes from Awadh; he enjoys wrestling; his pay was recently reduced; his family’s land is heavily taxed; he has two brothers.',
    stem: 'Which facts help explain why he might join the revolt?',
    options: ['He enjoys wrestling and has two brothers', 'His pay was reduced and his family’s land is heavily taxed', 'He has two brothers and comes from Awadh', 'He enjoys wrestling'],
    answer: 1,
    hint: 'Which facts are grievances?',
    explanation: 'Lower pay and heavy land tax are grievances that could push him to join. Hobbies and brothers do not explain it.',
  }),
  unt('2b', 2, {
    context: 'Facts about Jhansi: the Rani’s adopted son was not accepted as heir; Jhansi has a large fort; the Company took over Jhansi; Jhansi is in the Bundelkhand region.',
    stem: 'Which facts explain why Jhansi’s ruler resisted the Company?',
    options: ['It has a large fort and is in Bundelkhand', 'Her adopted son was refused as heir and the Company took over Jhansi', 'It is in Bundelkhand and has a fort', 'None of these facts'],
    answer: 1,
    hint: 'Which facts are about what the Company did to Jhansi?',
    explanation: 'Refusing the adopted heir and taking over the state under the Doctrine of Lapse are the grievances. The fort and region are background.',
  }),
  // L3 · Diagnose
  unt('3a', 3, {
    context: 'Two practice sources (written for this activity) disagree about the date a town rose up. Source A is a diary written that same week: “4 June.” Source B is a memoir written forty years later from memory: “some time in May.”',
    stem: 'Which source is likely to be more reliable about the date, and why?',
    options: ['Source B, because it is longer ago', 'Source A, because it was written at the time', 'Both are equally reliable', 'Neither, dates are never recorded'],
    answer: 1,
    hint: 'Memory fades over forty years.',
    explanation: 'A record made at the time is usually more reliable for dates than a memory written decades later.',
  }),
  unt('3b', 3, {
    stem: 'A student writes: “The revolt failed because the rebels were not brave.” What is the main problem with this claim?',
    options: ['It is too short', 'It ignores the evidence: many rebels fought bravely, and historians point to weak coordination and British resources instead', 'It uses the wrong year', 'It mentions the rebels'],
    answer: 1,
    hint: 'Does the evidence support the reason given?',
    explanation: 'The claim is not supported. Rebels showed great courage. Lack of a shared plan and the British advantages in communication and supplies are better-supported reasons.',
  }),
  // L4 · Define
  unt('4a', 4, {
    stem: 'Your teacher asks: “Was 1857 a mutiny or a war of independence?” What do you need to work out first?',
    options: ['Which name sounds better', 'What each term means, and who took part and why', 'How many years ago it was', 'Who won the most battles'],
    answer: 1,
    hint: 'You cannot test a label until you know what it means.',
    explanation: 'Defining each term, then checking who took part and what they wanted, lets you judge how well each label fits.',
  }),
  unt('4b', 4, {
    stem: 'The question is: “Why did the revolt not spread to every part of India?” Which information do you need most?',
    options: ['The names of all the battles', 'Which regions and rulers stayed out of it or supported the British, and their reasons', 'The weather in 1857', 'How long the rifles were'],
    answer: 1,
    hint: 'The question is about where the revolt did not happen.',
    explanation: 'To explain why it did not spread, you need to know which areas and groups stayed out and why.',
  }),
  // L5 · Reframe
  unt('5a', 5, {
    context: 'One name, “Sepoy Mutiny”, focuses on soldiers breaking army rules. Another, “First War of Independence”, focuses on a struggle for freedom.',
    stem: 'Which question is more useful than “Which name is right?”',
    options: ['Which name is shorter?', 'What does each name show, and what does it leave out?', 'Which name is older?', 'Which name do most people use?'],
    answer: 1,
    hint: 'Each name highlights some facts and hides others.',
    explanation: 'Asking what each name includes and leaves out shows why people describe the same event so differently.',
  }),
  unt('5b', 5, {
    stem: 'Instead of asking “Who was to blame for 1857?”, which question would help you understand it better?',
    options: ['“Who was the bravest?”', '“Why did different groups decide to join or stay out?”', '“Which side was evil?”', '“Who had the best uniforms?”'],
    answer: 1,
    hint: 'Blame looks for one culprit. Understanding looks for reasons.',
    explanation: 'Looking at the reasons of different groups gives a fuller and fairer picture than searching for someone to blame.',
  }),
  // L6 · Problem finding
  unt('6a', 6, {
    context: 'Many accounts of 1857 that survive were written by British officers and officials. Far fewer were written by peasants or ordinary sepoys.',
    stem: 'What question should a historian ask first?',
    options: ['Which British officer wrote the most?', 'Whose voices are missing, and how can we find out what they experienced?', 'Why did peasants not like writing?', 'Should we stop studying 1857?'],
    answer: 1,
    hint: 'What is the gap in the evidence?',
    explanation: 'The surviving records come mostly from one side. Finding other evidence, such as letters, songs, oral traditions and petitions, helps fill the gap.',
  }),
  unt('6b', 6, {
    context: 'Rebels held Delhi for about four months but lost it in September 1857. Different leaders fought in different regions at different times.',
    stem: 'Which question is most useful to investigate about why the revolt did not succeed?',
    options: ['Were the rebels brave enough?', 'How well were the different rebel groups able to coordinate with each other?', 'Why was Delhi chosen as the capital?', 'How tall were the city walls?'],
    answer: 1,
    hint: 'Look at the pattern: different places, different times.',
    explanation: 'Fighting in separate places at separate times suggests coordination was a key problem, which is worth investigating.',
  }),
];

// ---------- Pivot: can they change approach when it isn't working? ----------
const piv = item('PIV');
const PIVOT = [
  // L1 · Select
  piv('1a', 1, {
    stem: 'You want to find out what sepoys themselves felt in 1857. Which source should you look for first?',
    options: ['A modern film', 'A letter or statement made by a sepoy at the time', 'A cricket score from 1857', 'A map of Europe'],
    answer: 1,
    hint: 'Go to the people you are asking about.',
    explanation: 'A source made at the time by a sepoy is the closest evidence of how sepoys felt.',
  }),
  piv('1b', 1, {
    stem: 'You want to show the order in which the events of 1857 happened. Which tool is best?',
    options: ['A pie chart', 'A timeline', 'A family tree', 'A weather chart'],
    answer: 1,
    hint: 'Order in time.',
    explanation: 'A timeline places events in the order they happened.',
  }),
  // L2 · Compare
  piv('2a', 2, {
    stem: 'Explanation A: “The revolt was only about the cartridges.” Explanation B: “The cartridges were the spark, and many older grievances were the fuel.” Which fits more of the facts?',
    options: ['A', 'B', 'Both equally', 'Neither'],
    answer: 1,
    hint: 'Remember that peasants and rulers also joined.',
    explanation: 'Explanation B also accounts for why peasants and rulers joined, which A cannot explain.',
  }),
  piv('2b', 2, {
    context: PRACTICE + 'Source 1 is a letter by a British officer in Delhi. Source 2 is a letter by a Delhi resident. Both were written in 1857 and describe the same week.',
    stem: 'What is the best way to use them?',
    options: ['Use only the British officer’s letter', 'Use only the resident’s letter', 'Use both, compare them, and note each writer’s position', 'Use neither, because they disagree'],
    answer: 2,
    hint: 'Each writer saw the week from a different place.',
    explanation: 'Comparing sources and noting each writer’s position gives a fuller and fairer picture than relying on one side.',
  }),
  // L3 · Respond to evidence
  piv('3a', 3, {
    context: 'You explained 1857 as only an army rising. Then you read this. ' + PRACTICE + '“In our villages in Awadh, people refused to pay the revenue and went to join the fighting.”',
    stem: 'What should you do now?',
    options: ['Ignore the new source', 'Widen your explanation to include peasants as well as sepoys', 'Say the source must be false', 'Start a completely different topic'],
    answer: 1,
    hint: 'New evidence should change your answer if it does not fit.',
    explanation: 'The source shows villagers joining, so the explanation should grow to include peasants.',
  }),
  piv('3b', 3, {
    context: 'Your draft says Rani Lakshmibai planned to fight the Company from the very start. A fact sheet notes that she first sent appeals to the Company asking it to accept her adopted son as heir, and took up arms later.',
    stem: 'How should you change your draft?',
    options: ['Leave it as it is', 'Say she first tried appeals, and took up arms later', 'Remove her from the story', 'Say she never fought'],
    answer: 1,
    hint: 'Match the order of events in the evidence.',
    explanation: 'The fact sheet shows a sequence: appeals first, armed resistance later. The draft should follow the evidence.',
  }),
  // L4 · Revise
  piv('4a', 4, {
    context: 'After a month, your project said: “The British won because they had more soldiers.” Your new fact sheet says the British used the telegraph and railways, and rebel leaders fought in different places at different times.',
    stem: 'What is the better revised explanation?',
    options: ['Keep the original, numbers are all that matter', 'The British were helped by faster communication and transport, while rebel groups struggled to coordinate', 'The rebels did not want to win', 'The weather decided the result'],
    answer: 1,
    hint: 'Use the new facts in your answer.',
    explanation: 'The revised explanation uses the new evidence about communication and coordination, not just numbers.',
  }),
  piv('4b', 4, {
    context: 'Your poster says “1857 changed nothing.” A fact sheet notes that in 1858 the East India Company’s rule ended, the British Crown took direct control, and the Queen’s Proclamation promised no more annexations of Indian states.',
    stem: 'How should you revise the poster?',
    options: ['Keep “changed nothing”', 'Say 1857 led to major changes in how India was governed', 'Say the Company became stronger', 'Remove the year 1858'],
    answer: 1,
    hint: 'Does the fact sheet show change or no change?',
    explanation: 'Ending Company rule and stopping annexations are big changes, so the poster’s claim must be revised.',
  }),
  // L5 · Trade-off
  piv('5a', 5, {
    context: 'You have two minutes for a class talk on 1857. Your goal is for classmates to understand why it happened. Option A: mention every battle briefly. Option B: explain three main causes with one example each, and one result.',
    stem: 'Which option better meets your goal?',
    options: ['Option A', 'Option B', 'Both equally', 'Neither, cancel the talk'],
    answer: 1,
    hint: 'What is the goal of the talk?',
    explanation: 'With little time, explaining a few causes well serves “understanding why” better than a rushed list of battles.',
  }),
  piv('5b', 5, {
    context: 'You must write an 80-word textbook paragraph on 1857 that is fair to everyone. Option A: name as many leaders as possible. Option B: briefly give both British and Indian viewpoints, even if fewer leaders are named.',
    stem: 'Which option fits the goal of fairness better?',
    options: ['Option A', 'Option B', 'Neither', 'Write only the dates'],
    answer: 1,
    hint: 'Fairness is about viewpoints, not the number of names.',
    explanation: 'Including more than one viewpoint is what makes the paragraph fair. Fewer names is an acceptable cost.',
  }),
  // L6 · Adapt to change
  piv('6a', 6, {
    context: 'Your class planned a school play about 1857 set only in Delhi. Now classmates whose families come from Jhansi, Lucknow and Bihar ask for their regions to be shown too.',
    stem: 'How should you adapt the play?',
    options: ['Keep only Delhi', 'Show scenes from several regions, linked by a narrator', 'Cancel the play', 'Set it in a different century'],
    answer: 1,
    hint: 'The revolt itself happened in many places.',
    explanation: 'Showing several regions matches the history, since the revolt spread widely, and includes everyone’s story.',
  }),
  piv('6b', 6, {
    context: 'You planned an exhibit using only British accounts because they were easy to find. A museum then shares newly translated letters written by Indian participants.',
    stem: 'What is the best way to adapt?',
    options: ['Ignore the new letters to save time', 'Add the letters and compare them with the British accounts', 'Replace everything with the new letters only', 'Stop the exhibit'],
    answer: 1,
    hint: 'New evidence can fill a gap in your plan.',
    explanation: 'Adding the letters and comparing them with British accounts gives a fuller, more balanced exhibit.',
  }),
];

module.exports = [...DEPTH, ...STRETCH, ...UNTANGLE, ...PIVOT];
