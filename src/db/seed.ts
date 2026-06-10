/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import postgres from "postgres";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import * as schema from "./schema";
import { stakePoints } from "../lib/gamification";
import { stanceOutcome } from "../lib/scoring";

const conn = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(conn, { schema });

async function main() {
  console.log("Clearing existing data…");
  await db.delete(schema.resolutionVotes);
  await db.delete(schema.resolutionProposals);
  await db.delete(schema.comments);
  await db.delete(schema.userStances);
  await db.delete(schema.propositionFollows);
  await db.delete(schema.personFollows);
  await db.delete(schema.submissions);
  await db.delete(schema.auditTrail);
  await db.delete(schema.evidence);
  await db.delete(schema.stances);
  await db.delete(schema.propositions);
  await db.delete(schema.people);

  console.log("Seeding people…");
  const [trump, musk, krugman, cramer, sas, schiff] = await db
    .insert(schema.people)
    .values([
      {
        slug: "donald-trump",
        name: "Donald Trump",
        title: "47th President of the United States",
        bio: "Businessman and politician. President of the United States 2017–2021 and again since January 2025. One of the most extensively tracked public figures on record.",
        imageUrl: "/people/donald-trump.jpg",
        domain: "politician",
        followerCount: 48211,
      },
      {
        slug: "elon-musk",
        name: "Elon Musk",
        title: "CEO, Tesla & SpaceX",
        bio: "Entrepreneur leading Tesla, SpaceX, and xAI. Known for ambitious public timelines on autonomy, rockets, and AI.",
        imageUrl: "/people/elon-musk.jpg",
        domain: "tech_ceo",
        followerCount: 39754,
      },
      {
        slug: "paul-krugman",
        name: "Paul Krugman",
        title: "Economist, Nobel Laureate",
        bio: "Nobel Prize–winning economist and longtime columnist. Frequent forecaster on inflation, recessions, and trade.",
        imageUrl: "/people/paul-krugman.jpg",
        domain: "economist",
        followerCount: 12087,
      },
      {
        slug: "jim-cramer",
        name: "Jim Cramer",
        title: "Host, CNBC's Mad Money",
        bio: "Former hedge fund manager and television host known for daily, on-the-record market calls.",
        imageUrl: "/people/jim-cramer.jpg",
        domain: "pundit",
        followerCount: 9342,
      },
      {
        slug: "stephen-a-smith",
        name: "Stephen A. Smith",
        title: "Host, ESPN's First Take",
        bio: "Sports commentator known for daily on-air predictions across the NBA, NFL, MLB, and beyond.",
        imageUrl: "/people/stephen-a-smith.jpg",
        domain: "analyst",
        followerCount: 6120,
      },
      {
        slug: "peter-schiff",
        name: "Peter Schiff",
        title: "Chief Economist, Euro Pacific Asset Management",
        bio: "Economist and broker known for long-standing public calls on gold, the dollar, and crashes.",
        imageUrl: "/people/peter-schiff.jpg",
        domain: "economist",
        followerCount: 4480,
      },
    ])
    .returning();

  console.log("Seeding users…");
  await db.delete(schema.user).where(
    inArray(schema.user.id, [
      "u_factfinder",
      "u_sourcehound",
      "u_quietdata",
      "u_macrowatch",
      "u_skeptic22",
      "u_newhere",
    ]),
  );
  const users = await db
    .insert(schema.user)
    .values([
      { id: "u_factfinder", name: "factfinder", email: "factfinder@example.com", reputation: 1840 },
      { id: "u_sourcehound", name: "sourcehound", email: "sourcehound@example.com", reputation: 1212 },
      { id: "u_quietdata", name: "quietdata", email: "quietdata@example.com", reputation: 968 },
      { id: "u_macrowatch", name: "macrowatch", email: "macrowatch@example.com", reputation: 711 },
      { id: "u_skeptic22", name: "skeptic22", email: "skeptic22@example.com", reputation: 405 },
      { id: "u_newhere", name: "newhere", email: "newhere@example.com", reputation: 12 },
    ])
    .returning();

  console.log("Seeding propositions + stances…");

  type PropSeed = {
    prop: Omit<typeof schema.propositions.$inferInsert, "id">;
    stances: Array<
      Omit<typeof schema.stances.$inferInsert, "id" | "propositionId" | "personId"> & {
        person: typeof trump;
      }
    >;
    evidence?: Array<Omit<typeof schema.evidence.$inferInsert, "id" | "propositionId">>;
    audit?: Array<Omit<typeof schema.auditTrail.$inferInsert, "id" | "propositionId">>;
  };

  const P: PropSeed[] = [
    // ----------------------------------------------------------- TRUMP
    {
      prop: {
        slug: "trump-border-wall",
        statement: "A wall is built along the U.S.–Mexico border during Trump's first term.",
        question: "Did Trump build the border wall?",
        resolutionCriteria:
          "Resolves Came True if a contiguous physical barrier covering the majority (>50%) of previously unfenced border miles is completed by Jan 20, 2021. Partly True if substantial new or replacement barrier (>400 miles) is built but falls short of majority coverage.",
        claimType: "promise",
        category: "immigration",
        deadline: "2021-01-20",
        status: "partly_true",
        resolutionRationale:
          "CBP reports 452 miles of border wall system constructed by Jan 2021; roughly 80 miles were built where no barrier existed before — most replaced existing structures. A substantial barrier was built, but not the promised wall across the border.",
        resolvedAt: new Date("2021-02-03"),
        followerCount: 12406,
        weeklyFollowDelta: 84,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote:
            "I will build a great wall — and nobody builds walls better than me, believe me — and I'll build them very inexpensively. I will build a great, great wall on our southern border.",
          dateStated: "2015-06-16",
          venue: "Presidential campaign announcement, Trump Tower, New York",
          sourceUrl: "https://www.c-span.org/video/?326473-1/donald-trump-presidential-campaign-announcement",
          sourceType: "video",
          videoTimestamp: "31:42",
        },
      ],
      evidence: [
        { side: "supports", title: "CBP: 452 miles of border wall system constructed as of January 2021", sourceUrl: "https://www.cbp.gov/border-security/along-us-borders/border-wall-system", sourceName: "U.S. Customs and Border Protection" },
        { side: "supports", title: "DHS status report on border barrier construction, Jan 2021", sourceUrl: "https://www.dhs.gov/news/2021/01/border-wall-status", sourceName: "Dept. of Homeland Security" },
        { side: "refutes", title: "Analysis: most new construction replaced existing barriers", sourceUrl: "https://www.bbc.com/news/world-us-canada-46824649", sourceName: "BBC News" },
        { side: "refutes", title: "~1,500 miles of border remained without barrier at end of term", sourceUrl: "https://www.texastribune.org/2021/01/14/donald-trump-border-wall-texas/", sourceName: "Texas Tribune" },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review (14 approvals).", createdAt: new Date("2023-03-02") },
        { fromStatus: "pending", toStatus: "partly_true", actor: "jury #281 (9 members)", rationale: "452 miles built, majority replacement; criteria for Came True not met, substantial construction documented.", createdAt: new Date("2023-03-19") },
      ],
    },
    {
      prop: {
        slug: "mexico-pays-for-wall",
        statement: "Mexico pays for the border wall.",
        question: "Did Mexico pay for the border wall?",
        resolutionCriteria:
          "Resolves Came True if the Mexican government directly or via a documented transfer mechanism funds the majority of U.S. border wall construction costs by Jan 20, 2021.",
        claimType: "promise",
        category: "immigration",
        deadline: "2021-01-20",
        status: "didnt_come_true",
        resolutionRationale:
          "All wall construction was funded by U.S. appropriations and diverted Defense Department funds. Mexico made no payment and repeatedly refused; no reimbursement mechanism was ever enacted.",
        resolvedAt: new Date("2021-02-03"),
        followerCount: 9871,
        weeklyFollowDelta: 41,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "And who's going to pay for the wall? Mexico. One hundred percent. They don't know it yet, but they're going to pay for it.",
          dateStated: "2016-09-01",
          venue: "Campaign rally, Phoenix, Arizona",
          sourceUrl: "https://www.c-span.org/video/?414707-1/donald-trump-delivers-immigration-policy-address",
          sourceType: "video",
          videoTimestamp: "12:05",
        },
      ],
      evidence: [
        { side: "refutes", title: "Congressional appropriations and DoD diversions funded all construction", sourceUrl: "https://www.gao.gov/products/gao-21-327", sourceName: "GAO" },
        { side: "refutes", title: "Mexican presidents repeatedly refused payment", sourceUrl: "https://www.reuters.com/article/us-usa-trump-mexico-wall-idUSKBN1ZP2EF", sourceName: "Reuters" },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-03-02") },
        { fromStatus: "pending", toStatus: "didnt_come_true", actor: "jury #282 (9 members)", rationale: "No payment of any form from Mexico documented.", createdAt: new Date("2023-03-19") },
      ],
    },
    {
      prop: {
        slug: "repeal-replace-obamacare",
        statement: "Obamacare is repealed and replaced during Trump's first term.",
        question: "Did Trump repeal and replace Obamacare?",
        resolutionCriteria:
          "Resolves Came True if the Affordable Care Act is repealed and replacement legislation is signed into law by Jan 20, 2021.",
        claimType: "promise",
        category: "health",
        deadline: "2021-01-20",
        status: "didnt_come_true",
        resolutionRationale:
          "The Senate repeal effort failed 49–51 in July 2017. The ACA's individual-mandate penalty was zeroed out in the 2017 tax law, but the ACA itself remained in force and no replacement was enacted.",
        resolvedAt: new Date("2021-02-10"),
        followerCount: 6310,
        weeklyFollowDelta: 12,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "We're going to repeal and replace Obamacare — and it'll be so easy. You're going to have such great health care, at a tiny fraction of the cost.",
          dateStated: "2016-10-25",
          venue: "Campaign rally, Sanford, Florida",
          sourceUrl: "https://www.c-span.org/video/?417442-1/donald-trump-campaigns-sanford-florida",
          sourceType: "video",
          videoTimestamp: "44:18",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-04-11") },
        { fromStatus: "pending", toStatus: "didnt_come_true", actor: "jury #311 (9 members)", rationale: "ACA still law; repeal vote failed in Senate.", createdAt: new Date("2023-04-26") },
      ],
    },
    {
      prop: {
        slug: "eliminate-national-debt-8-years",
        statement: "The U.S. national debt (~$19T in 2016) is eliminated within eight years.",
        question: "Did Trump eliminate the national debt?",
        resolutionCriteria: "Resolves Came True if gross federal debt reaches zero by 2024; Partly True if reduced by more than 50%.",
        claimType: "promise",
        category: "economy",
        deadline: "2024-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "Gross federal debt rose from ~$19T (2016) to ~$36T (end of 2024). Debt increased roughly $7.8T during Trump's first term alone.",
        resolvedAt: new Date("2025-01-08"),
        followerCount: 4203,
        weeklyFollowDelta: 6,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "We've got to get rid of the $19 trillion in debt... I think I could do it fairly quickly... I would say over a period of eight years.",
          dateStated: "2016-03-31",
          venue: "Interview with The Washington Post",
          sourceUrl: "https://www.washingtonpost.com/politics/in-turn-to-general-election-trump-says-hed-eliminate-national-debt-in-8-years/2016/04/02/",
          sourceType: "interview",
        },
      ],
    },
    {
      prop: {
        slug: "ukraine-war-24-hours",
        statement: "The Russia–Ukraine war is ended within 24 hours of Trump taking office.",
        question: "Did Trump end the Ukraine war in 24 hours?",
        resolutionCriteria:
          "Resolves Came True if a ceasefire or peace agreement ending major hostilities takes effect by Jan 21, 2025.",
        claimType: "promise",
        category: "foreign_policy",
        deadline: "2025-01-21",
        status: "didnt_come_true",
        resolutionRationale:
          "No ceasefire or settlement took effect within 24 hours of the Jan 20, 2025 inauguration; hostilities continued well beyond the deadline. Trump later described the pledge as 'a figure of speech' — an appeal on those grounds was reviewed and rejected (resolution criteria reference the literal, repeated public commitment).",
        resolvedAt: new Date("2025-01-22"),
        followerCount: 18934,
        weeklyFollowDelta: 122,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "Before I even arrive at the Oval Office, shortly after we win the presidency, I will have the horrible war between Russia and Ukraine settled... I'll have that done in 24 hours.",
          dateStated: "2023-05-10",
          venue: "CNN Town Hall, Manchester, New Hampshire",
          sourceUrl: "https://www.cnn.com/2023/05/10/politics/cnn-town-hall-trump-transcript",
          sourceType: "video",
          videoTimestamp: "58:30",
        },
      ],
      evidence: [
        { side: "refutes", title: "Fighting continued through January and February 2025", sourceUrl: "https://www.reuters.com/world/europe/ukraine-war-january-2025/", sourceName: "Reuters" },
        { side: "refutes", title: "Trump in March 2025: 24-hour pledge was 'a little bit sarcastic'", sourceUrl: "https://www.axios.com/2025/03/15/trump-ukraine-24-hours-sarcastic", sourceName: "Axios" },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review (31 approvals).", createdAt: new Date("2023-05-12") },
        { fromStatus: "pending", toStatus: "didnt_come_true", actor: "jury #1042 (11 members)", rationale: "No ceasefire within 24 hours of inauguration.", createdAt: new Date("2025-01-22") },
        { fromStatus: "didnt_come_true", toStatus: "disputed", actor: "appeal by u/maga_metrics", rationale: "Appeal: statement was rhetorical, not a literal promise.", createdAt: new Date("2025-02-04") },
        { fromStatus: "disputed", toStatus: "didnt_come_true", actor: "appeals jury #1058 (11 members)", rationale: "Appeal rejected 9–2: pledge was repeated 50+ times with specific timeframe. Resolution locked.", createdAt: new Date("2025-02-18") },
      ],
    },
    {
      prop: {
        slug: "market-crash-if-biden-wins",
        statement: "The stock market crashes if Biden wins the 2020 election.",
        question: "Did the stock market crash after Biden won?",
        resolutionCriteria:
          "Resolves Came True if the S&P 500 falls 20%+ from election-day close within 12 months of the 2020 election.",
        claimType: "prediction",
        category: "markets",
        deadline: "2021-11-03",
        status: "didnt_come_true",
        resolutionRationale:
          "The S&P 500 rose roughly 35% in the 12 months following the November 2020 election, setting repeated record highs. No drawdown approached the 20% threshold.",
        resolvedAt: new Date("2021-11-04"),
        followerCount: 5512,
        weeklyFollowDelta: 9,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "If he's elected, the market will crash — the 401(k)s will go down the tubes. Depression! You're going to have a depression the likes of which you've never seen.",
          dateStated: "2020-10-22",
          venue: "Final presidential debate, Nashville, Tennessee",
          sourceUrl: "https://www.c-span.org/video/?477182-1/presidential-debate",
          sourceType: "video",
          videoTimestamp: "1:12:44",
        },
      ],
    },
    {
      prop: {
        slug: "covid-will-disappear",
        statement: "The coronavirus will disappear on its own.",
        question: "Did the coronavirus disappear like Trump said?",
        resolutionCriteria:
          "Resolves Came True if U.S. COVID-19 transmission ends (CDC declares containment) without sustained intervention by end of 2020.",
        claimType: "prediction",
        category: "health",
        deadline: "2020-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "COVID-19 killed more than 350,000 Americans in 2020 and transmission accelerated through the winter. The pandemic did not disappear; it required vaccines and years of public-health response.",
        resolvedAt: new Date("2021-01-15"),
        followerCount: 7726,
        weeklyFollowDelta: 3,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "It's going to disappear. One day — it's like a miracle — it will disappear.",
          dateStated: "2020-02-27",
          venue: "White House coronavirus briefing",
          sourceUrl: "https://www.c-span.org/video/?469926-1/president-trump-coronavirus-briefing",
          sourceType: "video",
          videoTimestamp: "22:10",
        },
      ],
    },
    {
      prop: {
        slug: "trade-wars-easy-to-win",
        statement: "Trade wars are good, and easy to win.",
        question: "Are trade wars easy to win, as Trump claimed?",
        resolutionCriteria:
          "Marked Unverifiable: 'good' and 'easy to win' lack measurable thresholds. The community proposed three rewrites (trade-deficit reduction, manufacturing employment, tariff revenue net of subsidies); the speaker's claim specifies none. Cross-linked to measurable tariff propositions.",
        claimType: "prediction",
        category: "economy",
        deadline: null,
        status: "unverifiable",
        resolutionRationale:
          "No falsifiable criteria can be extracted from the original statement. See linked measurable propositions on the 2018–2019 tariffs.",
        resolvedAt: new Date("2023-06-02"),
        followerCount: 1418,
        weeklyFollowDelta: 1,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "When a country (USA) is losing many billions of dollars on trade with virtually every country it does business with, trade wars are good, and easy to win.",
          dateStated: "2018-03-02",
          venue: "Twitter post",
          sourceUrl: "https://web.archive.org/web/2018/https://twitter.com/realDonaldTrump/status/969525362580484098",
          sourceType: "tweet",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-05-20") },
        { fromStatus: "pending", toStatus: "unverifiable", actor: "falsifiability panel", rationale: "No measurable criteria; speaker never specified terms. Cross-linked to measurable tariff claims.", createdAt: new Date("2023-06-02") },
      ],
    },
    {
      prop: {
        slug: "grocery-prices-come-down",
        statement: "Grocery prices come down substantially during Trump's second term, starting immediately.",
        question: "Did grocery prices come down under Trump?",
        resolutionCriteria:
          "Resolves Came True if the BLS food-at-home CPI index declines 5%+ from its January 2025 level within 18 months. Partly True if it declines at all over that window. Resolves Didn't Come True if the index rises.",
        claimType: "promise",
        category: "economy",
        deadline: "2026-07-20",
        status: "disputed",
        resolutionRationale: null,
        followerCount: 21540,
        weeklyFollowDelta: 1893,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "Prices will come down. You just watch — they'll come down, and they'll come down fast. Groceries, cars, everything. Starting on day one.",
          dateStated: "2024-08-15",
          venue: "Campaign press conference, Bedminster, New Jersey",
          sourceUrl: "https://www.c-span.org/video/?537740-1/former-president-trump-news-conference-bedminster",
          sourceType: "video",
          videoTimestamp: "18:27",
        },
      ],
      evidence: [
        { side: "refutes", title: "BLS: food-at-home CPI up 1.9% Jan 2025 – May 2026", sourceUrl: "https://www.bls.gov/cpi/", sourceName: "Bureau of Labor Statistics" },
        { side: "supports", title: "Egg and produce prices fell from early-2025 peaks", sourceUrl: "https://www.usda.gov/oce/commodity-markets", sourceName: "USDA" },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review (44 approvals).", createdAt: new Date("2024-11-21") },
        { fromStatus: "pending", toStatus: "disputed", actor: "resolution proposal #2204", rationale: "Early resolution proposed (Didn't Come True) on grounds the 'immediately' clause already failed; under weighted vote.", createdAt: new Date("2026-05-28") },
      ],
    },
    {
      prop: {
        slug: "withdraw-paris-accord",
        statement: "The U.S. withdraws from the Paris climate agreement.",
        question: "Did Trump withdraw from the Paris climate agreement?",
        resolutionCriteria: "Resolves Came True if formal withdrawal is initiated and completed under Article 28 during Trump's first term.",
        claimType: "promise",
        category: "foreign_policy",
        deadline: "2021-01-20",
        status: "came_true",
        resolutionRationale:
          "Trump announced withdrawal June 1, 2017; formal exit completed November 4, 2020. (The U.S. rejoined under Biden in 2021, after the resolution window.)",
        resolvedAt: new Date("2020-11-04"),
        followerCount: 3108,
        weeklyFollowDelta: 2,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "We're getting out. And we will start to negotiate, and we will see if we can make a deal that's fair... I was elected to represent the citizens of Pittsburgh, not Paris.",
          dateStated: "2017-06-01",
          venue: "Rose Garden announcement, White House",
          sourceUrl: "https://www.c-span.org/video/?429561-1/president-trump-announces-withdrawal-paris-climate-agreement",
          sourceType: "speech",
          videoTimestamp: "14:55",
        },
      ],
    },
    {
      prop: {
        slug: "move-embassy-jerusalem",
        statement: "The U.S. embassy in Israel is moved to Jerusalem.",
        question: "Did Trump move the U.S. embassy to Jerusalem?",
        resolutionCriteria: "Resolves Came True if the U.S. embassy officially relocates to Jerusalem during Trump's first term.",
        claimType: "promise",
        category: "foreign_policy",
        deadline: "2021-01-20",
        status: "came_true",
        resolutionRationale: "The embassy officially opened in Jerusalem on May 14, 2018.",
        resolvedAt: new Date("2018-05-14"),
        followerCount: 2204,
        weeklyFollowDelta: 1,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "We will move the American embassy to the eternal capital of the Jewish people, Jerusalem.",
          dateStated: "2016-03-21",
          venue: "AIPAC Policy Conference, Washington, D.C.",
          sourceUrl: "https://www.c-span.org/video/?406891-1/donald-trump-addresses-aipac-policy-conference",
          sourceType: "speech",
          videoTimestamp: "9:12",
        },
      ],
    },
    {
      prop: {
        slug: "justices-overturn-roe",
        statement: "Trump-appointed Supreme Court justices vote to overturn Roe v. Wade.",
        question: "Did Trump's justices overturn Roe v. Wade?",
        resolutionCriteria: "Resolves Came True if Roe v. Wade is overturned by a Court majority that includes Trump appointees.",
        claimType: "prediction",
        category: "other",
        deadline: null,
        status: "came_true",
        resolutionRationale:
          "Dobbs v. Jackson (June 24, 2022) overturned Roe 5–4 on the core holding; all three Trump appointees — Gorsuch, Kavanaugh, Barrett — joined the majority.",
        resolvedAt: new Date("2022-06-24"),
        followerCount: 8917,
        weeklyFollowDelta: 5,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "If we put another two or perhaps three justices on, that will happen — and that'll happen automatically, in my opinion, because I am putting pro-life justices on the court.",
          dateStated: "2016-10-19",
          venue: "Third presidential debate, Las Vegas, Nevada",
          sourceUrl: "https://www.c-span.org/video/?416988-1/presidential-nominees-debate-university-nevada-las-vegas",
          sourceType: "video",
          videoTimestamp: "26:03",
        },
      ],
    },
    {
      prop: {
        slug: "release-tax-returns",
        statement: "Trump releases his tax returns.",
        question: "Did Trump release his tax returns?",
        resolutionCriteria: "Resolves Came True if Trump voluntarily releases his personal federal tax returns.",
        claimType: "promise",
        category: "other",
        deadline: null,
        status: "walked_back",
        resolutionRationale:
          "Trump repeatedly promised release pending audit completion, then declined throughout his term, fighting subpoenas to the Supreme Court. Returns only became public via a House committee vote in Dec 2022 — not a voluntary release. Scored Walked Back: the commitment was abandoned by the speaker.",
        resolvedAt: new Date("2022-12-30"),
        followerCount: 3567,
        weeklyFollowDelta: 2,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "I'm under a routine audit and it'll be released, and as soon as the audit is finished it will be released.",
          dateStated: "2016-05-11",
          venue: "Interview, Fox News",
          sourceUrl: "https://www.foxnews.com/transcript/trump-on-releasing-tax-returns",
          sourceType: "interview",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-07-02") },
        { fromStatus: "pending", toStatus: "walked_back", actor: "jury #418 (9 members)", rationale: "Commitment abandoned by speaker; returns never voluntarily released.", createdAt: new Date("2023-07-15") },
      ],
    },
    {
      prop: {
        slug: "american-flag-on-mars-2029",
        statement: "American astronauts plant the U.S. flag on Mars before the end of Trump's second term.",
        question: "Will America land astronauts on Mars by 2029?",
        resolutionCriteria:
          "Resolves Came True if NASA or a U.S. company lands a crewed mission on Mars with astronauts on the surface by Jan 20, 2029.",
        claimType: "promise",
        category: "other",
        deadline: "2029-01-20",
        status: "pending",
        followerCount: 15208,
        weeklyFollowDelta: 341,
      },
      stances: [
        {
          person: trump,
          position: "affirm",
          quote: "We will pursue our manifest destiny into the stars, launching American astronauts to plant the Stars and Stripes on the planet Mars.",
          dateStated: "2025-01-20",
          venue: "Second inaugural address, U.S. Capitol",
          sourceUrl: "https://www.c-span.org/video/?second-inaugural-address-2025",
          sourceType: "speech",
          videoTimestamp: "21:40",
        },
        {
          person: musk,
          position: "affirm",
          quote: "Starship will carry humans to Mars within four years. I'd say 2028 is achievable — that's what we're aiming for.",
          dateStated: "2025-03-08",
          venue: "Interview, X Spaces",
          sourceUrl: "https://x.com/elonmusk/status/1898400000000000000",
          sourceType: "interview",
        },
      ],
      evidence: [
        { side: "refutes", title: "NASA OIG: crewed Mars mission infeasible before early 2030s", sourceUrl: "https://oig.nasa.gov/reports/mars-readiness-2025", sourceName: "NASA Office of Inspector General" },
      ],
    },

    // ----------------------------------------------------------- MUSK
    {
      prop: {
        slug: "tesla-coast-to-coast-fsd-2017",
        statement: "A Tesla drives coast-to-coast (LA to NYC) with no human input by the end of 2017.",
        question: "Did Tesla do a driverless coast-to-coast trip by 2017?",
        resolutionCriteria:
          "Resolves Came True if Tesla publicly demonstrates a full LA-to-NYC drive with zero human control inputs by Dec 31, 2017.",
        claimType: "prediction",
        category: "ai",
        deadline: "2017-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "No such demonstration occurred by the deadline — or since, as of mid-2026. Musk acknowledged in Feb 2018 the demo was postponed.",
        resolvedAt: new Date("2018-01-15"),
        followerCount: 8112,
        weeklyFollowDelta: 18,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "By the end of next year, a Tesla will be able to drive from a parking lot in California to a parking lot in New York — no controls touched at any point during the entire journey.",
          dateStated: "2016-10-19",
          venue: "Tesla Autopilot 2.0 press call",
          sourceUrl: "https://www.theverge.com/2016/10/19/13341306/tesla-autopilot-2-press-call-elon-musk",
          sourceType: "interview",
        },
      ],
      evidence: [
        { side: "refutes", title: "Musk, Feb 2018: coast-to-coast demo postponed", sourceUrl: "https://www.cnbc.com/2018/02/07/tesla-fsd-coast-to-coast-demo-delayed.html", sourceName: "CNBC" },
      ],
    },
    {
      prop: {
        slug: "million-robotaxis-2020",
        statement: "Tesla has one million robotaxis on the road by the end of 2020.",
        question: "Did Tesla deploy a million robotaxis by 2020?",
        resolutionCriteria:
          "Resolves Came True if 1,000,000+ Tesla vehicles operate as autonomous robotaxis (no safety driver) by Dec 31, 2020.",
        claimType: "prediction",
        category: "ai",
        deadline: "2020-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "Zero Tesla robotaxis operated without safety drivers by end of 2020. Tesla's first limited driverless service launched in Austin in 2025 with a small supervised fleet.",
        resolvedAt: new Date("2021-01-10"),
        followerCount: 10484,
        weeklyFollowDelta: 27,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "I feel very confident predicting autonomous robotaxis for Tesla next year... we'll have over a million robotaxis on the road.",
          dateStated: "2019-04-22",
          venue: "Tesla Autonomy Day, Palo Alto",
          sourceUrl: "https://www.youtube.com/watch?v=Ucp0TTmvqOE",
          sourceType: "video",
          videoTimestamp: "2:34:10",
        },
      ],
    },
    {
      prop: {
        slug: "tesla-private-420-funding-secured",
        statement: "Tesla is taken private at $420 per share — funding secured.",
        question: "Did Musk take Tesla private at $420?",
        resolutionCriteria: "Resolves Came True if a go-private transaction at ~$420/share closes. Walked Back if the plan is abandoned by the speaker.",
        claimType: "promise",
        category: "stocks",
        deadline: null,
        status: "walked_back",
        resolutionRationale:
          "Musk abandoned the plan on Aug 24, 2018, 17 days after the tweet. The SEC charged that funding was not in fact secured; Musk settled, paying $20M and stepping down as chairman.",
        resolvedAt: new Date("2018-08-24"),
        followerCount: 6098,
        weeklyFollowDelta: 4,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "Am considering taking Tesla private at $420. Funding secured.",
          dateStated: "2018-08-07",
          venue: "Twitter post",
          sourceUrl: "https://web.archive.org/web/2018/https://twitter.com/elonmusk/status/1026872652290379776",
          sourceType: "tweet",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-02-14") },
        { fromStatus: "pending", toStatus: "walked_back", actor: "jury #195 (9 members)", rationale: "Plan publicly abandoned by speaker within three weeks; SEC settlement documents the claim was unsupported.", createdAt: new Date("2023-02-27") },
      ],
    },
    {
      prop: {
        slug: "covid-cases-near-zero-april-2020",
        statement: "U.S. COVID-19 cases will be close to zero by the end of April 2020.",
        question: "Were COVID cases near zero by April 2020, as Musk predicted?",
        resolutionCriteria: "Resolves Came True if daily new U.S. cases fall below 100 by April 30, 2020.",
        claimType: "prediction",
        category: "health",
        deadline: "2020-04-30",
        status: "didnt_come_true",
        resolutionRationale: "The U.S. averaged roughly 29,000 new confirmed cases per day in the final week of April 2020.",
        resolvedAt: new Date("2020-05-01"),
        followerCount: 4451,
        weeklyFollowDelta: 2,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "Based on current trends, probably close to zero new cases in US too by end of April.",
          dateStated: "2020-03-19",
          venue: "Twitter post",
          sourceUrl: "https://web.archive.org/web/2020/https://twitter.com/elonmusk/status/1240754657263144960",
          sourceType: "tweet",
        },
      ],
    },
    {
      prop: {
        slug: "spacex-reuse-orbital-booster",
        statement: "SpaceX lands and re-flies an orbital-class rocket booster.",
        question: "Did SpaceX reuse an orbital rocket booster?",
        resolutionCriteria: "Resolves Came True if a previously-flown orbital-class first stage is re-launched successfully.",
        claimType: "prediction",
        category: "other",
        deadline: null,
        status: "came_true",
        resolutionRationale:
          "Falcon 9 booster B1021, first flown April 2016, was successfully re-launched on March 30, 2017 (SES-10) and landed again.",
        resolvedAt: new Date("2017-03-30"),
        followerCount: 3380,
        weeklyFollowDelta: 3,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "I'm fairly confident we can land and re-fly a booster. Rapid and complete reusability is the holy grail — and we're going to do it.",
          dateStated: "2014-09-15",
          venue: "Interview, MIT AeroAstro Centennial Symposium",
          sourceUrl: "https://www.youtube.com/watch?v=PULkWGHeIQQ",
          sourceType: "video",
          videoTimestamp: "12:30",
        },
      ],
    },
    {
      prop: {
        slug: "model-3-5k-week-2017",
        statement: "Tesla produces 5,000 Model 3s per week by the end of 2017.",
        question: "Did Tesla hit 5,000 Model 3s a week by end of 2017?",
        resolutionCriteria:
          "Resolves Came True if Tesla sustains a 5,000/week Model 3 production rate in Q4 2017. Partly True if the rate is achieved within two quarters of the deadline.",
        claimType: "promise",
        category: "stocks",
        deadline: "2017-12-31",
        status: "partly_true",
        resolutionRationale:
          "Q4 2017 peak was under 1,000/week amid 'production hell.' Tesla first hit 5,000/week in the final week of June 2018 — roughly six months late, within the Partly True window defined at admission.",
        resolvedAt: new Date("2018-07-02"),
        followerCount: 2240,
        weeklyFollowDelta: 1,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "We expect to achieve a production rate of 5,000 Model 3 vehicles per week by the end of 2017.",
          dateStated: "2017-05-03",
          venue: "Tesla Q1 2017 earnings letter",
          sourceUrl: "https://ir.tesla.com/press-release/tesla-first-quarter-2017-update",
          sourceType: "filing",
        },
      ],
    },
    {
      prop: {
        slug: "starship-uncrewed-mars-2026",
        statement: "SpaceX launches an uncrewed Starship to Mars by the end of 2026.",
        question: "Will SpaceX launch an uncrewed Starship to Mars in 2026?",
        resolutionCriteria:
          "Resolves Came True if a Starship vehicle launches on a Mars transfer trajectory by Dec 31, 2026 (the current transfer window closes in December).",
        claimType: "prediction",
        category: "other",
        deadline: "2026-12-31",
        status: "pending",
        followerCount: 13772,
        weeklyFollowDelta: 866,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "The first Starships to Mars will launch in the next Earth-Mars transfer window — uncrewed, carrying Optimus. If those land safely, crewed flights follow in four years.",
          dateStated: "2024-09-21",
          venue: "X post",
          sourceUrl: "https://x.com/elonmusk/status/1837550000000000000",
          sourceType: "tweet",
        },
      ],
      evidence: [
        { side: "supports", title: "Starship Flight 11 completed full orbital demonstration", sourceUrl: "https://www.spacex.com/launches/starship-flight-11", sourceName: "SpaceX" },
        { side: "refutes", title: "Orbital propellant transfer test still pending as of May 2026", sourceUrl: "https://spacenews.com/starship-propellant-transfer-2026/", sourceName: "SpaceNews" },
      ],
    },
    {
      prop: {
        slug: "cybercab-volume-production-2026",
        statement: "Tesla Cybercab reaches volume production in 2026.",
        question: "Will the Tesla Cybercab reach volume production in 2026?",
        resolutionCriteria:
          "Resolves Came True if Tesla produces 10,000+ Cybercab units in any quarter of 2026, per company filings or registrations.",
        claimType: "promise",
        category: "ai",
        deadline: "2026-12-31",
        status: "pending",
        followerCount: 7530,
        weeklyFollowDelta: 214,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "We do aim to have volume production of Cybercab in 2026. Before 2027, let me put it that way.",
          dateStated: "2024-10-23",
          venue: "Tesla Q3 2024 earnings call",
          sourceUrl: "https://ir.tesla.com/webcast/2024-q3",
          sourceType: "filing",
        },
      ],
    },

    // ----------------------------------------------------------- SHARED / KRUGMAN / CRAMER
    {
      prop: {
        slug: "us-recession-by-end-2023",
        statement: "The U.S. economy enters a recession by the end of 2023.",
        question: "Did the U.S. enter a recession in 2023?",
        resolutionCriteria:
          "Resolves Came True if NBER declares a recession with any month in 2022–2023 as the start, or two consecutive quarters of negative GDP growth occur in 2023.",
        claimType: "prediction",
        category: "economy",
        deadline: "2023-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "No NBER recession was declared; 2023 GDP grew 2.5% with unemployment under 4% all year. The widely predicted 2023 recession did not occur.",
        resolvedAt: new Date("2024-01-26"),
        followerCount: 11240,
        weeklyFollowDelta: 14,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "We are in a recession, and the recession will get worse... probably until spring of '24. These things pass and then there are boom times again.",
          dateStated: "2022-12-21",
          venue: "Twitter Spaces, All-In Podcast",
          sourceUrl: "https://web.archive.org/web/2022/https://twitter.com/elonmusk/status/1605600000000000000",
          sourceType: "interview",
        },
        {
          person: krugman,
          position: "deny",
          quote: "A recession isn't necessary to get inflation down. The data increasingly point toward a soft landing — immaculate disinflation, if you like.",
          dateStated: "2023-01-13",
          venue: "Column, The New York Times",
          sourceUrl: "https://www.nytimes.com/2023/01/13/opinion/inflation-soft-landing.html",
          sourceType: "article",
        },
        {
          person: cramer,
          position: "affirm",
          quote: "I think we get a recession in 2023 — the Fed has made that decision for us. Brace yourself.",
          dateStated: "2022-10-17",
          venue: "Mad Money, CNBC",
          sourceUrl: "https://www.cnbc.com/2022/10/17/cramer-recession-2023.html",
          sourceType: "video",
          videoTimestamp: "4:21",
        },
      ],
      evidence: [
        { side: "refutes", title: "BEA: U.S. real GDP grew 2.5% in 2023", sourceUrl: "https://www.bea.gov/news/2024/gross-domestic-product-fourth-quarter-and-year-2023-advance-estimate", sourceName: "Bureau of Economic Analysis" },
        { side: "refutes", title: "NBER business cycle dating: no recession declared", sourceUrl: "https://www.nber.org/research/business-cycle-dating", sourceName: "NBER" },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review (26 approvals).", createdAt: new Date("2022-11-02") },
        { fromStatus: "pending", toStatus: "didnt_come_true", actor: "jury #771 (11 members)", rationale: "GDP growth positive all four quarters of 2023; no NBER declaration.", createdAt: new Date("2024-01-26") },
      ],
    },
    {
      prop: {
        slug: "internet-no-greater-than-fax",
        statement: "By 2005, it becomes clear the Internet's impact on the economy is no greater than the fax machine's.",
        question: "Was the Internet's economic impact no greater than the fax machine's?",
        resolutionCriteria:
          "Resolves Came True if mainstream economic assessments by 2005 rate the Internet's productivity contribution as comparable to or less than fax technology.",
        claimType: "prediction",
        category: "economy",
        deadline: "2005-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "By 2005 the Internet underpinned e-commerce, search, and digital media industries worth hundreds of billions; economic literature credits IT broadly — and the Internet specifically — with a measurable share of late-1990s/2000s productivity acceleration.",
        resolvedAt: new Date("2023-01-20"),
        followerCount: 5320,
        weeklyFollowDelta: 11,
      },
      stances: [
        {
          person: krugman,
          position: "affirm",
          quote: "By 2005 or so, it will become clear that the Internet's impact on the economy has been no greater than the fax machine's.",
          dateStated: "1998-06-10",
          venue: "Essay, Red Herring magazine",
          // the original 1998 print piece has no surviving primary artifact —
          // the canonical example of the reported-quote tier
          sourceUrl: "https://www.snopes.com/fact-check/paul-krugman-internets-effect-economy/",
          corroborationUrl: "https://www.washingtonpost.com/technology/2019/06/11/krugman-internet-fax-machine/",
          quoteReported: true,
          sourceType: "article",
        },
      ],
    },
    {
      prop: {
        slug: "markets-never-recover-trump-2016",
        statement: "Global markets never recover from Trump's 2016 election victory.",
        question: "Did markets recover after Trump's 2016 win?",
        resolutionCriteria: "Resolves Came True if major U.S. indices remain below Nov 8, 2016 levels indefinitely. Walked Back if the speaker retracts.",
        claimType: "prediction",
        category: "markets",
        deadline: null,
        status: "walked_back",
        resolutionRationale:
          "Krugman retracted the call three days later, writing he had overreacted. (Markets closed higher the following day and rallied through 2017.) Scored Walked Back per the speaker's own retraction.",
        resolvedAt: new Date("2016-11-11"),
        followerCount: 2913,
        weeklyFollowDelta: 1,
      },
      stances: [
        {
          person: krugman,
          position: "affirm",
          quote: "If the question is when markets will recover, a first-pass answer is never... we are very probably looking at a global recession, with no end in sight.",
          dateStated: "2016-11-08",
          venue: "Live blog, The New York Times",
          sourceUrl: "https://www.nytimes.com/interactive/projects/cp/opinion/election-night-2016/paul-krugman-the-economic-fallout",
          sourceType: "article",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2023-09-12") },
        { fromStatus: "pending", toStatus: "walked_back", actor: "jury #523 (9 members)", rationale: "Speaker publicly retracted within 72 hours ('I overreacted').", createdAt: new Date("2023-09-25") },
      ],
    },
    {
      prop: {
        slug: "inflation-transitory-2021",
        statement: "Post-pandemic inflation is transitory and recedes without a major rise in unemployment.",
        question: "Was inflation transitory, as Krugman said?",
        resolutionCriteria:
          "Resolves Came True if CPI inflation returns under 3% by end of 2022 without unemployment exceeding 5%. Partly True if inflation normalizes by end of 2024 without unemployment exceeding 5%, but takes longer than 'transitory' implied.",
        claimType: "prediction",
        category: "economy",
        deadline: "2024-12-31",
        status: "partly_true",
        resolutionRationale:
          "Inflation peaked at 9.1% in June 2022 — far longer-lived than 'transitory' suggested — but ultimately receded to under 3% by mid-2024 with unemployment near 4%, vindicating the no-recession half of the claim.",
        resolvedAt: new Date("2024-08-15"),
        followerCount: 6651,
        weeklyFollowDelta: 8,
      },
      stances: [
        {
          person: krugman,
          position: "affirm",
          quote: "Those of us on Team Transitory think this inflation is mainly bottlenecks and base effects — it will subside without the Fed having to engineer a recession.",
          dateStated: "2021-08-27",
          venue: "Column, The New York Times",
          sourceUrl: "https://www.nytimes.com/2021/08/27/opinion/inflation-transitory-fed.html",
          sourceType: "article",
        },
      ],
      audit: [
        { fromStatus: null, toStatus: "pending", actor: "system", rationale: "Published after community review.", createdAt: new Date("2022-01-30") },
        { fromStatus: "pending", toStatus: "partly_true", actor: "jury #899 (11 members)", rationale: "Timeline wrong (2+ years), mechanism right (no recession needed). Split verdict 7–4.", createdAt: new Date("2024-08-15") },
      ],
    },
    {
      prop: {
        slug: "tariffs-push-inflation-above-4pct-2026",
        statement: "The 2025 tariff regime pushes U.S. CPI inflation above 4% by mid-2026.",
        question: "Will tariffs push U.S. inflation above 4% by mid-2026?",
        resolutionCriteria:
          "Resolves Came True if year-over-year headline CPI for any month through July 2026 prints at 4.0% or higher (BLS data).",
        claimType: "prediction",
        category: "economy",
        deadline: "2026-07-31",
        status: "pending",
        followerCount: 9914,
        weeklyFollowDelta: 1241,
      },
      stances: [
        {
          person: krugman,
          position: "affirm",
          quote: "Tariffs at this scale are a supply shock. I'd be surprised if we don't see headline inflation back above 4 percent by the middle of next year.",
          dateStated: "2025-07-02",
          venue: "Substack newsletter",
          sourceUrl: "https://paulkrugman.substack.com/p/tariff-inflation-outlook",
          sourceType: "article",
        },
        {
          person: trump,
          position: "deny",
          quote: "There is no inflation from tariffs. The tariffs are bringing in billions and prices are coming down. Anyone who says otherwise is a loser who's been wrong for years.",
          dateStated: "2025-08-11",
          venue: "Truth Social post",
          sourceUrl: "https://truthsocial.com/@realDonaldTrump/posts/114980000000000000",
          sourceType: "tweet",
        },
      ],
      evidence: [
        { side: "supports", title: "BLS: CPI YoY at 3.6% in April 2026, up from 2.9% a year earlier", sourceUrl: "https://www.bls.gov/news.release/cpi.nr0.htm", sourceName: "Bureau of Labor Statistics" },
        { side: "refutes", title: "Goods-price passthrough slowing per May 2026 Fed minutes", sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomcminutes2026.htm", sourceName: "Federal Reserve" },
      ],
    },
    {
      prop: {
        slug: "bear-stearns-is-fine-2008",
        statement: "Bear Stearns is fine — customer money is safe at the firm.",
        question: "Was Bear Stearns fine, as Cramer said?",
        resolutionCriteria: "Resolves Came True if Bear Stearns remains solvent and operating independently through 2008.",
        claimType: "factual",
        category: "stocks",
        deadline: "2008-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "Five days after the statement, Bear Stearns collapsed and was sold to JPMorgan at $2/share (later $10) in a Fed-brokered rescue — down from ~$62 when the statement aired.",
        resolvedAt: new Date("2008-03-16"),
        followerCount: 4187,
        weeklyFollowDelta: 6,
      },
      stances: [
        {
          person: cramer,
          position: "affirm",
          quote: "No! No! No! Bear Stearns is fine. Do not take your money out... Bear Stearns is not in trouble. Don't be silly.",
          dateStated: "2008-03-11",
          venue: "Mad Money, CNBC",
          sourceUrl: "https://www.youtube.com/watch?v=gUkbdjetlY8",
          sourceType: "video",
          videoTimestamp: "0:22",
        },
      ],
    },
    {
      prop: {
        slug: "meta-dead-money-2022",
        statement: "Meta at ~$100 is 'dead money' that won't recover for years.",
        question: "Was Meta dead money after its 2022 crash?",
        resolutionCriteria: "Resolves Came True if META trades below $150 through end of 2024.",
        claimType: "prediction",
        category: "stocks",
        deadline: "2024-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "META roughly 6x'd from its November 2022 low, crossing $590 by late 2024 — among the strongest large-cap recoveries on record.",
        resolvedAt: new Date("2025-01-03"),
        followerCount: 3056,
        weeklyFollowDelta: 4,
      },
      stances: [
        {
          person: cramer,
          position: "affirm",
          quote: "I made a mistake here. I was wrong about this company... but at this point, I think it's dead money. The metaverse spending makes it uninvestable.",
          dateStated: "2022-10-27",
          venue: "Squawk on the Street, CNBC",
          sourceUrl: "https://www.cnbc.com/2022/10/27/cramer-meta-apology.html",
          sourceType: "video",
          videoTimestamp: "1:48",
        },
      ],
    },
    {
      prop: {
        slug: "nvidia-own-it-dont-trade-it",
        statement: "Nvidia remains the must-own AI stock — it goes higher from 2023 levels.",
        question: "Was Cramer right that Nvidia would keep climbing?",
        resolutionCriteria: "Resolves Came True if NVDA total return exceeds the S&P 500 by 20+ points from May 2023 through end of 2025.",
        claimType: "prediction",
        category: "semiconductors",
        deadline: "2025-12-31",
        status: "came_true",
        resolutionRationale:
          "NVDA returned several hundred percent from May 2023 through 2025, outperforming the S&P 500 by an overwhelming margin as data-center revenue compounded.",
        resolvedAt: new Date("2026-01-05"),
        followerCount: 2871,
        weeklyFollowDelta: 19,
      },
      stances: [
        {
          person: cramer,
          position: "affirm",
          quote: "Nvidia is the one. Own it, don't trade it. This is the company powering the entire AI buildout and it is not stopping.",
          dateStated: "2023-05-25",
          venue: "Mad Money, CNBC",
          sourceUrl: "https://www.cnbc.com/2023/05/25/cramer-nvidia-own-it-dont-trade-it.html",
          sourceType: "video",
          videoTimestamp: "2:05",
        },
      ],
    },
    // ----------------------------------------------------------- AI
    {
      prop: {
        slug: "ai-smarter-than-any-human-2025",
        statement: "AI is smarter than any single human by the end of 2025.",
        question: "Did AI become smarter than any human by the end of 2025?",
        resolutionCriteria:
          "Resolves Came True if, by Dec 31, 2025, a deployed AI system demonstrably outperforms the best individual human across the breadth of cognitive work (expert consensus, benchmark sweeps, and real-world substitution).",
        claimType: "prediction",
        category: "ai",
        deadline: "2025-12-31",
        status: "didnt_come_true",
        resolutionRationale:
          "Frontier models surpassed experts on many benchmarks but jury review (7–4) found no system that outperforms the best individual human across the breadth of cognitive work by the deadline.",
        resolvedAt: new Date("2026-01-09"),
        followerCount: 11830,
        weeklyFollowDelta: 95,
      },
      stances: [
        {
          person: musk,
          position: "affirm",
          quote: "AI will probably be smarter than any single human next year.",
          dateStated: "2024-04-08",
          venue: "X post",
          sourceUrl: "https://x.com/elonmusk/status/1777300000000000000",
          sourceType: "tweet",
        },
      ],
    },

    // ----------------------------------------------------------- SPORTS
    {
      prop: {
        slug: "celtics-repeat-2025",
        statement: "The Boston Celtics repeat as NBA champions in 2025.",
        question: "Did the Celtics repeat as NBA champions in 2025?",
        resolutionCriteria: "Resolves Came True if Boston wins the 2024–25 NBA Finals.",
        claimType: "prediction",
        category: "nba",
        deadline: "2025-06-30",
        status: "didnt_come_true",
        resolutionRationale:
          "Boston was eliminated by the New York Knicks in the 2025 Eastern Conference semifinals.",
        resolvedAt: new Date("2025-05-16"),
        followerCount: 2140,
        weeklyFollowDelta: 4,
      },
      stances: [
        {
          person: sas,
          position: "affirm",
          quote: "The Celtics will repeat. I don't see anybody in the East — anybody — beating them four times in seven games.",
          dateStated: "2024-10-22",
          venue: "First Take, ESPN",
          sourceUrl: "https://www.espn.com/video/clip/_/id/first-take-celtics-repeat",
          sourceType: "video",
          videoTimestamp: "3:05",
        },
      ],
    },
    {
      prop: {
        slug: "thunder-win-2025-title",
        statement: "The Oklahoma City Thunder win the 2025 NBA championship.",
        question: "Did the Thunder win the 2025 NBA title?",
        resolutionCriteria: "Resolves Came True if Oklahoma City wins the 2024–25 NBA Finals.",
        claimType: "prediction",
        category: "nba",
        deadline: "2025-06-30",
        status: "came_true",
        resolutionRationale:
          "Oklahoma City defeated the Indiana Pacers in seven games, clinching the title on June 22, 2025.",
        resolvedAt: new Date("2025-06-22"),
        followerCount: 1860,
        weeklyFollowDelta: 3,
      },
      stances: [
        {
          person: sas,
          position: "affirm",
          quote: "Write it down: Oklahoma City is winning the championship this year. They're the deepest team in basketball and nobody wants to say it.",
          dateStated: "2025-01-15",
          venue: "First Take, ESPN",
          sourceUrl: "https://www.espn.com/video/clip/_/id/first-take-okc-title",
          sourceType: "video",
          videoTimestamp: "1:12",
        },
      ],
    },
    {
      prop: {
        slug: "chiefs-three-peat-lix",
        statement: "The Kansas City Chiefs win Super Bowl LIX, completing the first three-peat in NFL history.",
        question: "Did the Chiefs three-peat at Super Bowl LIX?",
        resolutionCriteria: "Resolves Came True if Kansas City wins Super Bowl LIX (February 2025).",
        claimType: "prediction",
        category: "nfl",
        deadline: "2025-02-09",
        status: "didnt_come_true",
        resolutionRationale:
          "Philadelphia beat Kansas City 40–22 in Super Bowl LIX on February 9, 2025.",
        resolvedAt: new Date("2025-02-09"),
        followerCount: 3320,
        weeklyFollowDelta: 2,
      },
      stances: [
        {
          person: sas,
          position: "affirm",
          quote: "The Chiefs are going to three-peat. Patrick Mahomes in a big game is the closest thing to a guarantee that exists in sports.",
          dateStated: "2025-01-27",
          venue: "First Take, ESPN",
          sourceUrl: "https://www.espn.com/video/clip/_/id/first-take-chiefs-threepeat",
          sourceType: "video",
          videoTimestamp: "0:48",
        },
      ],
    },
    {
      prop: {
        slug: "yankees-win-2025-world-series",
        statement: "The New York Yankees win the 2025 World Series.",
        question: "Did the Yankees win the 2025 World Series?",
        resolutionCriteria: "Resolves Came True if the Yankees win the 2025 World Series.",
        claimType: "prediction",
        category: "mlb",
        deadline: "2025-11-10",
        status: "didnt_come_true",
        resolutionRationale:
          "The Los Angeles Dodgers won the 2025 World Series; the Yankees did not reach the Fall Classic.",
        resolvedAt: new Date("2025-11-02"),
        followerCount: 1490,
        weeklyFollowDelta: 1,
      },
      stances: [
        {
          person: sas,
          position: "affirm",
          quote: "This is the year the Yankees finish the job. The lineup is too deep — they win the World Series, and it won't be close.",
          dateStated: "2025-03-26",
          venue: "First Take, ESPN",
          sourceUrl: "https://www.espn.com/video/clip/_/id/first-take-yankees-ws",
          sourceType: "video",
          videoTimestamp: "2:20",
        },
      ],
    },
    {
      prop: {
        slug: "hamilton-wins-gp-first-ferrari-season",
        statement: "Lewis Hamilton wins a Grand Prix in his first season with Ferrari (2025).",
        question: "Did Hamilton win a race in his first Ferrari season?",
        resolutionCriteria:
          "Resolves Came True if Hamilton wins a points-paying Grand Prix (sprint races excluded) during the 2025 F1 season.",
        claimType: "prediction",
        category: "f1",
        deadline: "2025-12-07",
        status: "didnt_come_true",
        resolutionRationale:
          "Hamilton won the Shanghai sprint but no Grand Prix in 2025; the criteria excluded sprints. The season ended December 7, 2025.",
        resolvedAt: new Date("2025-12-08"),
        followerCount: 2740,
        weeklyFollowDelta: 6,
      },
      stances: [
        {
          person: sas,
          position: "affirm",
          quote: "Lewis Hamilton in a red Ferrari? He wins races year one. Book it.",
          dateStated: "2025-02-18",
          venue: "First Take, ESPN",
          sourceUrl: "https://www.espn.com/video/clip/_/id/first-take-hamilton-ferrari",
          sourceType: "video",
          videoTimestamp: "4:40",
        },
      ],
    },

    // ----------------------------------------------------------- GOLD
    {
      prop: {
        slug: "gold-closes-above-4000-2025",
        statement: "Gold closes above $4,000/oz before the end of 2025.",
        question: "Did gold close above $4,000 in 2025?",
        resolutionCriteria:
          "Resolves Came True if spot gold (LBMA PM fix) closes above $4,000/oz on any trading day before Dec 31, 2025.",
        claimType: "prediction",
        category: "gold",
        deadline: "2025-12-31",
        status: "came_true",
        resolutionRationale:
          "Spot gold first closed above $4,000/oz in October 2025 amid central-bank buying and dollar weakness.",
        resolvedAt: new Date("2025-10-08"),
        followerCount: 3910,
        weeklyFollowDelta: 12,
      },
      stances: [
        {
          person: schiff,
          position: "affirm",
          quote: "Gold is going to take out $4,000 this year. The fundamentals have never been this lopsided — the dollar's purchasing power is the short of the decade.",
          dateStated: "2025-02-12",
          venue: "The Peter Schiff Show podcast",
          sourceUrl: "https://schiffradio.com/episodes/gold-4000",
          sourceType: "interview",
        },
      ],
    },
    {
      prop: {
        slug: "gold-hits-5000-by-end-2026",
        statement: "Gold reaches $5,000/oz by the end of 2026.",
        question: "Will gold hit $5,000 by the end of 2026?",
        resolutionCriteria:
          "Resolves Came True if spot gold (LBMA PM fix) reaches $5,000/oz on any trading day by Dec 31, 2026.",
        claimType: "prediction",
        category: "gold",
        deadline: "2026-12-31",
        status: "pending",
        followerCount: 5260,
        weeklyFollowDelta: 410,
      },
      stances: [
        {
          person: schiff,
          position: "affirm",
          quote: "This gold bull market is just getting started — $5,000 by the end of next year is conservative.",
          dateStated: "2025-11-04",
          venue: "The Peter Schiff Show podcast",
          sourceUrl: "https://schiffradio.com/episodes/gold-5000",
          sourceType: "interview",
        },
        {
          person: krugman,
          position: "deny",
          quote: "Gold at $5,000 is pricing in an inflation catastrophe that isn't coming. The metal's run is a momentum story, not a macro one.",
          dateStated: "2025-11-20",
          venue: "Substack newsletter",
          sourceUrl: "https://paulkrugman.substack.com/p/gold-bugs-again",
          sourceType: "article",
        },
      ],
    },
  ];

  const propIdBySlug = new Map<string, number>();

  for (const seed of P) {
    const [row] = await db.insert(schema.propositions).values(seed.prop).returning();
    propIdBySlug.set(row.slug, row.id);
    for (const s of seed.stances) {
      const { person, ...rest } = s;
      await db.insert(schema.stances).values({
        ...rest,
        propositionId: row.id,
        personId: person.id,
      });
    }
    if (seed.evidence) {
      await db.insert(schema.evidence).values(
        seed.evidence.map((e) => ({ ...e, propositionId: row.id })),
      );
    }
    if (seed.audit) {
      for (const a of seed.audit) {
        await db.insert(schema.auditTrail).values({ ...a, propositionId: row.id });
      }
    }
  }

  console.log("Seeding resolution proposal on the disputed claim…");
  const groceryId = propIdBySlug.get("grocery-prices-come-down")!;
  const [proposal] = await db
    .insert(schema.resolutionProposals)
    .values({
      propositionId: groceryId,
      proposedStatus: "didnt_come_true",
      rationale:
        "BLS food-at-home CPI is up 1.9% since January 2025 with one month left before the 18-month deadline. The 'immediately' clause and the 5% decline threshold are both mathematically out of reach.",
      proposedBy: users[0].id,
      state: "open",
      voteThreshold: 25,
      aiBrief:
        "EVIDENCE BRIEF (AI-drafted · awaiting human verification)\n\nFor 'Didn't Come True': BLS CPI food-at-home index rose from 305.2 (Jan 2025) to 311.0 (May 2026), +1.9%. A 5% decline by July 20, 2026 would require an unprecedented single-month deflation of ~7%.\n\nAgainst early resolution: USDA reports egg prices down 38% from March 2025 peak; some categories (produce, dairy) are below January 2025 levels. Proponents of waiting note the criteria's Partly True branch remains technically live until the deadline.",
    })
    .returning();

  await db.insert(schema.resolutionVotes).values([
    { proposalId: proposal.id, userId: users[0].id, agree: true, weight: 18 },
    { proposalId: proposal.id, userId: users[1].id, agree: true, weight: 12 },
    { proposalId: proposal.id, userId: users[2].id, agree: false, weight: 9 },
    { proposalId: proposal.id, userId: users[3].id, agree: true, weight: 7 },
    { proposalId: proposal.id, userId: users[4].id, agree: false, weight: 4 },
  ]);

  console.log("Seeding user stances + comments…");
  const recessionId = propIdBySlug.get("us-recession-by-end-2023")!;
  const tariffId = propIdBySlug.get("tariffs-push-inflation-above-4pct-2026")!;
  const starshipId = propIdBySlug.get("starship-uncrewed-mars-2026")!;

  // every stake carries its exact commitment time — and it must predate
  // resolution; "called it" means called it BEFORE the answer was out
  const stakeAt = (iso: string) => ({ createdAt: new Date(iso), updatedAt: new Date(iso) });
  await db.insert(schema.userStances).values([
    { userId: users[0].id, propositionId: tariffId, position: "affirm", stakeSideSharePct: 50, ...stakeAt("2025-08-14T10:00:00Z") },
    { userId: users[1].id, propositionId: tariffId, position: "affirm", stakeSideSharePct: 100, ...stakeAt("2025-08-15T12:00:00Z") },
    { userId: users[2].id, propositionId: tariffId, position: "deny", stakeSideSharePct: 0, ...stakeAt("2025-08-20T08:00:00Z") },
    { userId: users[3].id, propositionId: tariffId, position: "affirm", stakeSideSharePct: 67, ...stakeAt("2025-09-02T15:00:00Z") },
    { userId: users[4].id, propositionId: tariffId, position: "deny", stakeSideSharePct: 25, ...stakeAt("2025-09-10T17:00:00Z") },
    { userId: users[0].id, propositionId: starshipId, position: "deny", stakeSideSharePct: 50, ...stakeAt("2025-01-20T13:00:00Z") },
    { userId: users[1].id, propositionId: starshipId, position: "deny", stakeSideSharePct: 100, ...stakeAt("2025-01-22T09:30:00Z") },
    { userId: users[3].id, propositionId: starshipId, position: "affirm", stakeSideSharePct: 0, ...stakeAt("2025-02-01T18:00:00Z") },
    // factfinder denied the 2023 recession when ~85% of stakers agreed it was coming
    { userId: users[0].id, propositionId: recessionId, position: "deny", stakeSideSharePct: 15, ...stakeAt("2022-11-04T14:00:00Z") },
    { userId: users[2].id, propositionId: recessionId, position: "affirm", stakeSideSharePct: 85, ...stakeAt("2022-11-05T09:00:00Z") },
    { userId: users[0].id, propositionId: groceryId, position: "deny", stakeSideSharePct: 50, ...stakeAt("2025-02-01T16:00:00Z") },
    { userId: users[1].id, propositionId: groceryId, position: "deny", stakeSideSharePct: 100, ...stakeAt("2025-02-03T11:00:00Z") },
    { userId: users[5].id, propositionId: groceryId, position: "affirm", stakeSideSharePct: 0, ...stakeAt("2025-03-12T19:00:00Z") },
  ]);

  console.log("Scoring resolved stakes (resolution payday)…");
  const allStakes = await db.query.userStances.findMany({
    with: { proposition: true },
  });
  for (const stake of allStakes) {
    if (["pending", "disputed"].includes(stake.proposition.status)) continue;
    const pts = stakePoints(
      stanceOutcome(stake.proposition.status, stake.position),
      stake.stakeSideSharePct,
    );
    await db
      .update(schema.userStances)
      .set({ points: pts })
      .where(eq(schema.userStances.id, stake.id));
    if (pts > 0) {
      await db
        .update(schema.user)
        .set({ points: sql`${schema.user.points} + ${pts}` })
        .where(eq(schema.user.id, stake.userId));
    }
  }

  console.log("Backfilling audit trails (publication + resolution events)…");
  const allProps = await db.query.propositions.findMany({
    with: { auditTrail: true },
  });
  for (const prop of allProps) {
    if (!prop.auditTrail.some((a) => a.fromStatus === null)) {
      await db.insert(schema.auditTrail).values({
        propositionId: prop.id,
        fromStatus: null,
        toStatus: "pending",
        actor: "system",
        rationale:
          "Published after community review: quote, sourcing, and falsifiability verified.",
        createdAt: prop.createdAt,
      });
    }
    const resolved = !["pending", "disputed"].includes(prop.status);
    if (
      resolved &&
      !prop.auditTrail.some(
        (a) => a.toStatus === prop.status && a.fromStatus !== null,
      )
    ) {
      await db.insert(schema.auditTrail).values({
        propositionId: prop.id,
        fromStatus: "pending",
        toStatus: prop.status,
        actor: "community jury",
        rationale:
          prop.resolutionRationale ?? "Resolved against the stated criteria.",
        createdAt: prop.resolvedAt ?? new Date(),
      });
    }
  }

  console.log("Seeding season titles…");
  await db.insert(schema.seasonTitles).values({
    userId: users[0].id,
    title: "Top Forecaster, Economy",
    season: "Q1 2026",
  });

  // Threaded, Reddit-style comment seeds (parentId + score)
  const [groceryRoot] = await db
    .insert(schema.comments)
    .values({
      propositionId: groceryId,
      userId: users[0].id,
      score: 24,
      body: "The 5% decline branch needs food-at-home CPI at ~290 by July 20. It's at 311. This is resolvable now — that's why I proposed early resolution.",
      createdAt: new Date("2026-05-28T14:02:00Z"),
    })
    .returning();
  const [groceryReply1] = await db
    .insert(schema.comments)
    .values({
      propositionId: groceryId,
      userId: users[5].id,
      parentId: groceryRoot.id,
      score: 9,
      body: "Partly True branch only requires *any* decline over the window though. If June prints negative MoM it gets close. I'd wait for the deadline.",
      createdAt: new Date("2026-05-29T09:31:00Z"),
    })
    .returning();
  await db.insert(schema.comments).values([
    {
      propositionId: groceryId,
      userId: users[2].id,
      parentId: groceryReply1.id,
      score: 6,
      body: "Agree with waiting — early resolutions on near-miss math have been overturned on appeal twice this year. The deadline is seven weeks out.",
      createdAt: new Date("2026-05-30T17:48:00Z"),
    },
    {
      propositionId: groceryId,
      userId: users[1].id,
      parentId: groceryRoot.id,
      score: 3,
      body: "Sourcing note: the BLS series everyone should be citing is CUUR0000SAF11, not headline CPI. Linked it in the evidence panel.",
      createdAt: new Date("2026-05-31T20:12:00Z"),
    },
    {
      propositionId: groceryId,
      userId: users[4].id,
      score: -2,
      body: "This whole proposition is rigged — nobody promised a specific index.",
      createdAt: new Date("2026-06-01T03:44:00Z"),
    },
  ]);

  const [recessionRoot] = await db
    .insert(schema.comments)
    .values({
      propositionId: recessionId,
      userId: users[0].id,
      score: 31,
      body: "Worth noting how lopsided the expert consensus was here — Bloomberg's Oct 2022 model put recession probability at 100%. The base-rate lesson writes itself.",
      createdAt: new Date("2024-01-27T11:20:00Z"),
    })
    .returning();
  await db.insert(schema.comments).values({
    propositionId: recessionId,
    userId: users[2].id,
    parentId: recessionRoot.id,
    score: 11,
    body: "And the jury minutes are a great read — the 'two consecutive negative quarters' branch nearly triggered in mid-2022 before the revisions came in.",
    createdAt: new Date("2024-01-28T09:05:00Z"),
  });
  await db.insert(schema.comments).values({
    propositionId: tariffId,
    userId: users[3].id,
    score: 14,
    body: "April print was 3.6% and rising ~0.2/month. Two prints left before the deadline. This one is genuinely live.",
    createdAt: new Date("2026-06-02T08:15:00Z"),
  });

  console.log("Seeding proposition follows for sample users…");
  await db.insert(schema.propositionFollows).values([
    { userId: users[0].id, propositionId: groceryId },
    { userId: users[0].id, propositionId: tariffId },
    { userId: users[1].id, propositionId: tariffId },
    { userId: users[2].id, propositionId: starshipId },
  ]);

  console.log("Seed complete.");
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
