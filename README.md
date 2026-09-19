# PitchPilot AI

You are a senior full-stack engineer, product designer, AI engineer, and hackathon mentor.

Build a complete, production-quality full-stack web application called:

PITCHPILOT AI

Tagline

BUILD. CHALLENGE. PITCH.

Product description

PitchPilot AI helps startup founders transform a rough startup idea into an investor-ready pitch deck, edit the deck, and then challenge it with an AI-powered VC Critic before presenting it to real investors.

The complete workflow must be:

Sign Up → Login → Dashboard → Create Startup → AI Generate → Edit → VC Critic → Fix With AI → Export → Presentation Mode

This is being built for a 12-hour hackathon, so the application must be functional end-to-end, visually impressive, reliable during a live demo, and easy to deploy.

Do not create a static mockup.

Build a REAL full-stack application.

1. PRIMARY GOAL

The final website should make hackathon judges immediately understand:

“This doesn't just generate a pitch deck. It generates the pitch, attacks the weak points, helps fix them, and produces the final presentation.”

The application should feel like a real startup SaaS product rather than a student project.

2. AI MODEL

Use:

Gemini 3.6 Flash

Model ID:

gemini-3.6-flash

Use Google's official GenAI JavaScript SDK.

Use environment variable:

GEMINI_API_KEY

Never expose the API key in frontend code.

All Gemini calls must happen server-side.

Use Gemini's structured JSON output/schema capability wherever possible so that generated deck data and critic results are predictable.

Do NOT use OpenAI.

3. RECOMMENDED TECH STACK

Frontend:

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide React

Framer Motion

Backend:

Next.js server/API routes

TypeScript

Database:

Supabase PostgreSQL

Authentication:

Supabase Auth

Storage:

Supabase database for user/deck persistence.

AI:

Gemini 3.6 Flash

Export:

PptxGenJS for PowerPoint

jsPDF/html2canvas for PDF if practical

Deployment:

Vercel

4. AUTHENTICATION — REAL USER ACCOUNTS

The application MUST have real account-based authentication.

Do NOT use only localStorage authentication.

Create:

Sign Up

Fields:

Full Name

Email

Password

Confirm Password

Button:

Create Account →

Validation:

Valid email

Password minimum 8 characters

Password confirmation must match

Email must be unique

After signup:

Create the user account through Supabase Auth.

Store the user's profile:

id

full_name

email

created_at

5. LOGIN

Login page fields:

Email

Password

Button:

Login →

Additional options:

Forgot Password?

Create New Account

Also provide:

Try Demo →

Demo mode should NOT bypass the real authentication system for normal users.

It should simply provide judges a controlled demonstration experience.

After login:

Redirect to:

/dashboard

Persist the authenticated session.

Protect all application routes.

Unauthenticated users should be redirected to /login.

6. SECURITY

Implement proper authentication.

Never store plain-text passwords in the database.

Use Supabase Auth for password handling.

Never expose:

GEMINI_API_KEY

database service keys

authentication secrets

in frontend code.

Use Row Level Security so that:

A user can only access their own:

decks

slides

critiques

profile data

User A must NEVER be able to retrieve User B's decks.

7. COLOR PALETTE

The entire UI must use an:

ICED MINT + CADET BLUE

aesthetic.

Primary palette:

Iced Mint:
#DDF7EF

Soft Mint:
#C8EEE4

Deep Mint:
#8FD5C5

Cadet Blue:
#5F7F8F

Deep Cadet:
#405C69

Dark Navy:
#17252D

Off White:
#F7FBFA

Use the palette consistently.

Do NOT use random colors.

Critical/warning/info indicators may use subtle semantic colors, but they should still fit the overall design.

8. VISUAL STYLE

Make the website:

Premium

Minimal

Elegant

Modern

AI SaaS

Clean

Highly polished

Use:

Large bold typography

Rounded cards

Soft shadows

Glass effects

Iced-mint gradients

Cadet-blue accents

Subtle grain/noise

Smooth hover animations

Floating elements

