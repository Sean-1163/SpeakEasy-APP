// 故事服务 - 内置20篇分级故事
import type { Story } from '../types';

const BUILT_IN_STORIES: Story[] = [
  // Easy (Level 1-7)
  {
    id: 'story-1',
    title: 'The Little Red Hen',
    content: `Once upon a time, there was a little red hen. She lived in a farm with a cat, a dog, and a mouse.

One day, the little red hen found some grains of wheat. "Who will help me plant this wheat?" she asked.

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the mouse.

"Then I will do it myself," said the little red hen.

And she did. She planted the wheat, watered it, and waited.

The wheat grew tall. "Who will help me cut the wheat?" asked the little red hen.

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the mouse.

"Then I will do it myself," said the little red hen.

And she did. She cut all the wheat.

"Who will help me make the bread?" asked the little red hen.

"Not I," said the cat.
"Not I," said the dog.
"Not I," said the mouse.

"Then I will do it myself," said the little red hen.

And she made the bread.

Finally, the bread was ready. "Who will help me eat the bread?" asked the little red hen.

"I will!" said the cat.
"I will!" said the dog.
"I will!" said the mouse.

"No," said the little red hen. "I planted the wheat. I cut the wheat. I made the bread. I will eat it myself!"

And she did. And it was delicious.

The End.`,
    difficulty: 'easy',
    category: 'Fable'
  },
  {
    id: 'story-2',
    title: 'The Three Little Pigs',
    content: `Once upon a time, there were three little pigs. They each decided to build a house.

The first little pig built his house with straw. It was quick and easy.

The second little pig built his house with sticks. It took a little more time.

The third little pig built his house with bricks. It took a long time and hard work.

One day, a big bad wolf came to the first house. "Little pig, little pig, let me come in!"

"Not by the hair on my chinny chin chin!" said the first little pig.

"Then I'll huff, and I'll puff, and I'll blow your house down!"

And he did! The straw house fell down.

The first little pig ran to the second little pig's house.

The wolf came again. "Little pigs, little pigs, let me come in!"

"Not by the hair on our chinny chin chins!"

So the wolf huffed and puffed. And he blew down the stick house.

Both pigs ran to the brick house.

The wolf came to the brick house. But no matter how hard he huffed and puffed, he could not blow down the brick house.

The wolf tried to go down the chimney. But the pigs had a pot of boiling water waiting.

The wolf ran away and never came back.

The three little pigs lived happily ever after in the brick house.

The End.`,
    difficulty: 'easy',
    category: 'Fable'
  },
  {
    id: 'story-3',
    title: 'My Day at School',
    content: `Hello! My name is Tom. I am eight years old. I go to Green Valley Elementary School.

Every morning, I wake up at seven o'clock. I brush my teeth and wash my face. Then I eat breakfast with my family.

At eight o'clock, my mom drives me to school. I like the car ride because I can listen to music.

School starts at nine o'clock. My favorite subject is science. We are learning about plants and animals.

At lunch time, I eat in the cafeteria. Today I had a sandwich, an apple, and milk.

After lunch, we have art class. I made a beautiful drawing of my dog.

School ends at three o'clock. My friend Jack and I walk home together. We talk about our day and play games.

After school, I do my homework. Then I play outside until dinner time.

Dinner is at six o'clock. My mom makes delicious food. Tonight we are having pasta with vegetables.

After dinner, I read a book for a while. Then I take a bath and go to bed.

Tomorrow will be another great day!

The End.`,
    difficulty: 'easy',
    category: 'Daily Life'
  },
  {
    id: 'story-4',
    title: 'A Day at the Beach',
    content: `It was a hot summer day. The sun was shining bright. Lily and her family went to the beach.

They packed their car with towels, sunscreen, and a big cooler full of food and drinks.

When they arrived, Lily ran to the water. The ocean was blue and beautiful. Waves were rolling onto the shore.

She splashed in the water and swam. The water was cool and refreshing.

Her brother built a big sandcastle near the water. Their dad helped him make towers and a moat.

Their mom sat under a big umbrella. She read a book and drank lemonade.

At lunchtime, they had a picnic on the beach. They ate sandwiches, fruit, and cookies.

After lunch, Lily found shells on the beach. She collected pink ones and white ones.

In the afternoon, they flew a kite. It was yellow and blue. It flew high in the sky.

As the sun started to set, the family packed up their things. They were tired but happy.

"What a wonderful day!" said Lily.

The End.`,
    difficulty: 'easy',
    category: 'Daily Life'
  },
  {
    id: 'story-5',
    title: 'The Friendly Neighborhood',
    content: `I live on a friendly street. My neighbors are kind and helpful.

Mrs. Johnson lives next door. She is a retired teacher. She grows beautiful flowers in her garden.

Mr. Chen runs the bakery on the corner. He makes the best bread in town. Every Sunday, he gives free cookies to children.

Old Tom lives across the street. He is eighty years old. He tells wonderful stories about the old days.

The Kim family moved in last month. They have two children, Sarah and James. They are my age. Now we play together every day.

Every Saturday, we have a neighborhood party. Everyone brings food to share. We eat, talk, and have fun together.

Last month, Mrs. Brown's roof was broken. All the neighbors came to help fix it. We worked together as a team.

I am happy to live on this street. Everyone knows each other. We help each other. We are like one big family.

The End.`,
    difficulty: 'easy',
    category: 'Community'
  },
  {
    id: 'story-6',
    title: 'My Pet Dog',
    content: `I have a pet dog. His name is Max. He is a golden retriever.

Max is three years old. He has soft golden fur and big brown eyes. He is very cute.

Every morning, I take Max for a walk in the park. He loves to run and play with other dogs. He is very friendly.

Max knows many tricks. He can sit, shake hands, and roll over. He can also fetch the newspaper for me.

At dinner time, Max waits by his bowl. He is always hungry! His favorite food is chicken and rice.

In the evening, Max likes to watch TV with my family. He especially likes animal programs. When he sees another dog on TV, he barks with excitement.

When I am sad, Max sits next to me. He puts his head on my lap. He always knows when I need comfort.

Max is not just a pet. He is my best friend. I love him very much.

The End.`,
    difficulty: 'easy',
    category: 'Animals'
  },
  {
    id: 'story-7',
    title: 'Learning to Ride a Bicycle',
    content: `Last summer, I learned to ride a bicycle. It was challenging but fun.

At first, I was scared. I thought I would fall and get hurt. My dad said, "Don't worry. I will help you."

We went to the park. It was empty and safe. The ground was flat and smooth.

I got on the bicycle. My dad held the back of the seat. He said, "Look straight ahead, not at your feet."

I started to pedal slowly. My dad ran beside me. He kept one hand on the seat.

After a while, I felt more confident. I pedaled faster. The wind touched my face. It felt wonderful!

Then I heard my dad say, "You are doing it! You are riding by yourself!"

I looked back. My dad had let go of the seat! I was riding alone!

I was so happy. I rode around the park many times.

Now I ride my bicycle every weekend. I love the feeling of freedom. Learning to ride was one of the best things I ever did.

The End.`,
    difficulty: 'easy',
    category: 'Learning'
  },

  // Medium (Level 8-14)
  {
    id: 'story-8',
    title: 'The Boy Who Cried Wolf',
    content: `Once upon a time, there was a shepherd boy. He watched over his family's sheep on the hillside near the village.

One day, the boy was bored. He wanted to have some fun. So he ran to the village shouting, "Wolf! Wolf! A wolf is coming!"

The villagers heard his cry. They放下工作, grabbed their tools, and ran up the hill to help.

But when they got there, there was no wolf. The boy laughed at them. "I was just joking!" he said.

The villagers were angry, but they went back to their work.

A few days later, the boy was bored again. He decided to play the same trick. "Wolf! Wolf!" he shouted.

Again, the villagers came running. Again, there was no wolf. The boy thought it was hilarious.

"We are very busy," the villagers said. "Please don't call us unless there is really a wolf."

But then, one evening, a real wolf came! It came out of the forest. It started attacking the sheep!

The boy was terrified. "Wolf! Wolf!" he screamed as loud as he could.

But this time, no one came. The villagers thought it was another trick.

The wolf attacked many sheep that night. The boy learned an important lesson: if you tell lies, people won't believe you when you tell the truth.

The End.`,
    difficulty: 'medium',
    category: 'Fable'
  },
  {
    id: 'story-9',
    title: 'The Tortoise and the Hare',
    content: `Once upon a time, there lived a hare who was very proud of how fast he could run. He always boasted about being the fastest animal in the forest.

One day, he laughed at a tortoise for being so slow. "You are the slowest creature I have ever seen!" said the hare.

The tortoise smiled calmly and said, "Why don't we have a race? You are so confident in your speed."

The hare agreed immediately. "That will be fun! I will beat you easily!"

All the animals in the forest gathered to watch the race. Fox was the judge. He shouted, "On your marks, get set, GO!"

The hare took off like lightning. He ran so fast that he was soon out of sight. The tortoise kept moving slowly but steadily.

The hare was so far ahead that he decided to take a nap. "The tortoise will never catch up," he thought. "I have plenty of time."

The tortoise continued walking, step by step, never stopping.

The hare woke up and looked around. He couldn't see the tortoise. "I must have slept too long," he thought. He ran as fast as he could to the finish line.

But when he arrived, he found the tortoise already there, smiling and waving.

All the animals cheered for the tortoise. The hare was embarrassed.

The lesson is clear: slow and steady wins the race. Pride and overconfidence can make you lose.

The End.`,
    difficulty: 'medium',
    category: 'Fable'
  },
  {
    id: 'story-10',
    title: 'A Journey to Space',
    content: `Have you ever looked up at the night sky and wondered what is out there? Space has always fascinated humans.

In 1969, something amazing happened. Neil Armstrong became the first human to walk on the Moon. He said, "That's one small step for man, one giant leap for mankind."

Today, space exploration continues. Astronauts live and work on the International Space Station. They conduct experiments and study Earth from above.

Last year, scientists discovered water on Mars. This discovery excited everyone. Water means there might be life, or at least the possibility of life.

Private companies are now building rockets. SpaceX and Blue Origin are making space travel more affordable. Soon, ordinary people might be able to visit space.

Some scientists are even planning missions to Mars. Astronauts would spend months traveling through space. It would be the greatest adventure in human history.

But space travel is dangerous. Astronauts must handle isolation, radiation, and many health risks. They train for years before going to space.

I dream of becoming an astronaut someday. I want to float in zero gravity and see Earth from space. I want to explore the mysteries of the universe.

Who knows? Maybe one day I will stand on another planet and look back at our beautiful blue Earth.

The End.`,
    difficulty: 'medium',
    category: 'Science'
  },
  {
    id: 'story-11',
    title: 'The Importance of Reading',
    content: `Books have always been important in human history. They store knowledge, tell stories, and transport us to magical worlds.

When I was young, my grandmother taught me to read. She would sit with me every evening and read fairy tales. I loved stories about princesses, dragons, and brave heroes.

Reading became my favorite hobby. I read everywhere: in bed, on the bus, during lunch, even in the bathroom!

Books taught me many things. They expanded my vocabulary and improved my writing. They taught me about history, science, and different cultures.

Reading also exercises the brain. Research shows that people who read regularly have better memory and concentration. It reduces stress and improves imagination.

In today's digital age, many people prefer watching videos or scrolling through social media. While these are fun, they cannot replace the benefits of reading.

Reading a book requires focus and patience. It forces us to use our imagination. When we read, we create the characters, the settings, and the scenes in our minds.

I encourage everyone to read more. Start with something simple. A book a month is a good goal. You will be surprised how much you can learn and grow.

Remember, "Reading is to the mind what exercise is to the body." - Joseph Addison.

The End.`,
    difficulty: 'medium',
    category: 'Education'
  },
  {
    id: 'story-12',
    title: 'Protecting Our Environment',
    content: `Our planet Earth is the only home we have. But it is in danger. Climate change, pollution, and deforestation threaten our environment.

Every year, we produce millions of tons of garbage. Much of it ends up in oceans and landfills. Plastic waste kills marine animals and pollutes our waters.

Factory smoke and car exhaust release harmful gases into the air. These gases cause global warming. Temperatures are rising. Ice caps are melting. Sea levels are increasing.

Forests are being cut down for agriculture and development. Animals are losing their habitats. Many species are in danger of extinction.

But there is hope. We can all make a difference. Here are some simple steps:

First, reduce, reuse, and recycle. Buy products with less packaging. Use reusable bags and bottles. Separate your trash.

Second, save energy. Turn off lights when leaving a room. Use public transportation or ride a bicycle. Plant trees in your community.

Third, save water. Don't leave taps running. Take shorter showers. Fix leaky faucets.

Fourth, support environmentally friendly businesses. Buy local products when possible.

Together, we can protect our planet. Every small action counts. Let's work together for a greener, cleaner future.

The End.`,
    difficulty: 'medium',
    category: 'Environment'
  },
  {
    id: 'story-13',
    title: 'The Power of Music',
    content: `Music is a universal language. It has existed since the beginning of human civilization. People in every culture have created and enjoyed music.

Music has the power to change our moods. Sad songs can make us feel better when we are down. Happy songs can lift our spirits even higher.

Scientists have studied music's effects on the brain. They found that music activates many areas of the brain. It can improve memory, attention, and even physical performance.

Many athletes listen to music while training. The rhythm helps them maintain pace and energy. Studies show that music can improve athletic performance by up to fifteen percent.

Music therapy is now used to treat various conditions. It helps patients with depression, anxiety, and even Alzheimer's disease. Singing and playing instruments can improve motor skills and speech.

Learning to play an instrument has many benefits. It teaches discipline and patience. It improves coordination and concentration. Children who learn music often do better in school.

Music brings people together. Concerts and festivals create a sense of community. People from different backgrounds unite through shared musical experiences.

I believe music should be part of every child's education. It nurtures creativity and emotional intelligence. It connects us to our heritage and to each other.

Turn on some music today. Dance, sing, or just listen. Let music fill your life with joy.

The End.`,
    difficulty: 'medium',
    category: 'Arts'
  },
  {
    id: 'story-14',
    title: 'The Story of Coffee',
    content: `Every morning, millions of people around the world start their day with a cup of coffee. But where does this popular drink come from?

The story begins in Ethiopia, around 800 AD. Legend says that a goat herder named Kaldi noticed his goats became very energetic after eating red berries from a certain bush. They danced around happily and wouldn't sleep at night.

Kaldi tried the berries himself and felt the same energy. He brought them to a monastery. The monks were not impressed and threw them into the fire. But the smell was wonderful. They pulled the roasted beans out and made a drink. This was the first cup of coffee.

From Ethiopia, coffee spread to Yemen and the Arabian Peninsula. By the 15th century, coffee houses called "qahwa houses" opened in Mecca. People gathered to drink coffee, discuss ideas, and play chess.

Coffee came to Europe in the 17th century. At first, some people thought it was dangerous. Pope Clement VIII was told to ban it. But after tasting it himself, he declared it delicious and blessed it.

Today, Brazil is the largest coffee producer, followed by Vietnam and Colombia. Coffee is the second most traded commodity in the world, after oil.

Coffee has become an important part of our culture. We meet friends for coffee, take a break with coffee, and study over coffee. It is more than just a drink. It is a social ritual.

The End.`,
    difficulty: 'medium',
    category: 'Culture'
  },

  // Hard (Level 15-20)
  {
    id: 'story-15',
    title: 'The Silk Road: Gateway Between East and West',
    content: `Imagine traveling on foot or by camel for thousands of miles across deserts and mountains. For over a thousand years, merchants did exactly that on the Silk Road.

The Silk Road was not a single road but a network of trade routes connecting China to the Mediterranean. It got its name because silk was one of the most valuable goods traded.

But silk was just the beginning. Spices from India, glass from Rome, gold from Egypt, and precious stones from Persia all traveled these routes. Ideas, religions, and technologies spread along with the goods.

Buddhism traveled from India to China via the Silk Road. Islam spread along these routes to Southeast Asia. The Black Death, unfortunately, also traveled from Asia to Europe, killing millions.

Traveling the Silk Road was dangerous. Merchants faced bandits, harsh weather, and difficult terrain. Many died on the journey. But the promise of wealth kept them coming.

To protect the caravans, special stopping points called caravanserais were built. These were like ancient hotels where travelers could rest, eat, and feed their animals. They were found every 25 to 30 miles along the route.

The Silk Road declined in the 15th century when sea routes became safer and more efficient. But its legacy lives on. The cultures along the route were shaped by their interactions. Our world today is more connected because of these ancient trade routes.

The End.`,
    difficulty: 'hard',
    category: 'History'
  },
  {
    id: 'story-16',
    title: 'The Mystery of the Bermuda Triangle',
    content: `The Bermuda Triangle, also known as the Devil's Triangle, is a region in the western part of the North Atlantic Ocean. It is roughly bounded by Miami, Bermuda, and Puerto Rico.

Over the centuries, many ships and planes have disappeared under mysterious circumstances in this area. Some estimates suggest that more than 1000 lives have been lost there in the past 100 years.

The most famous disappearance was Flight 19 in 1945. Five US Navy bombers vanished during a training mission. A rescue plane sent to find them also disappeared. All 27 men were never found.

So what causes these disappearances? Scientists have proposed many theories.

Some believe methane gas bubbles from the ocean floor can suddenly reduce water density, causing ships to sink. Others suggest magnetic anomalies that interfere with compasses.

Powerful storms and hurricanes are common in this region. The Gulf Stream can quickly scatter debris. Some say the weather is to blame.

There are also supernatural explanations. Some believe it is an area where aliens abduct humans and vessels. Others think it is the lost city of Atlantis, with advanced technology that causes the disappearances.

However, many scientists argue that the Bermuda Triangle is no more dangerous than other ocean areas. Statistics show that the number of disappearances is not unusual for such a heavily traveled region.

The mystery continues. Perhaps one day we will have all the answers. Until then, the Bermuda Triangle remains one of the world's greatest unsolved puzzles.

The End.`,
    difficulty: 'hard',
    category: 'Mystery'
  },
  {
    id: 'story-17',
    title: 'The Rise and Fall of the Roman Empire',
    content: `The Roman Empire was one of the greatest civilizations in human history. At its peak, it controlled about 5 million square kilometers and 70 million people.

Rome began as a small city-state around 753 BC. According to legend, Romulus founded the city. He killed his brother Remus in a dispute and became the first king.

After centuries of kings, the Romans overthrew the monarchy and established a republic. The republic was governed by elected officials and the Senate.

In 27 BC, Augustus became the first emperor. This marked the beginning of the Roman Empire. Under his rule, Rome experienced peace and prosperity. The Pax Romana, or Roman Peace, lasted over 200 years.

The Romans built an incredible infrastructure. They constructed roads, aqueducts, and bridges. Many of these structures still stand today. Roman law influenced legal systems worldwide. The Latin language became the basis for Romance languages.

But the empire began to decline. Economic problems, military defeats, and political instability plagued Rome. In 476 AD, the last Western Roman Emperor was deposed.

Why did Rome fall? Historians offer many explanations. Overexpansion made the empire difficult to defend. Corruption weakened the government. Economic troubles caused by inflation and heavy taxation led to discontent.

The Eastern Roman Empire, known as the Byzantine Empire, continued for another thousand years. Its capital, Constantinople, was a center of culture and learning.

The legacy of Rome lives on. Our calendar, legal system, architecture, and even our language bear the mark of this ancient civilization.

The End.`,
    difficulty: 'hard',
    category: 'History'
  },
  {
    id: 'story-18',
    title: 'The Science of Sleep',
    content: `We spend about one-third of our lives sleeping. Yet many of us don't fully understand this essential activity.

Sleep is not simply the absence of wakefulness. It is a complex process with multiple stages. Scientists categorize sleep into two main types: REM and non-REM sleep.

Non-REM sleep has three stages. Stage one is light sleep, where you can be easily awakened. Stage two is slightly deeper, with slower brain waves. Stage three, called deep sleep, is when the body repairs tissues and strengthens the immune system.

REM sleep, named for Rapid Eye Movement, is when most dreaming occurs. During REM, the brain is almost as active as when awake. Memory consolidation happens in this stage.

Why do we need sleep? Sleep serves multiple vital functions. It helps the body recover from daily wear and tear. It allows the brain to process information and form memories. Sleep also regulates hormones that control growth, appetite, and mood.

Studies show that sleep deprivation has serious consequences. Lack of sleep impairs judgment and reaction time. It increases the risk of obesity, heart disease, and diabetes. Chronic sleep loss can even weaken the immune system.

Most adults need seven to nine hours of sleep per night. Teenagers need even more, about eight to ten hours.

Good sleep habits, called sleep hygiene, can improve sleep quality. Keep a consistent sleep schedule. Avoid screens before bed. Create a dark, quiet, cool sleeping environment.

In our busy modern world, we often sacrifice sleep for productivity. But remember: sleep is not a luxury. It is a biological necessity. Take care of your sleep, and it will take care of you.

The End.`,
    difficulty: 'hard',
    category: 'Science'
  },
  {
    id: 'story-19',
    title: 'The Industrial Revolution: Transforming the World',
    content: `The Industrial Revolution, which began in Britain around 1760, was one of the most significant periods in human history. It transformed agrarian societies into industrial powers.

Before this revolution, most people lived in rural areas and worked in agriculture. Goods were made by hand, often in homes or small workshops. Life moved at a slow, predictable pace.

The revolution started with innovations in textile manufacturing. James Hargreaves invented the spinning jenny, which could spin multiple threads at once. Edmund Cartwright created the power loom. These machines increased production dramatically.

The steam engine, perfected by James Watt, was perhaps the most important invention. It provided reliable power for factories and transportation. Trains and steamships revolutionized travel and trade.

Factories replaced workshops. Cities grew rapidly as people moved from rural areas to work in industrial centers. The population of London, for example, increased from about 1 million in 1800 to over 6 million by 1900.

The revolution brought both progress and problems. New jobs attracted workers, but conditions were often terrible. Long hours, low wages, and child labor were common. Factories polluted the air and rivers.

Reformers worked to improve conditions. Laws were passed limiting child labor and regulating workplace safety. Labor unions formed to protect workers' rights.

The Industrial Revolution spread from Britain to Europe and North America. It fundamentally changed how people lived and worked. We still live in the world it created.

The End.`,
    difficulty: 'hard',
    category: 'History'
  },
  {
    id: 'story-20',
    title: 'Artificial Intelligence: The Future of Humanity',
    content: `Artificial Intelligence, or AI, is no longer science fiction. It is rapidly becoming part of our daily lives, from smartphones to medical diagnosis.

But what exactly is AI? In simple terms, AI is the ability of machines to perform tasks that typically require human intelligence. These include learning, reasoning, problem-solving, understanding language, and recognizing patterns.

The concept of AI dates back to ancient times, but the field was officially founded at a conference in 1956. Early AI programs could solve simple problems, but they were limited by computer power.

In recent years, AI has made remarkable progress. Machine learning, a technique where computers learn from data, has driven much of this advancement. Deep learning, using neural networks inspired by the human brain, has achieved superhuman performance in many areas.

AI is now everywhere. Recommendation algorithms suggest movies and products we might like. Virtual assistants like Siri and Alexa answer our questions. Self-driving cars are becoming reality.

In healthcare, AI can analyze medical images to detect diseases. It can predict patient outcomes and suggest treatments. In science, AI has helped discover new drugs and materials.

However, AI also raises important questions. Will robots take our jobs? How do we ensure AI is fair and unbiased? Can AI be dangerous? These concerns are legitimate and require careful consideration.

The future of AI is uncertain, but one thing is clear: it will profoundly shape our world. We must guide its development wisely, ensuring it benefits all of humanity.

The choice is ours to make.

The End.`,
    difficulty: 'hard',
    category: 'Technology'
  }
];

