import OpenAI from "openai";

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const SYSTEM_PROMPT = `You are ResumeAI Coach — an expert resume consultant, technical mentor, and career advisor with 15+ years of experience. You help ALL types of users:
- Complete beginners and freshers looking for their first job
- Experienced professionals wanting to switch careers
- People searching for non-tech jobs (BPO, Sales, HR, Marketing, etc.)
- Tech professionals (developers, analysts, data scientists)
- People with no experience who need guidance from scratch

If a user asks about a technical term, concept, or role — explain it clearly and simply.
If a user is a fresher or beginner — give them step-by-step practical guidance.
Be warm, encouraging, and actionable. Use bullet points. Keep responses under 250 words unless more detail is needed.`;

export const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const aiInstance = getOpenAI();
    if (aiInstance) {
      try {
        const completion = await aiInstance.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: 500,
        });
        return res.json({ response: completion.choices[0].message.content });
      } catch (err) {
        console.error("OpenAI Chat Error:", err.message);
      }
    }

    // Comprehensive fallback knowledge base
    const demos = {
      // --- Beginners & Freshers ---
      "fresher": "Welcome, Fresher! \ud83c\udf31 Here's your starter roadmap:\n\n\u2022 **Step 1:** Build a clean 1-page resume with education, skills, and projects\n\u2022 **Step 2:** Create a free LinkedIn profile and connect with people in your field\n\u2022 **Step 3:** Apply on Naukri, Indeed, Internshala, LinkedIn daily\n\u2022 **Step 4:** Practice interview answers using the STAR method\n\u2022 **Step 5:** Start with internships or entry-level roles to build experience\n\nTell me your field (Tech, Sales, HR, BPO...) and I'll guide you specifically!",
      "no experience": "No experience? No problem! \ud83d\ude4c\n\n\u2022 Freshers ARE hired — companies want the right attitude\n\u2022 **Build a portfolio:** Personal projects, college work, freelance\n\u2022 **Free certifications:** Google, HubSpot, Coursera, NPTEL\n\u2022 **Internships:** Internshala, LinkedIn, AngelList\n\u2022 **Highlight:** Communication, teamwork, willingness to learn\n\u2022 **Entry roles:** Data entry, customer support, BPO are great starting points\n\nStart applying now — don't wait to be 100% ready!",
      "how to write a resume": "How to write a great resume:\n\n\u2022 **1 page** for freshers, 2 pages for experienced\n\u2022 **Sections:** Name & Contact \u2192 Summary \u2192 Skills \u2192 Experience/Projects \u2192 Education\n\u2022 **Action verbs:** Start bullets with 'Managed', 'Built', 'Led', 'Achieved'\n\u2022 **Quantify:** '35+ WPM typing' beats 'fast typer'\n\u2022 **Tailor it** for each job you apply to\n\u2022 **No images or tables** — ATS systems can't read them\n\nUpload your resume here and I'll analyze it for you!",
      "resume": "A great resume needs:\n\n\u2022 **Header:** Name, Email, Phone, LinkedIn\n\u2022 **Summary:** 2-3 line pitch about yourself\n\u2022 **Skills:** Relevant tools/technologies\n\u2022 **Experience/Projects:** Bullet points with numbers\n\u2022 **Education:** Degree, Institution, Year\n\nKeep it under 2 pages, clean font (Calibri/Arial), save as PDF!",
      "linkedin": "LinkedIn is your **digital resume**! Setup guide:\n\n\u2022 **Photo:** Professional, clear background\n\u2022 **Headline:** 'BCA Graduate | Seeking Customer Support Role'\n\u2022 **About:** 3-4 sentences about your skills and goals\n\u2022 **Skills:** Add 10+ relevant skills\n\u2022 **Connections:** Connect with 100+ people in your field\n\u2022 **Apply:** Use 'Easy Apply' for fast applications\n\nA complete profile gets 40x more opportunities!",
      "where to apply": "Best job sites in India:\n\n\u2022 **Naukri.com** \u2014 Largest Indian job portal\n\u2022 **LinkedIn** \u2014 Global + Indian opportunities\n\u2022 **Indeed** \u2014 Easy-apply for all levels\n\u2022 **Internshala** \u2014 Best for freshers\n\u2022 **Glassdoor** \u2014 Company reviews + salaries\n\u2022 **Company Websites** \u2014 Apply directly for better response\n\nApply to 5-10 jobs every day consistently!",
      "career switch": "Switching careers? Here's how:\n\n\u2022 **Identify transferable skills** from your current role\n\u2022 **Bridge the gap:** Take 1-2 online courses in the new field\n\u2022 **Start small:** Freelance, intern, or volunteer first\n\u2022 **Update resume** to highlight relevant skills\n\u2022 **Network:** Join LinkedIn groups in your target industry\n\u2022 Career switches usually take 3-6 months — be patient!\n\nWhat are you switching from and to? I'll give you a specific plan!",
      "work from home": "Top **Work From Home** jobs:\n\n\u2022 **Roles:** Customer support, data entry, content writing, coding, virtual assistant\n\u2022 **Sites:** LinkedIn (remote filter), Remote.co, We Work Remotely, Naukri\n\u2022 **Must have:** Stable internet, quiet space, good communication\n\u2022 **Certifications** help you stand out\n\nRemote work needs self-discipline and clear communication!",
      "salary": "Salary guide (India):\n\n\u2022 **Entry Level (0-1 yr):** \u20b92-4 LPA non-tech, \u20b93-6 LPA tech\n\u2022 **Mid Level (3-5 yrs):** \u20b95-12 LPA\n\u2022 **Research:** Glassdoor, AmbitionBox, LinkedIn Salary\n\u2022 **Negotiate:** Never accept the first offer\n\u2022 **In interviews:** 'Based on market, I expect \u20b9X-Y LPA'\n\nAlways give a salary range, not a single number!",
      // --- Tech Roles ---
      "ats": "Boost your ATS score:\n\n\u2022 **Use exact keywords** from the job post\n\u2022 **Standard sections:** Work Experience, Education, Skills\n\u2022 **Avoid tables & columns** \u2014 ATS can't read them\n\u2022 **Quantify everything** \u2014 numbers stand out\n\u2022 **Save as PDF** for best compatibility",
      "full stack": "A **Full Stack Developer** builds both front-end and back-end:\n\n\u2022 **Front-End:** HTML, CSS, JavaScript, React \u2014 what users see\n\u2022 **Back-End:** Node.js, Python, REST APIs \u2014 server logic\n\u2022 **Database:** MySQL, MongoDB\n\nLearning path: HTML \u2192 CSS \u2192 JavaScript \u2192 React \u2192 Node.js \u2192 MongoDB\n\nA full stack dev can build an entire product solo!",
      "frontend": "**Front-End Development** = what users see & interact with.\n\n\u2022 **Core:** HTML, CSS, JavaScript\n\u2022 **Frameworks:** React.js, Vue.js, Angular\n\u2022 **Tools:** VS Code, Figma, Chrome DevTools\n\nStart: HTML \u2192 CSS \u2192 JavaScript \u2192 React!",
      "front end": "**Front-End Development** = what users see & interact with.\n\n\u2022 **Core:** HTML, CSS, JavaScript\n\u2022 **Frameworks:** React.js, Vue.js\n\nStart: HTML \u2192 CSS \u2192 JavaScript \u2192 React!",
      "backend": "**Back-End Development** = server-side logic.\n\n\u2022 **Languages:** Node.js, Python, Java, PHP\n\u2022 **Databases:** MySQL, MongoDB, PostgreSQL\n\u2022 **APIs:** REST, GraphQL\n\nStart: Python or JavaScript \u2192 REST APIs \u2192 Databases!",
      "back end": "**Back-End Development** = server-side logic.\n\n\u2022 **Languages:** Node.js, Python, Java\n\u2022 **Databases:** MySQL, MongoDB\n\nStart: Python or JavaScript \u2192 REST APIs \u2192 Databases!",
      "python": "**Python** is one of the most versatile languages:\n\n\u2022 **Uses:** Data Science, AI/ML, Web Dev, Automation\n\u2022 **Free Learning:** freeCodeCamp, CS50 (Harvard)\n\u2022 **Salary:** \u20b94-12 LPA for freshers to mid-level\n\nPython is beginner-friendly — great first language!",
      "data analyst": "For a **Data Analyst** role:\n\n\u2022 **Must learn:** Excel, SQL, Power BI or Tableau\n\u2022 **Good to have:** Python (Pandas), data visualization\n\u2022 **Free courses:** Google Data Analytics (Coursera)\n\u2022 **Salary:** \u20b93-8 LPA for freshers\n\nBuild 2-3 portfolio projects on Kaggle!",
      "mern": "For MERN stack:\n\n\u2022 **React:** Hooks, Virtual DOM, State Management\n\u2022 **Node/Express:** Middleware, REST APIs, Auth\n\u2022 **MongoDB:** Aggregation, Mongoose\n\nBuild a full project (Blog/E-commerce) to showcase!",
      // --- Non-Tech Roles ---
      "customer support": "To land a **Customer Support** job:\n\n\u2022 **Communication:** Clear English, written & verbal\n\u2022 **CRM Tools:** Freshdesk, Zendesk, Zoho CRM\n\u2022 **Typing Speed:** 35+ WPM for chat support\n\u2022 **Soft Skills:** Patience, empathy, problem-solving\n\u2022 **Bonus:** Basic Excel\n\nEven freshers get hired! Show communication skills in the interview.",
      "customer service": "For **Customer Service** jobs:\n\n\u2022 **Active Listening & Empathy** \u2014 most important!\n\u2022 **CRM Tools:** Zendesk, Freshdesk\n\u2022 **Conflict Resolution:** Stay calm under pressure\n\u2022 **Multitasking:** Manage multiple queries\n\nHighlight any customer-facing experience, even from college!",
      "bpo": "For **BPO / Call Center** jobs:\n\n\u2022 **Communication:** Clear English or regional language\n\u2022 **Typing:** 30-40+ WPM for non-voice roles\n\u2022 **Training provided** by most companies\n\nGreat entry-level option — builds communication and confidence fast!",
      "sales": "To grow in **Sales**:\n\n\u2022 **Pitch:** Practice your 30-second elevator pitch\n\u2022 **CRM:** Salesforce, HubSpot, Zoho\n\u2022 **Negotiation:** Practice via mock calls\n\u2022 **Target mindset:** Always quantify results\n\nSales has great earning potential through incentives!",
      "marketing": "For a **Marketing** career:\n\n\u2022 **Digital Marketing:** SEO, SEM, Social Media\n\u2022 **Tools:** Google Analytics, Canva, Meta Ads\n\u2022 **Free Certs:** Google Digital Garage, HubSpot Academy\n\nBuild a small brand page on Instagram as your portfolio!",
      "data entry": "For **Data Entry** jobs:\n\n\u2022 **Typing Speed:** 40+ WPM with accuracy\n\u2022 **MS Office:** Excel, Word (mandatory)\n\u2022 **Attention to Detail:** Zero-error mindset\n\u2022 **Tools:** Google Sheets, Tally\n\nGreat entry-level role! Practice typing speed daily.",
      "hr": "For an **HR** career:\n\n\u2022 **Recruitment:** LinkedIn, Naukri sourcing\n\u2022 **HR Software:** Zoho People, SAP HR\n\u2022 **Labour Laws:** PF, ESI, Gratuity basics\n\u2022 **Certifications:** SHRM, MBA-HR\n\nStart with HR internships for hands-on experience!",
      "content writing": "For **Content Writing**:\n\n\u2022 **Skills:** Clear, engaging, SEO-friendly writing\n\u2022 **Tools:** Grammarly, Hemingway App\n\u2022 **Portfolio:** Start a blog or write on Medium\n\u2022 **Freelance:** Upwork, Fiverr to build experience",
      "accounting": "For **Accounting / Finance**:\n\n\u2022 **Must Know:** Tally ERP9, MS Excel\n\u2022 **Concepts:** GST, TDS, Bookkeeping, Payroll\n\u2022 **Certifications:** CA Foundation, B.Com + Tally\n\nKnowledge of Tally and GST filing is highly valued!",
      // --- Interview & Job Search ---
      "interview": "Interview prep:\n\n\u2022 **STAR Method:** Situation \u2192 Task \u2192 Action \u2192 Result\n\u2022 **Research:** Know the company's products and values\n\u2022 **Common questions:** 'Tell me about yourself', 'Strengths & weaknesses'\n\u2022 **Questions to ask:** 'What does success look like in this role?'\n\nPractice aloud at home at least 5 times before the real thing!",
      "cover letter": "A **Cover Letter** = short intro + why you're a fit:\n\n\u2022 Keep it under 250 words\n\u2022 Para 1: Who am I?\n\u2022 Para 2: Why this role?\n\u2022 Para 3: What I bring to the company\n\nPersonalize it with the company name and role — never use a generic template!",
      "action verb": "Powerful resume action verbs:\n\n\u2022 **Tech:** Built, Engineered, Deployed, Optimized\n\u2022 **Sales:** Achieved, Negotiated, Closed, Grew\n\u2022 **Support:** Resolved, Handled, Managed, Escalated\n\u2022 **Leadership:** Led, Directed, Mentored, Coordinated\n\nAlways start a bullet with an action verb + result!",
      "quantify": "Quantify your experience:\n\n\u2022 'Handled 50+ customer calls per day' \u2705\n\u2022 'Achieved 115% of monthly sales target' \u2705\n\u2022 'Typed 45 WPM with 98% accuracy' \u2705\n\nNumbers prove your impact — recruiters love specific data!",
      "searching": "Job search plan:\n\n\u2022 **Polish resume** — tailor for every role\n\u2022 **LinkedIn:** Stay active, connect daily\n\u2022 **Apply daily:** 5-10 applications/day\n\u2022 **Portals:** Naukri, Indeed, LinkedIn, Internshala\n\u2022 **Follow up:** Email recruiters after 3-5 days\n\nAverage job search = 2-3 months. Stay consistent! \ud83d\udcaa",
      "what to learn": "Tell me your **target job role** and I'll give exact skills!\n\nExamples:\n\u2022 Customer Support \u2192 Communication, CRM, Typing\n\u2022 Data Analyst \u2192 Excel, SQL, Power BI\n\u2022 Developer \u2192 JavaScript, React, Node.js\n\u2022 Sales \u2192 CRM, Negotiation, Cold Calling\n\nWhat role are you targeting?",
      "what i need": "To give you a personalized plan, tell me:\n\n1. What **role** are you targeting?\n2. What is your **education** background?\n3. Do you have any **experience** or skills?\n\nI'll map out a step-by-step roadmap just for you!",
      "explain": "Happy to explain anything! \ud83d\ude0a\n\nTry asking:\n\u2022 'What is Full Stack development?'\n\u2022 'What is ATS?'\n\u2022 'Explain Customer Support role'\n\u2022 'What does a Data Analyst do?'",
      "value": "To increase your resume value:\n\n\u2022 **Quantify Impacts:** 'Increased sales by 20%' beats 'Helped sales'\n\u2022 **Keywords:** Match job description skills\n\u2022 **Certifications:** Add relevant industry certs\n\u2022 **Action Verbs:** 'Led', 'Architected', 'Spearheaded'",
    };

    const lowercaseMsg = message.toLowerCase();
    const matched = Object.keys(demos).find((k) => lowercaseMsg.includes(k));

    res.json({
      response: matched
        ? demos[matched]
        : `I'm here to help everyone! \ud83d\ude0a\n\n**Try asking:**\n\u2022 'I am a fresher, where do I start?'\n\u2022 'What is Customer Support job?'\n\u2022 'What skills do I need for Sales?'\n\u2022 'How to write a resume?'\n\u2022 'Where should I apply for jobs?'\n\u2022 'What is Full Stack development?'\n\u2022 'How to prepare for interview?'\n\nJust ask naturally \u2014 I understand plain English! \ud83c\udf1f`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