Beautiful empty states

Animated progress indicators

Modern icons

Excellent spacing

Use large hero typography.

Example:

TURN YOUR IDEA

INTO A PITCH

WORTH REMEMBERING.

Do NOT make it look like:

Bootstrap

a generic dashboard template

an old-school admin panel

a basic college project

The UI should look like something a startup could actually launch.

9. LANDING / LOGIN EXPERIENCE

Create a premium authentication page.

Left side:

Large branding:

PITCHPILOT AI

Headline:

Your idea deserves a better pitch.

Supporting text:

“Generate the story. Challenge the assumptions. Walk into the pitch prepared.”

Right side:

Beautiful login/sign-up card.

Background:

Iced mint → cadet blue gradient.

Add subtle animated abstract shapes representing:

slides

charts

ideas

AI

startups

Keep the page fast and clean.

10. DASHBOARD

After login:

Show:

Good morning, {userName}.

Subtitle:

What are you pitching today?

Primary CTA:

+ CREATE NEW PITCH

Dashboard statistics:

Pitches Created

Dynamic count

Decks Critiqued

Dynamic count

Issues Fixed

Dynamic count

Pitch Readiness

Dynamic diagnostic

11. RECENT DECKS

Display beautiful cards.

Each card:

Startup Name

Industry

Created Date

Last Updated

Number of Slides

Critique Status

Buttons:

Open

Critique

Export

Example:

FarmAI

AI + Agriculture

11 slides

4 issues identified

Last edited:
Today

12. CREATE PITCH

Create a beautiful page.

Heading:

LET'S BUILD YOUR PITCH.

Subtitle:

Tell us the idea. We'll structure the story.

Large textarea:

“Describe your startup in 3–5 sentences.

What problem are you solving?
Who experiences the problem?
What are you building?
Who is your target customer?
How will you make money?”

Show character count.

Minimum recommended:

50 characters.

Optional fields:

Industry

Target Customer

Business Model

Startup Stage

Funding Stage

Current Traction

Competitors

Button:

GENERATE MY PITCH →

13. AI GENERATION EXPERIENCE

When generating, do NOT simply show:

“Loading...”

Create an animated AI workflow.

Display:

UNDERSTANDING YOUR IDEA

↓

IDENTIFYING THE CORE PROBLEM

↓

STRUCTURING THE SOLUTION

↓

MAPPING THE MARKET

↓

BUILDING YOUR BUSINESS MODEL

↓

PREPARING YOUR INVESTOR STORY

Then:

YOUR PITCH IS READY.

14. DECK GENERATOR

Gemini should generate exactly 11 slides.

Slides:

Cover

Problem

Solution

Market Opportunity

Product / How It Works

Business Model

Competition & Differentiation

Go-To-Market

Traction / Validation

Financials & Funding Ask

Team & Vision

15. AI OUTPUT SCHEMA

Use structured JSON.

Schema:

{
"startupName": "",
"tagline": "",
"industry": "",
"oneLiner": "",
"slides": [
{
"number": 1,
"title": "",
"purpose": "",
"content": [],
"keyMetric": "",
"assumptions": [],
"missingInformation": []
}
]
}

Every slide must contain concise, presentation-ready content.

Avoid giant paragraphs.

Use 3–5 strong bullets where appropriate.

16. FACTUAL ACCURACY RULES

This is extremely important.

The AI must distinguish:

FACT

FOUNDER-PROVIDED INFORMATION

ASSUMPTION

ESTIMATE

MISSING DATA

Never invent:

customers

revenue

users

partnerships

investors

patents

market share

traction

testimonials

financial performance

If the founder didn't provide traction:

Show:

TRACTION NOT PROVIDED

Then explain what evidence the founder should collect.

If market numbers are estimated:

Label them:

AI ESTIMATE — VALIDATE BEFORE PRESENTING

Do not present fabricated statistics as verified facts.

17. GEMINI SYSTEM INSTRUCTION

Use a strong system instruction similar to:

“You are an expert startup strategist, pitch-deck consultant, market reasoning assistant, and skeptical investor.