class StoryService {
  // 获取所有故事
  getAllStories(): Story[] {
    return BUILT_IN_STORIES;
  }

  // 按难度获取故事
  getStoriesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Story[] {
    return BUILT_IN_STORIES.filter(story => story.difficulty === difficulty);
  }

  // 按分类获取故事
  getStoriesByCategory(category: string): Story[] {
    return BUILT_IN_STORIES.filter(story => story.category === category);
  }

  // 获取单个故事
  getStoryById(id: string): Story | undefined {
    return BUILT_IN_STORIES.find(story => story.id === id);
  }

  // 搜索故事
  searchStories(query: string): Story[] {
    const lowerQuery = query.toLowerCase();
    return BUILT_IN_STORIES.filter(story => 
      story.title.toLowerCase().includes(lowerQuery) ||
      story.content.toLowerCase().includes(lowerQuery) ||
      story.category.toLowerCase().includes(lowerQuery)
    );
  }

  // 获取随机故事
  getRandomStory(): Story {
    const randomIndex = Math.floor(Math.random() * BUILT_IN_STORIES.length);
    return BUILT_IN_STORIES[randomIndex];
  }

  // 获取所有分类
  getAllCategories(): string[] {
    return [...new Set(BUILT_IN_STORIES.map(story => story.category))];
  }

  // 获取难度统计
  getDifficultyStats(): { easy: number; medium: number; hard: number } {
    return {
      easy: BUILT_IN_STORIES.filter(s => s.difficulty === 'easy').length,
      medium: BUILT_IN_STORIES.filter(s => s.difficulty === 'medium').length,
      hard: BUILT_IN_STORIES.filter(s => s.difficulty === 'hard').length
    };
  }
}

export const storyService = new StoryService();