Your task is to transform a founder's startup information into a concise investor presentation.

Be specific to the founder's startup.

Do not invent factual evidence.

Separate founder-provided facts from assumptions and estimates.

If information is missing, explicitly identify it.

Do not manufacture traction, customers, revenue, partnerships, market share, funding history, or testimonials.

Market sizing should explain assumptions and methodology.

The resulting pitch should be clear, concise, commercially realistic, and presentation-ready.

Return only data matching the provided structured schema.”

18. DECK VIEWER

After generation:

Create a premium presentation workspace.

LEFT:

Slide thumbnails.

CENTER:

Large slide preview.

RIGHT:

AI Insights.

Bottom:

Previous

Slide 3 / 11

Next

Top buttons:

Edit

Critique

Ask AI

Export

The center slide should visually resemble an actual presentation.

19. SLIDE EDITOR

Allow users to edit:

Slide title

Bullet points

Key metric

Assumptions

Actions:

Save

Cancel

Reset AI Version

Add Bullet

Delete Bullet

Autosave edits.

Save changes to Supabase.

Show:

Saved ✓

20. VC CRITIC

This is the signature feature.

Create a completely different visual mode.

Heading:

VC CRITIC

Subtitle:

Let's find the holes before an investor does.

Investor persona:

Dropdown:

Angel Investor

Seed VC

Growth VC

Corporate Investor

Default:

Seed VC

Button:

CHALLENGE MY PITCH →

21. CRITIC AI BEHAVIOR

Gemini must analyze the ENTIRE deck.

Find:

weak arguments

unsupported assumptions

vague market size

weak differentiation

unclear business model

unrealistic projections

missing validation

weak go-to-market

unclear target customer

missing unit economics

missing funding logic

inconsistent claims

Return 5–7 specific issues.

Do NOT produce generic criticism.

Every criticism should reference a slide.

22. CRITIC JSON

Return:

{
"overallSummary": "",
"issues": [
{
"slideNumber": 0,
"category": "",
"severity": "critical",
"title": "",
"feedback": "",
"whyItMatters": "",
"suggestion": ""
}
]
}

Severity:

critical

warning

info

23. CRITIC INTERFACE

Display:

🔴 CRITICAL

Issues that should be addressed before pitching.

🟠 WARNING

Potential investor questions.

🔵 INFO

Improvement opportunities.

Each card:

CATEGORY

TITLE

FEEDBACK

WHY IT MATTERS

HOW TO FIX IT

Buttons:

FIX WITH AI

EDIT SLIDE

24. FIX WITH AI

When the user clicks:

FIX WITH AI

Gemini should rewrite ONLY the affected section/slide.

Show:

BEFORE

Original content.

AFTER

AI-improved content.

Buttons:

Apply Fix

Keep Original

This creates a powerful demo moment.

25. PITCH READINESS

Create:

PITCH READINESS

Use diagnostic indicators:

Problem Clarity

Market Evidence

Differentiation

Business Model

Traction Evidence

Financial Assumptions

Do not call this an investment score.

Label:

AI-generated pitch diagnostic — not investment advice.

26. ASK PITCHPILOT

Add an AI assistant.

Name:

PitchPilot AI

Users can ask:

“How can I strengthen my problem statement?”

“Why would an investor challenge my market size?”

“What evidence should I collect?”

“Rewrite this slide more clearly.”

“Explain my business model in simple terms.”

The assistant should have access to the current deck context.

27. EXPORT

Create:

YOUR PITCH IS READY.

Options:

POWERPOINT

Download .PPTX

PDF

Download PDF

PRESENTATION MODE

Start Presentation

PowerPoint export must work reliably.

Use PptxGenJS.

Do not make Google Slides OAuth a dependency for the core application.

If Google Slides integration is implemented, treat it as an optional enhancement.

28. POWERPOINT EXPORT

Generate professional slides.

Every PPTX slide should contain:

startup name

slide title

content

key metric where available

clean layout

Use the PitchPilot color palette.

Use professional typography.

Make the exported presentation usable outside the website.

29. PRESENTATION MODE

Create fullscreen mode.

Controls:

← Previous

→ Next

ESC Exit

Keyboard navigation.

Beautiful slide transitions.

Hide application navigation.

30. MY DECKS

Create a page:

MY DECKS

Users see ONLY their own decks.

Cards:

Startup Name

Industry

Created

Updated

Critique status

Actions:

Open

Edit

Critique

Duplicate

Export

Delete

31. DATABASE SCHEMA

Create Supabase tables.

profiles

id

full_name

email

created_at

updated_at

decks

id

user_id

startup_name

industry

description

tagline

deck_data

created_at

updated_at

critiques

id

deck_id

user_id

critic_persona

critic_data

created_at

slide_edits

id

deck_id

slide_number

content

updated_at

Use Row Level Security.

Users can only access their own records.

32. DEMO DATA

Create a polished demo startup:

FarmAI

Description:

“FarmAI is an AI-powered agriculture platform that helps small farmers make better irrigation and crop-management decisions using satellite imagery, weather information and machine learning. Farmers receive simple recommendations through a mobile application.”

Create demo data for:

11 slides

market assumptions

business model

competition

go-to-market

traction limitations

financial assumptions

VC criticisms

The demo must work even if Gemini API is temporarily unavailable.

33. DEMO MODE

On login page:

TRY DEMO →

This should launch a pre-populated demo workspace.

Do NOT make the demo look fake.

Make it feel like a real product walkthrough.

The judge should be able to experience:

Demo → Deck → Edit → Critique → Fix → Export

in under 5 minutes.

34. API FAILURE FALLBACK

If Gemini fails:

Show:

AI is temporarily unavailable.

Buttons:

Try Again

Continue with Demo Data

Never show a blank screen.

Never crash.

35. JSON VALIDATION

Use Zod or equivalent validation.

Validate:

deck structure

slide count

slide fields

critic structure

severity values

If invalid:

Attempt one repair/retry.

If still invalid:

Use fallback data.

36. RATE LIMIT PROTECTION

Prevent users from repeatedly clicking AI buttons.

Disable button while request is running.

Show:

Analyzing your pitch...

Add basic API rate protection where practical.

Cache or reuse results when possible.

37. RESPONSIVE DESIGN

Desktop is the main hackathon presentation target.

Also support mobile.

Desktop:

Sidebar + workspace.

Mobile:

Bottom navigation / collapsible sidebar.

Slide viewer becomes vertically scrollable.

Critic cards stack.

38. NAVIGATION

Sidebar:

Dashboard

Create Pitch

My Decks

VC Critic

Presentation

Settings

Bottom:

Profile

Logout

39. SETTINGS

Create simple settings:

Name

Email

Change Password

Theme

Logout

Do not overbuild settings.

40. MICROINTERACTIONS

Use Framer Motion for tasteful:

page transitions

card entrance

button hover

slide transitions

loading states

success states

critic cards

export confirmation

Avoid excessive animations.

41. EMPTY STATES

Every empty page needs a useful empty state.

Example:

No decks yet.

Your first pitch starts here.

Button:

Create Your First Pitch →

42. TOAST NOTIFICATIONS

Use Sonner.

Examples:

Pitch generated ✓

Changes saved ✓

Critique complete ✓

Fix applied ✓

PowerPoint exported ✓

43. HACKATHON DEMO FLOW

Optimize the product specifically for this demonstration:

STEP 1

Login.

STEP 2

Dashboard.

STEP 3

Click:

Create New Pitch

STEP 4

Enter:

“FarmAI is an AI-powered agriculture platform that helps small farmers make better irrigation and crop-management decisions using satellite imagery, weather information and machine learning. Farmers receive simple recommendations through a mobile application.”

STEP 5

Click:

Generate My Pitch

STEP 6

Show AI generation animation.

STEP 7

Display 11 slides.

STEP 8

Open Market slide.

Edit one bullet.

STEP 9

Click:

Challenge My Pitch

STEP 10

Show critical issues.

STEP 11

Click:

Fix With AI

STEP 12

Show:

BEFORE → AFTER

STEP 13

Click:

Export PPTX

STEP 14

Open Presentation Mode.

This should feel like one continuous product experience.

44. WINNING PRODUCT DETAILS

Add small touches that make the product memorable.

AI Confidence Tags

For claims:

Verified Input

Founder Provided

AI Estimate

Missing Data

Investor Questions

After VC Critic, show:

QUESTIONS AN INVESTOR MAY ASK

Examples:

“Where will your first 100 customers come from?”

“What makes this difficult for competitors to copy?”

“How did you calculate your TAM?”

“What evidence suggests customers will pay?”

These should be generated from the deck.

45. PITCH HEALTH PANEL

Create a compact panel:

PITCH HEALTH

Problem
Strong

Market
Needs Evidence

Differentiation
Needs Work

Business Model
Clear

Traction
Missing

Financials
Needs Validation

This is a diagnostic, not an investment recommendation.

46. FINAL PRODUCT EXPERIENCE

The product should communicate:

BEFORE

“I have an idea.”

↓

PITCHPILOT

“Here's my investor story.”

↓

VC CRITIC

“Here's what investors may challenge.”

↓

FIX WITH AI

“Here's how I can strengthen it.”

↓

FINAL DECK

“Now I'm ready to present.”

47. PROJECT STRUCTURE

Use a clean structure such as:

app/
login/
signup/
dashboard/
create/
deck/[id]/
critic/[id]/
history/
presentation/[id]/
settings/
api/
generate/
critic/
improve/
questions/

components/
auth/
dashboard/
deck/
critic/
presentation/
ui/

lib/
gemini/
supabase/
export/
validation/

types/

48. ENVIRONMENT VARIABLES

Create .env.example:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=

Never commit .env.local.

49. README

Create a complete README containing:

Project overview

Features

Tech stack

Architecture

Supabase setup

Gemini API setup

Environment variables

Database setup

Local development

Demo mode

Deployment to Vercel

Troubleshooting

50. FINAL TEST

Before declaring the project complete, test:

SIGN UP
↓
LOGIN
↓
DASHBOARD
↓
CREATE PITCH
↓
GEMINI GENERATION
↓
11 SLIDES
↓
EDIT SLIDE
↓
SAVE
↓
VC CRITIC
↓
5–7 CRITICISMS
↓
FIX WITH AI
↓
APPLY FIX
↓
SAVE
↓
EXPORT PPTX
↓
PRESENTATION MODE
↓
LOGOUT
↓
LOGIN AGAIN
↓
VERIFY DECK STILL EXISTS

Also test:

invalid login

duplicate email

short password

empty startup idea

Gemini failure

malformed AI response

multiple users

unauthorized deck access

export failure

mobile layout

Fix all errors before finishing.

51. MOST IMPORTANT RULE

Do not give me a prototype consisting only of frontend screens.

Build the actual:

FRONTEND + BACKEND + DATABASE + AUTHENTICATION + AI + EXPORT

The core application must work.

Prioritize:

Reliability

Authentication

AI generation

VC Critic

Editing

Export

Premium UI

Extra features

If a feature is too complicated for a 12-hour hackathon, implement a simpler reliable version rather than leaving the application broken.

52. FINAL QUALITY BAR

When finished, ask yourself:

Would a judge understand the product within 30 seconds?

Does the UI look premium?

Can a new user sign up?

Can they log back in later?

Are their decks private?

Does Gemini actually generate the deck?

Does the critic actually identify weaknesses?

Can the user fix those weaknesses?

Can the user export a real presentation?

Can the entire demo be completed in 3–5 minutes?

If any answer is NO, fix it.

The final result should feel like:

A real AI startup product that happens to have been built during a hackathon.

Not:

A hackathon project that happens to have an AI button.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pitchperfect-ai-41.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b00d84d-17d5-5076-a8d3-ae09e878e2cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
